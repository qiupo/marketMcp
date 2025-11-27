#!/usr/bin/env node

import { StockService } from './dist/services/stockService.js';
import { DataSource } from './dist/types/stock.js';

async function testIPO3Service() {
  const stockService = new StockService();

  console.log('🧪 测试IPO3.com API股票服务\n');

  // 测试1: 获取热门股票
  console.log('1️⃣ 测试获取热门股票...');
  try {
    const result = await stockService.getPopularStocks();
    if (result.success) {
      console.log(`✅ 成功获取 ${result.data.length} 只热门股票`);
      console.log(`数据源: ${result.source}`);
      if (result.data.length > 0) {
        console.log('示例股票:');
        result.data.slice(0, 3).forEach((stock, index) => {
          console.log(`${index + 1}. ${stock.name} (${stock.code}): ${stock.price}元 ${stock.changePercent}`);
          if (stock.industry) {
            console.log(`   行业: ${stock.industry}`);
          }
          if (stock.totalMarketValue) {
            console.log(`   市值: ${stock.totalMarketValue}`);
          }
        });
      }
    } else {
      console.log('❌ 获取热门股票失败:', result.errors);
    }
  } catch (error) {
    console.log('❌ 测试1失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: 获取指定股票（使用示例代码）
  console.log('2️⃣ 测试获取指定股票 (430510)...');
  try {
    const result = await stockService.getStockInfo({
      codes: ['430510']
    });
    if (result.success) {
      console.log(`✅ 成功获取股票信息`);
      console.log(`数据源: ${result.source}`);
      result.data.forEach(stock => {
        console.log(`- ${stock.name} (${stock.code}): ${stock.price}元 ${stock.changePercent}`);
        if (stock.industry) console.log(`  行业: ${stock.industry}`);
        if (stock.open) console.log(`  今开: ${stock.open}元`);
        if (stock.high) console.log(`  最高: ${stock.high}元`);
        if (stock.low) console.log(`  最低: ${stock.low}元`);
        if (stock.volume) console.log(`  成交量: ${stock.volume}`);
        if (stock.turnoverRate) console.log(`  换手率: ${stock.turnoverRate}`);
        if (stock.peRatio) console.log(`  市盈率: ${stock.peRatio}`);
        if (stock.totalMarketValue) console.log(`  总市值: ${stock.totalMarketValue}`);
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
  const testCodes = ['430510', 'bj430510', 'sh600000', 'sz000001', 'invalid', '123'];
  testCodes.forEach(code => {
    const isValid = stockService.validateStockCode(code);
    const normalized = stockService.normalizeStockCode(code);
    console.log(`${code.padEnd(12)} -> ${normalized.padEnd(6)} ${isValid ? '✅' : '❌'}`);
  });

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试4: 搜索股票
  console.log('4️⃣ 测试搜索股票 (丰光精密)...');
  try {
    const result = await stockService.searchStock('丰光精密');
    if (result.success) {
      console.log(`✅ 搜索成功，找到 ${result.data.length} 只相关股票`);
      console.log(`数据源: ${result.source}`);
      result.data.forEach(stock => {
        console.log(`- ${stock.name} (${stock.code}): ${stock.price}元 ${stock.changePercent}`);
      });
    } else {
      console.log('❌ 搜索股票失败:', result.errors);
    }
  } catch (error) {
    console.log('❌ 测试4失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试5: 批量查询
  console.log('5️⃣ 测试批量查询...');
  const batchCodes = ['430510', '873152', '870299'];
  try {
    const result = await stockService.getBatchStockInfo(batchCodes);
    if (result.success) {
      console.log(`✅ 批量查询成功，获取 ${result.data.length} 只股票信息`);
      result.data.forEach(stock => {
        console.log(`- ${stock.name} (${stock.code}): ${stock.price}元 ${stock.changePercent}`);
      });
    } else {
      console.log('❌ 批量查询失败:', result.errors);
    }
  } catch (error) {
    console.log('❌ 测试5失败:', error.message);
  }

  console.log('\n🎉 IPO3 API测试完成！');
  console.log('\n📊 功能特色:');
  console.log('✅ 详细的公司信息');
  console.log('✅ 实时行情数据');
  console.log('✅ 财务指标分析');
  console.log('✅ 股东结构信息');
  console.log('✅ 新闻资讯集成');
}

// 运行测试
testIPO3Service().catch(console.error);