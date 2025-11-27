#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { StockService } from './services/stockService.js';
/**
 * 金融股票数据查询MCP服务器
 */
class MarketMCPServer {
    server;
    stockService;
    constructor() {
        this.server = new Server({
            name: 'market-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
                prompts: {},
            },
        });
        this.stockService = new StockService();
        this.setupHandlers();
    }
    setupHandlers() {
        // 工具列表
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
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
                                    enum: ['ipo3'],
                                    description: '数据源选择，使用IPO3.com提供详细的公司信息'
                                }
                            },
                            required: ['codes']
                        }
                    },
                    {
                        name: 'search_stock',
                        description: '搜索股票信息，支持按名称或代码搜索，返回匹配的股票列表',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                keyword: {
                                    type: 'string',
                                    description: '搜索关键词，可以是股票名称或代码'
                                }
                            },
                            required: ['keyword']
                        }
                    },
                    {
                        name: 'get_popular_stocks',
                        description: '获取热门股票行情，包括涨跌幅、成交量等关键指标',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                data_source: {
                                    type: 'string',
                                    enum: ['ipo3'],
                                    description: '数据源选择，可选'
                                }
                            }
                        }
                    },
                    {
                        name: 'validate_stock_code',
                        description: '验证股票代码格式',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    description: '要验证的股票代码'
                                }
                            },
                            required: ['code']
                        }
                    }
                ]
            };
        });
        // 工具调用处理
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'get_stock_info':
                        return await this.handleGetStockInfo(args);
                    case 'search_stock':
                        return await this.handleSearchStock(args);
                    case 'get_popular_stocks':
                        return await this.handleGetPopularStocks(args);
                    case 'validate_stock_code':
                        return await this.handleValidateStockCode(args);
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
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
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
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
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
        const dataSource = data_source;
        const result = await this.stockService.getBatchStockInfo(codesArray, dataSource);
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
                        text: `查询失败: ${result.errors?.join(', ') || '未知错误'}`
                    }
                ]
            };
        }
    }
    async handleSearchStock(args) {
        const { keyword } = args;
        const result = await this.stockService.searchStock(keyword);
        if (result.success && result.data.length > 0) {
            const formattedData = this.formatStockData(result.data, result.source);
            return {
                content: [
                    {
                        type: 'text',
                        text: `搜索结果 (${result.source}):\n\n${formattedData}`
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: 'text',
                        text: `搜索无结果: ${result.errors?.join(', ') || '未知错误'}`
                    }
                ]
            };
        }
    }
    async handleGetPopularStocks(args) {
        const { data_source } = args;
        const dataSource = data_source;
        const result = await this.stockService.getPopularStocks();
        if (result.success && result.data.length > 0) {
            const formattedData = this.formatStockData(result.data, result.source);
            return {
                content: [
                    {
                        type: 'text',
                        text: `热门股票行情 (${result.source}):\n\n${formattedData}`
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: 'text',
                        text: `获取热门股票失败: ${result.errors?.join(', ') || '未知错误'}`
                    }
                ]
            };
        }
    }
    async handleValidateStockCode(args) {
        const { code } = args;
        const isValid = this.stockService.validateStockCode(code);
        const normalizedCode = this.stockService.normalizeStockCode(code);
        return {
            content: [
                {
                    type: 'text',
                    text: `股票代码验证结果:\n` +
                        `原始代码: ${code}\n` +
                        `标准化代码: ${normalizedCode}\n` +
                        `格式有效性: ${isValid ? '✓ 有效' : '✗ 无效'}\n` +
                        `建议: ${isValid ? '代码格式正确' : '请使用6位数字股票代码'}`
                }
            ]
        };
    }
    async handleStockAnalysisPrompt(args) {
        const { stock_codes, analysis_type = 'basic' } = args;
        const codes = stock_codes.split(/[,，\s]+/).filter((code) => code.trim());
        const result = await this.stockService.getBatchStockInfo(codes);
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
        const result = await this.stockService.getPopularStocks();
        if (result.success && result.data.length > 0) {
            prompt += '\n\n热门股票参考:\n' + this.formatStockData(result.data, result.source);
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
    formatStockData(stocks, source) {
        if (stocks.length === 0)
            return '暂无数据';
        const header = `股票代码\t股票名称\t当前价格\t涨跌额\t涨跌幅\t成交量\t成交额\t市场`;
        const separator = '-'.repeat(80);
        let result = `数据来源: ${source}\n${separator}\n${header}\n${separator}\n`;
        for (const stock of stocks) {
            const changeColor = stock.change >= 0 ? '📈' : '📉';
            result += `${stock.code}\t${stock.name}\t${stock.price.toFixed(2)}\t` +
                `${stock.change.toFixed(2)}\t${stock.changePercent.toFixed(2)}%\t` +
                `${this.formatNumber(stock.volume)}\t${this.formatNumber(stock.amount)}\t` +
                `${stock.market.toUpperCase()}\t${changeColor}\n`;
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
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Market MCP Server running on stdio');
    }
}
const server = new MarketMCPServer();
server.run().catch(console.error);
