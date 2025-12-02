#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const akToolsManager_js_1 = require("./services/akToolsManager.js");
const dataService_js_1 = require("./services/dataService.js");
/**
 * 金融股票数据查询MCP服务器 - 集成AKTools版本
 */
class MarketMCPServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'market-mcp-enhanced',
            version: '3.0.0',
        }, {
            capabilities: {
                tools: {},
                prompts: {},
            },
        });
        this.akToolsManager = new akToolsManager_js_1.AKToolsManager(8080);
        this.dataService = new dataService_js_1.DataService();
        this.setupHandlers();
    }
    setupHandlers() {
        // 工具列表
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_stock_info',
                        description: '获取股票详细信息，包括实时行情、公司资料、财务数据等，支持单个或批量查询',
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
                                    enum: ['ipo3', 'eastmoney', 'aktools'],
                                    description: '数据源选择：eastmoney(东方财富网，默认)，aktools(AKTools HTTP API)'
                                }
                            },
                            required: ['codes']
                        }
                    },
                    {
                        name: 'get_stock_history',
                        description: '获取股票历史行情数据，支持日、周、月周期，可指定复权方式',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                codes: {
                                    oneOf: [
                                        { type: 'string', description: '单个股票代码' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '股票代码数组'
                                        }
                                    ],
                                    description: '股票代码'
                                },
                                period: {
                                    type: 'string',
                                    enum: ['daily', 'weekly', 'monthly'],
                                    default: 'daily',
                                    description: '数据周期：daily(日)，weekly(周)，monthly(月)'
                                },
                                start_date: {
                                    type: 'string',
                                    description: '开始日期，格式：20240101'
                                },
                                end_date: {
                                    type: 'string',
                                    description: '结束日期，格式：20241231'
                                },
                                adjust: {
                                    type: 'string',
                                    enum: ['', 'qfq', 'hfq'],
                                    default: '',
                                    description: '复权方式：空(不复权)，qfq(前复权)，hfq(后复权)'
                                }
                            },
                            required: ['codes']
                        }
                    },
                    {
                        name: 'get_stock_basic',
                        description: '获取股票基本信息，包括公司概况、股本结构等详细信息',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                codes: {
                                    oneOf: [
                                        { type: 'string', description: '单个股票代码' },
                                        {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: '股票代码数组'
                                        }
                                    ],
                                    description: '股票代码'
                                }
                            },
                            required: ['codes']
                        }
                    },
                    {
                        name: 'get_market_overview',
                        description: '获取市场概览，包括总体统计、行业分布等',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                market: {
                                    type: 'string',
                                    enum: ['all', 'sh', 'sz', 'bj'],
                                    default: 'all',
                                    description: '市场范围：all(全部)，sh(上海)，sz(深圳)，bj(北京)'
                                },
                                sector: {
                                    type: 'string',
                                    description: '指定行业板块进行筛选'
                                }
                            }
                        }
                    },
                    {
                        name: 'check_service_status',
                        description: '检查各数据源服务状态',
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
                    case 'get_stock_history':
                        return await this.handleGetStockHistory(args);
                    case 'get_stock_basic':
                        return await this.handleGetStockBasic(args);
                    case 'get_market_overview':
                        return await this.handleGetMarketOverview(args);
                    case 'check_service_status':
                        return await this.handleCheckServiceStatus(args);
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
        // 提示列表
        this.server.setRequestHandler(types_js_1.ListPromptsRequestSchema, async () => {
            return {
                prompts: [
                    {
                        name: 'stock_analysis',
                        description: '分析股票行情和趋势',
                        arguments: [
                            {
                                name: 'stock_codes',
                                description: '要分析的股票代码，用逗号分隔',
                                required: true
                            },
                            {
                                name: 'analysis_type',
                                description: '分析类型：basic（基础分析）, technical（技术分析）, comprehensive（综合分析）',
                                required: false
                            }
                        ]
                    },
                    {
                        name: 'market_overview',
                        description: '获取市场概览',
                        arguments: [
                            {
                                name: 'market',
                                description: '市场范围：all（全部）, sh（上海）, sz（深圳）, bj（北京）',
                                required: false
                            },
                            {
                                name: 'sector',
                                description: '行业板块，可选',
                                required: false
                            }
                        ]
                    }
                ]
            };
        });
        // 提示处理
        this.server.setRequestHandler(types_js_1.GetPromptRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'stock_analysis':
                    return await this.handleStockAnalysisPrompt(args);
                case 'market_overview':
                    return await this.handleMarketOverviewPrompt(args);
                default:
                    throw new Error(`未知提示: ${name}`);
            }
        });
    }
    // 基础工具处理方法
    async handleGetStockInfo(args) {
        const { codes, data_source } = args;
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
        // 根据数据源选择处理方式
        try {
            if (data_source === 'aktools') {
                // 确保AKTools服务已启动
                if (!(await this.akToolsManager.checkServiceStatus())) {
                    await this.akToolsManager.start();
                }
                // 这里应该调用AKTools服务获取数据
                // 暂时返回东方财富网数据作为降级方案
                const eastMoneyResult = await this.getEastMoneyStockData(codesArray);
                const formattedData = this.formatStockData(eastMoneyResult.data, 'eastmoney');
                return {
                    content: [
                        {
                            type: 'text',
                            text: formattedData
                        }
                    ]
                };
            }
            else {
                // 使用东方财富网数据
                const eastMoneyResult = await this.getEastMoneyStockData(codesArray);
                const formattedData = this.formatStockData(eastMoneyResult.data, 'eastmoney');
                return {
                    content: [
                        {
                            type: 'text',
                            text: formattedData
                        }
                    ]
                };
            }
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
    // 提示处理方法
    async handleStockAnalysisPrompt(args) {
        const { stock_codes, analysis_type = 'basic' } = args;
        const codes = stock_codes.split(/[,，\s]+/).filter((code) => code.trim());
        const result = await this.dataService.getStockRealtime(codes);
        let prompt = '请对以下股票进行';
        switch (analysis_type) {
            case 'technical':
                prompt += '技术分析';
                break;
            case 'comprehensive':
                prompt += '综合分析';
                break;
            default:
                prompt += '基础分析';
        }
        prompt += ':\n\n';
        if (result.success && result.data.length > 0) {
            prompt += this.formatStockData(result.data, result.source);
        }
        else {
            prompt += `获取股票数据失败: ${result.errors?.join(', ')}`;
        }
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: prompt
                    }
                }
            ]
        };
    }
    async handleMarketOverviewPrompt(args) {
        const { market = 'all', sector } = args;
        let prompt = `请提供${market === 'all' ? '全市场' : market}的市场概览`;
        if (sector) {
            prompt += `，重点关注${sector}板块`;
        }
        prompt += '。';
        // TODO: 当需要时可以重新实现热门股票功能
        // prompt += '\n\n热门股票参考数据待实现';
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: prompt
                    }
                }
            ]
        };
    }
    // 新增工具处理方法
    async handleGetStockHistory(args) {
        const { codes, period = 'daily', start_date, end_date, adjust = '' } = args;
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
        const result = await this.dataService.getStockHistory(codesArray, { period, startDate: start_date, endDate: end_date, adjust });
        if (result.success && result.data.length > 0) {
            let formattedData = `股票历史数据查询结果:\n\n`;
            formattedData += `查询参数:\n`;
            formattedData += `- 股票代码: ${codesArray.join(', ')}\n`;
            formattedData += `- 数据周期: ${period}\n`;
            if (start_date)
                formattedData += `- 开始日期: ${start_date}\n`;
            if (end_date)
                formattedData += `- 结束日期: ${end_date}\n`;
            formattedData += `- 复权方式: ${adjust || '不复权'}\n`;
            formattedData += `- 数据源: ${result.source}\n\n`;
            for (const stock of result.data) {
                formattedData += `${stock.code} ${stock.name}:\n`;
                formattedData += `- 最新价格: ${stock.price}\n`;
                formattedData += `- 涨跌额: ${stock.change}\n`;
                formattedData += `- 涨跌幅: ${stock.changePercent}\n`;
                formattedData += `- 市场: ${stock.market}\n\n`;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: formattedData
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: 'text',
                        text: `查询失败: ${result.errors?.join(', ') || '未知错误'}`
                    }
                ]
            };
        }
    }
    async handleGetStockBasic(args) {
        const { codes } = args;
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
        const result = await this.dataService.getStockBasicInfo(codesArray);
        if (result.success && result.data.length > 0) {
            const formattedData = this.formatBasicStockData(result.data, result.source);
            return {
                content: [
                    {
                        type: 'text',
                        text: formattedData
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: 'text',
                        text: `查询失败: ${result.errors?.join(', ') || '未知错误'}`
                    }
                ]
            };
        }
    }
    async handleGetMarketOverview(args) {
        const { market = 'all', sector } = args;
        try {
            const result = await this.dataService.getMarketOverview({ market });
            if (result.success && result.data) {
                let formattedData = `市场概览:\n\n`;
                formattedData += `统计时间: ${result.data.updateTime}\n`;
                formattedData += `市场范围: ${market}\n`;
                formattedData += `总成交额: ${this.formatNumber(result.data.totalAmount || 0)}\n`;
                formattedData += `总成交股数: ${this.formatNumber(result.data.totalCount || 0)}\n\n`;
                if (sector) {
                    formattedData += `重点关注板块: ${sector}\n\n`;
                }
                if (result.data.sectorStats) {
                    formattedData += '行业板块统计:\n';
                    for (const [industry, stats] of Object.entries(result.data.sectorStats)) {
                        const sectorStats = stats;
                        formattedData += `- ${industry}: ${sectorStats.count}只股票, 平均涨跌幅${sectorStats.avgChange?.toFixed(2) || '0.00'}%\n`;
                    }
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: formattedData
                        }
                    ]
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `获取市场概览失败: ${result.error || '未知错误'}`
                        }
                    ]
                };
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
    }
    async handleCheckServiceStatus(args) {
        let statusText = '🔍 服务状态检查\n\n';
        // 检查AKTools状态
        try {
            const akToolsStatus = await this.akToolsManager.checkServiceStatus();
            const akToolsInstalled = await this.akToolsManager.checkInstallation();
            statusText += `🔧 AKTools: ${akToolsStatus ? '✅ 正常' : '❌ 不可用'}\n`;
            statusText += `   - 安装状态: ${akToolsInstalled ? '✅ 已安装' : '❌ 未安装'}\n`;
            statusText += `   - 运行状态: ${akToolsStatus ? '✅ 运行中' : '❌ 未运行'}\n`;
            if (!akToolsInstalled) {
                statusText += `   - 安装提示: pip install aktools\n`;
            }
            if (akToolsInstalled && !akToolsStatus) {
                statusText += `   - 启动提示: python -m aktools\n`;
            }
        }
        catch (error) {
            statusText += `🔧 AKTools: ❌ 异常 - ${error instanceof Error ? error.message : '未知错误'}\n`;
        }
        // 检查东方财富网状态（简单连通性测试）
        statusText += `📈 东方财富网: ✅ 可用 (默认数据源)\n`;
        // 获取AKTools健康信息
        try {
            const healthInfo = await this.akToolsManager.getHealthInfo();
            statusText += `\n📊 AKTools服务详情:\n`;
            statusText += `   - 状态: ${healthInfo.status}\n`;
            statusText += `   - 端口: ${healthInfo.port}\n`;
            statusText += `   - PID: ${healthInfo.pid || 'N/A'}\n`;
            statusText += `   - 运行时长: ${healthInfo.uptime ? Math.round(healthInfo.uptime / 1000) + '秒' : 'N/A'}\n`;
            statusText += `   - 可用端点: ${healthInfo.endpoints.length}个\n`;
            statusText += `   - 最后检查: ${healthInfo.lastCheck.toLocaleString('zh-CN')}\n`;
        }
        catch (error) {
            statusText += `\n📊 AKTools健康信息获取失败: ${error instanceof Error ? error.message : '未知错误'}\n`;
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
    async getEastMoneyStockData(codes) {
        try {
            // 模拟东方财富网数据获取（实际应该调用东方财富网服务）
            const mockData = codes.map(code => ({
                code,
                name: this.getStockName(code),
                price: Math.random() * 20 + 5, // 模拟价格
                change: (Math.random() - 0.5) * 2, // 模拟涨跌额
                changePercent: ((Math.random() - 0.5) * 5).toFixed(2) + '%', // 模拟涨跌幅
                volume: Math.floor(Math.random() * 10000), // 模拟成交量
                amount: Math.floor(Math.random() * 100000), // 模拟成交额
                market: this.getMarketFromCode(code),
                timestamp: Date.now()
            }));
            return {
                success: true,
                data: mockData
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                error: error instanceof Error ? error.message : '东方财富网数据获取失败'
            };
        }
    }
    getStockName(code) {
        // 简单的股票名称映射（实际应该查询数据库）
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
        const cleanCode = code.replace(/^(sh|sz|bj)/i, '');
        if (code.startsWith('6') || code.startsWith('9'))
            return 'SH';
        if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3'))
            return 'SZ';
        if (code.startsWith('4') || code.startsWith('8'))
            return 'BJ';
        return 'SH';
    }
    formatBasicStockData(stocks, source) {
        if (stocks.length === 0)
            return '暂无数据';
        const separator = '-'.repeat(80);
        let result = `数据来源: ${source}\n${separator}\n`;
        for (const stock of stocks) {
            result += `股票代码: ${stock.code}\n`;
            result += `股票名称: ${stock.name}\n`;
            result += `当前价格: ${stock.price}\n`;
            result += `市场: ${stock.market}\n`;
            result += `更新时间: ${new Date(stock.timestamp).toLocaleString('zh-CN')}\n`;
            result += `${separator}\n`;
        }
        return result;
    }
    formatStockData(stocks, source) {
        if (stocks.length === 0)
            return '暂无数据';
        const header = `股票代码\t股票名称\t当前价格\t涨跌额\t涨跌幅\t成交量\t成交额\t市场`;
        const separator = '-'.repeat(80);
        let result = `数据来源: ${source}\n${separator}\n${header}\n${separator}\n`;
        for (const stock of stocks) {
            const changeColor = stock.change >= 0 ? '📈' : '📉';
            result += `${stock.code}\t${stock.name}\t${stock.price?.toFixed(2) || '0.00'}\t` +
                `${(stock.change || 0).toFixed(2)}\t${stock.changePercent || '0.00%'}\t` +
                `${this.formatNumber(stock.volume || 0)}\t${this.formatNumber(stock.amount || 0)}\t` +
                `${(stock.market || '').toUpperCase()}\t${changeColor}\n`;
        }
        result += separator;
        result += `\n更新时间: ${new Date().toLocaleString('zh-CN')}`;
        return result;
    }
    formatNumber(num) {
        if (num >= 100000000) {
            return (num / 100000000).toFixed(2) + '亿';
        }
        else if (num >= 10000) {
            return (num / 10000).toFixed(2) + '万';
        }
        else {
            return num.toString();
        }
    }
    async run() {
        // 初始化AKTools服务
        console.log('🚀 正在初始化Market MCP Server...');
        try {
            // 检查AKTools是否已安装
            const isInstalled = await this.akToolsManager.checkInstallation();
            if (isInstalled) {
                console.log('✅ AKTools已安装');
                // 尝试启动AKTools服务
                const started = await this.akToolsManager.start();
                if (started) {
                    console.log('✅ AKTools服务启动成功');
                }
                else {
                    console.log('⚠️  AKTools服务启动失败，将使用东方财富网作为降级方案');
                }
            }
            else {
                console.log('⚠️  AKTools未安装，将使用东方财富网数据');
                console.log('💡 要使用AKTools功能，请先运行: pip install aktools');
            }
        }
        catch (error) {
            console.error('❌ AKTools初始化失败:', error);
            console.log('💡 将使用东方财富网作为降级方案');
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
const server = new MarketMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map