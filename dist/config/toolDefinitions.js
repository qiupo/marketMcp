"use strict";
/**
 * MCP工具定义配置
 * 统一管理所有工具定义，避免重复
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DISPLAY_NAMES = exports.TOOL_METHOD_MAP = exports.ALL_TOOLS = exports.IPO3_TOOLS = exports.BASIC_TOOLS = exports.IPO3_TOOL_CONFIG = void 0;
/**
 * IPO3工具配置映射
 * 统一管理工具参数和描述
 */
exports.IPO3_TOOL_CONFIG = {
    // 通用参数
    stockCode: {
        type: 'string',
        description: '股票代码（6位数字）'
    },
    englishKey: {
        type: 'boolean',
        description: '是否返回英文字段名，默认false返回中文字段名',
        default: false
    },
    page: {
        type: 'number',
        description: '页码，默认1',
        default: 1,
        minimum: 1
    },
    statementType: {
        type: 'string',
        enum: ['income', 'balance', 'cashflow', 'analysis'],
        description: '报表类型：income-利润表，balance-资产负债表，cashflow-现金流量表，analysis-财务分析'
    },
    dateType: {
        type: 'string',
        enum: ['年报', '中报', '一季报', '三季报'],
        description: '报告期类型，默认年报',
        default: '年报'
    }
};
/**
 * 基础工具定义
 */
exports.BASIC_TOOLS = [
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
                    enum: ['ipo3', 'eastmoney'],
                    description: '数据源选择，ipo3-使用IPO3.com（已废弃），eastmoney-使用东方财富网（推荐）'
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
                },
                data_source: {
                    type: 'string',
                    enum: ['ipo3', 'eastmoney'],
                    description: '数据源选择，ipo3-使用IPO3.com（已废弃），eastmoney-使用东方财富网（推荐）',
                    default: 'eastmoney'
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
                    enum: ['ipo3', 'eastmoney'],
                    description: '数据源选择，ipo3-使用IPO3.com（已废弃），eastmoney-使用东方财富网（推荐）',
                    default: 'eastmoney'
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
];
/**
 * IPO3增强工具定义
 */
exports.IPO3_TOOLS = [
    {
        name: 'get_company_info',
        description: '获取公司详细信息，包括基本资料、股本结构、高管信息、公司简介等',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code']
        }
    },
    {
        name: 'get_financial_statements',
        description: '获取财务报表数据（利润表、资产负债表、现金流量表、财务分析）',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                statement_type: exports.IPO3_TOOL_CONFIG.statementType,
                date_type: exports.IPO3_TOOL_CONFIG.dateType,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code', 'statement_type']
        }
    },
    {
        name: 'get_stock_funding',
        description: '获取股票募资明细，包括投资者信息、投资金额、锁定状态等',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code']
        }
    },
    {
        name: 'get_stock_trades',
        description: '获取股票交易明细，包括交易价格、交易量、买卖双方信息等',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code']
        }
    },
    {
        name: 'get_stock_events',
        description: '获取股票事件提醒，包括重要事件日期和类型',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code']
        }
    },
    {
        name: 'get_stock_notices',
        description: '获取股票公告列表，支持分页查询',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                page: exports.IPO3_TOOL_CONFIG.page
            },
            required: ['stock_code']
        }
    },
    {
        name: 'get_stock_survey',
        description: '获取股票定增计划信息，包括融资进度和基本信息',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code']
        }
    },
    {
        name: 'get_stock_brokers',
        description: '获取做市商信息，包括做市商、初始库存、初始价格等',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code']
        }
    },
    {
        name: 'get_stock_pledge',
        description: '获取股票质押信息，包括质押总数和质押方详情',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code']
        }
    },
    {
        name: 'get_stock_reports',
        description: '获取研报列表，包括研究报告标题和发布时间',
        inputSchema: {
            type: 'object',
            properties: {
                stock_code: exports.IPO3_TOOL_CONFIG.stockCode,
                english_key: exports.IPO3_TOOL_CONFIG.englishKey
            },
            required: ['stock_code']
        }
    }
];
/**
 * 所有工具定义
 */
exports.ALL_TOOLS = [...exports.BASIC_TOOLS, ...exports.IPO3_TOOLS];
/**
 * 工具名称到方法名的映射
 */
exports.TOOL_METHOD_MAP = {
    'get_company_info': 'getCompanyInfo',
    'get_financial_statements': 'getFinancialStatements',
    'get_stock_funding': 'getStockFundList',
    'get_stock_trades': 'getStockTradeList',
    'get_stock_events': 'getStockEventList',
    'get_stock_notices': 'getStockNoticeList',
    'get_stock_survey': 'getStockSurvey',
    'get_stock_brokers': 'getStockBrokerList',
    'get_stock_pledge': 'getStockPledgeData',
    'get_stock_reports': 'getStockReportList'
};
/**
 * 工具显示名称映射
 */
exports.TOOL_DISPLAY_NAMES = {
    'get_company_info': '公司详细信息',
    'get_financial_statements': '财务报表',
    'get_stock_funding': '募资明细',
    'get_stock_trades': '交易明细',
    'get_stock_events': '事件提醒',
    'get_stock_notices': '公告列表',
    'get_stock_survey': '定增计划',
    'get_stock_brokers': '做市商信息',
    'get_stock_pledge': '质押信息',
    'get_stock_reports': '研报列表'
};
//# sourceMappingURL=toolDefinitions.js.map