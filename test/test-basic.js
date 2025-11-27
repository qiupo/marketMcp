#!/usr/bin/env node

/**
 * 基础功能测试 - 不依赖外部API
 */

async function basicTest() {
  console.log('🚀 开始基础功能测试...\n');

  let passedTests = 0;
  let totalTests = 0;

  function runTest(name, testFn) {
    totalTests++;
    console.log(`${totalTests}. ${name}`);
    try {
      testFn();
      console.log('   ✅ 通过\n');
      passedTests++;
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}\n`);
    }
  }

  // 测试1: 项目文件结构
  runTest('检查项目文件结构', () => {
    const fs = require('fs');
    const path = require('path');

    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'src/index.ts',
      'src/services/stockService.ts',
      'src/services/ipo3-service-v2.ts',
      'src/types/stock.ts',
      'dist/index.js'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`缺少文件: ${file}`);
      }
    }
  });

  // 测试2: package.json配置
  runTest('检查package.json配置', () => {
    const fs = require('fs');
    const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

    if (!packageData.name || !packageData.version) {
      throw new Error('package.json缺少基本信息');
    }

    if (!packageData.dependencies || !packageData.devDependencies) {
      throw new Error('package.json缺少依赖配置');
    }

    const requiredDeps = ['@modelcontextprotocol/sdk', 'axios'];
    for (const dep of requiredDeps) {
      if (!packageData.dependencies[dep]) {
        throw new Error(`缺少依赖: ${dep}`);
      }
    }
  });

  // 测试3: TypeScript配置
  runTest('检查TypeScript配置', () => {
    const fs = require('fs');
    const tsConfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

    if (!tsConfig.compilerOptions) {
      throw new Error('TypeScript配置不完整');
    }

    if (tsConfig.compilerOptions.module !== 'ESNext') {
      console.log('   ⚠️  建议使用ESNext模块系统');
    }
  });

  // 测试4: 构建输出
  runTest('检查构建输出', () => {
    const fs = require('fs');

    if (!fs.existsSync('dist/index.js')) {
      throw new Error('构建输出文件不存在');
    }

    const indexContent = fs.readFileSync('dist/index.js', 'utf8');
    if (!indexContent.includes('MarketMCPServer') || !indexContent.includes('Server')) {
      throw new Error('构建输出内容不正确');
    }
  });

  // 测试5: 检查MCP工具定义
  runTest('检查MCP工具定义完整性', () => {
    const fs = require('fs');
    const indexContent = fs.readFileSync('src/index.ts', 'utf8');

    const expectedTools = [
      'get_stock_info',
      'search_stock',
      'get_popular_stocks',
      'validate_stock_code',
      'get_company_info',
      'get_financial_statements',
      'get_stock_funding',
      'get_stock_trades',
      'get_stock_events',
      'get_stock_notices',
      'get_stock_survey',
      'get_stock_brokers',
      'get_stock_pledge',
      'get_stock_reports'
    ];

    for (const tool of expectedTools) {
      if (!indexContent.includes(`name: '${tool}'`)) {
        throw new Error(`缺少工具定义: ${tool}`);
      }
    }
  });

  // 测试6: 检查MCP prompts定义
  runTest('检查MCP prompts定义完整性', () => {
    const fs = require('fs');
    const indexContent = fs.readFileSync('src/index.ts', 'utf8');

    const expectedPrompts = ['stock_analysis', 'market_overview'];

    for (const prompt of expectedPrompts) {
      if (!indexContent.includes(`name: '${prompt}'`)) {
        throw new Error(`缺少prompt定义: ${prompt}`);
      }
    }
  });

  // 测试7: 检查工具处理函数
  runTest('检查工具处理函数完整性', () => {
    const fs = require('fs');
    const indexContent = fs.readFileSync('src/index.ts', 'utf8');

    const expectedHandlers = [
      'handleGetStockInfo',
      'handleSearchStock',
      'handleGetPopularStocks',
      'handleValidateStockCode',
      'handleGetCompanyInfo',
      'handleGetFinancialStatements',
      'handleGetStockFunding',
      'handleGetStockTrades',
      'handleGetStockEvents',
      'handleGetStockNotices',
      'handleGetStockSurvey',
      'handleGetStockBrokers',
      'handleGetStockPledge',
      'handleGetStockReports'
    ];

    for (const handler of expectedHandlers) {
      if (!indexContent.includes(handler)) {
        throw new Error(`缺少处理函数: ${handler}`);
      }
    }
  });

  // 测试8: 检查StockService方法
  runTest('检查StockService方法完整性', () => {
    const fs = require('fs');
    const serviceContent = fs.readFileSync('src/services/stockService.ts', 'utf8');

    const expectedMethods = [
      'getStockInfo',
      'searchStock',
      'getPopularStocks',
      'validateStockCode',
      'normalizeStockCode',
      'getCompanyInfo',
      'getIncomeStatementList',
      'getBalanceSheetList',
      'getCashFlowStatementList',
      'getFinancialAnalysisList'
    ];

    for (const method of expectedMethods) {
      if (!serviceContent.includes(method)) {
        throw new Error(`StockService缺少方法: ${method}`);
      }
    }
  });

  // 测试9: 检查类型定义
  runTest('检查类型定义完整性', () => {
    const fs = require('fs');
    const typesContent = fs.readFileSync('src/types/stock.ts', 'utf8');

    const expectedTypes = [
      'StockInfo',
      'CompanyInfo',
      'StockQueryParams',
      'StockQueryResult',
      'DataSource',
      'IncomeStatement',
      'BalanceSheet',
      'CashFlowStatement'
    ];

    for (const type of expectedTypes) {
      if (!typesContent.includes(type)) {
        throw new Error(`类型定义缺少: ${type}`);
      }
    }
  });

  // 测试10: 语法检查
  runTest('检查TypeScript语法', () => {
    const { execSync } = require('child_process');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('TypeScript语法检查失败');
    }
  });

  // 生成测试报告
  console.log('📊 测试报告');
  console.log('='.repeat(50));
  console.log(`总测试数: ${totalTests}`);
  console.log(`✅ 通过: ${passedTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}`);
  console.log(`📈 通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (passedTests === totalTests) {
    console.log('🎉 所有基础测试通过！');
    console.log('\n✨ 项目结构完整，可以继续进行功能测试');
    console.log('\n💡 下一步:');
    console.log('   1. 运行 MCP 服务器: node dist/index.js');
    console.log('   2. 在Claude中配置MCP连接');
    console.log('   3. 测试具体的MCP工具功能');
  } else {
    console.log('⚠️  部分测试失败，请检查相关问题');
  }

  return passedTests === totalTests;
}

// 运行测试
basicTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});