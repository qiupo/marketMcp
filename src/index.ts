#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义Python akshare服务路径
const PYTHON_SERVICE_PATH = path.join(__dirname, '../akshare_service.py');

class AkshareMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'akshare-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupTools(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getToolDefinitions()
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return this.handleToolCall(name, args);
    });
  }

  private getToolDefinitions(): Tool[] {
    return [
      // 沪A股实时行情
      {
        name: 'stock_sh_a_spot_em',
        description: '获取沪A股实时行情数据',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: '返回数据条数限制，默认为100条',
              default: 100
            }
          }
        }
      },

      // 深A股实时行情
      {
        name: 'stock_sz_a_spot_em',
        description: '获取深A股实时行情数据',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: '返回数据条数限制，默认为100条',
              default: 100
            }
          }
        }
      },

  
      // 新股数据
      {
        name: 'stock_zh_a_new_em',
        description: '获取新股上市数据',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: '返回数据条数限制，默认为50条',
              default: 50
            }
          }
        }
      },

      // 风险警示板数据
      {
        name: 'stock_zh_a_st_em',
        description: '获取风险警示板股票数据',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: '返回数据条数限制，默认为50条',
              default: 50
            }
          }
        }
      },

      // 历史行情数据
      {
        name: 'stock_zh_a_hist',
        description: '获取A股历史行情数据',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: '股票代码，例如：600246'
            },
            period: {
              type: 'string',
              description: '周期：daily(日线), weekly(周线), monthly(月线)',
              enum: ['daily', 'weekly', 'monthly'],
              default: 'daily'
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
              description: '复权类型：qfq(前复权), hfq(后复权), ""(不复权)',
              enum: ['qfq', 'hfq', ''],
              default: ''
            }
          },
          required: ['symbol']
        }
      },

      // 个股信息查询
      {
        name: 'stock_individual_basic_info_xq',
        description: '查询个股基本信息',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: '股票代码，例如：600246'
            }
          },
          required: ['symbol']
        }
      },

      // 分时数据
      {
        name: 'stock_zh_a_minute',
        description: '获取股票分时数据',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: '股票代码，例如：sh600000'
            },
            period: {
              type: 'string',
              description: '时间周期：1, 5, 15, 30, 60 分钟',
              enum: ['1', '5', '15', '30', '60'],
              default: '1'
            },
            adjust: {
              type: 'string',
              description: '复权类型：qfq(前复权), hfq(后复权), ""(不复权)',
              enum: ['qfq', 'hfq', ''],
              default: ''
            }
          },
          required: ['symbol']
        }
      },

      // 股市日历
      {
        name: 'stock_gsrl_gsdt_em',
        description: '获取股市日历-公司动态数据',
        inputSchema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: '交易日，格式：20240101'
            }
          },
          required: ['date']
        }
      },

      // 个股实时行情雪球版
      {
        name: 'stock_individual_spot_xq',
        description: '获取个股实时行情数据（雪球）',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: '股票代码，例如：SZ600246、SH600000'
            }
          },
          required: ['symbol']
        }
      },

      // 实时行情
      {
        name: 'realtime_quote',
        description: '获取实时行情数据',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: '股票代码，支持多只股票，用逗号分隔，例如：600246,600000,000002'
            }
          },
          required: ['symbol']
        }
      },

      // 全球实时行情
      {
        name: 'stock_global_realtime',
        description: '获取全球股市实时行情数据',
        inputSchema: {
          type: 'object',
          properties: {
            region: {
              type: 'string',
              description: '地区：中国大陆、香港、美国、欧洲等',
              enum: ['中国', '香港', '美国', '欧洲', '亚洲', '全球'],
              default: '全球'
            }
          }
        }
      },

      // 港股实时行情
      {
        name: 'stock_hk_spot_em',
        description: '获取港股实时行情数据',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: '返回数据条数限制，默认为100条',
              default: 100
            }
          }
        }
      },

      // 美股实时行情
      {
        name: 'stock_us_spot',
        description: '获取美股实时行情数据（新浪）',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: '股票代码，支持多只股票，用逗号分隔，例如：AAPL,MSFT,GOOGL'
            }
          }
        }
      }
    ];
  }

  private async handleToolCall(name: string, args: any): Promise<any> {
    try {
      console.log(`[MCP] 调用工具: ${name}`, args);

      const pythonArgs = {
        function: name,
        params: args || {}
      };

      const result = await this.callPythonService(pythonArgs);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: result,
              tool: name,
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error(`[MCP] 工具调用失败: ${name}`, error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
              tool: name,
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    }
  }

  private async callPythonService(args: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        mode: 'json' as const,
        pythonOptions: ['-u'], // 获取实时输出
        args: [JSON.stringify(args)]
      };

      const pyshell = new PythonShell(PYTHON_SERVICE_PATH, options);

      let result: any = null;
      pyshell.on('message', (message: any) => {
        result = message;
      });

      pyshell.on('error', (err: any) => {
        console.error('[Python Error]', err);
        reject(new Error(`Python服务调用失败: ${err.message}`));
      });

      pyshell.on('close', (_code: number) => {
        try {
          if (result) {
            if (result.success) {
              resolve(result.data);
            } else {
              reject(new Error(result.error || 'Python服务返回错误'));
            }
          } else {
            reject(new Error('Python服务未返回数据'));
          }
        } catch (parseError) {
          console.error('[Parse Error]', parseError);
          reject(new Error('Python服务返回数据解析失败'));
        }
      });

      // PythonShell会自动使用启动时的参数，不需要手动发送
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP] Akshare MCP服务器启动成功');
  }
}

// 检查Python服务文件是否存在，如果不存在则创建
if (!fs.existsSync(PYTHON_SERVICE_PATH)) {
  console.log('[MCP] 创建Python服务文件...');
  createPythonService();
}

function createPythonService(): void {
  const pythonCode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AkShare Python服务
为MCP服务器提供金融数据接口
"""

import sys
import json
import importlib
from typing import Dict, Any, Optional
import pandas as pd

# 导入akshare
try:
    import akshare as ak
except ImportError:
    print(json.dumps({
        "success": False,
        "error": "akshare库未安装，请先安装：pip install akshare"
    }))
    sys.exit(1)

class AkshareService:
    """AkShare服务类"""

    def __init__(self):
        self.ak = ak

    def call_function(self, function_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """动态调用akshare函数"""
        try:
            # 获取函数
            if not hasattr(self.ak, function_name):
                return {
                    "success": False,
                    "error": f"函数 {function_name} 不存在"
                }

            func = getattr(self.ak, function_name)

            # 调用函数并转换参数
            result = func(**params)

            # 将DataFrame转换为字典列表
            if isinstance(result, pd.DataFrame):
                data = result.to_dict('records')
                return {
                    "success": True,
                    "data": data,
                    "count": len(data)
                }
            elif isinstance(result, pd.Series):
                data = result.to_dict()
                return {
                    "success": True,
                    "data": data
                }
            else:
                return {
                    "success": True,
                    "data": result
                }

        except Exception as e:
            return {
                "success": False,
                "error": f"调用函数失败: {str(e)}"
            }

def main():
    """主函数"""
    try:
        # 读取输入参数
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            input_data = json.loads(sys.stdin.read())

        function_name = input_data.get('function')
        params = input_data.get('params', {})

        if not function_name:
            result = {
                "success": False,
                "error": "未指定函数名称"
            }
        else:
            # 创建服务实例
            service = AkshareService()

            # 调用函数
            result = service.call_function(function_name, params)

        # 输出结果
        print(json.dumps(result, ensure_ascii=False, default=str))

    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "error": f"JSON解析失败: {str(e)}"
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"服务执行失败: {str(e)}"
        }))

if __name__ == "__main__":
    main()
`;

  fs.writeFileSync(PYTHON_SERVICE_PATH, pythonCode, 'utf8');
  console.log('[MCP] Python服务文件创建完成');
}

// 启动服务器
const server = new AkshareMCPServer();
server.run().catch(console.error);