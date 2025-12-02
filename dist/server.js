#!/usr/bin/env node
"use strict";
/**
 * Market MCP 增强版服务器
 * 集成东方财富网和AKTools的数据功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const dataService_js_1 = require("./services/dataService.js");
const index_js_2 = require("./config/index.js");
/**
 * 增强版Market MCP服务器
 */
class EnhancedMarketMCPServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: index_js_2.defaultConfig.server.name,
            version: index_js_2.defaultConfig.server.version,
        }, {
            capabilities: {
                tools: {},
                prompts: {},
            },
        });
        this.dataService = new dataService_js_1.DataService();
        this.setupHandlers();
    }
    setupHandlers() {
        // 工具列表
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            const tools = [];
            if (index_js_2.defaultConfig.features.enableHistory || index_js_2.defaultConfig.features.enableBasicInfo || index_js_2.defaultConfig.features.enableMarketOverview) {
                tools.push({
                    name: 'get_stock_info',
                    description: '获取股票实时行情信息，支持单个或批量查询，可指定数据源',
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
                                enum: ['eastmoney', 'aktools', 'auto'],
                                description: '数据源选择：eastmoney(东方财富网)，aktools(AKTools)，auto(自动选择)'
                            }
                        },
                        required: ['codes']
                    }
                });
            }
            if (index_js_2.defaultConfig.features.enableHistory) {
                tools.push({
                    name: 'get_stock_history',
                    description: '获取股票历史行情数据，支持日/周/月周期，可指定复权方式',
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
                            },
                            data_source: {
                                type: 'string',
                                enum: ['eastmoney', 'aktools', 'auto'],
                                description: '数据源选择'
                            }
                        },
                        required: ['codes']
                    }
                });
            }
            if (index_js_2.defaultConfig.features.enableBasicInfo) {
                tools.push({
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
                            },
                            data_source: {
                                type: 'string',
                                enum: ['eastmoney', 'aktools', 'auto'],
                                description: '数据源选择'
                            }
                        },
                        required: ['codes']
                    }
                });
            }
            if (index_js_2.defaultConfig.features.enableMarketOverview) {
                tools.push({
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
                            },
                            data_source: {
                                type: 'string',
                                enum: ['eastmoney', 'aktools', 'auto'],
                                description: '数据源选择'
                            }
                        }
                    }
                });
            }
            if (index_js_2.defaultConfig.features.enableServiceCheck) {
                tools.push({
                    name: 'check_services',
                    description: '检查各数据源服务状态，包括东方财富网和AKTools',
                    inputSchema: {
                        type: 'object',
                        properties: {}
                    }
                });
            }
            return { tools };
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
                    case 'check_services':
                        return await this.handleCheckServices(args);
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
                        description: '分析股票行情和趋势，提供专业的技术分析',
                        arguments: [
                            {
                                name: 'stock_codes',
                                description: '要分析的股票代码，用逗号分隔',
                                required: true
                            },
                            {
                                name: 'analysis_type',
                                description: '分析类型：basic(基础分析), technical(技术分析), comprehensive(综合分析)',
                                required: false
                            },
                            {
                                name: 'data_source',
                                description: '指定数据源：eastmoney, aktools, auto',
                                required: false
                            }
                        ]
                    },
                    {
                        name: 'market_watch',
                        description: '市场监控，获取实时市场动态和热点板块',
                        arguments: [
                            {
                                name: 'market_focus',
                                description: '监控市场：all(全部), sh(沪市), sz(深市), bj(北市)',
                                required: false
                            },
                            {
                                name: 'sectors',
                                description: '关注的行业板块，用逗号分隔',
                                required: false
                            },
                            {
                                name: 'data_source',
                                description: '指定数据源：eastmoney, aktools, auto',
                                required: false
                            }
                        ]
                    },
                    {
                        name: 'portfolio_analysis',
                        description: '投资组合分析，分析持仓股票的整体表现',
                        arguments: [
                            {
                                name: 'portfolio_codes',
                                description: '投资组合股票代码，用逗号分隔',
                                required: true
                            },
                            {
                                name: 'analysis_depth',
                                description: '分析深度：summary(概览), detailed(详细), risk(风险评估)',
                                required: false
                            },
                            {
                                name: 'data_source',
                                description: '指定数据源：eastmoney, aktools, auto',
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
            try {
                switch (name) {
                    case 'stock_analysis':
                        return await this.handleStockAnalysisPrompt(args);
                    case 'market_watch':
                        return await this.handleMarketWatchPrompt(args);
                    case 'portfolio_analysis':
                        return await this.handlePortfolioAnalysisPrompt(args);
                    default:
                        throw new Error(`未知提示: ${name}`);
                }
            }
            catch (error) {
                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `生成分析提示时出错: ${error instanceof Error ? error.message : '未知错误'}`
                            }
                        }
                    ]
                };
            }
        });
    }
    // 工具处理方法
    async handleGetStockInfo(args) {
        const { codes, data_source = 'auto' } = args;
        const codesArray = this.normalizeCodes(codes);
        if (codesArray.length === 0) {
            throw new Error('股票代码不能为空');
        }
        const result = await this.dataService.getStockRealtime(codesArray, data_source === 'auto' ? undefined : data_source);
        if (result.success && result.data.length > 0) {
            const formattedData = this.formatStockData(result.data, result.source);
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
                        text: `查询失败: ${result.errors?.join(', ') || '未知错误'}\n\n💡 提示: 请检查股票代码格式或网络连接`
                    }
                ]
            };
        }
    }
    async handleGetStockHistory(args) {
        const { codes, period = 'daily', start_date, end_date, adjust = '', data_source = 'auto' } = args;
        const codesArray = this.normalizeCodes(codes);
        if (codesArray.length === 0) {
            throw new Error('股票代码不能为空');
        }
        const result = await this.dataService.getStockHistory(codesArray, { period, startDate: start_date, endDate: end_date, adjust }, data_source === 'auto' ? undefined : data_source);
        if (result.success && result.data.length > 0) {
            const formattedData = this.formatHistoryData(result.data, result.source, { period, start_date, end_date, adjust });
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
                        text: `查询失败: ${result.errors?.join(', ') || '未知错误'}\n\n💡 提示: 历史数据查询需要AKTools服务支持`
                    }
                ]
            };
        }
    }
    async handleGetStockBasic(args) {
        const { codes, data_source = 'auto' } = args;
        const codesArray = this.normalizeCodes(codes);
        if (codesArray.length === 0) {
            throw new Error('股票代码不能为空');
        }
        const result = await this.dataService.getStockBasicInfo(codesArray, data_source === 'auto' ? undefined : data_source);
        if (result.success && result.data.length > 0) {
            const formattedData = this.formatBasicData(result.data, result.source);
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
                        text: `查询失败: ${result.errors?.join(', ') || '未知错误'}\n\n💡 提示: 基本信息查询需要AKTools服务支持`
                    }
                ]
            };
        }
    }
    async handleGetMarketOverview(args) {
        const { market = 'all', sector, data_source = 'auto' } = args;
        const result = await this.dataService.getMarketOverview({ market, sector }, data_source === 'auto' ? undefined : data_source);
        if (result.success && result.data) {
            const formattedData = this.formatMarketOverview(result.data, result.source);
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
    async handleCheckServices(args) {
        const services = await this.dataService.checkServices();
        let statusText = '🔍 服务状态检查\n\n';
        if (services.eastmoney) {
            statusText += `📈 东方财富网: ${services.eastmoney}\n`;
        }
        if (services.aktools) {
            statusText += `🔧 AKTools: ${services.aktools ? '✅ 正常' : '❌ 不可用'}\n`;
        }
        statusText += `\n🏗️ 建议配置:\n`;
        statusText += `- 默认数据源: ${services.recommended}\n`;
        statusText += `- 自动选择: ${services.auto ? '启用' : '禁用'}\n`;
        if (!services.aktools && services.recommended === 'aktools') {
            statusText += `\n⚠️  AKTools未启动，请运行: pip install aktools && python -m aktools`;
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
    // 提示处理方法
    async handleStockAnalysisPrompt(args) {
        const { stock_codes, analysis_type = 'basic', data_source = 'auto' } = args;
        const codesArray = this.normalizeCodes(stock_codes);
        const result = await this.dataService.getStockRealtime(codesArray, data_source === 'auto' ? undefined : data_source);
        let prompt = `请对以下股票进行${this.getAnalysisTypeText(analysis_type)}分析:\n\n`;
        if (result.success && result.data.length > 0) {
            const stockData = this.formatStockData(result.data, result.source);
            prompt += stockData;
        }
        else {
            prompt += `❌ 获取股票数据失败: ${result.errors?.join(', ') || '未知错误'}`;
        }
        prompt += `\n\n📋 分析要求:`;
        switch (analysis_type) {
            case 'technical':
                prompt += `\n- 技术指标分析(均线、MACD、RSI等)\n- 支撑阻力位判断\n- 成交量分析\n- 趋势预测`;
                break;
            case 'comprehensive':
                prompt += `\n- 基本面分析\n- 技术面分析\n- 市场情绪分析\n- 投资建议`;
                break;
            default:
                prompt += `\n- 当前行情分析\n- 涨跌幅统计\n- 成交活跃度\n- 短期趋势判断`;
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
    async handleMarketWatchPrompt(args) {
        const { market_focus = 'all', sectors, data_source = 'auto' } = args;
        const result = await this.dataService.getMarketOverview({ market: market_focus }, data_source === 'auto' ? undefined : data_source);
        let prompt = `📊 市场监控报告 - ${market_focus === 'all' ? '全市场' : market_focus.toUpperCase()}\n\n`;
        if (result.success && result.data) {
            prompt += `📈 总体情况:\n`;
            prompt += `- 统计时间: ${result.data.updateTime}\n`;
            prompt += `- 交易股票数: ${result.data.totalCount}\n`;
            prompt += `- 总成交额: ${this.formatAmount(result.data.totalAmount)}\n\n`;
            if (sectors) {
                prompt += `🎯 重点关注板块: ${sectors}\n`;
            }
            if (result.data.sectorStats && Object.keys(result.data.sectorStats).length > 0) {
                prompt += `📋 行业板块统计:\n`;
                const sortedSectors = Object.entries(result.data.sectorStats)
                    .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
                    .slice(0, 10);
                for (const [sector, stats] of sortedSectors) {
                    prompt += `- ${sector}: ${stats.count}只股票, ${this.formatAmount(stats.totalAmount)}, 平均涨跌幅${stats.avgChange?.toFixed(2) || '0.00'}%\n`;
                }
            }
        }
        else {
            prompt += `❌ 获取市场数据失败: ${result.error || '未知错误'}`;
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
    async handlePortfolioAnalysisPrompt(args) {
        const { portfolio_codes, analysis_depth = 'summary', data_source = 'auto' } = args;
        const codesArray = this.normalizeCodes(portfolio_codes);
        const result = await this.dataService.getStockRealtime(codesArray, data_source === 'auto' ? undefined : data_source);
        let prompt = `💼 投资组合分析 (${this.getAnalysisDepthText(analysis_depth)})\n\n`;
        if (result.success && result.data.length > 0) {
            prompt += `📊 持仓概览:\n`;
            let totalValue = 0;
            let totalChange = 0;
            let positiveCount = 0;
            let negativeCount = 0;
            for (const stock of result.data) {
                prompt += `- ${stock.code} ${stock.name}: ${stock.price} (${stock.changePercent})\n`;
                totalValue += stock.price;
                totalChange += stock.change;
                if (stock.change > 0)
                    positiveCount++;
                if (stock.change < 0)
                    negativeCount++;
            }
            prompt += `\n📈 组合统计:\n`;
            prompt += `- 持仓数量: ${result.data.length}\n`;
            prompt += `- 平均价格: ${(totalValue / result.data.length).toFixed(2)}\n`;
            prompt += `- 总涨跌额: ${totalChange.toFixed(2)}\n`;
            prompt += `- 上涨股票: ${positiveCount}只 (${((positiveCount / result.data.length) * 100).toFixed(1)}%)\n`;
            prompt += `- 下跌股票: ${negativeCount}只 (${((negativeCount / result.data.length) * 100).toFixed(1)}%)\n`;
            if (analysis_depth === 'risk') {
                prompt += `\n⚠️ 风险评估:\n`;
                const maxLoss = Math.max(...result.data.map(s => Math.abs(s.change)));
                const maxLossPercent = Math.max(...result.data.map(s => Math.abs(parseFloat(s.changePercent))));
                prompt += `- 最大单只损失: ${maxLoss.toFixed(2)} (${maxLossPercent.toFixed(2)}%)\n`;
                prompt += `- 集中度: ${positiveCount === negativeCount ? '中等' : positiveCount > negativeCount ? '较高' : '较低'}\n`;
                prompt += `- 建议控制单只持仓比例在20%以内`;
            }
        }
        else {
            prompt += `❌ 获取组合数据失败: ${result.errors?.join(', ') || '未知错误'}`;
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
    // 辅助方法
    normalizeCodes(codes) {
        if (typeof codes === 'string') {
            return codes.split(/[,，\s]+/).filter(code => code.trim());
        }
        else if (Array.isArray(codes)) {
            return codes;
        }
        else {
            return [];
        }
    }
    getAnalysisTypeText(type) {
        switch (type) {
            case 'technical': return '技术分析';
            case 'comprehensive': return '综合分析';
            default: return '基础分析';
        }
    }
    getAnalysisDepthText(depth) {
        switch (depth) {
            case 'detailed': return '详细分析';
            case 'risk': return '风险评估';
            default: return '概览';
        }
    }
    // 数据格式化方法
    formatStockData(stocks, source) {
        if (stocks.length === 0)
            return '暂无数据';
        const header = '股票代码\t股票名称\t最新价格\t涨跌额\t涨跌幅\t成交量\t成交额\t市场';
        const separator = '-'.repeat(80);
        let result = `📊 股票实时行情 (数据源: ${source})\n${separator}\n${header}\n${separator}\n`;
        for (const stock of stocks) {
            const changeColor = stock.change >= 0 ? '📈' : '📉';
            result += `${stock.code}\t${stock.name}\t${stock.price.toFixed(2)}\t` +
                `${stock.change.toFixed(2)}\t${stock.changePercent}\t` +
                `${stock.volume}\t${stock.amount}\t${stock.market}\t${changeColor}\n`;
        }
        result += `${separator}\n🕒 更新时间: ${new Date().toLocaleString('zh-CN')}`;
        return result;
    }
    formatHistoryData(data, source, options) {
        if (data.length === 0)
            return '暂无历史数据';
        let result = `📈 股票历史数据 (数据源: ${source})\n\n`;
        result += `📋 查询参数:\n`;
        result += `- 股票代码: ${data.map(s => s.code).join(', ')}\n`;
        result += `- 数据周期: ${options.period}\n`;
        if (options.start_date)
            result += `- 开始日期: ${options.start_date}\n`;
        if (options.end_date)
            result += `- 结束日期: ${options.end_date}\n`;
        result += `- 复权方式: ${options.adjust || '不复权'}\n\n`;
        for (const stock of data.slice(0, 3)) { // 只显示前3只股票
            result += `${stock.code} ${stock.name}:\n`;
            result += `- 最新价格: ${stock.price}\n`;
            result += `- 涨跌额: ${stock.change}\n`;
            result += `- 涨跌幅: ${stock.changePercent}\n`;
            result += `- 市场: ${stock.market}\n`;
            result += `- 更新时间: ${new Date(stock.timestamp).toLocaleString('zh-CN')}\n`;
        }
        if (data.length > 3) {
            result += `... 还有${data.length - 3}只股票数据\n`;
        }
        return result;
    }
    formatBasicData(data, source) {
        if (data.length === 0)
            return '暂无基本信息';
        const header = '股票代码\t股票名称\t最新价格\t总市值\t流通市值\t市盈率\t行业\t市场';
        const separator = '-'.repeat(80);
        let result = `🏢 股票基本信息 (数据源: ${source})\n${separator}\n${header}\n${separator}\n`;
        for (const stock of data) {
            result += `${stock.code}\t${stock.name}\t${stock.price.toFixed(2)}\t` +
                `${stock.totalMarketValue || '-'}\t${stock.circulatingMarketValue || '-'}\t` +
                `${stock.peRatio || '-'}\t${stock.industry || '-'}\t${stock.market}\n`;
        }
        result += `${separator}\n🕒 更新时间: ${new Date().toLocaleString('zh-CN')}`;
        return result;
    }
    formatMarketOverview(data, source) {
        let result = `📊 市场概览 (数据源: ${source})\n\n`;
        result += `🕒 统计时间: ${data.updateTime}\n`;
        result += `📈 总交易股票数: ${data.totalCount}\n`;
        result += `💰 总成交额: ${this.formatAmount(data.totalAmount)}\n\n`;
        if (data.sectorStats && Object.keys(data.sectorStats).length > 0) {
            result += `🏭️ 行业板块统计:\n`;
            const sortedSectors = Object.entries(data.sectorStats)
                .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
                .slice(0, 15);
            for (const [sector, stats] of sortedSectors) {
                const statsData = stats;
                result += `- ${sector}: ${statsData.count}只股票, ${this.formatAmount(statsData.totalAmount)}, 平均涨跌幅${statsData.avgChange?.toFixed(2) || '0.00'}%\n`;
            }
        }
        return result;
    }
    formatAmount(amount) {
        if (amount >= 100000000) {
            return (amount / 100000000).toFixed(2) + '亿元';
        }
        else if (amount >= 10000) {
            return (amount / 10000).toFixed(2) + '万元';
        }
        else {
            return amount.toFixed(2) + '元';
        }
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('🚀 Enhanced Market MCP Server running on stdio');
    }
}
// 启动服务器
const server = new EnhancedMarketMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=server.js.map