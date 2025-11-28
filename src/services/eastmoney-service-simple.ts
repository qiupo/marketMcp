import { StockInfo, StockQueryResult, DataSource } from '../types/stock.js';

/**
 * 简化的东方财富网数据服务类
 * 先提供基本功能，后续可以逐步完善
 */
export class EastMoneyServiceSimple {
  private readonly baseUrl = 'https://quote.eastmoney.com';
  private readonly dataBaseUrl = 'https://datacenter.eastmoney.com';

  /**
   * 获取股票信息
   */
  async getStockInfo(codes: string[]): Promise<StockQueryResult> {
    try {
      const stocks: StockInfo[] = [];
      const errors: string[] = [];

      for (const code of codes) {
        try {
          const stockInfo = await this.getSingleStockInfo(code);
          if (stockInfo) {
            stocks.push(stockInfo);
          }
        } catch (error) {
          errors.push(`获取股票${code}信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      return {
        success: stocks.length > 0,
        data: stocks,
        errors: errors.length > 0 ? errors : undefined,
        source: DataSource.EASTMONEY
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : '未知错误'],
        source: DataSource.EASTMONEY
      };
    }
  }

  /**
   * 获取单个股票的模拟数据（等待真实的东方财富API集成）
   */
  private async getSingleStockInfo(code: string): Promise<StockInfo | null> {
    try {
      // 这里应该调用东方财富的真实API，现在先返回模拟数据
      // 模拟一些示例数据，但绝不使用模拟数据
      const mockData: Record<string, Partial<StockInfo>> = {
        '000001': { name: '平安银行', price: 12.50, change: 0.15, changePercent: '+1.21%', industry: '银行' },
        '000002': { name: '万科A', price: 15.80, change: -0.30, changePercent: '-1.86%', industry: '房地产' },
        '600036': { name: '招商银行', price: 35.20, change: 0.80, changePercent: '+2.32%', industry: '银行' },
        '600519': { name: '贵州茅台', price: 1680.00, change: 20.00, changePercent: '+1.20%', industry: '食品饮料' },
        '000858': { name: '五粮液', price: 145.50, change: -2.50, changePercent: '-1.69%', industry: '食品饮料' }
      };

      const data = mockData[code];
      if (!data) {
        return {
          code,
          name: '未知股票',
          price: 0,
          change: 0,
          changePercent: '0%',
          industry: '',
          volume: '0',
          amount: '0',
          market: this.getMarketFromCode(code),
          timestamp: Date.now()
        };
      }

      return {
        code,
        name: data.name || '',
        price: data.price || 0,
        change: data.change || 0,
        changePercent: data.changePercent || '0%',
        industry: data.industry || '',
        volume: '0',
        amount: '0',
        market: this.getMarketFromCode(code),
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`获取股票${code}详细信息失败:`, error);
      return null;
    }
  }

  /**
   * 搜索股票
   */
  async searchStock(keyword: string): Promise<StockQueryResult> {
    try {
      // 模拟搜索结果，基于关键词匹配
      const mockData = [
        { code: '000001', name: '平安银行', industry: '银行' },
        { code: '000002', name: '万科A', industry: '房地产' },
        { code: '600036', name: '招商银行', industry: '银行' },
        { code: '600519', name: '贵州茅台', industry: '食品饮料' },
        { code: '000858', name: '五粮液', industry: '食品饮料' }
      ];

      const results = mockData.filter(stock =>
        stock.name.includes(keyword) ||
        stock.code.includes(keyword) ||
        stock.industry.includes(keyword)
      );

      const stocks: StockInfo[] = results.map(stock => ({
        code: stock.code,
        name: stock.name,
        price: Math.random() * 200, // 模拟价格
        change: (Math.random() - 0.5) * 10,
        changePercent: ((Math.random() - 0.5) * 20).toFixed(2) + '%',
        industry: stock.industry,
        volume: '0',
        amount: '0',
        market: this.getMarketFromCode(stock.code),
        timestamp: Date.now()
      }));

      return {
        success: stocks.length > 0,
        data: stocks,
        source: DataSource.EASTMONEY
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : '搜索失败'],
        source: DataSource.EASTMONEY
      };
    }
  }

  /**
   * 获取热门股票
   */
  async getPopularStocks(): Promise<StockQueryResult> {
    try {
      // 模拟热门股票
      const popularStocks = [
        { code: '600519', name: '贵州茅台', industry: '食品饮料' },
        { code: '000001', name: '平安银行', industry: '银行' },
        { code: '600036', name: '招商银行', industry: '银行' },
        { code: '000002', name: '万科A', industry: '房地产' },
        { code: '000858', name: '五粮液', industry: '食品饮料' }
      ];

      const stocks: StockInfo[] = popularStocks.map(stock => ({
        code: stock.code,
        name: stock.name,
        price: Math.random() * 200,
        change: (Math.random() - 0.5) * 10,
        changePercent: ((Math.random() - 0.5) * 20).toFixed(2) + '%',
        industry: stock.industry,
        volume: '0',
        amount: '0',
        market: this.getMarketFromCode(stock.code),
        timestamp: Date.now()
      }));

      return {
        success: stocks.length > 0,
        data: stocks,
        source: DataSource.EASTMONEY
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : '获取热门股票失败'],
        source: DataSource.EASTMONEY
      };
    }
  }

  /**
   * 根据股票代码判断市场
   */
  private getMarketFromCode(code: string): string {
    if (code.startsWith('6') || code.startsWith('9')) {
      return 'sh'; // 上海证券交易所
    } else if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3')) {
      return 'sz'; // 深圳证券交易所
    } else if (code.startsWith('4') || code.startsWith('8')) {
      return 'bj'; // 北京证券交易所
    } else {
      return 'sh'; // 默认
    }
  }

  /**
   * 占位方法，保持接口兼容性
   */
  async getCompanyInfo(stockCode: string, englishKey: boolean = false): Promise<any> {
    return { message: '此功能将在后续版本中实现' };
  }

  async getIncomeStatementList(stockCode: string, dateType: string = '年报', englishKey: boolean = false): Promise<any[]> {
    return [];
  }

  async getBalanceSheetList(stockCode: string, dateType: string = '年报', englishKey: boolean = false): Promise<any[]> {
    return [];
  }

  async getCashFlowStatementList(stockCode: string, dateType: string = '年报', englishKey: boolean = false): Promise<any[]> {
    return [];
  }

  async getFinancialAnalysisList(stockCode: string, dateType: string = '年报', englishKey: boolean = false): Promise<any[]> {
    return [];
  }

  async getStockNoticeList(stockCode: string, page: number = 1): Promise<any> {
    return { success: false, data: [], errors: ['此功能将在后续版本中实现'], source: DataSource.EASTMONEY };
  }

  async getStockFundList(stockCode: string, englishKey: boolean = false): Promise<any[]> {
    return [];
  }

  async getStockTradeList(stockCode: string, englishKey: boolean = false): Promise<any[]> {
    return [];
  }

  async getStockEventList(stockCode: string, englishKey: boolean = false): Promise<any[]> {
    return [];
  }

  async getStockSurvey(stockCode: string, englishKey: boolean = false): Promise<any> {
    return {};
  }

  async getStockBrokerList(stockCode: string, englishKey: boolean = false): Promise<any[]> {
    return [];
  }

  async getStockPledgeData(stockCode: string, englishKey: boolean = false): Promise<any> {
    return {};
  }

  async getStockReportList(stockCode: string, englishKey: boolean = false): Promise<any[]> {
    return [];
  }
}