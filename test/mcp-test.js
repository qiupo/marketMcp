#!/usr/bin/env node

/**
 * MCP服务器测试脚本
 * 测试akshare MCP服务器的各项功能
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPTester {
  constructor() {
    this.serverProcess = null;
    this.requestId = 1;
  }

  async startServer() {
    console.log('🚀 启动MCP服务器...');

    this.serverProcess = spawn('node', ['dist/index.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'inherit']
    });

    this.serverProcess.on('error', (error) => {
      console.error('❌ 服务器启动失败:', error);
    });

    this.serverProcess.on('exit', (code) => {
      console.log(`📋 服务器进程退出，代码: ${code}`);
    });

    // 等待服务器启动
    await this.sleep(2000);
    console.log('✅ MCP服务器启动成功');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params
      };

      const requestStr = JSON.stringify(request) + '\n';

      let responseData = '';

      this.serverProcess.stdout.on('data', (data) => {
        responseData += data.toString();

        // 尝试解析完整的JSON响应
        const lines = responseData.trim().split('\n');
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              resolve(response);
              return;
            }
          } catch (e) {
            // 忽略解析错误，继续等待完整响应
          }
        }
      });

      this.serverProcess.stdin.write(requestStr);

      // 设置超时
      setTimeout(() => {
        reject(new Error('请求超时'));
      }, 30000);
    });
  }

  async initialize() {
    console.log('🔧 初始化MCP连接...');

    try {
      const response = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('✅ MCP连接初始化成功');
      return response.result;
    } catch (error) {
      console.error('❌ MCP连接初始化失败:', error.message);
      throw error;
    }
  }

  async listTools() {
    console.log('🛠️  获取可用工具列表...');

    try {
      const response = await this.sendRequest('tools/list');

      if (response.error) {
        throw new Error(response.error.message);
      }

      const tools = response.result.tools;
      console.log(`✅ 找到 ${tools.length} 个可用工具:`);
      tools.forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });

      return tools;
    } catch (error) {
      console.error('❌ 获取工具列表失败:', error.message);
      throw error;
    }
  }

  async testTool(toolName, params = {}) {
    console.log(`🧪 测试工具: ${toolName}`);
    console.log(`📋 参数:`, JSON.stringify(params, null, 2));

    try {
      const response = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: params
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.result;
      console.log(`✅ 工具 ${toolName} 执行成功`);

      if (result.content && result.content.length > 0) {
        const content = result.content[0];
        if (content.type === 'text') {
          try {
            const data = JSON.parse(content.text);
            if (data.success) {
              console.log(`📊 数据获取成功，记录数: ${data.count || data.data?.length || 'unknown'}`);
              if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                console.log(`📄 示例数据:`, JSON.stringify(data.data.slice(0, 2), null, 2));
              }
            } else {
              console.log(`⚠️  数据获取失败: ${data.error}`);
            }
          } catch (parseError) {
            console.log(`📄 原始响应:`, content.text.substring(0, 200) + '...');
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`❌ 工具 ${toolName} 执行失败:`, error.message);
      throw error;
    }
  }

  async runTests() {
    try {
      // 启动服务器
      await this.startServer();

      // 初始化连接
      await this.initialize();

      // 获取工具列表
      const tools = await this.listTools();

      // 基础测试 - 获取A股实时行情
      console.log('\n📈 测试A股实时行情...');
      await this.testTool('stock_zh_a_spot_em', { limit: 5 });

      // 测试个股信息查询
      console.log('\n🏢 测试个股信息查询...');
      await this.testTool('stock_individual_info_em', { symbol: '000001' });

      // 测试历史行情数据
      console.log('\n📊 测试历史行情数据...');
      await this.testTool('stock_zh_a_hist', {
        symbol: '000001',
        period: 'daily',
        start_date: '20241201',
        end_date: '20241205'
      });

      // 测试创业板行情
      console.log('\n🚀 测试创业板行情...');
      await this.testTool('stock_cy_a_spot_em', { limit: 3 });

      // 测试科创板行情
      console.log('\n🔬 测试科创板行情...');
      await this.testTool('stock_kc_a_spot_em', { limit: 3 });

      // 测试B股行情
      console.log('\n💰 测试B股行情...');
      await this.testTool('stock_zh_b_spot_em', { limit: 3 });

      // 测试A+H股比价
      console.log('\n🌏 测试A+H股比价...');
      await this.testTool('stock_zh_ah_spot_em', { limit: 5 });

      // 测试美股行情
      console.log('\n🇺🇸 测试美股行情...');
      await this.testTool('stock_us_spot_em', { limit: 5 });

      console.log('\n🎉 所有测试完成！');

    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
    } finally {
      // 关闭服务器
      if (this.serverProcess) {
        console.log('\n🛑 关闭MCP服务器...');
        this.serverProcess.kill();
      }
    }
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPTester();
  tester.runTests().catch(console.error);
}

export default MCPTester;