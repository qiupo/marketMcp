import axios from 'axios';
import { StockInfo, StockQueryResult, DataSource } from '../types/stock.js';

/**
 * 简化版IPO3服务
 * 专注于核心功能
 */
export class IPO3Service {
  private readonly baseUrl = 'https://www.ipo3.com';

  /**
   * 获取股票信息
   * @param codes 股票代码列表
   */
  async getStockInfo(codes: string[]): Promise<StockQueryResult> {
    try {
      const stocks: StockInfo[] = [];
      const errors: string[] = [];

      for (const code of codes) {
        try {
          const stockInfo = await this.getSingleStockInfo(code);
          stocks.push(stockInfo);
        } catch (error) {
          errors.push(`获取股票${code}信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      return {
        success: stocks.length > 0,
        data: stocks,
        errors: errors.length > 0 ? errors : undefined,
        source: DataSource.IPO3
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : '未知错误'],
        source: DataSource.IPO3
      };
    }
  }

  /**
   * 获取单个股票信息
   */
  private async getSingleStockInfo(code: string): Promise<StockInfo> {
    try {
      const url = `${this.baseUrl}/company-show/stock_code-${code}.html`;

      const response = await axios.get<string>(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });

      const html = response.data;
      return this.parseStockInfo(html, code);

    } catch (error) {
      console.error(`获取股票${code}信息失败:`, error);
      // 返回默认信息
      return {
        code,
        name: '',
        price: 0,
        change: 0,
        changePercent: '0%',
        industry: '',
        volume: '',
        totalMarketValue: '',
        turnoverRate: '',
        amount: '',
        timestamp: Date.now(),
        market: 'bj'
      };
    }
  }

  /**
   * 解析股票信息
   */
  private parseStockInfo(html: string, code: string): StockInfo {
    // 使用正则表达式解析基础信息
    const stockNameMatch = html.match(/<[^>]*id="stockName"[^>]*>([^<]*)</);
    const priceMatch = html.match(/class="[^"]*cur-price[^"]*"[^>]*>([^<]*)</);
    const changeMatch = html.match(/class="[^"]*range-num[^"]*"[^>]*>([^<]*)</);
    const changePercentMatch = html.match(/class="[^"]*range-percent[^"]*"[^>]*>([^<]*)</);

    const name = stockNameMatch ? stockNameMatch[1].trim() : '';
    const price = priceMatch ? parseFloat(priceMatch[1].trim()) || 0 : 0;
    const change = changeMatch ? parseFloat(changeMatch[1].trim()) || 0 : 0;
    const changePercent = changePercentMatch ? changePercentMatch[1].trim() : '0%';

    return {
      code,
      name,
      price,
      change,
      changePercent,
      industry: '',
      volume: '',
      totalMarketValue: '',
      turnoverRate: '',
      amount: '0',
      timestamp: Date.now(),
      market: 'bj'
    };
  }

  /**
   * 搜索股票
   */
  async searchStock(keyword: string): Promise<StockQueryResult> {
    try {
      const url = `${this.baseUrl}/search.html?keyword=${encodeURIComponent(keyword)}`;

      const response = await axios.get<string>(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // 简化的搜索结果解析
      const stocks: StockInfo[] = [];

      return {
        success: stocks.length > 0,
        data: stocks,
        source: DataSource.IPO3
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : '搜索失败'],
        source: DataSource.IPO3
      };
    }
  }

  /**
   * 获取热门股票
   */
  async getPopularStocks(): Promise<StockQueryResult> {
    try {
      const url = `${this.baseUrl}/`;

      const response = await axios.get<string>(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // 简化的热门股票解析
      const stocks: StockInfo[] = [];

      return {
        success: stocks.length > 0,
        data: stocks,
        source: DataSource.IPO3
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : '获取热门股票失败'],
        source: DataSource.IPO3
      };
    }
  }

  /**
   * 其他方法的占位符
   */
  async getIncomeStatementList(stockCode: string, dateType?: string) {
    return { success: false, error: '功能待实现' };
  }

  async getBalanceSheetList(stockCode: string, dateType?: string) {
    return { success: false, error: '功能待实现' };
  }

  async getCashFlowStatementList(stockCode: string, dateType?: string) {
    return { success: false, error: '功能待实现' };
  }

  async getFinancialAnalysisList(stockCode: string, dateType?: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockFundList(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockTradeList(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockNoticeList(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockEventList(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockSurvey(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockBrokerList(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockPledgeData(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockPledgeLoanRecords(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockFundedList(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }

  async getStockReportList(stockCode: string) {
    return { success: false, error: '功能待实现' };
  }
}