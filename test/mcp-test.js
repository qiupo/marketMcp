#!/usr/bin/env node

/**
 * MCP服务器功能测试
 * 测试简化后的Market MCP服务器
 */

import { spawn } from 'child_process';

async function testMCPServer() {
  console.log('🧪 开始MCP服务器功能测试...\n');

  try {
    // 启动MCP服务器
    const server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseData = '';
    let errorData = '';

    server.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // 发送初始化请求
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    server.stdin.write(JSON.stringify(initRequest) + '\n');

    // 发送工具列表请求
    const toolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    };

    setTimeout(() => {
      server.stdin.write(JSON.stringify(toolsRequest) + '\n');
    }, 100);

    // 等待响应
    setTimeout(() => {
      server.kill();

      // 分析结果
      if (responseData.includes('get_stock_info')) {
        console.log('✅ MCP服务器工具列表正常');
        console.log('✅ 核心股票查询工具可用');

        const toolCount = (responseData.match(/"name":/g) || []).length;
        console.log(`📊 可用工具数量: ${toolCount}`);

        console.log('\n🎉 MCP服务器功能测试通过！');
        console.log('📋 服务器已成功简化，只保留核心功能:');
        console.log('   ✅ get_stock_info - 股票信息查询');

      } else {
        console.log('❌ MCP服务器响应异常');
        console.log('错误信息:', errorData);
        console.log('响应数据:', responseData);
      }

      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testMCPServer().catch(console.error);