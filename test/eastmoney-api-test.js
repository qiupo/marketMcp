#!/usr/bin/env node

/**
 * 东方财富网API验证测试
 * 验证从IPO3.com迁移到东方财富网的API集成
 */

import { EastMoneyServiceSimple } from '../dist/services/eastmoney-service-simple.js';

async function testEastMoneyAPI() {
  console.log('🔍 开始东方财富网API验证测试...\n');

  const eastMoneyService = new EastMoneyServiceSimple();
  let testsPassed = 0;
  let totalTests = 0;

  // 测试1: 单个股票查询
  console.log('1️⃣ 测试单个股票查询');
  totalTests++;
  try {
    const result = await eastMoneyService.getSingleStockInfo('000001');
    if (result && result.name && result.price > 0) {
      console.log(`   ✅ 成功获取股票信息: ${result.name} - ¥${result.price}`);
      testsPassed++;
    } else {
      console.log(`   ❌ 获取股票信息失败`);
    }
  } catch (error) {
    console.log(`   ❌ 获取股票信息错误: ${error.message}`);
  }

  // 测试2: 股票搜索
  console.log('\n2️⃣ 测试股票搜索');
  totalTests++;
  try {
    const result = await eastMoneyService.searchStock('平安银行');
    if (result.success && result.data.length > 0) {
      console.log(`   ✅ 搜索成功: 找到${result.data.length}只股票`);
      testsPassed++;
    } else {
      console.log(`   ❌ 搜索失败: 未找到相关股票`);
    }
  } catch (error) {
    console.log(`   ❌ 搜索错误: ${error.message}`);
  }

  // 测试3: 热门股票
  console.log('\n3️⃣ 测试热门股票查询');
  totalTests++;
  try {
    const result = await eastMoneyService.getPopularStocks();
    if (result.success && result.data.length > 0) {
      console.log(`   ✅ 热门股票成功: 获取${result.data.length}只股票`);
      testsPassed++;
    } else {
      console.log(`   ❌ 热门股票失败: 未获取到数据`);
    }
  } catch (error) {
    console.log(`   ❌ 热门股票错误: ${error.message}`);
  }

  // 测试4: 股票代码验证
  console.log('\n4️⃣ 测试股票代码验证');
  totalTests++;
  try {
    const normalizedCode = eastMoneyService.normalizeStockCode('sh600000');
    const isValid = eastMoneyService.validateStockCode('600000');
    if (normalizedCode === '600000' && isValid) {
      console.log(`   ✅ 代码验证成功: 600000 → ${normalizedCode} (有效)`);
      testsPassed++;
    } else {
      console.log(`   ❌ 代码验证失败`);
    }
  } catch (error) {
    console.log(`   ❌ 代码验证错误: ${error.message}`);
  }

  // 生成测试报告
  const passRate = totalTests > 0 ? ((testsPassed / totalTests) * 100).toFixed(1) : '0';
  console.log('\n📊 东方财富网API测试报告');
  console.log('='.repeat(50));
  console.log(`总测试数: ${totalTests}`);
  console.log(`✅ 通过: ${testsPassed}`);
  console.log(`❌ 失败: ${totalTests - testsPassed}`);
  console.log(`📈 通过率: ${passRate}%`);
  console.log('='.repeat(50));

  if (testsPassed === totalTests) {
    console.log('\n🎉 所有API测试通过！');
    console.log('📋 API功能验证:');
    console.log('   ✅ 单个股票查询 - 东方财富网API');
    console.log('   ✅ 股票搜索 - 关键词匹配');
    console.log('   ✅ 热门股票 - 排行榜查询');
    console.log('   ✅ 代码验证 - 格式检查');
    console.log('\n🚀 Market MCP已成功迁移到东方财富网数据源！');
  } else {
    console.log('\n⚠️  部分API测试失败，请检查网络连接和API参数');
  }

  console.log('\n📝 下一步建议:');
  console.log('1. 检查网络连接是否正常');
  console.log('2. 验证东方财富网API可用性');
  console.log('3. 完善错误处理和重试机制');
  console.log('4. 测试更多股票代码和功能');
}

// 运行API测试
testEastMoneyAPI().catch(console.error);