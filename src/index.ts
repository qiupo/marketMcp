#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { StockService } from './services/stockService.js';
import { GetStockInfoParams, DataSource } from './types/stock.js';

/**
 * 金融股票数据查询MCP服务器
 */
class MarketMCPServer {
  private server: Server;
  private stockService: StockService;

  constructor() {
    this.server = new Server(
      {
        name: 'market-mcp',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      }
    );

    this.stockService = new StockService();
    this.setupHandlers();
  }

  private setupHandlers() {
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
          },
          // IPO3 增强功能工具
          {
            name: 'get_company_info',
            description: '获取公司详细信息，包括基本资料、股本结构、高管信息、公司简介等',
            inputSchema: {
              type: 'object',
              properties: {
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false返回中文字段名',
                  default: false
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                statement_type: {
                  type: 'string',
                  enum: ['income', 'balance', 'cashflow', 'analysis'],
                  description: '报表类型：income-利润表，balance-资产负债表，cashflow-现金流量表，analysis-财务分析'
                },
                date_type: {
                  type: 'string',
                  enum: ['年报', '中报', '一季报', '三季报'],
                  description: '报告期类型，默认年报',
                  default: '年报'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false',
                  default: false
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false',
                  default: false
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false',
                  default: false
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false',
                  default: false
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                page: {
                  type: 'number',
                  description: '页码，默认1',
                  default: 1,
                  minimum: 1
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false',
                  default: false
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false',
                  default: false
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false',
                  default: false
                }
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
                stock_code: {
                  type: 'string',
                  description: '股票代码（6位数字）'
                },
                english_key: {
                  type: 'boolean',
                  description: '是否返回英文字段名，默认false',
                  default: false
                }
              },
              required: ['stock_code']
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
          case 'get_company_info':
            return await this.handleGetCompanyInfo(args);
          case 'get_financial_statements':
            return await this.handleGetFinancialStatements(args);
          case 'get_stock_funding':
            return await this.handleGetStockFunding(args);
          case 'get_stock_trades':
            return await this.handleGetStockTrades(args);
          case 'get_stock_events':
            return await this.handleGetStockEvents(args);
          case 'get_stock_notices':
            return await this.handleGetStockNotices(args);
          case 'get_stock_survey':
            return await this.handleGetStockSurvey(args);
          case 'get_stock_brokers':
            return await this.handleGetStockBrokers(args);
          case 'get_stock_pledge':
            return await this.handleGetStockPledge(args);
          case 'get_stock_reports':
            return await this.handleGetStockReports(args);
          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
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

  // 基础工具处理方法
  private async handleGetStockInfo(args: any) {
    const { codes, data_source } = args as GetStockInfoParams;

    let codesArray: string[];
    if (typeof codes === 'string') {
      codesArray = codes.split(/[,，\s]+/).filter(code => code.trim());
    } else if (Array.isArray(codes)) {
      codesArray = codes;
    } else {
      throw new Error('股票代码格式错误');
    }

    const dataSource = data_source as DataSource | undefined;
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
    } else {
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

  private async handleSearchStock(args: any) {
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
    } else {
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

  private async handleGetPopularStocks(args: any) {
    const { data_source } = args;
    const dataSource = data_source as DataSource | undefined;
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
    } else {
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

  private async handleValidateStockCode(args: any) {
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

  // IPO3增强功能处理方法
  private async handleIPO3Request(methodName: string, displayName: string, args: any, extraParams: string[] = []): Promise<any> {
    try {
      const { stock_code, english_key = false, ...otherParams } = args;

      // 构建参数列表
      const params: any[] = [stock_code, english_key];

      // 添加额外参数
      for (const param of extraParams) {
        if (param in otherParams) {
          params.push(otherParams[param]);
        }
      }

      // 动态调用方法
      const method = (this.stockService as any)[methodName];
      if (!method) {
        throw new Error(`方法 ${methodName} 不存在`);
      }

      const result = await method.apply(this.stockService, params);

      // 构建描述信息
      let description = `${displayName} (股票代码: ${stock_code})`;
      if ('page' in otherParams) {
        description += `, 第${otherParams.page}页`;
      }
      if ('statement_type' in otherParams) {
        const statementNames: Record<string, string> = {
          'income': '利润表',
          'balance': '资产负债表',
          'cashflow': '现金流量表',
          'analysis': '财务分析'
        };
        description += `, 报表类型: ${statementNames[otherParams.statement_type] || otherParams.statement_type}`;
      }
      if ('date_type' in otherParams) {
        description += `, 报告期: ${otherParams.date_type}`;
      }
      description += ')';

      return {
        content: [
          {
            type: 'text',
            text: `${description}:\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `获取${displayName}失败: ${error instanceof Error ? error.message : '未知错误'}`
          }
        ]
      };
    }
  }

  private async handleGetCompanyInfo(args: any) {
    return await this.handleIPO3Request('getCompanyInfo', '公司详细信息', args);
  }

  private async handleGetFinancialStatements(args: any) {
    const { stock_code, statement_type, date_type = '年报', english_key = false } = args;

    try {
      let methodName: string;
      switch (statement_type) {
        case 'income':
          methodName = 'getIncomeStatementList';
          break;
        case 'balance':
          methodName = 'getBalanceSheetList';
          break;
        case 'cashflow':
          methodName = 'getCashFlowStatementList';
          break;
        case 'analysis':
          methodName = 'getFinancialAnalysisList';
          break;
        default:
          throw new Error(`不支持的报表类型: ${statement_type}`);
      }

      const method = (this.stockService as any)[methodName];
      if (!method) {
        throw new Error(`方法 ${methodName} 不存在`);
      }

      const result = await method.call(this.stockService, stock_code, date_type, english_key);

      const statementNames: Record<string, string> = {
        'income': '利润表',
        'balance': '资产负债表',
        'cashflow': '现金流量表',
        'analysis': '财务分析'
      };

      return {
        content: [
          {
            type: 'text',
            text: `${statementNames[statement_type]} (股票代码: ${stock_code}, 报告期: ${date_type}):\n\n${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `获取财务报表失败: ${error instanceof Error ? error.message : '未知错误'}`
          }
        ]
      };
    }
  }

  private async handleGetStockFunding(args: any) {
    return await this.handleIPO3Request('getStockFundList', '募资明细', args);
  }

  private async handleGetStockTrades(args: any) {
    return await this.handleIPO3Request('getStockTradeList', '交易明细', args);
  }

  private async handleGetStockEvents(args: any) {
    return await this.handleIPO3Request('getStockEventList', '事件提醒', args);
  }

  private async handleGetStockNotices(args: any) {
    return await this.handleIPO3Request('getStockNoticeList', '公告列表', args, ['page']);
  }

  private async handleGetStockSurvey(args: any) {
    return await this.handleIPO3Request('getStockSurvey', '定增计划', args);
  }

  private async handleGetStockBrokers(args: any) {
    return await this.handleIPO3Request('getStockBrokerList', '做市商信息', args);
  }

  private async handleGetStockPledge(args: any) {
    return await this.handleIPO3Request('getStockPledgeData', '质押信息', args);
  }

  private async handleGetStockReports(args: any) {
    return await this.handleIPO3Request('getStockReportList', '研报列表', args);
  }

  // 提示处理方法
  private async handleStockAnalysisPrompt(args: any) {
    const { stock_codes, analysis_type = 'basic' } = args;
    const codes = stock_codes.split(/[,，\s]+/).filter((code: string) => code.trim());
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
    } else {
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

  private async handleMarketOverviewPrompt(args: any) {
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

  private formatStockData(stocks: any[], source: string): string {
    if (stocks.length === 0) return '暂无数据';

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

  private formatNumber(num: number): string {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    } else {
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