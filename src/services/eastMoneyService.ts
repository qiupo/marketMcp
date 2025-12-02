/**
 * 东方财富网数据服务
 * 专门处理东方财富网的股票数据
 */

import axios from 'axios';
import { StockInfo, StockHistoryData, CompanyBasicInfo, MarketOverview, StockQueryResult, DataSource } from '../types';

/**
 * 东方财富网服务类
 */
export class EastMoneyService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(baseUrl: string = 'https://push2.eastmoney.com/api/qt/ulist.np/get', timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * 根据股票代码获取东方财富格式
   * 东方财富格式：0.000001,1.600519 (0=深市，1=沪市)
   */
  private getEastMoneyCode(code: string): string {
    const cleanCode = code.replace(/^(sh|sz|bj)/i, '');

    if (code.startsWith('6') || code.startsWith('9')) {
      return `1.${cleanCode}`; // 沪市
    } else if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3')) {
      return `0.${cleanCode}`; // 深市
    } else if (code.startsWith('4') || code.startsWith('8')) {
      return `0.${cleanCode}`; // 北市，暂时用深市格式
    } else {
      return `1.${cleanCode}`; // 默认沪市
    }
  }

  /**
   * 检查服务状态
   */
  async checkService(): Promise<{ status: 'ok' | 'error'; message?: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}?fltt=2&fields=f2&secids=1.000001`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://quote.eastmoney.com'
        },
        timeout: this.timeout
      });

      return {
        status: response.data.rc === 0 ? 'ok' : 'error',
        message: response.data.rc === 0 ? '服务正常' : '数据异常'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : '连接失败'
      };
    }
  }

  /**
   * 获取股票实时行情数据
   */
  async getStockRealtime(codes: string[]): Promise<StockQueryResult> {
    try {
      const eastmoneyCodes = codes.map(code => this.getEastMoneyCode(code)).join(',');
      const url = `${this.baseUrl}?fltt=2&fields=f2,f3,f4,f12,f14&secids=${eastmoneyCodes}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://quote.eastmoney.com'
        },
        timeout: this.timeout
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.data.rc !== 0 || !response.data?.diff || response.data.diff.length === 0) {
        return {
          success: false,
          data: [],
          errors: ['未找到股票数据'],
          source: DataSource.EASTMONEY
        };
      }

      const stocks: StockInfo[] = response.data.diff.map((stock: any) => {
        const price = parseFloat(stock.f2) || 0;
        const changePercent = parseFloat(stock.f3) || 0;
        const changeAmount = parseFloat(stock.f4) || 0;

        return {
          code: stock.f12 || '',
          name: stock.f14 || '',
          price: price,
          change: changeAmount,
          changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
          volume: this.formatVolume(stock.f5 || 0),
          amount: this.formatAmount(stock.f6 || 0),
          market: this.getMarketFromCode(stock.f12 || '000001'),
          timestamp: Date.now()
        };
      });

      return {
        success: stocks.length > 0,
        data: stocks,
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
   * 获取股票历史数据
   * 注意：东方财富网的历史数据接口有限，建议使用AKTools获取完整历史数据
   */
  async getStockHistory(
    codes: string[],
    period: string = 'daily',
    startDate?: string,
    endDate?: string,
    adjust: string = ''
  ): Promise<StockQueryResult> {
    try {
      // 东方财富网的历史数据接口相对有限，这里返回一个基础实现
      // 实际项目中建议使用AKTools获取历史数据
      const eastmoneyCodes = codes.map(code => this.getEastMoneyCode(code)).join(',');
      const url = `${this.baseUrl}?fields=f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f15,f16,f17,f18,f20,f21,f22,f23&secids=${eastmoneyCodes}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://quote.eastmoney.com'
        },
        timeout: this.timeout
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.data.rc !== 0 || !response.data?.diff || response.data.diff.length === 0) {
        return {
          success: false,
          data: [],
          errors: ['未找到股票数据'],
          source: DataSource.EASTMONEY
        };
      }

      // 东方财富网返回的数据格式相对简单，需要适配
      const stocks: StockInfo[] = response.data.diff.map((stock: any) => {
        return {
          code: stock.f12 || '',
          name: stock.f14 || '',
          price: parseFloat(stock.f2) || 0,
          change: parseFloat(stock.f4) || 0,
          changePercent: `${parseFloat(stock.f3) || 0}%`,
          open: parseFloat(stock.f17) || 0,
          high: parseFloat(stock.f18) || 0,
          low: parseFloat(stock.f19) || 0,
          volume: this.formatVolume(stock.f5 || 0),
          amount: this.formatAmount(stock.f6 || 0),
          market: this.getMarketFromCode(stock.f12 || '000001'),
          timestamp: Date.now()
        };
      });

      return {
        success: stocks.length > 0,
        data: stocks,
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
   * 获取股票基本信息
   */
  async getStockBasicInfo(codes: string[]): Promise<StockQueryResult> {
    try {
      const eastmoneyCodes = codes.map(code => this.getEastMoneyCode(code)).join(',');
      const url = `${this.baseUrl}?fields=f2,f12,f14,f20,f21,f22,f23&secids=${eastmoneyCodes}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://quote.eastmoney.com'
        },
        timeout: this.timeout
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.data.rc !== 0 || !response.data?.diff || response.data.diff.length === 0) {
        return {
          success: false,
          data: [],
          errors: ['未找到股票数据'],
          source: DataSource.EASTMONEY
        };
      }

      const stocks: StockInfo[] = response.data.diff.map((stock: any) => {
        return {
          code: stock.f12 || '',
          name: stock.f14 || '',
          price: parseFloat(stock.f2) || 0,
          change: 0,
          changePercent: '0.00%',
          industry: stock.f23 || '',
          totalMarketValue: stock.f20 ? this.formatAmount(parseFloat(stock.f20)) : '',
          circulatingMarketValue: stock.f21 ? this.formatAmount(parseFloat(stock.f21)) : '',
          peRatio: stock.f22 ? `${stock.f22}` : '',
          pbRatio: stock.f23 ? `${stock.f23}` : '',
          volume: '0',
          amount: '0',
          market: this.getMarketFromCode(stock.f12 || '000001'),
          timestamp: Date.now()
        };
      });

      return {
        success: stocks.length > 0,
        data: stocks,
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
   * 获取市场概览
   */
  async getMarketOverview(options: { market?: string; sector?: string } = {}): Promise<{
    success: boolean;
    data?: MarketOverview;
    error?: string;
    source: DataSource;
  }> {
    try {
      // 东方财富网的市场概览接口有限，这里返回基础信息
      // 实际市场概览建议使用AKTools
      const sectorFilter = options.sector ? `&${encodeURIComponent(options.sector)}` : '';
      const url = `${this.baseUrl}?fltt=2&fields=f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f14&pageSize=100${sectorFilter}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://quote.eastmoney.com'
        },
        timeout: this.timeout
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.data.rc !== 0 || !response.data?.diff) {
        return {
          success: false,
          error: '获取市场概览失败',
          source: DataSource.EASTMONEY
        };
      }

      const stocks = response.data.diff || [];
      const sectorStats: Record<string, { count: number; totalAmount: number; avgChange: number }> = {};
      let totalAmount = 0;

      stocks.forEach((stock: any) => {
        const sector = stock.industry || '其他';
        const amount = parseFloat(stock.f6) || 0;
        const changePercent = parseFloat(stock.f3) || 0;

        if (!sectorStats[sector]) {
          sectorStats[sector] = { count: 0, totalAmount: 0, avgChange: 0 };
        }

        sectorStats[sector].count++;
        sectorStats[sector].totalAmount += amount;
        sectorStats[sector].avgChange += changePercent;
        totalAmount += amount;
      });

      // 计算平均涨跌幅
      Object.values(sectorStats).forEach(stats => {
        if (stats.count > 0) {
          stats.avgChange = stats.avgChange / stats.count;
        }
      });

      return {
        success: true,
        data: {
          totalCount: stocks.length,
          totalAmount,
          sectorStats,
          updateTime: new Date().toLocaleString('zh-CN')
        },
        source: DataSource.EASTMONEY
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        source: DataSource.EASTMONEY
      };
    }
  }

  /**
   * 根据股票代码判断市场
   */
  private getMarketFromCode(code: string): string {
    const cleanCode = code.replace(/^(sh|sz|bj)/i, '');

    if (code.startsWith('6') || code.startsWith('9')) {
      return 'sh'; // 上海证券交易所
    } else if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3')) {
      return 'sz'; // 深圳证券交易所
    } else if (code.startsWith('4') || code.startsWith('8')) {
      return 'bj'; // 北京证券交易所
    } else {
      return 'sh'; // 默认上海证券交易所
    }
  }

  /**
   * 格式化成交量
   */
  private formatVolume(volume: number): string {
    if (volume >= 100000000) {
      return (volume / 100000000).toFixed(2) + '亿手';
    } else if (volume >= 10000) {
      return (volume / 10000).toFixed(2) + '万手';
    } else {
      return volume.toString();
    }
  }

  /**
   * 格式化成交额
   */
  private formatAmount(amount: number): string {
    if (amount >= 100000000) {
      return (amount / 100000000).toFixed(2) + '亿元';
    } else if (amount >= 10000) {
      return (amount / 10000).toFixed(2) + '万元';
    } else {
      return amount.toFixed(2) + '元';
    }
  }
}