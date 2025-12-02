import { EastMoneyServiceSimple } from './eastmoney-service-simple.js';
import { AKToolsService } from './aktools-service.js';
import { StockInfo, StockQueryParams, StockQueryResult, DataSource } from '../types/stock.js';

/**
 * 股票服务管理器
 * 支持东方财富网和AKTools数据源
 */
export class StockService {
  private eastMoneyService = new EastMoneyServiceSimple();
  private aktoolsService = new AKToolsService();

  /**
   * 获取股票信息
   * @param params 查询参数
   */
  async getStockInfo(params: StockQueryParams): Promise<StockQueryResult> {
    const { codes, dataSource = DataSource.EASTMONEY } = params;

    // 根据数据源选择服务
    switch (dataSource) {
      case 'aktools':
        return this.aktoolsService.getStockRealtime(codes);
      case 'eastmoney':
      default:
        return this.eastMoneyService.getStockInfo(codes);
    }
  }

  /**
   * 获取单个股票信息
   */
  async getSingleStockInfo(code: string, dataSource: string = 'eastmoney'): Promise<StockQueryResult> {
    return this.getStockInfo({
      codes: [code],
      dataSource: dataSource as any
    });
  }

  /**
   * 批量获取股票信息
   */
  async getBatchStockInfo(codes: string[], dataSource: string = 'eastmoney'): Promise<StockQueryResult> {
    if (dataSource === 'aktools') {
      return this.aktoolsService.getStockRealtime(codes);
    }

    // 东方财富API支持批量查询，但建议分批处理以提高性能
    const batchSize = 20; // 每批最多20个股票
    const results: StockInfo[] = [];
    const allErrors: string[] = [];
    let finalSource = dataSource;

    for (let i = 0; i < codes.length; i += batchSize) {
      const batch = codes.slice(i, i + batchSize);
      const result = await this.getStockInfo({
        codes: batch,
        dataSource: dataSource as any
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
      source: finalSource as any
    };
  }

  /**
   * 获取股票历史数据
   */
  async getStockHistory(
    codes: string[],
    period: string = 'daily',
    startDate?: string,
    endDate?: string,
    adjust: string = ''
  ): Promise<StockQueryResult> {
    return this.aktoolsService.getStockHistory(codes, period, startDate, endDate, adjust);
  }

  /**
   * 获取股票基本信息
   */
  async getStockBasicInfo(codes: string[]): Promise<StockQueryResult> {
    return this.aktoolsService.getStockBasicInfo(codes);
  }

  /**
   * 获取行业板块数据
   */
  async getSectorData(sector?: string): Promise<any> {
    return this.aktoolsService.getSectorData(sector);
  }

  /**
   * 检查AKTools服务状态
   */
  async checkAKToolsService(): Promise<boolean> {
    return this.aktoolsService.checkService();
  }

  /**
   * 获取市场概览
   */
  async getMarketOverview(market: string = 'all'): Promise<any> {
    try {
      const sectorData = await this.aktoolsService.getSectorData();
      if (sectorData.success) {
        return {
          success: true,
          market,
          totalCount: sectorData.data.totalCount,
          totalAmount: sectorData.data.totalAmount,
          sectorStats: sectorData.data.sectorStats,
          updateTime: sectorData.data.updateTime
        };
      }
      return {
        success: false,
        error: '无法获取市场数据'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  }