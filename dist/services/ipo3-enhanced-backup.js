import axios from 'axios';
import { DataSource } from '../types/stock.js';
import { createHtmlParser } from '../utils/html-parser.js';
import { COMPANY_INFO_KEY_MAP, INCOME_STATEMENT_KEY_MAP, BALANCE_SHEET_KEY_MAP, CASH_FLOW_STATEMENT_KEY_MAP, FINANCIAL_ANALYSIS_KEY_MAP, STOCK_FUND_KEY_MAP, STOCK_TRADE_KEY_MAP, STOCK_SURVEY_KEY_MAP, STOCK_BROKER_KEY_MAP, STOCK_PLEDGE_DATA_KEY_MAP, STOCK_PLEDGE_LOAN_RECORD_KEY_MAP, STOCK_FUNDED_LIST_KEY_MAP } from '../types/ipo3-types.js';
/**
 * 增强版IPO3.com API服务
 * 基于stock_open_api项目，提供完整的股票和公司信息
 */
export class IPO3EnhancedService {
    baseUrl = 'https://www.ipo3.com';
    /**
     * 获取股票信息
     * @param codes 股票代码列表
     */
    async getStockInfo(codes) {
        try {
            const stocks = [];
            const errors = [];
            for (const code of codes) {
                try {
                    const companyInfo = await this.getCompanyDetail(code);
                    if (companyInfo) {
                        const stockInfo = this.convertToStockInfo(companyInfo);
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
                source: DataSource.IPO3
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '未知错误'],
                source: DataSource.IPO3
            };
        }
    }
    /**
     * 获取公司详细信息
     * @param stockCode 股票代码
     */
    async getCompanyDetail(stockCode) {
        try {
            const url = `${this.baseUrl}/company-show/stock_code-${stockCode}.html`;
            const response = await axios.get(url, {
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
            return this.parseCompanyHtmlEnhanced(html, stockCode);
        }
        catch (error) {
            console.error(`获取公司${stockCode}信息失败:`, error);
            return null;
        }
    }
    /**
     * 增强版HTML解析
     */
    parseCompanyHtmlEnhanced(html, stockCode) {
        try {
            const parser = createHtmlParser(html);
            // 基础数据解析 - 使用CSS选择器
            const stockName = parser.text('#stockName') || '';
            const curPrice = parser.text('.company-detail .cur-price span') || '0';
            const rangeNum = parser.text('.company-detail .range-num') || '0';
            const rangePercent = parser.text('.company-detail .range-percent') || '0%';
            if (!stockName && !curPrice) {
                throw new Error('无法解析页面数据，可能页面结构已改变');
            }
            const data = {
                '股票名称': stockName,
                '股票代码': stockCode,
                '最新价': curPrice,
                '涨跌额': rangeNum,
                '涨跌幅': rangePercent,
            };
            // 所属行业解析
            const industryText = parser.text('.industry');
            if (industryText && industryText.includes('：')) {
                const parts = industryText.split('：');
                if (parts.length === 2) {
                    data['所属行业'] = parts[1].trim();
                }
            }
            // 指数信息解析
            parser.$('.exponent .item').each((index, element) => {
                const $item = parser.$(element);
                const label = parser.$($item).find('span').text().replace(/[：:\s]/g, '');
                const value = parser.$($item).find('strong').text().trim();
                if (label && value) {
                    data[label] = value;
                }
            });
            // 公司基本信息解析
            parser.$('.company-sheet .sheet-item').each((index, element) => {
                const $item = parser.$(element);
                const label = parser.$($item).find('span').text().replace(/[：:\s]/g, '');
                const value = parser.$($item).find('strong').text().trim();
                if (label && value) {
                    data[label] = value;
                }
            });
            // 定增融资信息解析
            parser.$('.strategy-info .strategy-item').each((index, element) => {
                const $item = parser.$(element);
                const label = parser.$($item).find('.strategy-tit').text().replace(/[：:\s]/g, '');
                const value = parser.$($item).find('.strategy-status span').text().trim();
                if (label && value) {
                    data[label] = value;
                }
            });
            // 公司总计信息解析
            parser.$('.company-total .lc-title').each((index, element) => {
                const $item = parser.$(element);
                const label = parser.$($item).find('span').text();
                const content = parser.$($item).find('.lc-main').text();
                if (label && content) {
                    data[label] = content;
                }
            });
            // 股本结构解析
            parser.$('.equity-structure .lc-title').each((index, element) => {
                const $item = parser.$(element);
                const label = parser.$($item).find('span').text();
                const content = parser.$($item).find('.lc-main').text();
                if (label && content) {
                    data[label] = content;
                }
            });
            // 高管介绍解析
            const managerList = [];
            parser.$('.manager-list .manager-item').each((index, element) => {
                const $item = parser.$(element);
                const name = parser.$($item).find('.manager-name').text();
                const position = parser.$($item).find('.manager-position').text();
                const education = parser.$($item).find('.manager-education').text();
                const termStart = parser.$($item).find('.manager-term-start').text();
                const profile = parser.$($item).find('.manager-profile').text();
                if (name) {
                    managerList.push({
                        name,
                        position,
                        highestEducation: education,
                        termStartDate: termStart,
                        profile
                    });
                }
            });
            if (managerList.length > 0) {
                data['高管介绍'] = managerList;
            }
            // 新闻资讯解析
            const newsList = [];
            parser.$('.news-list .news-item').each((index, element) => {
                const $item = parser.$(element);
                const title = parser.$($item).find('.news-title').text();
                const summary = parser.$($item).find('.news-summary').text();
                const url = parser.$($item).find('a').attr('href');
                const source = parser.$($item).find('.news-source').text();
                const time = parser.$($item).find('.news-time').text();
                if (title) {
                    newsList.push({
                        title,
                        summary,
                        url: url || '',
                        source: source || '',
                        time: time || ''
                    });
                }
            });
            if (newsList.length > 0) {
                data['新闻资讯'] = newsList;
            }
            return this.mapCompanyData(data);
        }
        catch (error) {
            console.error('解析公司HTML失败:', error);
            return null;
        }
    }
    /**
     * 映射公司数据
     */
    mapCompanyData(data) {
        const mappedData = {};
        // 使用映射表转换字段
        Object.entries(COMPANY_INFO_KEY_MAP).forEach(([chineseKey, englishKey]) => {
            if (data[chineseKey] !== undefined) {
                mappedData[englishKey] = data[chineseKey];
            }
        });
        // 确保必要的字段存在
        mappedData.stock_code = mappedData.stock_code || data['股票代码'] || '';
        mappedData.stock_name = mappedData.stock_name || data['股票名称'] || '';
        mappedData.last_price = mappedData.last_price || data['最新价'] || '0';
        mappedData.change_value = mappedData.change_value || data['涨跌额'] || '0';
        mappedData.change_rate = mappedData.change_rate || data['涨跌幅'] || '0%';
        return mappedData;
    }
    /**
     * 转换为股票信息
     */
    convertToStockInfo(companyInfo) {
        const price = parseFloat(companyInfo.last_price || '0');
        const changeValue = parseFloat(companyInfo.change_value || '0');
        const changeRate = companyInfo.change_rate || '0%';
        return {
            code: companyInfo.stock_code || '',
            name: companyInfo.stock_name || '',
            price: price,
            change: changeValue,
            changePercent: changeRate,
            industry: companyInfo.industry || '',
            volume: companyInfo.volume || '',
            totalMarketValue: companyInfo.total_market_value || '',
            turnoverRate: companyInfo.turnover_rate || '',
            market: 'bj' // 默认为北交所
        };
    }
    /**
     * 搜索股票
     */
    async searchStock(keyword) {
        try {
            const url = `${this.baseUrl}/search.html?keyword=${encodeURIComponent(keyword)}`;
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const parser = createHtmlParser(response.data);
            const stocks = [];
            parser.$('.search-result .result-item').each((index, element) => {
                const $item = parser.$(element);
                const code = parser.$($item).find('.stock-code').text();
                const name = parser.$($item).find('.stock-name').text();
                const price = parser.$($item).find('.stock-price').text();
                if (code && name) {
                    stocks.push({
                        code,
                        name,
                        price: parseFloat(price) || 0,
                        change: 0,
                        changePercent: '0%',
                        industry: '',
                        volume: '',
                        totalMarketValue: '',
                        turnoverRate: '',
                        market: 'bj'
                    });
                }
            });
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
            const url = `${this.baseUrl}/`;
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const parser = createHtmlParser(response.data);
            const stocks = [];
            parser.$('.hot-stocks .stock-item').each((index, element) => {
                const $item = parser.$(element);
                const code = parser.$($item).find('.stock-code').text();
                const name = parser.$($item).find('.stock-name').text();
                const price = parser.$($item).find('.stock-price').text();
                const change = parser.$($item).find('.stock-change').text();
                if (code && name) {
                    stocks.push({
                        code,
                        name,
                        price: parseFloat(price) || 0,
                        change: parseFloat(change) || 0,
                        changePercent: change,
                        industry: '',
                        volume: '',
                        totalMarketValue: '',
                        turnoverRate: '',
                        market: 'bj'
                    });
                }
            });
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
     * 获取利润表
     */
    async getIncomeStatementList(stockCode, dateType) {
        try {
            const url = `${this.baseUrl}/income-statement-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.financial-table');
            return this.mapFinancialData(tableData, INCOME_STATEMENT_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取利润表失败' };
        }
    }
    /**
     * 获取资产负债表
     */
    async getBalanceSheetList(stockCode, dateType) {
        try {
            const url = `${this.baseUrl}/balance-sheet-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.financial-table');
            return this.mapFinancialData(tableData, BALANCE_SHEET_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取资产负债表失败' };
        }
    }
    /**
     * 获取现金流量表
     */
    async getCashFlowStatementList(stockCode, dateType) {
        try {
            const url = `${this.baseUrl}/cash-flow-statement-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.financial-table');
            return this.mapFinancialData(tableData, CASH_FLOW_STATEMENT_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取现金流量表失败' };
        }
    }
    /**
     * 获取财务分析表
     */
    async getFinancialAnalysisList(stockCode, dateType) {
        try {
            const url = `${this.baseUrl}/financial-analysis-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.financial-table');
            return this.mapFinancialData(tableData, FINANCIAL_ANALYSIS_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取财务分析表失败' };
        }
    }
    /**
     * 映射财务数据
     */
    mapFinancialData(tableData, keyMap) {
        if (!tableData || tableData.length === 0) {
            return { success: false, error: '没有找到数据' };
        }
        const mappedData = [];
        tableData.forEach(row => {
            const mappedRow = {};
            Object.entries(keyMap).forEach(([chineseKey, englishKey]) => {
                if (row[chineseKey] !== undefined) {
                    mappedRow[englishKey] = row[chineseKey];
                }
            });
            mappedData.push(mappedRow);
        });
        return { success: true, data: mappedData };
    }
    /**
     * 获取融资明细
     */
    async getStockFundList(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-fund-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.fund-table');
            return this.mapFinancialData(tableData, STOCK_FUND_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取融资明细失败' };
        }
    }
    /**
     * 获取交易明细
     */
    async getStockTradeList(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-trade-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.trade-table');
            return this.mapFinancialData(tableData, STOCK_TRADE_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取交易明细失败' };
        }
    }
    /**
     * 获取最新公告
     */
    async getStockNoticeList(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-notice-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const notices = [];
            parser.$('.notice-list .notice-item').each((index, element) => {
                const $item = parser.$(element);
                const title = parser.$($item).find('.notice-title').text();
                const downUrl = parser.$($item).find('.notice-download').attr('href');
                const time = parser.$($item).find('.notice-time').text();
                if (title) {
                    notices.push({
                        title,
                        down_url: downUrl || '',
                        time: time || ''
                    });
                }
            });
            return { success: true, data: notices };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取最新公告失败' };
        }
    }
    /**
     * 获取大事提醒
     */
    async getStockEventList(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-event-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const events = [];
            parser.$('.event-list .event-item').each((index, element) => {
                const $item = parser.$(element);
                const eventDate = parser.$($item).find('.event-date').text();
                const eventType = parser.$($item).find('.event-type').text();
                const title = parser.$($item).find('.event-title').text();
                if (title) {
                    events.push({
                        event_date: eventDate || '',
                        event_type: eventType || '',
                        title
                    });
                }
            });
            return { success: true, data: events };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取大事提醒失败' };
        }
    }
    /**
     * 获取定增计划
     */
    async getStockSurvey(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-survey/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.survey-table');
            return this.mapFinancialData(tableData, STOCK_SURVEY_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取定增计划失败' };
        }
    }
    /**
     * 获取做市商持股成本
     */
    async getStockBrokerList(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-broker-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.broker-table');
            return this.mapFinancialData(tableData, STOCK_BROKER_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取做市商持股成本失败' };
        }
    }
    /**
     * 获取质押信息
     */
    async getStockPledgeData(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-pledge-data/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.pledge-table');
            return this.mapFinancialData(tableData, STOCK_PLEDGE_DATA_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取质押信息失败' };
        }
    }
    /**
     * 获取质押贷款记录
     */
    async getStockPledgeLoanRecords(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-pledge-loan-records/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.loan-table');
            return this.mapFinancialData(tableData, STOCK_PLEDGE_LOAN_RECORD_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取质押贷款记录失败' };
        }
    }
    /**
     * 获取投资者持股成本
     */
    async getStockFundedList(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-funded-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const tableData = parser.tableToJson('.funded-table');
            return this.mapFinancialData(tableData, STOCK_FUNDED_LIST_KEY_MAP);
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取投资者持股成本失败' };
        }
    }
    /**
     * 获取研报信息
     */
    async getStockReportList(stockCode) {
        try {
            const url = `${this.baseUrl}/stock-report-list/stock_code-${stockCode}.html`;
            const response = await axios.get(url, { timeout: 15000 });
            const parser = createHtmlParser(response.data);
            const reports = [];
            parser.$('.report-list .report-item').each((index, element) => {
                const $item = parser.$(element);
                const title = parser.$($item).find('.report-title').text();
                const detailUrl = parser.$($item).find('a').attr('href');
                const publishDate = parser.$($item).find('.report-date').text();
                if (title) {
                    reports.push({
                        title,
                        detail_url: detailUrl || '',
                        publish_date: publishDate || ''
                    });
                }
            });
            return { success: true, data: reports };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '获取研报信息失败' };
        }
    }
}
