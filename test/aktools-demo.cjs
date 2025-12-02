#!/usr/bin/env node

/**
 * AKTools集成演示脚本
 * 展示集成后的MCP服务器功能
 */

const { spawn } = require('child_process');
const path = require('path');

// 演示配置
const SERVER_PATH = path.join(__dirname, '../dist/simple-server.js');

class AKToolsDemo {
  constructor() {
    this.serverProcess = null;
  }

  /**
   * 运行演示
   */
  async runDemo() {
    console.log('🎯 AKTools集成功能演示');
    console.log('='.repeat(60));

    try {
      // 1. 启动服务器
      await this.startServer();

      // 2. 检查AKTools状态
      await this.checkAKToolsStatus();

      // 3. 演示股票数据获取
      await this.demonstrateStockData();

      // 4. 演示AKTools管理
      await this.demonstrateAKToolsManagement();

    } catch (error) {
      console.error('❌ 演示执行失败:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 启动服务器
   */
  async startServer() {
    console.log('\n🚀 步骤1: 启动集成版MCP服务器');

    return new Promise((resolve, reject) => {
      console.log('📡 启动中...');

      this.serverProcess = spawn('node', [SERVER_PATH], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let startupOutput = '';

      this.serverProcess.stderr.on('data', (data) => {
        const text = data.toString();
        startupOutput += text;
        console.log('Server:', text.trim());

        // 检查服务器启动成功
        if (text.includes('running on stdio') ||
            text.includes('AKTools集成') ||
            text.includes('初始化完成')) {
          console.log('✅ 服务器启动成功！');
          setTimeout(resolve, 1000); // 等待完全启动
        }
      });

      this.serverProcess.on('error', (error) => {
        console.error('❌ 服务器启动失败:', error.message);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0) {
          console.error(`❌ 服务器异常退出，代码: ${code}`);
          reject(new Error(`Server exited with code ${code}`));
        }
      });

      // 超时检查
      setTimeout(() => {
        if (!startupOutput.includes('running on stdio')) {
          console.log('⚠️ 服务器启动超时，但继续演示...');
          resolve();
        }
      }, 10000);
    });
  }

  /**
   * 检查AKTools状态
   */
  async checkAKToolsStatus() {
    console.log('\n🔍 步骤2: 检查AKTools服务状态');

    try {
      const result = await this.callMCPTool('check_aktools_status', {});

      if (result && result.content && result.content[0]) {
        console.log('✅ AKTools状态检查成功！');
        console.log('\n📊 状态报告:');
        console.log(result.content[0].text.substring(0, 800) + '...');
      } else {
        console.log('⚠️ 未收到状态检查响应');
      }
    } catch (error) {
      console.log('❌ AKTools状态检查失败:', error.message);
    }
  }

  /**
   * 演示股票数据获取
   */
  async demonstrateStockData() {
    console.log('\n📈 步骤3: 演示股票数据获取');

    const testCases = [
      {
        name: '东方财富网数据源',
        params: {
          codes: ['000001', '600000', '430002'],
          data_source: 'eastmoney'
        }
      },
      {
        name: '自动数据源选择',
        params: {
          codes: ['000001', '600000'],
          data_source: 'auto'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 测试${testCase.name}...`);

      try {
        const result = await this.callMCPTool('get_stock_info', testCase.params);

        if (result && result.content && result.content[0]) {
          const output = result.content[0].text;

          // 检查是否包含股票数据
          const hasStockData = testCase.params.codes.some(code =>
            output.includes(code) || output.includes(this.getStockName(code))
          );

          if (hasStockData) {
            console.log(`✅ ${testCase.name} - 数据获取成功`);
            console.log('📋 股票信息:');

            // 显示关键信息
            const lines = output.split('\n');
            lines.forEach(line => {
              if (line.includes('000001') || line.includes('600000') || line.includes('430002')) {
                console.log('  ' + line);
              }
            });
          } else {
            console.log(`⚠️ ${testCase.name} - 数据格式异常`);
          }
        } else {
          console.log(`❌ ${testCase.name} - 未收到有效响应`);
        }
      } catch (error) {
        console.log(`❌ ${testCase.name} - 失败: ${error.message}`);
      }

      // 等待避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * 演示AKTools管理
   */
  async demonstrateAKToolsManagement() {
    console.log('\n⚙️ 步骤4: 演示AKTools服务管理');

    try {
      // 尝试启动AKTools（如果未启动）
      console.log('🚀 尝试启动AKTools服务...');
      const startResult = await this.callMCPTool('start_aktools', {});

      if (startResult && startResult.content && startResult.content[0]) {
        const output = startResult.content[0].text;

        if (output.includes('启动成功') || output.includes('已在运行')) {
          console.log('✅ AKTools启动成功！');

          // 显示服务信息
          const lines = output.split('\n');
          lines.forEach(line => {
            if (line.includes('端口:') || line.includes('API地址:') || line.includes('状态:')) {
              console.log('  ' + line);
            }
          });
        } else {
          console.log('⚠️ AKTools启动返回异常状态');
          console.log('  ' + output);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      // 再次检查状态
      console.log('\n🔍 重新检查AKTools状态...');
      const statusResult = await this.callMCPTool('check_aktools_status', {});

      if (statusResult && statusResult.content && statusResult.content[0]) {
        const statusOutput = statusResult.content[0].text;

        if (statusOutput.includes('正在运行')) {
          console.log('✅ AKTools服务确认运行中！');
        } else {
          console.log('⚠️ AKTools服务状态异常');
        }
      }

    } catch (error) {
      console.log('❌ AKTools管理演示失败:', error.message);
    }
  }

  /**
   * 调用MCP工具
   */
  async callMCPTool(toolName, args) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      let response = '';
      let isComplete = false;

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

      const timeout = setTimeout(() => {
        if (!isComplete) {
          reject(new Error(`Tool call timeout: ${toolName}`));
        }
      }, 15000);

      const dataHandler = (data) => {
        response += data;

        try {
          const lines = response.trim().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              try {
                const result = JSON.parse(line);
                if (result.id === request.id) {
                  clearTimeout(timeout);
                  this.serverProcess.stdout.removeListener('data', dataHandler);
                  resolve(result);
                  isComplete = true;
                  return;
                }
              } catch (e) {
                // 忽略解析错误，继续收集数据
              }
            }
          }
        } catch (error) {
          // 解析错误，继续收集数据
        }
      };

      this.serverProcess.stdout.on('data', dataHandler);
    });
  }

  /**
   * 获取股票名称
   */
  getStockName(code) {
    const nameMap = {
      '000001': '平安银行',
      '000002': '万科A',
      '600000': '浦发银行',
      '600036': '招商银行',
      '430002': '易安科技'
    };
    return nameMap[code] || `股票${code}`;
  }

  /**
   * 清理资源
   */
  async cleanup() {
    if (this.serverProcess) {
      console.log('\n🛑 清理: 停止MCP服务器...');

      this.serverProcess.kill('SIGTERM');

      await new Promise(resolve => {
        this.serverProcess.on('exit', resolve);
        setTimeout(resolve, 3000);
      });

      if (this.serverProcess && !this.serverProcess.killed) {
        this.serverProcess.kill('SIGKILL');
      }

      console.log('✅ 演示完成，服务器已停止');
    }
  }
}

// 运行演示
if (require.main === module) {
  console.log('🎯 Market MCP - AKTools集成功能演示\n');
  console.log('📝 本演示将展示以下功能:');
  console.log('   1. MCP服务器启动和AKTools初始化');
  console.log('   2. AKTools服务状态检查');
  console.log('   3. 多数据源股票数据获取');
  console.log('   4. AKTools服务管理（启动/状态检查）\n');

  const demo = new AKToolsDemo();
  demo.runDemo().catch(error => {
    console.error('❌ 演示执行失败:', error);
    process.exit(1);
  });
}

module.exports = AKToolsDemo;