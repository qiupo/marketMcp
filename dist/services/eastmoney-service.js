import axios from 'axios';
import * as cheerio from 'cheerio';
import { DataSource } from '../types/stock.js';
/**
 * 东方财富网 数据服务类
 * 替换IPO3.com，提供完整的股票数据功能
 */
export class EastMoneyService {
    baseUrl = 'https://quote.eastmoney.com';
    dataBaseUrl = 'https://datacenter.eastmoney.com';
    defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://quote.eastmoney.com/'
    };
    /**
     * 通用HTTP请求方法
     */
    async request(url, timeout = 15000) {
        try {
            const response = await axios.get(url, {
                timeout,
                headers: this.defaultHeaders
            });
            return response.data;
        }
        catch (error) {
            console.error(`请求失败: ${url}`, error);
            throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
    /**
     * 解析HTML文档
     */
    parseHTML(html) {
        const $ = cheerio.load(html);
        return $;
    }
    /**
     * 清理文本内容
     */
    cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }
    /**
     * 获取股票基础信息（基于东方财富API）
     * 通过AKShare风格的接口调用东财数据
     */
    async getStockInfo(codes) {
        try {
            const stocks = [];
            const errors = [];
            for (const code of codes) {
                try {
                    const standardCode = this.standardizeStockCode(code);
                    const stockData = await this.getSingleStockInfo(standardCode);
                    if (stockData) {
                        stocks.push(stockData);
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
                source: DataSource.IPO3 // 保持兼容性
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '未知错误'],
                source: DataSource.IPO3 // 保持兼容性
            };
        }
    }
    /**
     * 标准化股票代码
     */
    standardizeStockCode(code) {
        // 移除前缀，只保留6位数字
        const cleanCode = code.replace(/^(sh|sz|bj)/i, '');
        // 如果不是6位，尝试补充
        if (cleanCode.length === 4) {
            return cleanCode.padStart(6, '0');
        }
        return cleanCode;
    }
    /**
     * 获取单个股票的详细信息
     */
    async getSingleStockInfo(code) {
        try {
            // 东方财富API接口 - 获取实时行情
            const api_url = `${this.dataBaseUrl}/api/data/v1/get?reportName=RPT_DAILYKLINE_NEW&columns=ALL&filter=(SECURITY_CODE%3D%3D${code})&pageNumber=1&pageSize=1&source=WEB`;
            const response = await this.request(api_url);
            if (!response.success || !response.result || !response.result.data || response.result.data.length === 0) {
                throw new Error('未找到股票数据');
            }
            const stockData = response.result.data[0];
            // 获取更详细的实时行情数据
            const quoteData = await this.getRealtimeQuote(code);
            return {
                code: code,
                name: stockData.SECURITY_NAME_ABBR || '',
                price: parseFloat(quoteData.currentPrice || stockData.CLOSE_PRICE || '0'),
                change: parseFloat(quoteData.changeValue || stockData.CHANGE_VALUE || '0'),
                changePercent: quoteData.changePercent || stockData.CHANGE_RATE || '0%',
                industry: stockData.TRADE || '',
                open: parseFloat(quoteData.openPrice || stockData.OPEN_PRICE || '0'),
                high: parseFloat(quoteData.highPrice || stockData.HIGH_PRICE || '0'),
                low: parseFloat(quoteData.lowPrice || stockData.LOW_PRICE || '0'),
                prevClose: parseFloat(quoteData.prevClosePrice || stockData.PRE_CLOSE_PRICE || '0'),
                volume: parseInt(quoteData.volume || stockData.TURNOVER_VOLUME || '0'),
                amount: parseFloat(quoteData.amount || stockData.TURNOVER_VALUE || '0'),
                peRatio: quoteData.peRatio || stockData.PE_RATIO || '',
                pbRatio: quoteData.pbRatio || stockData.PB_RATIO || '',
                totalMarketValue: quoteData.totalMarketValue || stockData.TOTAL_MARKET_VALUE || '',
                circulatingMarketValue: quoteData.circulatingMarketValue || stockData.CIRCULATING_MARKET_VALUE || '',
                turnoverRate: quoteData.turnoverRate || stockData.TURNOVER_RATE || '',
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
     * 获取实时行情数据
     */
    async getRealtimeQuote(code) {
        try {
            // 使用东方财富的实时行情接口
            const marketCode = this.getMarketCode(code);
            const url = `${this.baseUrl}/${marketCode}${code}.html`;
            const html = await this.request(url);
            const $ = this.parseHTML(html);
            // 从HTML中解析实时数据
            const priceElements = $('.price-container .price');
            const changeElements = $('.price-container .change');
            const infoElements = $('.stock-info .item');
            return {
                currentPrice: priceElements.first().text().trim() || '0',
                changeValue: changeElements.find('.change-value').text().trim() || '0',
                changePercent: changeElements.find('.change-percent').text().trim() || '0%',
                openPrice: $(`[data-field="open"]`).text().trim() || '0',
                highPrice: $(`[data-field="high"]`).text().trim() || '0',
                lowPrice: $(`[data-field="low"]`).text().trim() || '0',
                prevClosePrice: $(`[data-field="preClose"]`).text().trim() || '0',
                volume: $(`[data-field="volume"]`).text().trim() || '0',
                amount: $(`[data-field="amount"]`).text().trim() || '0'
            };
        }
        catch (error) {
            console.error(`获取实时行情失败:`, error);
            return {};
        }
    }
    /**
     * 根据股票代码获取市场代码
     */
    getMarketCode(code) {
        if (code.startsWith('6') || code.startsWith('9')) {
            return 'sh';
        }
        else if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3')) {
            return 'sz';
        }
        else if (code.startsWith('4') || code.startsWith('8')) {
            return 'bj';
        }
        return 'sh';
    }
    /**
     * 根据股票代码判断市场
     */
    getMarketFromCode(code) {
        return this.getMarketCode(code);
    }
    /**
     * 搜索股票
     */
    async searchStock(keyword) {
        try {
            // 东方财富搜索接口
            const searchUrl = `${this.dataBaseUrl}/api/data/v1/get?reportName=RPT_SEARCH_BUSINESS_NEW&columns=ALL&filter=(KEYWORD%3D%3D%27${encodeURIComponent(keyword)}%27)&pageNumber=1&pageSize=20&source=WEB`;
            const response = await this.request(searchUrl);
            if (!response.success || !response.result || !response.result.data) {
                return {
                    success: false,
                    data: [],
                    errors: ['搜索无结果'],
                    source: DataSource.IPO3
                };
            }
            const stocks = response.result.data.map((item) => ({
                code: item.SECURITY_CODE || '',
                name: item.SECURITY_NAME_ABBR || '',
                price: parseFloat(item.CLOSE_PRICE || 0),
                change: parseFloat(item.CHANGE_VALUE || 0),
                changePercent: item.CHANGE_RATE || '0%',
                industry: item.TRADE || '',
                market: this.getMarketFromCode(item.SECURITY_CODE || ''),
                timestamp: Date.now()
            }));
            return {
                success: stocks.length > 0,
                data: stocks,
                source: DataSource.IPO3
            };
        }
        catch (error) {
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
    async getPopularStocks() {
        try {
            // 获取东方财富热门股票
            const popularUrl = `${this.dataBaseUrl}/api/data/v1/get?reportName=RPT_DAILYKLINE_NEW&columns=ALL&filter=(MARKET%3D%3D%27sh%27)&pageNumber=1&pageSize=50&sortColumns=CHANGE_RATE&sortTypes=-1&source=WEB`;
            const response = await this.request(popularUrl);
            if (!response.success || !response.result || !response.result.data) {
                return {
                    success: false,
                    data: [],
                    errors: ['获取热门股票失败'],
                    source: DataSource.IPO3
                };
            }
            const stocks = response.result.data.slice(0, 10).map((item) => ({
                code: item.SECURITY_CODE || '',
                name: item.SECURITY_NAME_ABBR || '',
                price: parseFloat(item.CLOSE_PRICE || 0),
                change: parseFloat(item.CHANGE_VALUE || 0),
                changePercent: item.CHANGE_RATE || '0%',
                industry: item.TRADE || '',
                volume: parseInt(item.TURNOVER_VOLUME || 0),
                amount: parseFloat(item.TURNOVER_VALUE || 0),
                market: this.getMarketFromCode(item.SECURITY_CODE || ''),
                timestamp: Date.now()
            }));
            return {
                success: stocks.length > 0,
                data: stocks,
                source: DataSource.IPO3
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '获取热门股票失败'],
                source: DataSource.IPO3
            };
        }
    }
    /**
     * 获取公司详细信息
     */
    async getCompanyInfo(stockCode, englishKey = false) {
        try {
            const code = this.standardizeStockCode(stockCode);
            const marketCode = this.getMarketCode(code);
            // 东方财富公司详情页面
            const url = `${this.baseUrl}/${marketCode}${code}.html`;
            const html = await this.request(url);
            const $ = this.parseHTML(html);
            // 提取基本信息
            const companyInfo = {
                name: $('.company-name').text().trim() || '',
                code: code,
                price: $('.price-current').text().trim() || '0',
                change: $('.price-change').text().trim() || '0',
                changePercent: $('.price-percent').text().trim() || '0%',
                industry: $('.industry-info').text().trim() || '',
                open: $('.info-item[data-field="open"]').text().trim() || '0',
                high: $('.info-item[data-field="high"]').text().trim() || '0',
                low: $('.info-item[data-field="low"]').text().trim() || '0',
                avgPrice: $('.info-item[data-field="avgPrice"]').text().trim() || '0',
                peRatio: $('.info-item[data-field="pe"]').text().trim() || '',
                volume: $('.info-item[data-field="volume"]').text().trim() || '0',
                totalMarketValue: $('.info-item[data-field="totalMarketValue"]').text().trim() || '',
                prevClose: $('.info-item[data-field="preClose"]').text().trim() || '0',
                turnoverRate: $('.info-item[data-field="turnoverRate"]').text().trim() || '',
                pbRatio: $('.info-item[data-field="pb"]').text().trim() || '',
                amount: $('.info-item[data-field="amount"]').text().trim() || '0',
                circulatingMarketValue: $('.info-item[data-field="circulatingMarketValue"]').text().trim() || '',
                companyName: '',
                companyWebsite: '',
                companyPhone: '',
                secretary: '',
                secretaryEmail: '',
                secretaryPhone: '',
                legalPerson: '',
                sponsor: '',
                tradingMethod: '',
                listingDate: '',
                establishmentDate: '',
                marketMakingDate: '',
                registeredCapital: '',
                region: '',
                officeAddress: '',
                companyProfile: '',
                mainBusiness: '',
                businessScope: '',
                financingStatus: '',
                actualRaisedNetAmount: '',
                financingSuccessRate: '',
                financingRanking: '',
                equityStructure: [],
                seniorManagement: [],
                news: []
            };
            return companyInfo;
        }
        catch (error) {
            console.error(`获取公司${stockCode}信息失败:`, error);
            throw new Error(`获取公司信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
    /**
     * 获取财务报表数据
     */
    async getIncomeStatementList(stockCode, dateType = '年报', englishKey = false) {
        try {
            const code = this.standardizeStockCode(stockCode);
            // 东方财富财务报表接口
            const reportType = this.getDateTypeCode(dateType);
            const url = `${this.dataBaseUrl}/api/data/v1/get?reportName=RPT_FINA_MAIN_INCOME_NEW&columns=ALL&filter=(SECURITY_CODE%3D%3D%27${code}%27)(REPORT_TYPE%3D%3D%27${reportType}%27)&pageNumber=1&pageSize=20&source=WEB`;
            const response = await this.request(url);
            if (!response.success || !response.result || !response.result.data) {
                return [];
            }
            return response.result.data.map((item) => ({
                date: item.REPORT_DATE || '',
                revenue: parseFloat(item.TOTAL_OPERATE_INCOME || 0),
                netProfit: parseFloat(item.PARENT_NETPROFIT || 0),
                grossProfit: parseFloat(item.GROSSPROFIT || 0),
                operatingProfit: parseFloat(item.OPERATEPROFIT || 0),
                totalProfit: parseFloat(item.TOTALPROFIT || 0),
                eps: parseFloat(item.BASIC_DILUTE_EPS || 0)
            }));
        }
        catch (error) {
            console.error(`获取股票${stockCode}利润表失败:`, error);
            return [];
        }
    }
    /**
     * 获取资产负债表数据
     */
    async getBalanceSheetList(stockCode, dateType = '年报', englishKey = false) {
        try {
            const code = this.standardizeStockCode(stockCode);
            const reportType = this.getDateTypeCode(dateType);
            const url = `${this.dataBaseUrl}/api/data/v1/get?reportName=RPT_FINA_MAIN_BALANCE_SHEET_NEW&columns=ALL&filter=(SECURITY_CODE%3D%3D%27${code}%27)(REPORT_TYPE%3D%3D%27${reportType}%27)&pageNumber=1&pageSize=20&source=WEB`;
            const response = await this.request(url);
            if (!response.success || !response.result || !response.result.data) {
                return [];
            }
            return response.result.data.map((item) => ({
                date: item.REPORT_DATE || '',
                totalAssets: parseFloat(item.TOTAL_ASSETS || 0),
                totalLiabilities: parseFloat(item.TOTAL_LIABILITIES || 0),
                totalEquity: parseFloat(item.TOTAL_EQUITY || 0),
                currentAssets: parseFloat(item.CURRENT_ASSETS || 0),
                currentLiabilities: parseFloat(item.CURRENT_LIABILITIES || 0),
                fixedAssets: parseFloat(item.FIXED_ASSETS || 0),
                inventory: parseFloat(item.INVENTORY || 0)
            }));
        }
        catch (error) {
            console.error(`获取股票${stockCode}资产负债表失败:`, error);
            return [];
        }
    }
    /**
     * 获取现金流量表数据
     */
    async getCashFlowStatementList(stockCode, dateType = '年报', englishKey = false) {
        try {
            const code = this.standardizeStockCode(stockCode);
            const reportType = this.getDateTypeCode(dateType);
            const url = `${this.dataBaseUrl}/api/data/v1/get?reportName=RPT_FINA_MAIN_CASHFLOW_NEW&columns=ALL&filter=(SECURITY_CODE%3D%3D%27${code}%27)(REPORT_TYPE%3D%3D%27${reportType}%27)&pageNumber=1&pageSize=20&source=WEB`;
            const response = await this.request(url);
            if (!response.success || !response.result || !response.result.data) {
                return [];
            }
            return response.result.data.map((item) => ({
                date: item.REPORT_DATE || '',
                operatingCashFlow: parseFloat(item.NETCASH_OPERATE || 0),
                investingCashFlow: parseFloat(item.NETCASH_INVEST || 0),
                financingCashFlow: parseFloat(item.NETCASH_FINANCE || 0),
                netCashFlow: parseFloat(item.NETCASH_EQUALEND || 0),
                cashBeginning: parseFloat(item.CASHBEGIN_BALANCE || 0),
                cashEnding: parseFloat(item.CASHEND_BALANCE || 0)
            }));
        }
        catch (error) {
            console.error(`获取股票${stockCode}现金流量表失败:`, error);
            return [];
        }
    }
    /**
     * 获取财务分析数据
     */
    async getFinancialAnalysisList(stockCode, dateType = '年报', englishKey = false) {
        try {
            const code = this.standardizeStockCode(stockCode);
            const reportType = this.getDateTypeCode(dateType);
            const url = `${this.dataBaseUrl}/api/data/v1/get?reportName=RPT_FINA_MAIN_INDICATOR&columns=ALL&filter=(SECURITY_CODE%3D%3D%27${code}%27)(REPORT_TYPE%3D%3D%27${reportType}%27)&pageNumber=1&pageSize=20&source=WEB`;
            const response = await this.request(url);
            if (!response.success || !response.result || !response.result.data) {
                return [];
            }
            return response.result.data.map((item) => ({
                date: item.REPORT_DATE || '',
                roe: parseFloat(item.WEBEDROE || 0),
                roa: parseFloat(item.ROA || 0),
                debtRatio: parseFloat(item.DEBT_ASSET_RATIO || 0),
                currentRatio: parseFloat(item.CURRENT_RATIO || 0),
                quickRatio: parseFloat(item.QUICK_RATIO || 0),
                grossMargin: parseFloat(item.GROSSPROFIT_MARGIN || 0),
                netMargin: parseFloat(item.NETPROFIT_MARGIN || 0),
                assetTurnover: parseFloat(item.ASSET_TURNOVER || 0)
            }));
        }
        catch (error) {
            console.error(`获取股票${stockCode}财务分析失败:`, error);
            return [];
        }
    }
    /**
     * 获取公告列表
     */
    async getStockNoticeList(stockCode, page = 1) {
        try {
            const code = this.standardizeStockCode(stockCode);
            const url = `${this.dataBaseUrl}/api/data/v1/get?reportName=RPT_F10_EQUITYNOTICE&columns=NOTICE_ID%2CNOTICE_TITLE%2CNOTICE_DATE%2CNOTICE_TYPE&filter=(SECURITY_CODE%3D%3D%27${code}%27)&pageNumber=${page}&pageSize=20&source=WEB`;
            const response = await this.request(url);
            if (!response.success || !response.result) {
                return {
                    success: false,
                    data: [],
                    errors: ['获取公告失败'],
                    source: DataSource.IPO3
                };
            }
            const notices = response.result.data.map((item) => ({
                id: item.NOTICE_ID || '',
                title: item.NOTICE_TITLE || '',
                date: item.NOTICE_DATE || '',
                type: item.NOTICE_TYPE || '',
                detailUrl: `${this.baseUrl}/${code}/news/${item.NOTICE_ID}.html`
            }));
            return {
                success: true,
                data: notices,
                pagination: {
                    total: response.result.total || 0,
                    currentPage: page,
                    nextPage: response.result.hasMore ? page + 1 : undefined,
                    hasNextPage: response.result.hasMore || false
                },
                source: DataSource.IPO3
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '获取公告失败'],
                source: DataSource.IPO3
            };
        }
    }
    /**
     * 获取日期类型代码
     */
    getDateTypeCode(dateType) {
        const dateTypeMap = {
            '年报': '1',
            '中报': '2',
            '一季报': '3',
            '三季报': '4'
        };
        return dateTypeMap[dateType] || '1';
    }
    /**
     * 占位方法，保持接口兼容性
     */
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
