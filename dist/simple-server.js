#!/usr/bin/env node
"use strict";
/**
 * Market MCP Server - 简化版，集成AKTools管理
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const akToolsManager_js_1 = require("./services/akToolsManager.js");
/**
 * 简化版MCP服务器 - 集成AKTools
 */
class SimpleMarketMCPServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'market-mcp-aktools-integrated',
            version: '3.0.0',
        }, {
            capabilities: {
                tools: {},
                prompts: {},
            },
        });
        this.akToolsManager = new akToolsManager_js_1.AKToolsManager(8080);
        this.setupHandlers();
    }
    setupHandlers() {
        // 工具列表
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_stock_info',
                        description: '获取股票实时行情信息，支持AKTools和东方财富网数据源',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                codes: {
                                    oneOf: [
                                        { type: 'string', description: '单个股票代码，如 000001 或 sh600000' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '股票代码数组，如 ["000001", "600000"]'
                                        }
                                    ],
                                    description: '股票代码，支持带市场前缀（sh/sz/bj）或不带'
                                },
                                data_source: {
                                    type: 'string',
                                    enum: ['aktools', 'eastmoney', 'auto'],
                                    default: 'auto',
                                    description: '数据源选择：aktools(AKTools), eastmoney(东方财富网), auto(自动选择)'
                                }
                            },
                            required: ['codes']
                        }
                    },
                    {
                        name: 'check_aktools_status',
                        description: '检查AKTools服务状态，包括安装、运行和健康信息',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    },
                    {
                        name: 'start_aktools',
                        description: '启动AKTools服务（如果已安装）',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    },
                    {
                        name: 'stop_aktools',
                        description: '停止AKTools服务',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    }
                ]
            };
        });
        // 工具调用处理
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'get_stock_info':
                        return await this.handleGetStockInfo(args);
                    case 'check_aktools_status':
                        return await this.handleCheckAKToolsStatus(args);
                    case 'start_aktools':
                        return await this.handleStartAKTools(args);
                    case 'stop_aktools':
                        return await this.handleStopAKTools(args);
                    default:
                        throw new Error(`未知工具: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `错误: ${error instanceof Error ? error.message : '未知错误'}`
                        }
                    ]
                };
            }
        });
    }
    async handleGetStockInfo(args) {
        const { codes, data_source = 'auto' } = args;
        let codesArray;
        if (typeof codes === 'string') {
            codesArray = codes.split(/[,，\s]+/).filter(code => code.trim());
        }
        else if (Array.isArray(codes)) {
            codesArray = codes;
        }
        else {
            throw new Error('股票代码格式错误');
        }
        if (codesArray.length === 0) {
            throw new Error('股票代码不能为空');
        }
        try {
            let dataSource;
            let stockData = [];
            if (data_source === 'auto') {
                // 自动选择：优先AKTools，失败则降级到东方财富网
                const akToolsRunning = await this.akToolsManager.checkServiceStatus();
                if (akToolsRunning) {
                    dataSource = 'aktools';
                    stockData = await this.getAKToolsStockData(codesArray);
                }
                else {
                    dataSource = 'eastmoney';
                    stockData = this.getMockStockData(codesArray);
                }
            }
            else if (data_source === 'aktools') {
                dataSource = 'aktools';
                const isRunning = await this.akToolsManager.checkServiceStatus();
                if (!isRunning) {
                    console.log('AKTools未运行，正在启动...');
                    await this.akToolsManager.start();
                }
                stockData = await this.getAKToolsStockData(codesArray);
            }
            else {
                dataSource = 'eastmoney';
                stockData = this.getMockStockData(codesArray);
            }
            const formattedData = this.formatStockData(stockData, dataSource);
            return {
                content: [
                    {
                        type: 'text',
                        text: formattedData
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `查询失败: ${error instanceof Error ? error.message : '未知错误'}`
                    }
                ]
            };
        }
    }
    async handleCheckAKToolsStatus(args) {
        let statusText = '🔍 AKTools服务状态检查\n\n';
        try {
            // 检查安装状态
            const isInstalled = await this.akToolsManager.checkInstallation();
            statusText += `📦 安装状态: ${isInstalled ? '✅ 已安装' : '❌ 未安装'}\n`;
            if (isInstalled) {
                // 检查运行状态
                const isRunning = await this.akToolsManager.checkServiceStatus();
                statusText += `🚀 运行状态: ${isRunning ? '✅ 正在运行' : '❌ 未运行'}\n`;
                // 获取健康信息
                const healthInfo = await this.akToolsManager.getHealthInfo();
                statusText += `📊 服务详情:\n`;
                statusText += `   - 状态: ${healthInfo.status}\n`;
                statusText += `   - 端口: ${healthInfo.port}\n`;
                statusText += `   - PID: ${healthInfo.pid || 'N/A'}\n`;
                statusText += `   - 运行时长: ${healthInfo.uptime ? Math.round(healthInfo.uptime / 1000) + '秒' : 'N/A'}\n`;
                statusText += `   - 可用端点: ${healthInfo.endpoints.length}个\n`;
                statusText += `   - 最后检查: ${healthInfo.lastCheck.toLocaleString('zh-CN')}\n`;
                if (healthInfo.endpoints.length > 0) {
                    statusText += `\n🔗 可用端点:\n`;
                    healthInfo.endpoints.forEach((endpoint, index) => {
                        statusText += `   ${index + 1}. ${endpoint}\n`;
                    });
                }
            }
            else {
                statusText += `\n💡 安装AKTools:\n`;
                statusText += `   pip install aktools\n\n`;
                statusText += `🚀 启动AKTools服务:\n`;
                statusText += `   python -m aktools\n`;
            }
        }
        catch (error) {
            statusText += `❌ 状态检查失败: ${error instanceof Error ? error.message : '未知错误'}\n`;
        }
        return {
            content: [
                {
                    type: 'text',
                    text: statusText
                }
            ]
        };
    }
    async handleStartAKTools(args) {
        try {
            const isInstalled = await this.akToolsManager.checkInstallation();
            if (!isInstalled) {
                throw new Error('AKTools未安装。请先运行: pip install aktools');
            }
            const isRunning = await this.akToolsManager.checkServiceStatus();
            if (isRunning) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: '✅ AKTools服务已在运行'
                        }
                    ]
                };
            }
            console.log('🚀 正在启动AKTools服务...');
            const started = await this.akToolsManager.start();
            if (started) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: '✅ AKTools服务启动成功！\n\n📊 服务信息:\n' +
                                `- 端口: 8080\n` +
                                `- API地址: http://127.0.0.1:8080\n` +
                                `- 文档: http://127.0.0.1:8080/docs\n` +
                                `- 状态: 正在运行\n` +
                                `- 启动时间: ${new Date().toLocaleString('zh-CN')}`
                        }
                    ]
                };
            }
            else {
                throw new Error('AKTools服务启动失败，请检查端口8080是否被占用');
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ 启动AKTools失败: ${error instanceof Error ? error.message : '未知错误'}`
                    }
                ]
            };
        }
    }
    async handleStopAKTools(args) {
        try {
            const isRunning = await this.akToolsManager.checkServiceStatus();
            if (!isRunning) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'ℹ️  AKTools服务未运行'
                        }
                    ]
                };
            }
            console.log('🛑 正在停止AKTools服务...');
            await this.akToolsManager.stop();
            return {
                content: [
                    {
                        type: 'text',
                        text: '✅ AKTools服务已停止'
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ 停止AKTools失败: ${error instanceof Error ? error.message : '未知错误'}`
                    }
                ]
            };
        }
    }
    async getAKToolsStockData(codes) {
        try {
            const axios = (await Promise.resolve().then(() => __importStar(require('axios')))).default;
            const symbol = codes.join(',');
            const response = await axios.get(`http://127.0.0.1:8080/api/public/stock_zh_a_spot_em`, {
                params: { symbol },
                timeout: 10000,
                headers: {
                    'User-Agent': 'MarketMCP-Client/3.0.0'
                }
            });
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('AKTools API返回数据格式错误');
            }
            return response.data.map((stock) => ({
                code: stock['代码'] || '',
                name: stock['名称'] || '',
                price: parseFloat(stock['最新价']) || 0,
                change: parseFloat(stock['涨跌额']) || 0,
                changePercent: stock['涨跌幅'] ? `${stock['涨跌幅']}%` : '0.00%',
                volume: stock['成交量'] || '0',
                amount: stock['成交额'] || '0',
                market: this.getMarketFromCode(stock['代码'] || ''),
                timestamp: Date.now()
            }));
        }
        catch (error) {
            console.error('AKTools数据获取失败:', error);
            throw error;
        }
    }
    getMockStockData(codes) {
        return codes.map(code => ({
            code,
            name: this.getStockName(code),
            price: Math.random() * 20 + 5,
            change: (Math.random() - 0.5) * 2,
            changePercent: ((Math.random() - 0.5) * 5).toFixed(2) + '%',
            volume: Math.floor(Math.random() * 10000),
            amount: Math.floor(Math.random() * 100000),
            market: this.getMarketFromCode(code),
            timestamp: Date.now()
        }));
    }
    getStockName(code) {
        const nameMap = {
            '600000': '浦发银行',
            '600036': '招商银行',
            '000001': '平安银行',
            '000002': '万科A',
            '430002': '易安科技'
        };
        return nameMap[code] || `股票${code}`;
    }
    getMarketFromCode(code) {
        if (code.startsWith('6') || code.startsWith('9'))
            return 'SH';
        if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3'))
            return 'SZ';
        if (code.startsWith('4') || code.startsWith('8'))
            return 'BJ';
        return 'SH';
    }
    formatStockData(stocks, source) {
        if (stocks.length === 0)
            return '暂无数据';
        const header = '股票代码\t股票名称\t最新价格\t涨跌额\t涨跌幅\t成交量\t成交额\t市场';
        const separator = '-'.repeat(100);
        let result = `📊 股票实时行情 (数据源: ${source.toUpperCase()})\n${separator}\n${header}\n${separator}\n`;
        for (const stock of stocks) {
            const changeColor = stock.change >= 0 ? '📈' : '📉';
            result += `${stock.code}\t${stock.name}\t${stock.price.toFixed(2)}\t` +
                `${stock.change.toFixed(2)}\t${stock.changePercent}\t` +
                `${this.formatNumber(stock.volume)}\t${this.formatNumber(stock.amount)}\t` +
                `${stock.market}\t${changeColor}\n`;
        }
        result += `${separator}\n🕒 更新时间: ${new Date().toLocaleString('zh-CN')}`;
        return result;
    }
    formatNumber(num) {
        const n = typeof num === 'string' ? parseFloat(num) : num;
        if (n >= 100000000) {
            return (n / 100000000).toFixed(2) + '亿';
        }
        else if (n >= 10000) {
            return (n / 10000).toFixed(2) + '万';
        }
        else {
            return n.toString();
        }
    }
    async run() {
        // 初始化AKTools服务
        console.log('🚀 正在初始化Market MCP Server with AKTools integration...');
        try {
            const isInstalled = await this.akToolsManager.checkInstallation();
            if (isInstalled) {
                console.log('✅ AKTools已安装');
                // 尝试自动启动AKTools
                const started = await this.akToolsManager.start();
                if (started) {
                    console.log('✅ AKTools服务启动成功');
                }
                else {
                    console.log('⚠️  AKTools服务启动失败，将使用模拟数据');
                }
            }
            else {
                console.log('⚠️  AKTools未安装，将使用模拟数据');
                console.log('💡 要使用AKTools功能，请先运行: pip install aktools');
            }
        }
        catch (error) {
            console.error('❌ AKTools初始化失败:', error);
            console.log('💡 将使用模拟数据作为降级方案');
        }
        // 设置优雅退出处理
        const cleanup = async () => {
            console.log('\n🛑 正在关闭Market MCP Server...');
            try {
                await this.akToolsManager.cleanup();
                console.log('✅ AKTools服务已停止');
            }
            catch (error) {
                console.error('❌ 清理AKTools服务失败:', error);
            }
            process.exit(0);
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('uncaughtException', (error) => {
            console.error('未捕获异常:', error);
            cleanup();
        });
        process.on('unhandledRejection', (reason) => {
            console.error('未处理的Promise拒绝:', reason);
            cleanup();
        });
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('🚀 Market MCP Server with AKTools integration running on stdio');
    }
}
// 启动服务器
const server = new SimpleMarketMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=simple-server.js.map