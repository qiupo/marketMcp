import { DataSource } from '../types/stock.js';
import { URLSearchParams } from 'url';
/**
 * 东方财富网数据服务类
 * 提供完整的股票数据查询功能
 */
export class EastMoneyServiceSimple {
    baseUrl = 'https://quote.eastmoney.com';
    dataBaseUrl = 'https://datacenter.eastmoney.com';
    /**
     * 获取股票信息
     */
    async getStockInfo(codes) {
        try {
            const stocks = [];
            const errors = [];
            for (const code of codes) {
                try {
                    const stockInfo = await this.getSingleStockInfo(code);
                    if (stockInfo) {
                        stocks.push(stockInfo);
                    }
                }
                catch (error) {
                    errors.push(`获取股票${code}信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
                }
            }
            return {
                success: stocks.length > 0,
                data: stocks,
                errors: errors.length > 0 ? errors : undefined,
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
     * 获取单个股票的东方财富网API数据
     */
    async getSingleStockInfo(code) {
        try {
            // 调用东方财富网API获取股票信息
            const url = `${this.dataBaseUrl}/api/data/v1/get`;
            const params = new URLSearchParams({
                'sortFields': '1',
                'filter': `(SECURITY_CODE="${code}")`,
                'pageNumber': '1',
                'pageSize': '1',
                'showFields': 'f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f20,f21,f23,f24,f25,f26,f22,f33,f34,f35,f36,f37,f38,f39,f40,f41,f57,f58,f124,f125,f127,f128,f115,f152',
                'source': 'WEB',
                'client': 'WEB'
            });
            const response = await fetch(`${url}?${params.toString()}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://quote.eastmoney.com'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data.result || !data.data || data.data.length === 0) {
                throw new Error('未找到股票数据');
            }
            const stock = data.data[0];
            const changeNum = parseFloat(stock.f43) || 0;
            const changePercentNum = parseFloat(stock.f170) || 0;
            return {
                code: stock.f12 || code,
                name: stock.f14 || '未知股票',
                price: parseFloat(stock.f2) || 0,
                change: changeNum,
                changePercent: changePercentNum >= 0 ? `+${changePercentNum.toFixed(2)}%` : `${changePercentNum.toFixed(2)}%`,
                industry: stock.f62 || '',
                volume: stock.f5 || '0',
                amount: stock.f6 || '0',
                market: this.getMarketFromCode(code),
                timestamp: Date.now()
            };
        }
        catch (error) {
            console.error(`获取股票${code}详细信息失败:`, error);
            return null;
        }
    }
    /**
     * 搜索股票
     */
    async searchStock(keyword) {
        try {
            // 调用东方财富网API搜索股票
            const url = `${this.dataBaseUrl}/api/data/v1/get`;
            const params = new URLSearchParams({
                'sortFields': '1',
                'filter': `(SECURITY_CODE_LIKE="%${keyword}%") OR SECURITY_NAME_ABBR_LIKE="%${keyword}%")`,
                'pageNumber': '1',
                'pageSize': '20',
                'showFields': 'f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f20,f21,f23,f24,f25,f26,f22,f33,f34,f35,f36,f37,f38,f39,f40,f41,f57,f58,f124,f125,f127,f128,f115,f152',
                'source': 'WEB',
                'client': 'WEB'
            });
            const response = await fetch(`${url}?${params.toString()}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://quote.eastmoney.com'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data.result || !data.data || data.data.length === 0) {
                return {
                    success: false,
                    data: [],
                    errors: ['未找到相关股票'],
                    source: DataSource.EASTMONEY
                };
            }
            const stocks = data.data.map((stock) => ({
                code: stock.f12 || '',
                name: stock.f14 || '',
                price: parseFloat(stock.f2) || 0,
                change: parseFloat(stock.f43) || 0,
                changePercent: stock.f170 || '',
                industry: stock.f62 || '',
                volume: stock.f5 || '0',
                amount: stock.f6 || '0',
                market: this.getMarketFromCode(stock.f12 || ''),
                timestamp: Date.now()
            }));
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
                errors: [error instanceof Error ? error.message : '搜索失败'],
                source: DataSource.EASTMONEY
            };
        }
    }
    /**
     * 获取热门股票
     */
    async getPopularStocks() {
        try {
            // 调用东方财富网API获取热门股票
            const url = `${this.dataBaseUrl}/api/data/v1/get`;
            const params = new URLSearchParams({
                'sortFields': '1,-1',
                'sortRules': '[-1]',
                'pageNumber': '1',
                'pageSize': '50',
                'showFields': 'f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f20,f21,f23,f24,f25,f26,f22,f33,f34,f35,f36,f37,f38,f39,f40,f41,f57,f58,f124,f125,f127,f128,f115,f152',
                'source': 'WEB',
                'client': 'WEB'
            });
            const response = await fetch(`${url}?${params.toString()}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://quote.eastmoney.com'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data.result || !data.data || data.data.length === 0) {
                return {
                    success: false,
                    data: [],
                    errors: ['未找到热门股票数据'],
                    source: DataSource.EASTMONEY
                };
            }
            const stocks = data.data.map((stock) => ({
                code: stock.f12 || '',
                name: stock.f14 || '',
                price: parseFloat(stock.f2) || 0,
                change: parseFloat(stock.f43) || 0,
                changePercent: stock.f170 || '',
                industry: stock.f62 || '',
                volume: stock.f5 || '0',
                amount: stock.f6 || '0',
                market: this.getMarketFromCode(stock.f12 || ''),
                timestamp: Date.now()
            }));
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
                errors: [error instanceof Error ? error.message : '获取热门股票失败'],
                source: DataSource.EASTMONEY
            };
        }
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
     * 占位方法，保持接口兼容性
     */
    async getCompanyInfo(stockCode, englishKey = false) {
        return { message: '此功能将在后续版本中实现' };
    }
    async getIncomeStatementList(stockCode, dateType = '年报', englishKey = false) {
        return [];
    }
    async getBalanceSheetList(stockCode, dateType = '年报', englishKey = false) {
        return [];
    }
    async getCashFlowStatementList(stockCode, dateType = '年报', englishKey = false) {
        return [];
    }
    async getFinancialAnalysisList(stockCode, dateType = '年报', englishKey = false) {
        return [];
    }
    async getStockNoticeList(stockCode, page = 1) {
        return { success: false, data: [], errors: ['此功能将在后续版本中实现'], source: DataSource.EASTMONEY };
    }
    async getStockFundList(stockCode, englishKey = false) {
        return [];
    }
    async getStockTradeList(stockCode, englishKey = false) {
        return [];
    }
    async getStockEventList(stockCode, englishKey = false) {
        return [];
    }
    async getStockSurvey(stockCode, englishKey = false) {
        return {};
    }
    async getStockBrokerList(stockCode, englishKey = false) {
        return [];
    }
    async getStockPledgeData(stockCode, englishKey = false) {
        return {};
    }
    async getStockReportList(stockCode, englishKey = false) {
        return [];
    }
}
