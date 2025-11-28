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
        const cleanCode = this.normalizeStockCode(code);
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
                    market: this.getMarketFromCode(stock.f12 || ''),
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
     * 搜索股票（使用热门股票接口进行简单搜索）
     */
    async searchStock(keyword) {
        try {
            // 获取一些热门股票，然后在客户端进行简单的关键词匹配
            const result = await this.getPopularStocks();
            if (!result.success) {
                return result;
            }
            const filteredStocks = result.data.filter(stock => stock.name.includes(keyword) || stock.code.includes(keyword));
            return {
                success: filteredStocks.length > 0,
                data: filteredStocks,
                errors: filteredStocks.length === 0 ? ['未找到相关股票'] : undefined,
                source: DataSource.EASTMONEY
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '搜索失败'],
                source: DataSource.EASTMONEY
            };
        }
    }
    /**
     * 获取热门股票（使用一些知名股票代码）
     */
    async getPopularStocks() {
        // 一些热门股票代码
        const popularCodes = [
            '000001', // 平安银行
            '000002', // 万科A
            '000858', // 五粮液
            '002415', // 海康威视
            '002460', // 赣锋锂业
            '600000', // 浦发银行
            '600036', // 招商银行
            '600519', // 贵州茅台
            '600644', // 乐山电力
            '600887', // 伊利股份
        ];
        return await this.getStockInfo(popularCodes);
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
    /**
     * 验证股票代码格式
     */
    validateStockCode(code) {
        const cleanCode = code.replace(/^(sh|sz|bj)/i, '');
        return /^[0-9]{6}$/.test(cleanCode);
    }
    /**
     * 标准化股票代码
     */
    normalizeStockCode(code) {
        return code.replace(/^(sh|sz|bj)/i, '');
    }
}
