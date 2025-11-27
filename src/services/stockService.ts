import { IPO3ServiceV2 } from './ipo3-service-v2.js';
import { StockInfo, StockQueryParams, StockQueryResult, DataSource } from '../types/stock.js';

/**
 * 股票服务管理器
 * 使用IPO3.com作为主要数据源
 */
export class StockService {
  private ipo3Service = new IPO3ServiceV2();

  /**
   * 获取股票信息
   * @param params 查询参数
   */
  async getStockInfo(params: StockQueryParams): Promise<StockQueryResult> {
    const { codes, dataSource } = params;

    if (dataSource) {
      // 指定数据源
      return this.getFromSpecificSource(codes, dataSource);
    } else {
      // 使用默认数据源
      return this.getFromSpecificSource(codes, DataSource.IPO3);
    }
  }

  /**
   * 从指定数据源获取数据
   */
  private async getFromSpecificSource(codes: string[], dataSource: DataSource): Promise<StockQueryResult> {
    switch (dataSource) {
      case DataSource.IPO3:
        return this.ipo3Service.getStockInfo(codes);
      default:
        return this.getFromSpecificSource(codes, DataSource.IPO3);
    }
  }

  /**
   * 获取单个股票信息
   */
  async getSingleStockInfo(code: string, dataSource?: DataSource): Promise<StockQueryResult> {
    return this.getStockInfo({
      codes: [code],
      dataSource
    });
  }

  /**
   * 批量获取股票信息
   */
  async getBatchStockInfo(codes: string[], dataSource?: DataSource): Promise<StockQueryResult> {
    // IPO3 API建议批量查询，但每批数量不宜过多
    const batchSize = 10; // 每批最多10个股票
    const results: StockInfo[] = [];
    const allErrors: string[] = [];
    let finalSource = DataSource.IPO3;

    for (let i = 0; i < codes.length; i += batchSize) {
      const batch = codes.slice(i, i + batchSize);
      const result = await this.getStockInfo({
        codes: batch,
        dataSource
      });

      if (result.success) {
        results.push(...result.data);
        finalSource = result.source;
      }

      if (result.errors) {
        allErrors.push(...result.errors);
      }
    }

    return {
      success: results.length > 0,
      data: results,
      errors: allErrors.length > 0 ? allErrors : undefined,
      source: finalSource
    };
  }

  /**
   * 搜索股票
   */
  async searchStock(keyword: string): Promise<StockQueryResult> {
    return this.ipo3Service.searchStock(keyword);
  }

  /**
   * 获取热门股票
   */
  async getPopularStocks(): Promise<StockQueryResult> {
    try {
      // 使用搜索功能获取热门股票示例
      const result = await this.ipo3Service.searchStock('热门');
      if (!result.success || result.data.length === 0) {
        // 如果搜索无结果，返回一些示例代码
        return await this.ipo3Service.getStockInfo(['430002', '430003', '430004', '430005', '430006']);
      }
      return result;
    } catch (error) {
      // 降级处理：返回一些常见的新三板股票代码
      return await this.ipo3Service.getStockInfo(['430002', '430003', '430004', '430005', '430006']);
    }
  }

  /**
   * 验证股票代码格式
   */
  validateStockCode(code: string): boolean {
    const cleanCode = code.replace(/^(sh|sz|bj)/i, '');
    return /^[0-9]{6}$/.test(cleanCode);
  }

  /**
   * 标准化股票代码
   */
  normalizeStockCode(code: string): string {
    // 去除市场前缀，只保留6位数字
    return code.replace(/^(sh|sz|bj)/i, '');
  }

  // ==================== IPO3 增强功能 ====================

  /**
   * 获取公司详细信息
   */
  async getCompanyInfo(stockCode: string, englishKey: boolean = false) {
    return await this.ipo3Service.getCompanyInfo(stockCode, englishKey);
  }

  /**
   * 获取利润表数据
   */
  async getIncomeStatementList(stockCode: string, dateType: string = '年报', englishKey: boolean = false) {
    return await this.ipo3Service.getIncomeStatementList(stockCode, dateType, englishKey);
  }

  /**
   * 获取资产负债表数据
   */
  async getBalanceSheetList(stockCode: string, dateType: string = '年报', englishKey: boolean = false) {
    return await this.ipo3Service.getBalanceSheetList(stockCode, dateType, englishKey);
  }

  /**
   * 获取现金流量表数据
   */
  async getCashFlowStatementList(stockCode: string, dateType: string = '年报', englishKey: boolean = false) {
    return await this.ipo3Service.getCashFlowStatementList(stockCode, dateType, englishKey);
  }

  /**
   * 获取财务分析数据
   */
  async getFinancialAnalysisList(stockCode: string, dateType: string = '年报', englishKey: boolean = false) {
    return await this.ipo3Service.getFinancialAnalysisList(stockCode, dateType, englishKey);
  }

  /**
   * 获取募资明细
   */
  async getStockFundList(stockCode: string, englishKey: boolean = false) {
    return await this.ipo3Service.getStockFundList(stockCode, englishKey);
  }

  /**
   * 获取交易明细
   */
  async getStockTradeList(stockCode: string, englishKey: boolean = false) {
    return await this.ipo3Service.getStockTradeList(stockCode, englishKey);
  }

  /**
   * 获取事件提醒
   */
  async getStockEventList(stockCode: string, englishKey: boolean = false) {
    return await this.ipo3Service.getStockEventList(stockCode, englishKey);
  }

  /**
   * 获取公告列表
   */
  async getStockNoticeList(stockCode: string, page: number = 1) {
    return await this.ipo3Service.getStockNoticeList(stockCode, page);
  }

  /**
   * 获取定增计划
   */
  async getStockSurvey(stockCode: string, englishKey: boolean = false) {
    return await this.ipo3Service.getStockSurvey(stockCode, englishKey);
  }

  /**
   * 获取做市商信息
   */
  async getStockBrokerList(stockCode: string, englishKey: boolean = false) {
    return await this.ipo3Service.getStockBrokerList(stockCode, englishKey);
  }

  /**
   * 获取质押信息
   */
  async getStockPledgeData(stockCode: string, englishKey: boolean = false) {
    return await this.ipo3Service.getStockPledgeData(stockCode, englishKey);
  }

  /**
   * 获取研报列表
   */
  async getStockReportList(stockCode: string, englishKey: boolean = false) {
    return await this.ipo3Service.getStockReportList(stockCode, englishKey);
  }
}