#!/usr/bin/env node

import { StockService } from './dist/services/stockService.js';
import { DataSource } from './dist/types/stock.js';

async function testStockService() {
  const stockService = new StockService();

  console.log('🧪 测试Market MCP股票服务\n');

  // 测试1: 获取热门股票
  console.log('1️⃣ 测试获取热门股票...');
  try {
    const result = await stockService.getPopularStocks();
    if (result.success) {
      console.log(`✅ 成功获取 ${result.data.length} 只热门股票`);
      console.log(`数据源: ${result.source}`);
      if (result.data.length > 0) {
        console.log('示例股票:');
        console.log(`- ${result.data[0].name} (${result.data[0].code}): ${result.data[0].price}元`);
      }
    } else {
      console.log('❌ 获取热门股票失败:', result.errors);
    }
  } catch (error) {
    console.log('❌ 测试1失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: 获取指定股票
  console.log('2️⃣ 测试获取指定股票 (000001, 600036)...');
  try {
    const result = await stockService.getStockInfo({
      codes: ['000001', '600036']
    });
    if (result.success) {
      console.log(`✅ 成功获取 ${result.data.length} 只股票信息`);
      console.log(`数据源: ${result.source}`);
      result.data.forEach(stock => {
        console.log(`- ${stock.name} (${stock.code}): ${stock.price}元 ${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`);
      });
    } else {
      console.log('❌ 获取股票信息失败:', result.errors);
    }
  } catch (error) {
    console.log('❌ 测试2失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3: 验证股票代码
  console.log('3️⃣ 测试股票代码验证...');
  const testCodes = ['000001', 'sh600000', 'sz000002', 'invalid', '123'];
  testCodes.forEach(code => {
    const isValid = stockService.validateStockCode(code);
    const normalized = stockService.normalizeStockCode(code);
    console.log(`${code.padEnd(12)} -> ${normalized.padEnd(6)} ${isValid ? '✅' : '❌'}`);
  });

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试4: 指定数据源
  console.log('4️⃣ 测试指定数据源 (新浪财经)...');
  try {
    const result = await stockService.getStockInfo({
      codes: ['000001'],
      dataSource: DataSource.SINA
    });
    if (result.success) {
      console.log(`✅ 成功从新浪财经获取数据`);
      console.log(`- ${result.data[0].name}: ${result.data[0].price}元`);
    } else {
      console.log('❌ 从新浪财经获取数据失败:', result.errors);
    }
  } catch (error) {
    console.log('❌ 测试4失败:', error.message);
  }

  console.log('\n🎉 测试完成！');
}

// 运行测试
testStockService().catch(console.error);