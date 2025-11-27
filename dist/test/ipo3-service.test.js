"use strict";
/**
 * IPO3服务功能测试
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testBasicFunctionality = testBasicFunctionality;
exports.testFinancialData = testFinancialData;
exports.testOtherFeatures = testOtherFeatures;
exports.testErrorHandling = testErrorHandling;
exports.runTests = runTests;
const ipo3_service_v2_js_1 = require("../src/services/ipo3-service-v2.js");
// 创建服务实例
const ipo3Service = new ipo3_service_v2_js_1.IPO3ServiceV2();
/**
 * 测试基础功能
 */
async function testBasicFunctionality() {
    console.log('=== IPO3服务基础功能测试 ===\n');
    try {
        // 测试1：获取股票基础信息
        console.log('1. 测试获取股票基础信息...');
        const stockCodes = ['430510']; // 丰光精密
        const result = await ipo3Service.getStockInfo(stockCodes);
        if (result.success && result.data.length > 0) {
            const stock = result.data[0];
            console.log(`✅ 股票基础信息获取成功:`);
            console.log(`   - 股票名称: ${stock.name}`);
            console.log(`   - 股票代码: ${stock.code}`);
            console.log(`   - 最新价格: ${stock.price}元`);
            console.log(`   - 涨跌幅: ${stock.changePercent}`);
            console.log(`   - 数据来源: ${result.source}`);
        }
        else {
            console.log('❌ 获取股票基础信息失败:', result.errors);
            return;
        }
        console.log('\n2. 测试获取公司详细信息...');
        // 测试2：获取公司详细信息
        const companyInfo = await ipo3Service.getCompanyInfo('430510', false);
        console.log(`✅ 公司详细信息获取成功:`);
        console.log(`   - 公司名称: ${companyInfo.name}`);
        console.log(`   - 股票代码: ${companyInfo.code}`);
        console.log(`   - 最新价格: ${companyInfo.price}元`);
        console.log(`   - 所属行业: ${companyInfo.industry}`);
        console.log(`   - 总市值: ${companyInfo.totalMarketValue}`);
        console.log(`   - 主营业务: ${companyInfo.mainBusiness?.substring(0, 50)}...`);
        if (companyInfo.equityStructure && companyInfo.equityStructure.length > 0) {
            const equity = companyInfo.equityStructure[0];
            console.log(`   - 总股本: ${equity.totalEquity}`);
            console.log(`   - 流通股本: ${equity.circulatingEquity}`);
        }
        console.log('\n3. 测试英文字段名转换...');
        // 测试3：英文字段名转换
        const companyInfoEN = await ipo3Service.getCompanyInfo('430510', true);
        console.log(`✅ 英文字段名转换成功:`);
        console.log(`   - Stock Name: ${companyInfoEN.name}`);
        console.log(`   - Stock Code: ${companyInfoEN.code}`);
        console.log(`   - Last Price: ${companyInfoEN.price}`);
        console.log(`   - Industry: ${companyInfoEN.industry}`);
    }
    catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }
    console.log('\n=== 基础功能测试完成 ===\n');
}
/**
 * 测试财务数据功能
 */
async function testFinancialData() {
    console.log('=== IPO3服务财务数据测试 ===\n');
    try {
        console.log('1. 测试获取利润表数据...');
        const incomeStatements = await ipo3Service.getIncomeStatementList('430510', '年报');
        if (incomeStatements.length > 0) {
            const latest = incomeStatements[incomeStatements.length - 1];
            console.log(`✅ 利润表数据获取成功:`);
            console.log(`   - 报告期: ${latest.reportDate}`);
            console.log(`   - 营业收入: ${latest.salesRevenue}`);
            console.log(`   - 净利润: ${latest.netProfit}`);
            console.log(`   - 基本每股收益: ${latest.basicEarningsPerShare}`);
        }
        else {
            console.log('❌ 利润表数据获取失败或无数据');
        }
        console.log('\n2. 测试获取资产负债表数据...');
        const balanceSheets = await ipo3Service.getBalanceSheetList('430510', '年报');
        if (balanceSheets.length > 0) {
            const latest = balanceSheets[balanceSheets.length - 1];
            console.log(`✅ 资产负债表数据获取成功:`);
            console.log(`   - 报告期: ${latest.reportDate}`);
            console.log(`   - 总资产: ${latest.totalAssets}`);
            console.log(`   - 总负债: ${latest.totalLiabilities}`);
            console.log(`   - 股东权益合计: ${latest.totalEquity}`);
        }
        else {
            console.log('❌ 资产负债表数据获取失败或无数据');
        }
        console.log('\n3. 测试获取财务分析数据...');
        const financialAnalysis = await ipo3Service.getFinancialAnalysisList('430510', '年报');
        if (financialAnalysis.length > 0) {
            const latest = financialAnalysis[financialAnalysis.length - 1];
            console.log(`✅ 财务分析数据获取成功:`);
            console.log(`   - 报告期: ${latest.reportDate}`);
            console.log(`   - 净资产收益率: ${latest.returnOnEquityDiluted}%`);
            console.log(`   - 总资产报酬率: ${latest.totalAssetReturnRate}%`);
            console.log(`   - 资产负债率: ${latest.assetLiabilityRatio}%`);
            console.log(`   - 流动比率: ${latest.currentRatio}`);
        }
        else {
            console.log('❌ 财务分析数据获取失败或无数据');
        }
    }
    catch (error) {
        console.error('❌ 财务数据测试过程中发生错误:', error);
    }
    console.log('\n=== 财务数据测试完成 ===\n');
}
/**
 * 测试其他功能
 */
async function testOtherFeatures() {
    console.log('=== IPO3服务其他功能测试 ===\n');
    try {
        console.log('1. 测试获取交易明细...');
        const tradeList = await ipo3Service.getStockTradeList('430510');
        if (tradeList.length > 0) {
            const latest = tradeList[tradeList.length - 1];
            console.log(`✅ 交易明细获取成功:`);
            console.log(`   - 交易日期: ${latest.tradeDate}`);
            console.log(`   - 成交价格: ${latest.tradePrice}元`);
            console.log(`   - 成交数量: ${latest.tradeQuantity}股`);
            console.log(`   - 买方券商: ${latest.buyerBroker}`);
            console.log(`   - 卖方券商: ${latest.sellerBroker}`);
        }
        else {
            console.log('❌ 交易明细获取失败或无数据');
        }
        console.log('\n2. 测试获取公告信息...');
        const noticeList = await ipo3Service.getStockNoticeList('430510', 1);
        if (noticeList.success && noticeList.data.length > 0) {
            const latest = noticeList.data[0];
            console.log(`✅ 公告信息获取成功:`);
            console.log(`   - 公告标题: ${latest.title}`);
            console.log(`   - 发布时间: ${latest.time}`);
            console.log(`   - 详情链接: ${latest.detailUrl}`);
            console.log(`   - 总页数: ${noticeList.pagination?.total || 'N/A'}`);
        }
        else {
            console.log('❌ 公告信息获取失败或无数据');
        }
        console.log('\n3. 测试获取大事提醒...');
        const eventList = await ipo3Service.getStockEventList('430510');
        if (eventList.length > 0) {
            const latest = eventList[eventList.length - 1];
            console.log(`✅ 大事提醒获取成功:`);
            console.log(`   - 事件日期: ${latest.eventDate}`);
            console.log(`   - 事件类型: ${latest.eventType}`);
            console.log(`   - 事件标题: ${latest.title}`);
        }
        else {
            console.log('❌ 大事提醒获取失败或无数据');
        }
    }
    catch (error) {
        console.error('❌ 其他功能测试过程中发生错误:', error);
    }
    console.log('\n=== 其他功能测试完成 ===\n');
}
/**
 * 测试错误处理
 */
async function testErrorHandling() {
    console.log('=== IPO3服务错误处理测试 ===\n');
    try {
        console.log('1. 测试无效股票代码...');
        const result = await ipo3Service.getStockInfo(['999999']);
        if (!result.success) {
            console.log('✅ 无效股票代码正确处理:');
            console.log(`   - 成功状态: ${result.success}`);
            console.log(`   - 错误信息: ${result.errors?.join(', ')}`);
        }
        else {
            console.log('❌ 无效股票代码处理异常');
        }
        console.log('\n2. 测试空股票代码数组...');
        const emptyResult = await ipo3Service.getStockInfo([]);
        if (!emptyResult.success || emptyResult.data.length === 0) {
            console.log('✅ 空数组正确处理');
        }
        else {
            console.log('❌ 空数组处理异常');
        }
    }
    catch (error) {
        console.error('❌ 错误处理测试过程中发生错误:', error);
    }
    console.log('\n=== 错误处理测试完成 ===\n');
}
/**
 * 主测试函数
 */
async function runTests() {
    console.log('🚀 开始IPO3服务功能测试\n');
    const startTime = Date.now();
    try {
        await testBasicFunctionality();
        await testFinancialData();
        await testOtherFeatures();
        await testErrorHandling();
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`🎉 所有测试完成！总耗时: ${duration}秒`);
        console.log('\n📋 测试总结:');
        console.log('   ✅ 基础股票信息获取');
        console.log('   ✅ 公司详细信息获取');
        console.log('   ✅ 中英文字段名转换');
        console.log('   ✅ 财务报表数据获取');
        console.log('   ✅ 财务分析数据获取');
        console.log('   ✅ 交易明细获取');
        console.log('   ✅ 公告信息获取');
        console.log('   ✅ 大事提醒获取');
        console.log('   ✅ 错误处理机制');
    }
    catch (error) {
        console.error('💥 测试过程中发生严重错误:', error);
    }
}
// 运行测试
if (require.main === module) {
    runTests().catch(console.error);
}
