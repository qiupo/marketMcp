/**
 * IPO3.com 服务使用示例
 */

import { IPO3ServiceV2 } from '../src/services/ipo3-service-v2.js';
import {
  StockInfo,
  CompanyInfo,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  FinancialAnalysis,
  FundInfo,
  TradeInfo,
  EventInfo,
  NoticeInfo,
  SurveyInfo,
  BrokerInfo,
  PledgeData,
  ReportInfo
} from '../src/types/stock.js';

/**
 * 创建IPO3服务实例
 */
const ipo3Service = new IPO3ServiceV2();

/**
 * 示例1：获取股票基础信息
 */
async function example1_GetStockInfo() {
  console.log('=== 示例1：获取股票基础信息 ===');

  try {
    const stockCodes = ['430510', '832468', '870299']; // 北交所股票代码
    const result = await ipo3Service.getStockInfo(stockCodes);

    if (result.success && result.data) {
      console.log(`成功获取 ${result.data.length} 只股票信息:`);
      result.data.forEach((stock: StockInfo) => {
        console.log(`- ${stock.name}(${stock.code}): ${stock.price}元 ${stock.changePercent}`);
      });
    } else {
      console.error('获取股票信息失败:', result.errors);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }

  console.log('\n');
}

/**
 * 示例2：获取公司详细信息
 */
async function example2_GetCompanyInfo() {
  console.log('=== 示例2：获取公司详细信息 ===');

  try {
    const stockCode = '430510'; // 丰光精密
    const companyInfo = await ipo3Service.getCompanyInfo(stockCode);

    console.log(`公司名称: ${companyInfo.name}`);
    console.log(`股票代码: ${companyInfo.code}`);
    console.log(`最新价格: ${companyInfo.price}元`);
    console.log(`涨跌幅: ${companyInfo.changePercent}`);
    console.log(`所属行业: ${companyInfo.industry}`);
    console.log(`总市值: ${companyInfo.totalMarketValue}`);
    console.log(`流通市值: ${companyInfo.circulatingMarketValue}`);
    console.log(`主营业务: ${companyInfo.mainBusiness}`);
    console.log(`成立日期: ${companyInfo.establishDate}`);

    // 显示股本结构
    if (companyInfo.equityStructure && companyInfo.equityStructure.length > 0) {
      console.log('\n股本结构:');
      companyInfo.equityStructure.forEach((equity: any) => {
        console.log(`- 总股本: ${equity.totalEquity}, 流通股本: ${equity.circulatingEquity}`);
        console.log(`- 统计日期: ${equity.statisticalDate}, 股东户数: ${equity.shareholderCount}`);
      });
    }

    // 显示高管信息
    if (companyInfo.seniorManagement && companyInfo.seniorManagement.length > 0) {
      console.log('\n高管信息:');
      companyInfo.seniorManagement.slice(0, 3).forEach((exec: any) => {
        console.log(`- ${exec.name}: ${exec.position} (${exec.highestEducation})`);
      });
    }

  } catch (error) {
    console.error('获取公司信息失败:', error);
  }

  console.log('\n');
}

/**
 * 示例3：获取财务报表数据
 */
async function example3_GetFinancialStatements() {
  console.log('=== 示例3：获取财务报表数据 ===');

  try {
    const stockCode = '430510';
    const dateType = '年报'; // 可选：'年报', '中报', '一季报', '三季报'

    // 获取利润表
    console.log('获取利润表数据...');
    const incomeStatements = await ipo3Service.getIncomeStatementList(stockCode, dateType);
    if (incomeStatements.length > 0) {
      const latest = incomeStatements[incomeStatements.length - 1];
      console.log(`报告期: ${latest.reportDate}`);
      console.log(`营业收入: ${latest.salesRevenue}`);
      console.log(`净利润: ${latest.netProfit}`);
      console.log(`基本每股收益: ${latest.basicEarningsPerShare}`);
    }

    // 获取资产负债表
    console.log('\n获取资产负债表数据...');
    const balanceSheets = await ipo3Service.getBalanceSheetList(stockCode, dateType);
    if (balanceSheets.length > 0) {
      const latest = balanceSheets[balanceSheets.length - 1];
      console.log(`报告期: ${latest.reportDate}`);
      console.log(`总资产: ${latest.totalAssets}`);
      console.log(`总负债: ${latest.totalLiabilities}`);
      console.log(`股东权益合计: ${latest.totalEquity}`);
    }

    // 获取现金流量表
    console.log('\n获取现金流量表数据...');
    const cashFlowStatements = await ipo3Service.getCashFlowStatementList(stockCode, dateType);
    if (cashFlowStatements.length > 0) {
      const latest = cashFlowStatements[cashFlowStatements.length - 1];
      console.log(`报告期: ${latest.reportDate}`);
      console.log(`经营活动现金流量净额: ${latest.netCashFromOperatingActivities}`);
      console.log(`期末现金余额: ${latest.closingBalance}`);
    }

    // 获取财务分析
    console.log('\n获取财务分析数据...');
    const financialAnalysis = await ipo3Service.getFinancialAnalysisList(stockCode, dateType);
    if (financialAnalysis.length > 0) {
      const latest = financialAnalysis[financialAnalysis.length - 1];
      console.log(`报告期: ${latest.reportDate}`);
      console.log(`净资产收益率: ${latest.returnOnEquityDiluted}%`);
      console.log(`总资产报酬率: ${latest.totalAssetReturnRate}%`);
      console.log(`资产负债率: ${latest.assetLiabilityRatio}%`);
      console.log(`流动比率: ${latest.currentRatio}`);
    }

  } catch (error) {
    console.error('获取财务数据失败:', error);
  }

  console.log('\n');
}

/**
 * 示例4：获取融资和交易信息
 */
async function example4_GetFundingAndTrading() {
  console.log('=== 示例4：获取融资和交易信息 ===');

  try {
    const stockCode = '430510';

    // 获取募资明细
    console.log('获取募资明细...');
    const fundList = await ipo3Service.getStockFundList(stockCode);
    if (fundList.length > 0) {
      fundList.forEach((fund: FundInfo) => {
        console.log(`募资日期: ${fund.fundDate}, 类型: ${fund.fundType}`);
        console.log(`募集资金: ${fund.fundMoney}, 增发价格: ${fund.additionalIssuancePrice}`);
        console.log(`投资者数量: ${fund.investorList.length}`);
      });
    }

    // 获取交易明细
    console.log('\n获取交易明细...');
    const tradeList = await ipo3Service.getStockTradeList(stockCode);
    if (tradeList.length > 0) {
      const recentTrades = tradeList.slice(-5); // 最近5笔交易
      console.log('最近交易记录:');
      recentTrades.forEach((trade: TradeInfo) => {
        console.log(`${trade.tradeDate}: ${trade.tradePrice}元 ${trade.tradeQuantity}股`);
        console.log(`买方: ${trade.buyerBroker}, 卖方: ${trade.sellerBroker}`);
      });
    }

  } catch (error) {
    console.error('获取融资和交易信息失败:', error);
  }

  console.log('\n');
}

/**
 * 示例5：获取公告和事件信息
 */
async function example5_GetNoticesAndEvents() {
  console.log('=== 示例5：获取公告和事件信息 ===');

  try {
    const stockCode = '430510';

    // 获取大事提醒
    console.log('获取大事提醒...');
    const eventList = await ipo3Service.getStockEventList(stockCode);
    if (eventList.length > 0) {
      console.log('近期大事:');
      eventList.slice(0, 5).forEach((event: EventInfo) => {
        console.log(`${event.eventDate}: ${event.eventType} - ${event.title}`);
      });
    }

    // 获取最新公告
    console.log('\n获取最新公告...');
    const noticeList = await ipo3Service.getStockNoticeList(stockCode, 1);
    if (noticeList.success && noticeList.data) {
      console.log('最新公告列表:');
      noticeList.data.slice(0, 5).forEach((notice: NoticeInfo) => {
        console.log(`${notice.time}: ${notice.title}`);
        console.log(`链接: ${notice.detailUrl}`);
      });
    }

    // 获取定增计划
    console.log('\n获取定增计划...');
    const survey = await ipo3Service.getStockSurvey(stockCode);
    console.log(`融资进度: ${survey.financingProgress}`);
    console.log(`融资金额: ${survey.financingMoney}`);
    console.log(`出让股份: ${survey.transferOfShares}`);
    console.log(`每股价格: ${survey.pricePerShare}`);

  } catch (error) {
    console.error('获取公告和事件信息失败:', error);
  }

  console.log('\n');
}

/**
 * 示例6：获取研报和做市商信息
 */
async function example6_GetReportsAndBrokers() {
  console.log('=== 示例6：获取研报和做市商信息 ===');

  try {
    const stockCode = '430510';

    // 获取研报
    console.log('获取研报信息...');
    const reportList = await ipo3Service.getStockReportList(stockCode);
    if (reportList.length > 0) {
      console.log('最新研报:');
      reportList.slice(0, 3).forEach((report: ReportInfo) => {
        console.log(`${report.publishDate}: ${report.title}`);
        console.log(`详情: ${report.detailUrl}`);
      });
    }

    // 获取做市商信息
    console.log('\n获取做市商信息...');
    const brokerList = await ipo3Service.getStockBrokerList(stockCode);
    if (brokerList.length > 0) {
      console.log('做市商列表:');
      brokerList.forEach((broker: BrokerInfo) => {
        console.log(`${broker.broker}: 初始库存${broker.initialStock}, 初始价格${broker.initialPrice}`);
      });
    }

    // 获取质押信息
    console.log('\n获取质押信息...');
    const pledgeData = await ipo3Service.getStockPledgeData(stockCode);
    console.log(`累计质押: ${pledgeData.pledgeTotal}`);
    console.log(`质押股东数量: ${pledgeData.pledgeShareholders.length}`);

  } catch (error) {
    console.error('获取研报和做市商信息失败:', error);
  }

  console.log('\n');
}

/**
 * 示例7：批量获取多只股票的全面信息
 */
async function example7_BatchStockAnalysis() {
  console.log('=== 示例7：批量获取多只股票的全面信息 ===');

  try {
    const stockCodes = ['430510', '832468', '870299']; // 北交所股票

    for (const stockCode of stockCodes) {
      console.log(`\n--- 分析股票 ${stockCode} ---`);

      try {
        // 获取基础信息
        const companyInfo = await ipo3Service.getCompanyInfo(stockCode);
        console.log(`公司: ${companyInfo.name} (${companyInfo.code})`);
        console.log(`价格: ${companyInfo.price}元 ${companyInfo.changePercent}`);
        console.log(`行业: ${companyInfo.industry}`);

        // 获取财务摘要
        const latestFinancial = await ipo3Service.getFinancialAnalysisList(stockCode, '年报');
        if (latestFinancial.length > 0) {
          const latest = latestFinancial[latestFinancial.length - 1];
          console.log(`ROE: ${latest.returnOnEquityDiluted}%`);
          console.log(`资产负债率: ${latest.assetLiabilityRatio}%`);
        }

        // 获取定增计划
        const survey = await ipo3Service.getStockSurvey(stockCode);
        if (survey.financingProgress && survey.financingProgress !== '无') {
          console.log(`融资进度: ${survey.financingProgress}`);
          console.log(`融资金额: ${survey.financingMoney}`);
        }

      } catch (stockError) {
        console.error(`分析股票 ${stockCode} 失败:`, stockError);
      }
    }

  } catch (error) {
    console.error('批量分析失败:', error);
  }

  console.log('\n');
}

/**
 * 主函数：运行所有示例
 */
async function main() {
  console.log('IPO3.com 服务使用示例\n');

  try {
    await example1_GetStockInfo();
    await example2_GetCompanyInfo();
    await example3_GetFinancialStatements();
    await example4_GetFundingAndTrading();
    await example5_GetNoticesAndEvents();
    await example6_GetReportsAndBrokers();
    await example7_BatchStockAnalysis();

    console.log('所有示例运行完成！');
  } catch (error) {
    console.error('运行示例时出错:', error);
  }
}

/**
 * 如果直接运行此文件，则执行示例
 */
if (require.main === module) {
  main().catch(console.error);
}

// 导出示例函数供其他模块使用
export {
  example1_GetStockInfo,
  example2_GetCompanyInfo,
  example3_GetFinancialStatements,
  example4_GetFundingAndTrading,
  example5_GetNoticesAndEvents,
  example6_GetReportsAndBrokers,
  example7_BatchStockAnalysis
};