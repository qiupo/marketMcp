import axios from 'axios';
import { DataSource } from '../types/stock.js';
import { createHtmlParser } from '../utils/html-parser.js';
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
     * 获取公司详细信息（完整版）
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
            // 指数信息解析 - 更精确的结构
            const exponentItems = sel.querySelectorAll('.exponent .item');
            exponentItems.forEach((item) => {
                const labelElement = item.querySelector('span');
                const valueElement = item.querySelector('strong');
                if (labelElement && valueElement) {
                    const key = this.getElementText(labelElement).replace(/[：:\s]/g, '');
                    const value = this.getElementText(valueElement).trim();
                    data[key] = value;
                }
            });
            // 公司基本信息解析
            const sheetItems = sel.querySelectorAll('.company-sheet .sheet-item');
            sheetItems.forEach((item) => {
                const labelElement = item.querySelector('span');
                const valueElement = item.querySelector('strong');
                if (labelElement && valueElement) {
                    const key = this.getElementText(labelElement).replace(/[：:\s]/g, '');
                    const value = this.getElementText(valueElement).trim();
                    // 处理特殊字段
                    if (key === '所属地区') {
                        data[key] = value.replace(/\s+/g, '');
                    }
                    else {
                        data[key] = value;
                    }
                }
            });
            // 定增融资信息解析
            const strategyItems = sel.querySelectorAll('.strategy-info .strategy-item');
            strategyItems.forEach((item) => {
                const labelElement = item.querySelector('.strategy-tit');
                const valueElement = item.querySelector('.strategy-status span');
                if (labelElement && valueElement) {
                    const key = this.getElementText(labelElement).replace(/[：:\s]/g, '');
                    const value = this.getElementText(valueElement).trim();
                    // 处理特殊字段
                    if (key === '融资排名') {
                        data[key] = value.replace(/\s+/g, '');
                    }
                    else {
                        data[key] = value;
                    }
                }
            });
            // 解析公司总计信息（股票代码、主营业务、经营范围等）
            const companyTotalItems = sel.querySelectorAll('.company-total .lc-title');
            companyTotalItems.forEach((item) => {
                const labelElement = item.querySelector('span');
                const mainContent = item.querySelector('.lc-main');
                if (labelElement && mainContent) {
                    const key = this.getElementText(labelElement);
                    const content = this.getElementText(mainContent);
                    if (key === '公司简介' || key === '主营业务' || key === '经营范围') {
                        data[key] = content;
                    }
                    else if (key === '股本' || key === '股东结构' || key === '高管介绍' || key === '新闻资讯') {
                        // 这些字段需要进一步解析
                        data[key] = this.parseStructuredContent(content, key);
                    }
                }
            });
            return this.parseCompanyData(data, stockCode);
        }
        catch (error) {
            console.error(`解析${stockCode}的HTML失败:`, error);
            return null;
        }
    }
    /**
     * 创建类似CSS选择器的HTML解析器
     */
    createSelector(html) {
        return {
            querySelector: (selector) => {
                const regex = new RegExp(`<[^>]*class="[^"]*${selector.replace(/[.\s]/g, '[^\\s]*')}[^"]*"[^>]*>([^<]*)<`, 'g');
                const match = regex.exec(html);
                return match ? { textContent: match[1] } : null;
            },
            querySelectorAll: (selector) => {
                const regex = new RegExp(`<[^>]*class="[^"]*${selector.replace(/[.\s]/g, '[^\\s]*')}[^"]*"[^>]*>([^<]*?)<\/[^>]*>`, 'g');
                const matches = [];
                let match;
                while ((match = regex.exec(html)) !== null) {
                    matches.push({ textContent: match[1] });
                }
                return matches;
            },
            querySelector: (selector) => {
                // 简化的元素查找
                const regex = new RegExp(`<[^>]*${selector}[^>]*>`, 'g');
                const match = regex.exec(html);
                return match ? this.getElementText(match[0]) : null;
            }
        };
    }
    /**
     * 获取元素文本内容
     */
    extractTextContent(element) {
        if (!element)
            return '';
        if (element.textContent) {
            return element.textContent.trim();
        }
        else if (element.text) {
            return element.text.trim();
        }
        else if (typeof element === 'string') {
            return element.trim();
        }
        return '';
    }
    /**
     * 获取元素文本
     */
    getElementText(element) {
        if (!element)
            return '';
        if (typeof element === 'string') {
            return element.trim();
        }
        else if (element.textContent) {
            return element.textContent.trim();
        }
        return '';
    }
    /**
     * 解析结构化内容（股本、股东结构等）
     */
    parseStructuredContent(content, type) {
        try {
            if (type === '股本') {
                // 解析股本信息
                const lines = content.split('\n').filter(line => line.trim());
                const equityData = {};
                lines.forEach(line => {
                    if (line.includes('总股本')) {
                        const match = line.match(/总股本[：:]\s*(.+)/);
                        if (match)
                            equityData['总股本'] = match[1].trim();
                    }
                    else if (line.includes('流通股本')) {
                        const match = line.match(/流通股本[：:]\s*(.+)/);
                        if (match)
                            equityData['流通股本'] = match[1].trim();
                    }
                    else if (line.includes('股东户数')) {
                        const match = line.match(/股东户数[：:]\s*(.+)/);
                        if (match)
                            equityData['股东户数'] = match[1].trim();
                    }
                    else if (line.includes('统计日期')) {
                        const match = line.match(/统计日期[：:]\s*(.+)/);
                        if (match)
                            equityData['统计日期'] = match[1].trim();
                    }
                });
                return [equityData];
            }
            else if (type === '股东结构') {
                // 解析股东结构信息
                const lines = content.split('\n').filter(line => line.trim());
                const shareholderData = [];
                lines.forEach(line => {
                    if (line.includes('股东名称') || line.includes('持股数') || line.includes('持股比例')) {
                        const nameMatch = line.match(/股东名称[：:]\s*(.+)/);
                        const sharesMatch = line.match(/持股数[：:]\s*(.+)/);
                        const ratioMatch = line.match(/持股比例[：:]\s*(.+)/);
                        if (nameMatch && sharesMatch && ratioMatch) {
                            shareholderData.push({
                                '股东名称': nameMatch[1].trim(),
                                '持股数': sharesMatch[1].trim(),
                                '持股比例': ratioMatch[1].trim()
                            });
                        }
                    }
                });
                return shareholderData;
            }
            else if (type === '高管介绍') {
                // 解析高管信息
                const lines = content.split('\n').filter(line => line.trim());
                const managementData = [];
                lines.forEach(line => {
                    if (line.includes('姓名') || line.includes('职位') || line.includes('最高学历') || line.includes('任期开始日期') || line.includes('简介')) {
                        const nameMatch = line.match(/姓名[：:]\s*(.+)/);
                        const positionMatch = line.match(/职位[：:]\s*(.+)/);
                        const educationMatch = line.match(/最高学历[：:]\s*(.+)/);
                        const termMatch = line.match(/任期开始日期[：:]\s*(.+)/);
                        const profileMatch = line.match(/简介[：:]\s*(.+)/);
                        if (nameMatch && positionMatch && educationMatch && termMatch && profileMatch) {
                            const item = {
                                '姓名': nameMatch[1].trim(),
                                '职位': positionMatch[1].trim(),
                                '最高学历': educationMatch[1].trim(),
                                '任期开始日期': termMatch[1].trim(),
                                '简介': profileMatch[1].trim()
                            };
                            managementData.push(item);
                        }
                    }
                });
                return managementData;
            }
            else if (type === '新闻资讯') {
                // 解析新闻资讯
                const lines = content.split('\n').filter(line => line.trim());
                const newsData = [];
                lines.forEach(line => {
                    if (line.includes('标题') || line.includes('摘要') || line.includes('地址') || line.includes('来源') || line.includes('时间')) {
                        const titleMatch = line.match(/标题[：:]\s*(.+)/);
                        const summaryMatch = line.match(/摘要[：:]\s*(.+)/);
                        const urlMatch = line.match(/地址[：:]\s*(.+)/);
                        const sourceMatch = line.match(/来源[：:]\s*(.+)/);
                        const timeMatch = line.match(/时间[：:]\s*(.+)/);
                        if (titleMatch && summaryMatch && urlMatch && sourceMatch && timeMatch) {
                            newsData.push({
                                '标题': titleMatch[1].trim(),
                                '摘要': summaryMatch[1].trim(),
                                '地址': urlMatch[1].trim(),
                                '来源': sourceMatch[1].trim(),
                                '时间': timeMatch[1].trim()
                            });
                        }
                    }
                });
                return newsData;
            }
            return [];
        }
        catch (error) {
            console.error(`解析结构化内容失败:`, error);
            return [];
        }
    }
    /**
     * 解析公司数据
     */
    parseCompanyData(data, stockCode) {
        return {
            name: data['股票名称'] || '',
            code: stockCode,
            price: data['最新价'] || '0',
            change: data['涨跌额'] || '0',
            changePercent: data['涨跌幅'] || '0%',
            industry: data['所属行业'] || '',
            open: data['今开'] || '0',
            high: data['最高'] || '0',
            avgPrice: data['平均价'] || '0',
            peRatio: data['市盈率'] || '',
            volume: data['成交量'] || '0',
            totalMarketValue: data['总市值'] || '',
            prevClose: data['昨收'] || '0',
            low: data['最低'] || '0',
            turnoverRate: data['换手率'] || '',
            pbRatio: data['市净率'] || '',
            amount: data['成交额'] || '0',
            circulatingMarketValue: data['流通市值'] || '',
            companyName: data['公司名称'] || '',
            companyWebsite: data['公司网址'] || '',
            companyPhone: data['公司电话'] || '',
            secretary: data['董秘'] || '',
            secretaryEmail: data['董秘Email'] || '',
            secretaryPhone: data['董秘电话'] || '',
            legalPerson: data['法人'] || '',
            sponsor: data['主办券商'] || '',
            tradingMethod: data['交易方式'] || '',
            listingDate: data['挂牌日期'] || '',
            establishmentDate: data['成立日期'] || '',
            marketMakingDate: data['做市日期'] || '',
            registeredCapital: data['注册资本'] || '',
            region: data['所属地区'] || '',
            officeAddress: data['办公地址'] || '',
            companyProfile: data['公司简介'] || '',
            mainBusiness: data['主营业务'] || '',
            businessScope: data['经营范围'] || '',
            financingStatus: data['融资状态'] || '',
            actualRaisedNetAmount: data['实际募资净额'] || '',
            financingSuccessRate: data['融资成功率'] || '',
            financingRanking: data['融资排名'] || '',
            equityStructure: data['股本'] || [],
            seniorManagement: data['高管介绍'] || [],
            news: data['新闻资讯'] || []
        };
    }
    /**
     * 将CompanyInfo转换为StockInfo
     */
    convertToStockInfo(companyInfo) {
        return {
            code: companyInfo.code,
            name: companyInfo.name,
            price: parseFloat(companyInfo.price) || 0,
            change: parseFloat(companyInfo.change) || 0,
            changePercent: companyInfo.changePercent,
            industry: companyInfo.industry,
            open: parseFloat(companyInfo.open) || undefined,
            high: parseFloat(companyInfo.high) || undefined,
            avgPrice: parseFloat(companyInfo.avgPrice) || undefined,
            peRatio: companyInfo.peRatio,
            volume: companyInfo.volume,
            totalMarketValue: companyInfo.totalMarketValue,
            prevClose: parseFloat(companyInfo.prevClose) || undefined,
            low: parseFloat(companyInfo.low) || undefined,
            turnoverRate: companyInfo.turnoverRate,
            pbRatio: companyInfo.pbRatio,
            amount: companyInfo.amount,
            circulatingMarketValue: companyInfo.circulatingMarketValue,
            market: this.getMarketFromCode(companyInfo.code),
            timestamp: Date.now()
        };
    }
    /**
     * 根据股票代码判断市场
     */
    getMarketFromCode(code) {
        // 根据代码特征判断市场
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
     * 搜索股票（基于IPO3的搜索功能）
     */
    async searchStock(keyword) {
        try {
            const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(keyword)}`;
            const response = await axios.get(searchUrl, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });
            // 从搜索结果页面提取股票代码
            const codes = this.extractStockCodesFromSearch(response.data);
            if (codes.length > 0) {
                return this.getStockInfo(codes.slice(0, 10)); // 限制搜索结果数量
            }
            return {
                success: false,
                data: [],
                errors: ['搜索无结果'],
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
     * 从搜索结果中提取股票代码
     */
    extractStockCodesFromSearch(html) {
        const codes = [];
        const codePattern = /stock_code-(\d{6})\.html/g;
        let match;
        while ((match = codePattern.exec(html)) !== null) {
            if (!codes.includes(match[1])) {
                codes.push(match[1]);
            }
        }
        return codes;
    }
    /**
     * 获取实时行情（单个股票）
     */
    async getRealtimeQuote(code) {
        return this.getStockInfo([code]);
    }
    /**
     * 获取热门股票（基于IPO3的热门股票列表）
     */
    async getPopularStocks() {
        try {
            // 使用一些知名的新三板/北交所股票代码作为热门股票
            const popularCodes = [
                '430510', // 丰光精密
                '873152', // 天宏锂电
                '870299', // 灿能电力
                '837046', // 亿能电力
                '831627' // 力王股份
            ];
            return this.getStockInfo(popularCodes);
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
     * 获取利润表信息
     */
    async getIncomeStatementList(stockCode, dateType = '年报') {
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}-tab-finance-date_type-${this.getFinanceDateType(dateType)}.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseFinanceTable(response.data);
        }
        catch (error) {
            console.error(`获取利润表失败:`, error);
            return [];
        }
    }
    /**
     * 获取资产负债表信息
     */
    async getBalanceSheetList(stockCode, dateType = '年报') {
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}-tab-finance-date_type-${this.getFinanceDateType(dateType)}-type-debt.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseFinanceTable(response.data);
        }
        catch (error) {
            console.error(`获取资产负债表失败:`, error);
            return [];
        }
    }
    /**
     * 获取现金流量表信息
     */
    async getCashFlowStatementList(stockCode, dateType = '年报') {
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}-tab-finance-date_type-${this.getFinanceDateType(dateType)}-type-cash.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseFinanceTable(response.data);
        }
        catch (error) {
            console.error(`获取现金流量表失败:`, error);
            return [];
        }
    }
    /**
     * 获取财务分析信息
     */
    async getFinancialAnalysisList(stockCode, dateType = '年报') {
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}-tab-finance-date_type-${this.getFinanceDateType(dateType)}-type-analysis.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseFinanceTable(response.data);
        }
        catch (error) {
            console.error(`获取财务分析失败:`, error);
            return [];
        }
    }
    /**
     * 获取融资信息
     */
    async getStockFundList(stockCode) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-fund.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseFundTable(response.data);
        }
        catch (error) {
            console.error(`获取融资信息失败:`, error);
            return [];
        }
    }
    /**
     * 获取交易明细
     */
    async getStockTradeList(stockCode) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-trade.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseTradeTable(response.data);
        }
        catch (error) {
            console.error(`获取交易明细失败:`, error);
            return [];
        }
    }
    /**
     * 获取最新公告
     */
    async getStockNoticeList(stockCode, page = 1) {
        const url = `${this.baseUrl}/company-notice_ajax/stock_code-${stockCode}-p-${page}.html`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`获取最新公告失败:`, error);
            return {};
        }
    }
    /**
     * 获取大事提醒
     */
    async getStockEventList(stockCode) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-notice.html#notice1`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseEventTable(response.data);
        }
        catch (error) {
            console.error(`获取大事提醒失败:`, error);
            return [];
        }
    }
    /**
     * 获取研报信息
     */
    async getStockReportList(stockCode) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-report.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseReportTable(response.data);
        }
        catch (error) {
            console.error(`获取研报失败:`, error);
            return [];
        }
    }
    /**
     * 获取定增计划
     */
    async getStockSurvey(stockCode) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-survey.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseSurveyTable(response.data);
        }
        catch (error) {
            console.error(`获取定增计划失败:`, error);
            return {};
        }
    }
    /**
     * 获取质押信息
     */
    async getStockPledgeData(stockCode) {
        const url = `${this.baseUrl}/company-show/tab-pledge-stock_code-${stockCode}.html`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parsePledgeTable(response.data);
        }
        catch (error) {
            console.error(`获取质押信息失败:`, error);
            return {};
        }
    }
    /**
     * 获取质押贷款记录
     */
    async getStockPledgeLoanRecords(stockCode) {
        const url = `${this.baseUrl}/company-show/tab-pledge-stock_code-${stockCode}.html`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parsePledgeLoanTable(response.data);
        }
        catch (error) {
            console.error(`获取质押贷款记录失败:`, error);
            return [];
        }
    }
    /**
     * 获取做市商持股成本
     */
    async getStockBrokerList(stockCode) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-broker.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseBrokerTable(response.data);
        }
        catch (error) {
            console.error(`获取做市商持股成本失败:`, error);
            return [];
        }
    }
    /**
     * 获取持股成本-投资者持股成本
     */
    async getStockFundedList(stockCode) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-funded.html#content`;
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return this.parseFundTable(response.data);
        }
        catch (error) {
            console.error(`获取投资者持股成本失败:`, error);
            return [];
        }
    }
    /**
     * 辅助方法：获取财务报告类型对应的编号
     */
    getFinanceDateType(dateType) {
        const typeMap = {
            '年报': '001',
            '中报': '002',
            '一季报': '003',
            '三季报': '004'
        };
        return typeMap[dateType] || '001';
    }
    /**
     * 解析财务表格
     */
    parseFinanceTable(html) {
        try {
            const sel = this.createSelector(html);
            const headers = Array.from(sel.querySelectorAll('.finance-tab tr th')).map((th) => this.getElementText(th).trim());
            const rows = [];
            const rowElements = sel.querySelectorAll('.finance-tab tbody tr');
            rowElements.forEach((row) => {
                const cells = Array.from(row.querySelectorAll('td')).map((td) => this.getElementText(td).trim());
                if (headers.length === cells.length) {
                    const item = {};
                    headers.forEach((header, index) => {
                        item[header] = cells[index];
                    });
                    rows.push(item);
                }
            });
            return rows;
        }
        catch (error) {
            console.error('解析财务表格失败:', error);
            return [];
        }
    }
    /**
     * 解析融资表格
     */
    parseFundTable(html) {
        try {
            const sel = this.createSelector(html);
            const headers = Array.from(sel.querySelectorAll('#J_trade_main .nr_btd span')).map((span) => this.getElementText(span).trim());
            const rows = [];
            const rowElements = sel.querySelectorAll('#J_trade_main .surveyBox');
            rowElements.forEach((row) => {
                const cells = Array.from(row.querySelectorAll('td')).map((td) => this.getElementText(td).trim());
                if (headers.length === cells.length) {
                    const item = {};
                    headers.forEach((header, index) => {
                        item[header] = cells[index];
                    });
                    rows.push(item);
                }
            });
            return rows;
        }
        catch (error) {
            console.error('解析融资表格失败:', error);
            return [];
        }
    }
    /**
     * 解析交易表格
     */
    parseTradeTable(html) {
        try {
            const sel = this.createSelector(html);
            const headers = Array.from(sel.querySelectorAll('#J_trade_main .nr_btd')).map((td) => this.getElementText(td).trim());
            const rows = [];
            const rowElements = sel.querySelectorAll('#J_trade_main .surveyBox');
            rowElements.forEach((row) => {
                const cells = Array.from(row.querySelectorAll('td')).map((td) => this.getElementText(td).trim());
                if (headers.length === cells.length) {
                    const item = {};
                    headers.forEach((header, index) => {
                        item[header] = cells[index];
                    });
                    rows.push(item);
                }
            });
            return rows;
        }
        catch (error) {
            console.error('解析交易表格失败:', error);
            return [];
        }
    }
    /**
     * 解析事件表格
     */
    parseEventTable(html) {
        try {
            const sel = this.createSelector(html);
            const rows = [];
            const eventElements = sel.querySelectorAll('.event-list .event-item');
            eventElements.forEach((event) => {
                const flElement = event.querySelector('.fl');
                const tagsElement = event.querySelector('.event-tag');
                const titleElement = event.querySelector('h3');
                if (flElement && tagsElement && titleElement) {
                    rows.push({
                        '事件日期': this.getElementText(flElement).trim(),
                        '事件类型': Array.from(tagsElement.querySelectorAll('i')).map((i) => this.getElementText(i).trim()),
                        '事件标题': this.getElementText(titleElement).trim()
                    });
                }
            });
            return rows;
        }
        catch (error) {
            console.error('解析事件表格失败:', error);
            return [];
        }
    }
    /**
     * 解析报告表格
     */
    parseReportTable(html) {
        try {
            const sel = this.createSelector(html);
            const rows = [];
            const rowElements = sel.querySelectorAll('#content .table-body .table-row');
            rowElements.forEach((row) => {
                const titleElement = row.querySelector(".title::attr(title)");
                const rqElement = row.querySelector(".table-colrq::text");
                const hrefElement = row.querySelector(".title::attr(href)");
                if (titleElement && rqElement && hrefElement) {
                    rows.push({
                        '研报标题': this.getElementText(titleElement).trim(),
                        '详情地址': this.getElementText(hrefElement).trim(),
                        '发布日期': this.getElementText(rqElement).trim()
                    });
                }
            });
            return rows;
        }
        catch (error) {
            console.error('解析报告表格失败:', error);
            return [];
        }
    }
    /**
     * 解析调查表格
     */
    parseSurveyTable(html) {
        try {
            const sel = this.createSelector(html);
            // 融资进度：董事会通过 -> 股东大会通过 -> 证监会批准 -> 实施完成
            const progressText = this.getElementText(sel.querySelector('#content .nr_btd span'));
            // 提取融资基本信息
            const item = {
                '融资进度': progressText
            };
            // 解析基本信息项
            const sheetItems = sel.querySelectorAll('#content .boards .board-item');
            sheetItems.forEach((boardItem) => {
                const pElement = boardItem.querySelector('p');
                const spanElement = boardItem.querySelector('span');
                if (pElement && spanElement) {
                    const key = this.getElementText(spanElement).trim();
                    const value = this.getElementText(pElement).trim();
                    item[key] = value;
                }
            });
            // 解析表格数据
            const tableRows = sel.querySelectorAll('#content table tr');
            tableRows.forEach((tableRow) => {
                const key = this.getElementText(tableRow.querySelector('th')).trim();
                const value = this.getElementText(tableRow.querySelector('td')).trim();
                item[key] = value;
            });
            return item;
        }
        catch (error) {
            console.error('解析调查表格失败:', error);
            return {};
        }
    }
    /**
     * 解析质押表格
     */
    parsePledgeTable(html) {
        try {
            const sel = this.createSelector(html);
            const totalText = this.getElementText(sel.querySelector('#pledge_total::attr(value)'));
            const shareholdersText = sel.querySelector('#pledge_shareholders::attr(value)')?.textContent || '';
            const pledgeeText = sel.querySelector('#pledge_pledgee::attr(value)')?.textContent || '';
            let shareholders = [];
            let pledgee = [];
            if (shareholdersText) {
                try {
                    shareholders = JSON.parse(shareholdersText);
                }
                catch (e) {
                    console.warn('解析股东数据失败:', e);
                }
            }
            if (pledgeeText) {
                try {
                    pledgee = JSON.parse(pledgeeText);
                }
                catch (e) {
                    console.warn('解析质权人数据失败:', e);
                }
            }
            return {
                '累计质押': totalText,
                '质押股东': shareholders,
                '质权人': pledgee
            };
        }
        catch (error) {
            console.error('解析质押表格失败:', error);
            return {};
        }
    }
    /**
     * 解析质押贷款记录表格
     */
    parsePledgeLoanTable(html) {
        try {
            const sel = this.createSelector(html);
            const rows = [];
            const tableRows = sel.querySelectorAll('.pledge-table .contain-table');
            tableRows.forEach((tableRow) => {
                const cells = Array.from(tableRow.querySelectorAll('td')).map((td) => this.getElementText(td).trim());
                if (cells.length >= 6) { // 确保有足够的列
                    rows.push({
                        '股东名称': cells[0],
                        '质押日期': cells[1],
                        '贷款金额': cells[2],
                        '质权人': cells[3],
                        '质押占总股比': cells[4],
                        '质押占所持股比': cells[5],
                        '质押率': cells[6]
                    });
                }
            });
            return rows;
        }
        catch (error) {
            console.error('解析质押贷款记录表格失败:', error);
            return [];
        }
    }
    /**
     * 解析做市商表格
     */
    parseBrokerTable(html) {
        try {
            const sel = this.createSelector(html);
            const rows = [];
            const tableRows = sel.querySelectorAll('#content table tr');
            tableRows.forEach((tableRow) => {
                const cells = Array.from(tableRow.querySelectorAll('td')).map((td) => this.getElementText(td).trim());
                if (cells.length >= 4) { // 确保有足够的列
                    rows.push({
                        '做市商': cells[0],
                        '初始库存': cells[1],
                        '初始价格': cells[2]
                    });
                }
            });
            return rows;
        }
        catch (error) {
            console.error('解析做市商表格失败:', error);
            return [];
        }
    }
}
