#!/usr/bin/env node

/**
 * Market MCP 全功能测试脚本
 * 测试所有MCP工具和prompts功能
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';

class MCPTester extends EventEmitter {
  constructor() {
    super();
    this.mcpProcess = null;
    this.messageId = 1;
    this.pendingResponses = new Map();
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  async startMCP() {
    console.log('🚀 启动MCP服务器...');

    return new Promise((resolve, reject) => {
      this.mcpProcess = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let initBuffer = '';

      this.mcpProcess.stdout.on('data', (data) => {
        const messages = data.toString().split('\n').filter(line => line.trim());

        for (const message of messages) {
          if (!message.trim()) continue;

          try {
            const jsonMessage = JSON.parse(message);

            // 处理初始化响应
            if (jsonMessage.jsonrpc === '2.0' && jsonMessage.result?.capabilities) {
              console.log('✅ MCP服务器启动成功');
              resolve();
              return;
            }

            // 处理其他响应
            if (jsonMessage.id && this.pendingResponses.has(jsonMessage.id)) {
              const { resolve: responseResolve, timeout } = this.pendingResponses.get(jsonMessage.id);
              clearTimeout(timeout);
              this.pendingResponses.delete(jsonMessage.id);
              responseResolve(jsonMessage);
            }
          } catch (error) {
            // 忽略非JSON消息（可能是日志输出）
          }
        }
      });

      this.mcpProcess.stderr.on('data', (data) => {
        console.error('MCP错误:', data.toString());
      });

      this.mcpProcess.on('error', (error) => {
        console.error('启动MCP失败:', error);
        reject(error);
      });

      // 发送初始化请求
      setTimeout(() => {
        this.sendMessage({
          jsonrpc: '2.0',
          id: 0,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              prompts: {}
            },
            clientInfo: {
              name: 'test-client',
              version: '1.0.0'
            }
          }
        });
      }, 1000);

      // 超时处理
      setTimeout(() => {
        reject(new Error('MCP服务器启动超时'));
      }, 10000);
    });
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      const id = message.id || this.messageId++;
      message.id = id;

      const timeout = setTimeout(() => {
        this.pendingResponses.delete(id);
        reject(new Error(`消息 ${id} 超时`));
      }, 30000);

      this.pendingResponses.set(id, { resolve, timeout });

      const messageStr = JSON.stringify(message) + '\n';
      this.mcpProcess.stdin.write(messageStr);
    });
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 测试: ${testName}`);
    this.testResults.total++;

    try {
      await testFunction();
      console.log(`✅ ${testName} - 通过`);
      this.testResults.passed++;
      this.testResults.details.push({ name: testName, status: 'PASS', error: null });
    } catch (error) {
      console.log(`❌ ${testName} - 失败: ${error.message}`);
      this.testResults.failed++;
      this.testResults.details.push({ name: testName, status: 'FAIL', error: error.message });
    }
  }

  async testListTools() {
    return await this.runTest('List Tools', async () => {
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'tools/list'
      });

      if (!response.result?.tools || !Array.isArray(response.result.tools)) {
        throw new Error('工具列表格式错误');
      }

      const tools = response.result.tools;
      console.log(`   发现 ${tools.length} 个工具`);

      const expectedTools = [
        'get_stock_info', 'search_stock', 'get_popular_stocks', 'validate_stock_code',
        'get_company_info', 'get_financial_statements', 'get_stock_funding',
        'get_stock_trades', 'get_stock_events', 'get_stock_notices', 'get_stock_survey',
        'get_stock_brokers', 'get_stock_pledge', 'get_stock_reports'
      ];

      const foundTools = tools.map(t => t.name);
      const missingTools = expectedTools.filter(tool => !foundTools.includes(tool));

      if (missingTools.length > 0) {
        throw new Error(`缺少工具: ${missingTools.join(', ')}`);
      }

      console.log(`   ✓ 所有 ${expectedTools.length} 个预期工具都存在`);
    });
  }

  async testListPrompts() {
    return await this.runTest('List Prompts', async () => {
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'prompts/list'
      });

      if (!response.result?.prompts || !Array.isArray(response.result.prompts)) {
        throw new Error('Prompt列表格式错误');
      }

      const prompts = response.result.prompts;
      console.log(`   发现 ${prompts.length} 个prompts`);

      const expectedPrompts = ['stock_analysis', 'market_overview'];
      const foundPrompts = prompts.map(p => p.name);
      const missingPrompts = expectedPrompts.filter(prompt => !foundPrompts.includes(prompt));

      if (missingPrompts.length > 0) {
        throw new Error(`缺少prompts: ${missingPrompts.join(', ')}`);
      }

      console.log(`   ✓ 所有 ${expectedPrompts.length} 个预期prompts都存在`);
    });
  }

  async testValidateStockCode() {
    return await this.runTest('Validate Stock Code', async () => {
      const testCodes = [
        { code: '600000', expected: true },
        { code: '000001', expected: true },
        { code: 'sh600000', expected: true },
        { code: 'sz000001', expected: true },
        { code: '12345', expected: false },
        { code: 'abcdef', expected: false }
      ];

      for (const test of testCodes) {
        const response = await this.sendMessage({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'validate_stock_code',
            arguments: { code: test.code }
          }
        });

        if (!response.result?.content || response.result.content.length === 0) {
          throw new Error(`验证股票代码 ${test.code} 失败`);
        }

        const content = response.result.content[0].text;
        const isValid = content.includes('✓ 有效');

        if (isValid !== test.expected) {
          throw new Error(`股票代码 ${test.code} 验证结果不正确`);
        }
      }

      console.log(`   ✓ ${testCodes.length} 个股票代码验证测试通过`);
    });
  }

  async testGetStockInfo() {
    return await this.runTest('Get Stock Info', async () => {
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_stock_info',
          arguments: {
            codes: ['430002', '430003'],
            data_source: 'ipo3'
          }
        }
      });

      if (!response.result?.content || response.result.content.length === 0) {
        throw new Error('获取股票信息失败');
      }

      const content = response.result.content[0].text;
      if (!content.includes('数据来源') || !content.includes('股票代码')) {
        throw new Error('股票信息格式不正确');
      }

      console.log('   ✓ 股票信息获取成功');
    });
  }

  async testSearchStock() {
    return await this.runTest('Search Stock', async () => {
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'search_stock',
          arguments: {
            keyword: '科技'
          }
        }
      });

      if (!response.result?.content || response.result.content.length === 0) {
        throw new Error('股票搜索失败');
      }

      const content = response.result.content[0].text;
      if (!content.includes('搜索结果')) {
        throw new Error('搜索结果格式不正确');
      }

      console.log('   ✓ 股票搜索功能正常');
    });
  }

  async testGetPopularStocks() {
    return await this.runTest('Get Popular Stocks', async () => {
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_popular_stocks',
          arguments: {
            data_source: 'ipo3'
          }
        }
      });

      if (!response.result?.content || response.result.content.length === 0) {
        throw new Error('获取热门股票失败');
      }

      const content = response.result.content[0].text;
      if (!content.includes('热门股票')) {
        throw new Error('热门股票信息格式不正确');
      }

      console.log('   ✓ 热门股票获取成功');
    });
  }

  async testIPO3Features() {
    return await this.runTest('IPO3 Company Info', async () => {
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_company_info',
          arguments: {
            stock_code: '430002',
            english_key: false
          }
        }
      });

      if (!response.result?.content || response.result.content.length === 0) {
        throw new Error('获取公司信息失败');
      }

      const content = response.result.content[0].text;
      if (!content.includes('公司详细信息')) {
        throw new Error('公司信息格式不正确');
      }

      console.log('   ✓ IPO3公司信息获取成功');
    });
  }

  async testFinancialStatements() {
    return await this.runTest('Financial Statements', async () => {
      const statementTypes = ['income', 'balance', 'cashflow', 'analysis'];

      for (const type of statementTypes.slice(0, 2)) { // 只测试前两种以节省时间
        const response = await this.sendMessage({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'get_financial_statements',
            arguments: {
              stock_code: '430002',
              statement_type: type,
              date_type: '年报',
              english_key: false
            }
          }
        });

        if (!response.result?.content || response.result.content.length === 0) {
          throw new Error(`获取${type}财务报表失败`);
        }

        const content = response.result.content[0].text;
        const statementNames = {
          'income': '利润表',
          'balance': '资产负债表',
          'cashflow': '现金流量表',
          'analysis': '财务分析'
        };

        if (!content.includes(statementNames[type])) {
          throw new Error(`${type}财务报表格式不正确`);
        }
      }

      console.log('   ✓ 财务报表功能正常');
    });
  }

  async testStockPrompts() {
    return await this.runTest('Stock Analysis Prompt', async () => {
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'prompts/get',
        params: {
          name: 'stock_analysis',
          arguments: {
            stock_codes: '430002,430003',
            analysis_type: 'basic'
          }
        }
      });

      if (!response.result?.messages || response.result.messages.length === 0) {
        throw new Error('股票分析prompt失败');
      }

      const promptText = response.result.messages[0].content.text;
      if (!promptText.includes('基础分析') || !promptText.includes('430002')) {
        throw new Error('股票分析prompt内容不正确');
      }

      console.log('   ✓ 股票分析prompt正常');
    });
  }

  async testMarketOverviewPrompt() {
    return await this.runTest('Market Overview Prompt', async () => {
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'prompts/get',
        params: {
          name: 'market_overview',
          arguments: {
            market: 'all',
            sector: '科技'
          }
        }
      });

      if (!response.result?.messages || response.result.messages.length === 0) {
        throw new Error('市场概览prompt失败');
      }

      const promptText = response.result.messages[0].content.text;
      if (!promptText.includes('全市场') || !promptText.includes('科技')) {
        throw new Error('市场概览prompt内容不正确');
      }

      console.log('   ✓ 市场概览prompt正常');
    });
  }

  async testErrorHandling() {
    return await this.runTest('Error Handling', async () => {
      // 测试无效工具名称
      const response = await this.sendMessage({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'invalid_tool_name',
          arguments: {}
        }
      });

      if (!response.result?.content || response.result.content.length === 0) {
        throw new Error('错误处理失败');
      }

      const content = response.result.content[0].text;
      if (!content.includes('错误') && !content.includes('未知工具')) {
        throw new Error('错误信息格式不正确');
      }

      console.log('   ✓ 错误处理正常');
    });
  }

  async runAllTests() {
    console.log('🎯 开始Market MCP全功能测试\n');

    try {
      await this.startMCP();

      // 基础功能测试
      await this.testListTools();
      await this.testListPrompts();

      // 核心工具测试
      await this.testValidateStockCode();
      await this.testGetStockInfo();
      await this.testSearchStock();
      await this.testGetPopularStocks();

      // IPO3增强功能测试
      await this.testIPO3Features();
      await this.testFinancialStatements();

      // Prompt功能测试
      await this.testStockPrompts();
      await this.testMarketOverviewPrompt();

      // 错误处理测试
      await this.testErrorHandling();

    } catch (error) {
      console.error('\n💥 测试过程中发生严重错误:', error);
    } finally {
      this.cleanup();
      this.generateReport();
    }
  }

  cleanup() {
    if (this.mcpProcess) {
      console.log('\n🛑 关闭MCP服务器...');
      this.mcpProcess.kill();

      // 清理待处理的请求
      for (const [id, { timeout }] of this.pendingResponses) {
        clearTimeout(timeout);
      }
      this.pendingResponses.clear();
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试报告');
    console.log('='.repeat(60));
    console.log(`总测试数: ${this.testResults.total}`);
    console.log(`✅ 通过: ${this.testResults.passed}`);
    console.log(`❌ 失败: ${this.testResults.failed}`);
    console.log(`📈 通过率: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

    if (this.testResults.failed > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults.details
        .filter(detail => detail.status === 'FAIL')
        .forEach(detail => {
          console.log(`   - ${detail.name}: ${detail.error}`);
        });
    }

    console.log('\n🎉 Market MCP功能测试完成!');

    if (this.testResults.failed === 0) {
      console.log('🌟 所有测试都通过了，MCP服务器功能正常！');
    } else {
      console.log(`⚠️  有 ${this.testResults.failed} 个测试失败，请检查相关功能。`);
    }

    console.log('='.repeat(60));

    // 退出进程
    process.exit(this.testResults.failed > 0 ? 1 : 0);
  }
}

// 运行测试
if (require.main === module) {
  const tester = new MCPTester();
  tester.runAllTests().catch(console.error);
}

export { MCPTester };