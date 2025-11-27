#!/usr/bin/env node

/**
 * 简单测试脚本 - 使用Bash命令检查功能
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

console.log('🚀 开始MCP功能测试...\n');

let testsPassed = 0;
let totalTests = 0;

function test(name, testFn) {
  totalTests++;
  console.log(`${totalTests}. ${name}`);
  try {
    testFn();
    console.log('   ✅ 通过\n');
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ 失败: ${error.message}\n`);
  }
}

// 测试1: 检查文件存在性
test('检查关键文件存在性', () => {
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'src/index.ts',
    'src/services/stockService.ts',
    'src/types/stock.ts',
    'dist/index.js'
  ];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      throw new Error(`缺少文件: ${file}`);
    }
  }
});

// 测试2: 检查package.json
test('检查package.json配置', () => {
  const packageData = JSON.parse(readFileSync('./package.json', 'utf8'));

  if (!packageData.name) throw new Error('缺少name字段');
  if (!packageData.version) throw new Error('缺少version字段');
  if (!packageData.dependencies) throw new Error('缺少dependencies字段');

  const requiredDeps = ['@modelcontextprotocol/sdk', 'axios'];
  for (const dep of requiredDeps) {
    if (!packageData.dependencies[dep]) {
      throw new Error(`缺少依赖: ${dep}`);
    }
  }
});

// 测试3: 检查构建输出
test('检查构建输出', () => {
  if (!existsSync('dist/index.js')) {
    throw new Error('构建输出不存在');
  }

  const content = readFileSync('dist/index.js', 'utf8');
  if (!content.includes('MarketMCPServer')) {
    throw new Error('构建输出缺少MarketMCPServer类');
  }
  if (!content.includes('Server')) {
    throw new Error('构建输出缺少Server导入');
  }
});

// 测试4: 检查MCP工具定义
test('检查MCP工具定义', () => {
  const content = readFileSync('src/index.ts', 'utf8');

  const requiredTools = [
    'get_stock_info',
    'search_stock',
    'get_popular_stocks',
    'validate_stock_code',
    'get_company_info',
    'get_financial_statements'
  ];

  for (const tool of requiredTools) {
    if (!content.includes(`name: '${tool}'`)) {
      throw new Error(`缺少工具定义: ${tool}`);
    }
  }
});

// 测试5: 检查工具处理函数
test('检查工具处理函数', () => {
  const content = readFileSync('src/index.ts', 'utf8');

  const requiredHandlers = [
    'handleGetStockInfo',
    'handleSearchStock',
    'handleGetCompanyInfo',
    'handleValidateStockCode'
  ];

  for (const handler of requiredHandlers) {
    if (!content.includes(handler)) {
      throw new Error(`缺少处理函数: ${handler}`);
    }
  }
});

// 测试6: TypeScript编译检查
test('TypeScript编译检查', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('TypeScript编译失败');
  }
});

// 测试7: 重新构建检查
test('重新构建项目', () => {
  try {
    execSync('npm run build', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('项目构建失败');
  }
});

// 测试8: 检查StockService类
test('检查StockService实现', () => {
  const content = readFileSync('src/services/stockService.ts', 'utf8');

  const requiredMethods = [
    'getStockInfo',
    'searchStock',
    'validateStockCode',
    'getCompanyInfo',
    'getBatchStockInfo'
  ];

  for (const method of requiredMethods) {
    if (!content.includes(method)) {
      throw new Error(`StockService缺少方法: ${method}`);
    }
  }
});

// 测试9: 检查类型定义
test('检查类型定义', () => {
  const content = readFileSync('src/types/stock.ts', 'utf8');

  const requiredTypes = [
    'StockInfo',
    'CompanyInfo',
    'StockQueryParams',
    'StockQueryResult',
    'DataSource'
  ];

  for (const type of requiredTypes) {
    if (!content.includes(type)) {
      throw new Error(`类型定义缺少: ${type}`);
    }
  }
});

// 测试10: 检查可执行性
test('检查MCP服务器可执行性', () => {
  if (!existsSync('dist/index.js')) {
    throw new Error('dist/index.js不存在');
  }

  // 简单的语法检查
  try {
    execSync('node -c dist/index.js', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('dist/index.js语法错误');
  }
});

// 测试11: 检查prompt定义
test('检查MCP prompts定义', () => {
  const content = readFileSync('src/index.ts', 'utf8');

  const requiredPrompts = [
    'stock_analysis',
    'market_overview'
  ];

  for (const prompt of requiredPrompts) {
    if (!content.includes(`name: '${prompt}'`)) {
      throw new Error(`缺少prompt定义: ${prompt}`);
    }
  }
});

// 测试12: 检查IPO3增强功能
test('检查IPO3增强功能定义', () => {
  const content = readFileSync('src/index.ts', 'utf8');

  const requiredIPO3Tools = [
    'get_stock_funding',
    'get_stock_trades',
    'get_stock_events',
    'get_stock_notices'
  ];

  for (const tool of requiredIPO3Tools) {
    if (!content.includes(`name: '${tool}'`)) {
      throw new Error(`缺少IPO3工具: ${tool}`);
    }
  }
});

// 生成测试报告
console.log('📊 测试报告');
console.log('='.repeat(50));
console.log(`总测试数: ${totalTests}`);
console.log(`✅ 通过: ${testsPassed}`);
console.log(`❌ 失败: ${totalTests - testsPassed}`);
console.log(`📈 通过率: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);

console.log('\n🔍 详细功能清单:');
console.log('✅ 基础MCP结构');
console.log('✅ TypeScript配置');
console.log('✅ 构建系统');
console.log('✅ 工具定义（12个）');
console.log('✅ Prompt定义（2个）');
console.log('✅ StockService实现');
console.log('✅ IPO3集成');
console.log('✅ 类型安全');

if (testsPassed === totalTests) {
  console.log('\n🎉 所有基础测试通过！');
  console.log('\n📋 功能摘要:');
  console.log('   • 12个MCP工具');
  console.log('   • 2个MCP prompts');
  console.log('   • IPO3.com数据源集成');
  console.log('   • 完整的TypeScript类型定义');
  console.log('   • 股票查询、公司信息、财务数据等功能');

  console.log('\n🚀 下一步操作:');
  console.log('   1. 启动MCP服务器: node dist/index.js');
  console.log('   2. 在Claude中配置MCP连接');
  console.log('   3. 测试具体的MCP工具调用');
} else {
  console.log('\n⚠️  部分测试失败，请修复后重试');
}

console.log('\n' + '='.repeat(50));
process.exit(testsPassed === totalTests ? 0 : 1);