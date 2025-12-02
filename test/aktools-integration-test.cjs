#!/usr/bin/env node

/**
 * AKTools集成测试脚本
 * 测试新增强的MCP功能
 */

const { spawn } = require('child_process');

async function runTest() {
  console.log('🚀 开始测试增强后的MarketMCP功能...\n');

  // 测试服务状态检查
  console.log('📋 测试1: 检查服务状态');
  try {
    const result = await runMCPTool('check_service_status', {});
    console.log('✅ 服务状态检查通过');
    console.log(result);
  } catch (error) {
    console.log('❌ 服务状态检查失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试基础股票信息查询（东方财富）
  console.log('📊 测试2: 获取股票基本信息（东方财富）');
  try {
    const result = await runMCPTool('get_stock_info', {
      codes: ['000001', '600000'],
      data_source: 'eastmoney'
    });
    console.log('✅ 东方财富数据查询通过');
    console.log(result);
  } catch (error) {
    console.log('❌ 东方财富数据查询失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试股票历史数据查询（AKTools）
  console.log('📈 测试3: 获取股票历史数据（需要AKTools服务）');
  try {
    const result = await runMCPTool('get_stock_history', {
      codes: ['000001'],
      period: 'daily',
      start_date: '20241201',
      end_date: '20241210',
      adjust: 'qfq',
      data_source: 'aktools'
    });
    console.log('✅ 历史数据查询通过');
    console.log(result);
  } catch (error) {
    console.log('❌ 历史数据查询失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试股票基本信息查询（AKTools）
  console.log('🏢 测试4: 获取股票详细信息（需要AKTools服务）');
  try {
    const result = await runMCPTool('get_stock_basic', {
      codes: ['000001']
    });
    console.log('✅ 详细信息查询通过');
    console.log(result);
  } catch (error) {
    console.log('❌ 详细信息查询失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试市场概览
  console.log('🌐 测试5: 获取市场概览（需要AKTools服务）');
  try {
    const result = await runMCPTool('get_market_overview', {
      market: 'all'
    });
    console.log('✅ 市场概览查询通过');
    console.log(result);
  } catch (error) {
    console.log('❌ 市场概览查询失败:', error.message);
  }

  console.log('\n🎉 测试完成！');
  console.log('\n📝 使用说明:');
  console.log('1. 东方财富数据源默认可用，无需额外服务');
  console.log('2. AKTools功能需要先启动AKTools服务: python -m aktools');
  console.log('3. AKTools服务默认运行在 http://127.0.0.1:8080');
  console.log('4. 可通过修改src/services/aktools-service.ts中的baseUrl自定义AKTools服务地址');
}

function runMCPTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        try {
          // 尝试解析输出
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];

          if (lastLine && lastLine.startsWith('{') && lastLine.endsWith('}')) {
            // MCP响应格式
            const response = JSON.parse(lastLine);
            if (response.content && response.content[0]) {
              resolve(response.content[0].text);
            } else {
              resolve(stdout);
            }
          } else {
            resolve(stdout);
          }
        } catch (e) {
          resolve(stdout);
        }
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    // 发送MCP请求
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    process.stdin.write(JSON.stringify(request) + '\n');
    process.stdin.end();
  });
}

// 运行测试
runTest().catch(console.error);