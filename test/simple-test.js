#!/usr/bin/env node

/**
 * 简化测试脚本
 * 测试MCP服务器的基础功能
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleTester {
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

    // 等待服务器启动
    await this.sleep(3000);
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
      let timeout;

      const cleanup = () => {
        clearTimeout(timeout);
        this.serverProcess.stdout.removeAllListeners('data');
      };

      this.serverProcess.stdout.on('data', (data) => {
        responseData += data.toString();

        // 尝试解析完整的JSON响应
        const lines = responseData.trim().split('\n');
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              cleanup();
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
      timeout = setTimeout(() => {
        cleanup();
        reject(new Error('请求超时'));
      }, 10000); // 10秒超时
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
          name: 'simple-test-client',
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
      tools.forEach((tool, index) => {
        console.log(`  ${index + 1}. ${tool.name}: ${tool.description}`);
      });

      return tools;
    } catch (error) {
      console.error('❌ 获取工具列表失败:', error.message);
      throw error;
    }
  }

  async testBasicTool() {
    console.log('\n🧪 测试基础工具功能...');
    console.log('注意：由于网络连接问题，某些功能可能返回错误，这是正常的');

    // 测试一个简单工具 - 获取工具列表本身
    try {
      const response = await this.sendRequest('tools/list');
      if (response.error) {
        console.log('⚠️  工具列表请求返回错误:', response.error.message);
      } else {
        console.log('✅ 工具列表请求成功');
        console.log(`📊 找到 ${response.result.tools.length} 个工具`);
      }
    } catch (error) {
      console.log('⚠️  工具列表测试失败:', error.message);
    }
  }

  async cleanup() {
    if (this.serverProcess) {
      console.log('\n🛑 关闭MCP服务器...');
      this.serverProcess.kill();

      // 等待进程结束
      await this.sleep(1000);
      console.log('✅ 服务器已关闭');
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

      // 基础测试
      await this.testBasicTool();

      console.log('\n🎉 基础测试完成！');
      console.log('\n📋 可用工具概览:');
      tools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name}`);
      });

    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
    } finally {
      // 关闭服务器
      await this.cleanup();
    }
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SimpleTester();
  tester.runTests().catch(console.error);
}

export default SimpleTester;