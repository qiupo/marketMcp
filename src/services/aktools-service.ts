import axios from 'axios';
import { StockInfo, StockQueryResult, DataSource } from '../types/stock.js';

/**
 * AKTools HTTP API 客户端
 * 基于 aktools 项目实现HTTP API调用
 */
export class AKToolsService {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(baseUrl: string = 'http://127.0.0.1:8080/api/public/') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'MarketMCP-Client/1.0.0'
    };
  }

  /**
   * 获取股票实时行情数据
   */
  async getStockRealtime(codes: string[]): Promise<StockQueryResult> {
    try {
      const symbol = codes.join(',');
      const response = await axios.get(`${this.baseUrl}stock_zh_a_spot_em`, {
        params: { symbol },
        headers: this.headers,
        timeout: 10000
      });

      if (!response.data || !Array.isArray(response.data)) {
        return {
          success: false,
          data: [],
          errors: ['AKTools API返回数据格式错误'],
          source: DataSource.AKTOOLS
        };
      }

      const stocks: StockInfo[] = response.data.map((stock: any) => ({
        code: stock['代码'] || '',
        name: stock['名称'] || '',
        price: parseFloat(stock['最新价']) || 0,
        change: parseFloat(stock['涨跌额']) || 0,
        changePercent: stock['涨跌幅'] ? `${stock['涨跌幅']}%` : '0.00%',
        industry: '',
        volume: this.formatVolume(stock['成交量']) || '0',
        amount: this.formatAmount(stock['成交额']) || '0',
        market: this.getMarketFromCode(stock['代码'] || ''),
        timestamp: Date.now()
      }));

      return {
        success: stocks.length > 0,
        data: stocks,
        source: DataSource.AKTOOLS
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'AKTools API调用失败'],
        source: DataSource.AKTOOLS
      };
    }
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
    try {
      const results: StockInfo[] = [];
      const allErrors: string[] = [];

      for (const code of codes) {
        try {
          const response = await axios.get(`${this.baseUrl}stock_zh_a_hist`, {
            params: {
              symbol: code,
              period,
              start_date: startDate,
              end_date: endDate,
              adjust
            },
            headers: this.headers,
            timeout: 15000
          });

          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            const latestData = response.data[response.data.length - 1];

            const stockInfo: StockInfo = {
              code: code,
              name: latestData['股票代码'] || code,
              price: parseFloat(latestData['收盘']) || 0,
              change: parseFloat(latestData['涨跌额']) || 0,
              changePercent: latestData['涨跌幅'] ? `${latestData['涨跌幅']}%` : '0.00%',
              industry: '',
              volume: this.formatVolume(latestData['成交量']) || '0',
              amount: this.formatAmount(latestData['成交额']) || '0',
              market: this.getMarketFromCode(code),
              timestamp: Date.now()
            };

            results.push(stockInfo);
          }
        } catch (codeError) {
          allErrors.push(`${code}: ${codeError instanceof Error ? codeError.message : '查询失败'}`);
        }
      }

      return {
        success: results.length > 0,
        data: results,
        errors: allErrors.length > 0 ? allErrors : undefined,
        source: DataSource.AKTOOLS
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : '历史数据查询失败'],
        source: DataSource.AKTOOLS
      };
    }
  }

  /**
   * 获取个股基本信息
   */
  async getStockBasicInfo(codes: string[]): Promise<StockQueryResult> {
    try {
      const results: StockInfo[] = [];
      const allErrors: string[] = [];

      for (const code of codes) {
        try {
          const response = await axios.get(`${this.baseUrl}stock_individual_info_em`, {
            params: { symbol: code },
            headers: this.headers,
            timeout: 10000
          });

          if (response.data && Array.isArray(response.data)) {
            const infoData = response.data;
            let price = 0;
            let name = '';

            // 解析基本信息
            for (const item of infoData) {
              if (item['item'] === '最新') {
                price = parseFloat(item['value']) || 0;
              }
              if (item['item'] === '股票简称') {
                name = item['value'] || '';
              }
            }

            const stockInfo: StockInfo = {
              code: code,
              name: name,
              price: price,
              change: 0,
              changePercent: '0.00%',
              industry: '',
              volume: '0',
              amount: '0',
              market: this.getMarketFromCode(code),
              timestamp: Date.now()
            };

            results.push(stockInfo);
          }
        } catch (codeError) {
          allErrors.push(`${code}: ${codeError instanceof Error ? codeError.message : '基本信息查询失败'}`);
        }
      }

      return {
        success: results.length > 0,
        data: results,
        errors: allErrors.length > 0 ? allErrors : undefined,
        source: DataSource.AKTOOLS
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : '基本信息查询失败'],
        source: DataSource.AKTOOLS
      };
    }
  }

  /**
   * 获取行业板块数据
   */
  async getSectorData(sector?: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}stock_zh_a_spot_em`, {
        headers: this.headers,
        timeout: 15000
      });

      if (!response.data || !Array.isArray(response.data)) {
        return {
          success: false,
          data: [],
          errors: ['板块数据获取失败'],
          source: DataSource.AKTOOLS
        };
      }

      // 按行业分组统计
      const sectorStats: Record<string, any> = {};
      let totalCount = 0;
      let totalAmount = 0;

      for (const stock of response.data) {
        totalCount++;
        totalAmount += parseFloat(stock['成交额']) || 0;

        // 这里可以添加更详细的行业分类逻辑
        const industry = stock['行业'] || '其他';
        if (!sectorStats[industry]) {
          sectorStats[industry] = {
            count: 0,
            totalAmount: 0,
            avgChange: 0,
            stocks: []
          };
        }

        sectorStats[industry].count++;
        sectorStats[industry].totalAmount += parseFloat(stock['成交额']) || 0;
        sectorStats[industry].stocks.push({
          code: stock['代码'],
          name: stock['名称'],
          price: stock['最新价'],
          change: stock['涨跌额'],
          changePercent: stock['涨跌幅']
        });
      }

      // 计算平均涨跌幅
      for (const sector of Object.keys(sectorStats)) {
        const stocks = sectorStats[sector].stocks;
        const avgChange = stocks.reduce((sum: number, stock: any) => sum + parseFloat(stock['changePercent'] || 0), 0) / stocks.length;
        sectorStats[sector].avgChange = avgChange;
      }

      return {
        success: true,
        data: {
          totalCount,
          totalAmount,
          sectorStats,
          updateTime: new Date().toLocaleString('zh-CN')
        },
        source: DataSource.AKTOOLS
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error instanceof Error ? error.message : '板块数据获取失败'],
        source: DataSource.AKTOOLS
      };
    }
  }

  /**
   * 检查AKTools服务是否可用
   */
  async checkService(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}stock_zh_a_spot_em`, {
        headers: this.headers,
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
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
  private formatVolume(volume: any): string {
    const num = parseFloat(volume) || 0;
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿手';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万手';
    } else {
      return num.toString();
    }
  }

  /**
   * 格式化成交额
   */
  private formatAmount(amount: any): string {
    const num = parseFloat(amount) || 0;
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿元';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万元';
    } else {
      return num.toFixed(2) + '元';
    }
  }
}