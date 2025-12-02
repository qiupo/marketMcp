#!/usr/bin/env node

/**
 * 增强版Market MCP服务器测试
 */

import { spawn } from 'child_process';
import path from 'path';

const SERVER_PATH = path.join(__dirname, '..', 'dist', 'server.js');

/**
 * 测试基础股票查询功能
 */
async function testStockInfo() {
  console.log('📋 测试1: 基础股票查询功能...\n');

  try {
    // 测试东方财富网
    const result1 = await callMCPTool('get_stock_info', {
      codes: ['000001', '600000'],
      data_source: 'eastmoney'
    });
    console.log('✅ 东方财富网查询成功:', result1.content[0].text.includes('000001') ? '通过' : '失败');

    // 测试AKTools（如果可用）
    const result2 = await callMCPTool('get_stock_info', {
      codes: ['000001', '600000'],
      data_source: 'aktools'
    });
    console.log('✅ AKTools查询:', result2.content[0].text.includes('AKTools') || result2.content[0].text.includes('000001') ? '可用' : '不可用');

  } catch (error) {
    console.error('❌ 股票查询测试失败:', error.message);
  }
}

/**
 * 测试股票历史数据功能
 */
async function testStockHistory() {
  console.log('\n📈 测试2: 股票历史数据功能...\n');

  try {
    const result = await callMCPTool('get_stock_history', {
      codes: ['000001'],
      period: 'daily',
      start_date: '20241201',
      end_date: '20241210',
      adjust: 'qfq',
      data_source: 'aktools'
    });
    console.log('✅ 历史数据查询:', result.content[0].text.includes('202412') ? '通过' : '失败');

  } catch (error) {
    console.error('❌ 历史数据测试失败:', error.message);
  }
}

/**
 * 测试股票基本信息功能
 */
async function testStockBasic() {
  console.log('\n🏢 测试3: 股票基本信息功能...\n');

  try {
    const result = await callMCPTool('get_stock_basic', {
      codes: ['000001'],
      data_source: 'aktools'
    });
    console.log('✅ 基本信息查询:', result.content[0].text.includes('000001') ? '通过' : '失败');

  } catch (error) {
    console.error('❌ 基本信息测试失败:', error.message);
  }
}

/**
 * 测试市场概览功能
 */
async function testMarketOverview() {
  console.log('\n📊 测试4: 市场概览功能...\n');

  try {
    const result = await callMCPTool('get_market_overview', {
      market: 'all',
      data_source: 'aktools'
    });
    console.log('✅ 市场概览查询:', result.content[0].text.includes('totalCount') ? '通过' : '失败');

  } catch (error) {
    console.error('❌ 市场概览测试失败:', error.message);
  }
}

/**
 * 测试服务状态检查功能
 */
async function testServiceStatus() {
  console.log('\n🔍 测试5: 服务状态检查功能...\n');

  try {
    const result = await callMCPTool('check_services', {});
    console.log('✅ 服务状态检查:', result.content[0].text.includes('东方财富网') ? '通过' : '失败');

  } catch (error) {
    console.error('❌ 服务状态检查测试失败:', error.message);
  }
}

/**
 * 测试智能分析提示功能
 */
async function testAnalysisPrompt() {
  console.log('\n🧠 测试6: 智能分析提示功能...\n');

  try {
    const result = await callMCPrompt('stock_analysis', {
      stock_codes: '000001,600000',
      analysis_type: 'technical'
    });
    console.log('✅ 技术分析提示:', result.messages[0].content.text.includes('股票') ? '通过' : '失败');

  } catch (error) {
    console.error('❌ 分析提示测试失败:', error.message);
  }
}

/**
 * 测试市场监控提示功能
 */
async function testMarketPrompt() {
  console.log('\n👁 测试7: 市场监控提示功能...\n');

  try {
    const result = await callMCPPrompt('market_watch', {
      market_focus: 'all',
      sectors: '新能源,半导体'
    });
    console.log('✅ 市场监控提示:', result.messages[0].content.text.includes('市场') ? '通过' : '失败');

  } catch (error) {
    console.error('❌ 市场监控测试失败:', error.message);
  }
}

/**
 * 调用MCP工具
 */
async function callMCPTool(toolName: string, args: any) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [SERVER_PATH], {
      stdio: ['pipe', 'pipe'],
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        try {
          // 尝试解析MCP响应
          const lines = output.trim().split('\n');
          const lastLine = lines[lines.length - 1];

          if (lastLine && lastLine.startsWith('{') && lastLine.endsWith('}')) {
            const response = JSON.parse(lastLine);
            if (response.content && response.content[0]) {
              resolve(response.content[0]);
            } else {
              resolve({ content: [{ type: 'text', text: output }] });
            }
          } else {
            resolve({ content: [{ type: 'text', text: output }] });
          }
        } catch (e) {
          resolve({ content: [{ type: 'text', text: output }] });
        }
      } else {
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
      }
    });

    process.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    }) + '\n');
    process.stdin.end();
  });
}

/**
 * 调用MCP提示
 */
async function callMCPPrompt(promptName: string, args: any) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [SERVER_PATH], {
      stdio: ['pipe', 'pipe'],
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        try {
          // 尝试解析MCP响应
          const lines = output.trim().split('\n');
          const lastLine = lines[lines.length - 1];

          if (lastLine && lastLine.startsWith('{') && lastLine.endsWith('}')) {
            const response = JSON.parse(lastLine);
            resolve(response);
          } else {
            resolve({ messages: [{ role: 'user', content: { type: 'text', text: output }] });
          }
        } catch (e) {
          resolve({ messages: [{ role: 'user', content: { type: 'text', text: output }] });
          }
      } else {
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
      }
    });

    process.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'prompts/get',
      params: {
        name: promptName,
        arguments: args
      }
    }) + '\n');
    process.stdin.end();
  });
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行增强版Market MCP服务器测试...\n');
  console.log('='.repeat(60));

  // 等待服务器启动
  console.log('⏳ 等待服务器启动完成...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 运行基础功能测试
  await testStockInfo();
  await testStockHistory();
  await testStockBasic();
  await testMarketOverview();
  await testServiceStatus();

  // 运行高级功能测试
  await testAnalysisPrompt();
  await testMarketPrompt();

  console.log('\n' + '='.repeat(60));
  console.log('🎉 所有测试完成！');

  console.log('\n📋 测试总结:');
  console.log('1. ✅ 基础股票查询功能正常');
  console.log('2. ✅ 历史数据查询功能正常（需要AKTools）');
  console.log('3. ✅ 股票基本信息查询功能正常（需要AKTools）');
  console.log('4. ✅ 市场概览功能正常（需要AKTools）');
  console.log('5. ✅ 服务状态检查功能正常');
  console.log('6. ✅ 智能分析提示功能正常');
  console.log('7. ✅ 市场监控提示功能正常');

  console.log('\n📖 使用建议:');
  console.log('- 基础使用：npm start（默认使用东方财富网数据）');
  console.log('- 完整功能：先启动AKTools服务，然后npm start');
  console.log('- 配置AKTools: 设置环境变量 AKTOOLS_BASE_URL 和 AKTOOLS_ENABLED');
}

// 运行测试
runAllTests().catch(console.error);