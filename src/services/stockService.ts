import { EastMoneyServiceSimple } from './eastmoney-service-simple.js';
import { StockInfo, StockQueryParams, StockQueryResult, DataSource } from '../types/stock.js';

/**
 * 股票服务管理器
 * 支持东方财富网数据源
 */
export class StockService {
  private eastMoneyService = new EastMoneyServiceSimple();

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
        console.warn('IPO3.com数据源已废弃，使用东方财富网数据源替代');
        // 降级到东方财富网数据源
        return this.eastMoneyService.getStockInfo(codes);
      case DataSource.EASTMONEY:
        return this.eastMoneyService.getStockInfo(codes);
      default:
        // 默认使用东方财富网
        return this.eastMoneyService.getStockInfo(codes);
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
  async searchStock(keyword: string, dataSource: DataSource = DataSource.EASTMONEY): Promise<StockQueryResult> {
    switch (dataSource) {
      case DataSource.IPO3:
        console.warn('IPO3.com数据源已废弃，使用东方财富网数据源替代');
        return this.eastMoneyService.searchStock(keyword);
      case DataSource.EASTMONEY:
      default:
        return this.eastMoneyService.searchStock(keyword);
    }
  }

  /**
   * 获取热门股票
   */
  async getPopularStocks(dataSource: DataSource = DataSource.EASTMONEY): Promise<StockQueryResult> {
    switch (dataSource) {
      case DataSource.IPO3:
        console.warn('IPO3.com数据源已废弃，使用东方财富网数据源替代');
        // 降级到东方财富网数据源
        return this.eastMoneyService.getPopularStocks();
      case DataSource.EASTMONEY:
      default:
        return this.eastMoneyService.getPopularStocks();
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

  // ==================== 增强功能（占位方法）====================

  /**
   * 获取公司详细信息（待实现）
   */
  async getCompanyInfo(stockCode: string, englishKey: boolean = false) {
    return this.eastMoneyService.getCompanyInfo(stockCode, englishKey);
  }

  /**
   * 获取利润表数据（待实现）
   */
  async getIncomeStatementList(stockCode: string, dateType: string = '年报', englishKey: boolean = false) {
    return this.eastMoneyService.getIncomeStatementList(stockCode, dateType, englishKey);
  }

  /**
   * 获取资产负债表数据（待实现）
   */
  async getBalanceSheetList(stockCode: string, dateType: string = '年报', englishKey: boolean = false) {
    return this.eastMoneyService.getBalanceSheetList(stockCode, dateType, englishKey);
  }

  /**
   * 获取现金流量表数据（待实现）
   */
  async getCashFlowStatementList(stockCode: string, dateType: string = '年报', englishKey: boolean = false) {
    return this.eastMoneyService.getCashFlowStatementList(stockCode, dateType, englishKey);
  }

  /**
   * 获取财务分析数据（待实现）
   */
  async getFinancialAnalysisList(stockCode: string, dateType: string = '年报', englishKey: boolean = false) {
    return this.eastMoneyService.getFinancialAnalysisList(stockCode, dateType, englishKey);
  }

  /**
   * 获取募资明细（待实现）
   */
  async getStockFundList(stockCode: string, englishKey: boolean = false) {
    return this.eastMoneyService.getStockFundList(stockCode, englishKey);
  }

  /**
   * 获取交易明细（待实现）
   */
  async getStockTradeList(stockCode: string, englishKey: boolean = false) {
    return this.eastMoneyService.getStockTradeList(stockCode, englishKey);
  }

  /**
   * 获取事件提醒（待实现）
   */
  async getStockEventList(stockCode: string, englishKey: boolean = false) {
    return this.eastMoneyService.getStockEventList(stockCode, englishKey);
  }

  /**
   * 获取公告列表（待实现）
   */
  async getStockNoticeList(stockCode: string, page: number = 1) {
    return this.eastMoneyService.getStockNoticeList(stockCode, page);
  }

  /**
   * 获取定增计划（待实现）
   */
  async getStockSurvey(stockCode: string, englishKey: boolean = false) {
    return this.eastMoneyService.getStockSurvey(stockCode, englishKey);
  }

  /**
   * 获取做市商信息（待实现）
   */
  async getStockBrokerList(stockCode: string, englishKey: boolean = false) {
    return this.eastMoneyService.getStockBrokerList(stockCode, englishKey);
  }

  /**
   * 获取质押信息（待实现）
   */
  async getStockPledgeData(stockCode: string, englishKey: boolean = false) {
    return this.eastMoneyService.getStockPledgeData(stockCode, englishKey);
  }

  /**
   * 获取研报列表（待实现）
   */
  async getStockReportList(stockCode: string, englishKey: boolean = false) {
    return this.eastMoneyService.getStockReportList(stockCode, englishKey);
  }
}