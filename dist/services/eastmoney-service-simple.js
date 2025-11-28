import { DataSource } from '../types/stock.js';
/**
 * 东方财富网数据服务类
 * 提供完整的股票数据查询功能
 */
export class EastMoneyServiceSimple {
    baseUrl = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
    /**
     * 根据股票代码获取东方财富代码格式
     * 东方财富的格式：0.000001,1.600519 (0=深市，1=沪市)
     */
    getEastMoneyCode(code) {
        const cleanCode = code.replace(/^(sh|sz|bj)/i, '');
        if (code.startsWith('6') || code.startsWith('9')) {
            return `1.${cleanCode}`; // 沪市
        }
        else if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3')) {
            return `0.${cleanCode}`; // 深市
        }
        else if (code.startsWith('4') || code.startsWith('8')) {
            return `0.${cleanCode}`; // 北市，暂时用深市格式
        }
        else {
            return `1.${cleanCode}`; // 默认沪市
        }
    }
    /**
     * 获取股票信息
     */
    async getStockInfo(codes) {
        try {
            const eastmoneyCodes = codes.map(code => this.getEastMoneyCode(code)).join(',');
            const url = `${this.baseUrl}?fltt=2&fields=f2,f3,f4,f12,f14&secids=${eastmoneyCodes}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://quote.eastmoney.com'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.rc !== 0 || !data.data || !data.data.diff || data.data.diff.length === 0) {
                return {
                    success: false,
                    data: [],
                    errors: ['未找到股票数据'],
                    source: DataSource.EASTMONEY
                };
            }
            const stocks = data.data.diff.map((stock) => {
                const price = parseFloat(stock.f2) || 0;
                const changePercent = parseFloat(stock.f3) || 0;
                const changeAmount = parseFloat(stock.f4) || 0;
                return {
                    code: stock.f12 || '',
                    name: stock.f14 || '',
                    price: price,
                    change: changeAmount,
                    changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
                    industry: '',
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
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '未知错误'],
                source: DataSource.EASTMONEY
            };
        }
    }
    /**
     * 获取单个股票信息
     */
    async getSingleStockInfo(code) {
        const result = await this.getStockInfo([code]);
        if (result.success && result.data.length > 0) {
            return result.data[0];
        }
        return null;
    }
    /**
     * 根据股票代码判断市场
     */
    getMarketFromCode(code) {
        if (code.startsWith('6') || code.startsWith('9')) {
            return 'sh'; // 上海证券交易所
        }
        else if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3')) {
            return 'sz'; // 深圳证券交易所
        }
        else if (code.startsWith('4') || code.startsWith('8')) {
            return 'bj'; // 北京证券交易所
        }
        else {
            return 'sh'; // 默认
        }
    }
}
