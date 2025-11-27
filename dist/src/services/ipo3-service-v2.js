"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPO3ServiceV2 = void 0;
const axios_1 = __importDefault(require("axios"));
const stock_js_1 = require("../types/stock.js");
const jsdom_1 = require("jsdom");
/**
 * IPO3.com 数据服务类
 * 完整实现IPO3网站的所有功能
 */
class IPO3ServiceV2 {
    constructor() {
        this.baseUrl = 'https://www.ipo3.com';
        this.defaultHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        };
        /**
         * 字段映射配置（基于config.py）
         */
        this.keyMappings = {
            companyInfo: {
                '股票名称': 'stockName',
                '股票代码': 'stockCode',
                '最新价': 'lastPrice',
                '涨跌额': 'changeValue',
                '涨跌幅': 'changeRate',
                '所属行业': 'industry',
                '今开': 'openPrice',
                '最高': 'highPrice',
                '平均价': 'averagePrice',
                '市盈率': 'peRatio',
                '成交量': 'volume',
                '总市值': 'totalMarketValue',
                '昨收': 'prevClosePrice',
                '最低': 'lowPrice',
                '换手率': 'turnoverRate',
                '市净率': 'pbRatio',
                '成交额': 'turnover',
                '流通市值': 'circularMarketValue',
                '公司名称': 'companyName',
                '公司网址': 'companyWebsite',
                '公司电话': 'companyPhone',
                '董秘': 'companySecretary',
                '董秘Email': 'companySecretaryEmail',
                '董秘电话': 'companySecretaryPhone',
                '法人': 'legalRepresentative',
                '主办券商': 'broker',
                '交易方式': 'transactionMethod',
                '挂牌日期': 'listingDate',
                '成立日期': 'establishDate',
                '做市日期': 'makingDate',
                '注册资本': 'registeredCapital',
                '所属地区': 'area',
                '办公地址': 'companyAddress',
                '公司简介': 'companyIntroduction',
                '主营业务': 'mainBusiness',
                '经营范围': 'businessScope',
                '融资状态': 'financingStatus',
                '实际募资净额': 'financingActualNetAmount',
                '融资成功率': 'financingSuccessRate',
                '融资排名': 'financingRanking'
            }
        };
    }
    /**
     * 通用HTTP请求方法
     */
    async request(url, timeout = 15000) {
        try {
            const response = await axios_1.default.get(url, {
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
        const dom = new jsdom_1.JSDOM(html);
        return dom.window.document;
    }
    /**
     * 清理文本内容
     */
    cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }
    /**
     * 提取表格数据
     */
    extractTableData(document, selector) {
        const table = document.querySelector(selector);
        if (!table)
            return [];
        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length === 0)
            return [];
        const headers = Array.from(rows[0].querySelectorAll('th, td')).map(th => this.cleanText(th.textContent || ''));
        return rows.slice(1).map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const obj = {};
            headers.forEach((header, index) => {
                const cell = cells[index];
                if (cell) {
                    const value = this.cleanText(cell.textContent || '');
                    obj[header] = value === '-' ? '' : value;
                }
            });
            return obj;
        });
    }
    /**
     * 获取公司详细信息（核心功能）
     */
    async getCompanyInfo(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}.html`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        // 基础信息提取
        const stockName = document.querySelector('#stockName')?.textContent?.trim() || '';
        const curPrice = document.querySelector('.company-detail .cur-price span')?.textContent?.trim() || '0';
        const rangeNum = document.querySelector('.company-detail .range-num')?.textContent?.trim() || '0';
        const rangePercent = document.querySelector('.company-detail .range-percent')?.textContent?.trim() || '0%';
        const data = {
            name: stockName,
            code: stockCode,
            price: curPrice,
            change: rangeNum,
            changePercent: rangePercent,
            industry: '',
            open: '',
            high: '',
            avgPrice: '',
            peRatio: '',
            volume: '',
            totalMarketValue: '',
            prevClose: '',
            low: '',
            turnoverRate: '',
            pbRatio: '',
            amount: '',
            circulatingMarketValue: '',
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
        // 所属行业提取
        const industryElement = document.querySelector('.industry');
        if (industryElement) {
            const industryText = industryElement.textContent || '';
            const [, value] = industryText.split('：');
            data.industry = this.cleanText(value);
        }
        // 市值信息提取
        document.querySelectorAll('.exponent .item').forEach(item => {
            const key = item.querySelector('span')?.textContent?.replace(':', '').trim() || '';
            const value = item.querySelector('strong')?.textContent?.trim() || '';
            data[key.replace(/\s+/g, '')] = value;
        });
        // 基本信息提取
        document.querySelectorAll('.company-sheet .sheet-item').forEach(item => {
            const key = item.querySelector('span')?.textContent?.replace('：', '').trim() || '';
            const value = item.querySelector('strong')?.getAttribute('title') || '';
            data[key] = key === '所属地区' ? value.replace(/\s+/g, '') : value;
        });
        // 定增融资信息
        document.querySelectorAll('.strategy-info .strategy-item').forEach(item => {
            const key = item.querySelector('.strategy-tit')?.textContent?.trim() || '';
            const value = item.querySelector('.strategy-status, span')?.textContent?.trim() || '';
            data[key] = key === '融资排名' ? value.replace(/\s+/g, '') : value;
        });
        // 复杂数据结构解析
        this.parseComplexSections(document, data);
        // 英文字段名转换
        if (englishKey) {
            return this.convertKeys(this.keyMappings.companyInfo, data);
        }
        return data;
    }
    /**
     * 解析复杂的数据部分（股本、股东结构、高管介绍、新闻资讯）
     */
    parseComplexSections(document, data) {
        // 解析各个标签页
        const titles = document.querySelectorAll('.company-total .lc-title span');
        const mains = document.querySelectorAll('.company-total .lc-main');
        titles.forEach((title, index) => {
            const key = this.cleanText(title.textContent || '');
            const main = mains[index];
            if (key === '公司简介' || key === '主营业务' || key === '经营范围') {
                data[key === '公司简介' ? 'companyProfile' : key === '主营业务' ? 'mainBusiness' : 'businessScope'] =
                    main?.textContent?.trim() || '';
            }
            else if (key === '股本') {
                data.equityStructure = this.parseEquityStructure(main);
            }
            else if (key === '股东结构') {
                const items = this.extractTableData(main, 'table');
                data.equityStructure = items.map((item) => ({
                    shareholderName: item['股东名称'],
                    shareholdings: item['持股数'],
                    shareholdingRatio: item['持股比例']
                }));
            }
            else if (key === '高管介绍') {
                data.seniorManagement = this.parseSeniorManagement(main);
            }
            else if (key === '新闻资讯') {
                data.news = this.parseNewsList(main);
            }
        });
    }
    /**
     * 解析股本结构
     */
    parseEquityStructure(main) {
        if (!main)
            return [];
        const items = this.extractTableData(main, 'table');
        return items.map(item => ({
            totalEquity: item['总股本'],
            circulatingEquity: item['流通股本'],
            statisticalDate: item['统计日期'],
            shareholderCount: item['股东户数']
        }));
    }
    /**
     * 解析高管介绍
     */
    parseSeniorManagement(main) {
        if (!main)
            return [];
        const headers = Array.from(main.querySelectorAll('thead th')).map(th => this.cleanText(th.textContent || ''));
        const management = [];
        const rows = main.querySelectorAll('tbody tr.J_click');
        const detailRows = main.querySelectorAll('tbody tr.info-detail');
        rows.forEach((row, index) => {
            const cells = Array.from(row.querySelectorAll('td'));
            const item = {};
            headers.forEach((header, cellIndex) => {
                const cell = cells[cellIndex];
                if (header === '简介') {
                    const detailRow = detailRows[index];
                    item[header] = detailRow?.textContent?.trim() || '';
                }
                else {
                    item[header] = cell?.textContent?.trim() || '';
                }
            });
            // 格式化任期开始日期
            if (item['任期开始日期'] && item['任期开始日期'].length === 7) {
                item['任期开始日期'] = item['任期开始日期'] + '-01';
            }
            management.push(item);
        });
        return management;
    }
    /**
     * 解析新闻列表
     */
    parseNewsList(main) {
        if (!main)
            return [];
        const newsItems = [];
        const newsElements = main.querySelectorAll('.news-item');
        newsElements.forEach(element => {
            const title = element.querySelector('h3 a')?.textContent?.trim() || '';
            const href = element.querySelector('h3 a')?.getAttribute('href') || '';
            const summary = element.querySelector('p')?.textContent?.trim() || '';
            const news = {
                title,
                summary,
                url: href.startsWith('http') ? href : `${this.baseUrl}${href}`
            };
            // 提取来源和时间
            const spans = element.querySelectorAll('.about span');
            spans.forEach(span => {
                const text = span.textContent || '';
                const [key, value] = text.split('：');
                if (key && value) {
                    news[this.cleanText(key)] = this.cleanText(value);
                }
            });
            newsItems.push(news);
        });
        return newsItems;
    }
    /**
     * 获取利润表数据
     */
    async getIncomeStatementList(stockCode, dateType = '年报', englishKey = false) {
        const dateTypeMap = {
            '年报': '001',
            '中报': '002',
            '一季报': '003',
            '三季报': '004'
        };
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}-tab-finance-date_type-${dateTypeMap[dateType]}.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const tableData = this.extractTableData(document, '.finance-tab');
        if (englishKey) {
            return tableData.map(item => this.convertKeys(this.keyMappings.companyInfo, item));
        }
        return tableData;
    }
    /**
     * 获取资产负债表数据
     */
    async getBalanceSheetList(stockCode, dateType = '年报', englishKey = false) {
        const dateTypeMap = {
            '年报': '001',
            '中报': '002',
            '一季报': '003',
            '三季报': '004'
        };
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}-tab-finance-date_type-${dateTypeMap[dateType]}-type-debt.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const tableData = this.extractTableData(document, '.finance-tab');
        if (englishKey) {
            return tableData.map(item => this.convertKeys(this.keyMappings.companyInfo, item));
        }
        return tableData;
    }
    /**
     * 获取现金流量表数据
     */
    async getCashFlowStatementList(stockCode, dateType = '年报', englishKey = false) {
        const dateTypeMap = {
            '年报': '001',
            '中报': '002',
            '一季报': '003',
            '三季报': '004'
        };
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}-tab-finance-date_type-${dateTypeMap[dateType]}-type-cash.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const tableData = this.extractTableData(document, '.finance-tab');
        if (englishKey) {
            return tableData.map(item => this.convertKeys(this.keyMappings.companyInfo, item));
        }
        return tableData;
    }
    /**
     * 获取财务分析数据
     */
    async getFinancialAnalysisList(stockCode, dateType = '年报', englishKey = false) {
        const dateTypeMap = {
            '年报': '001',
            '中报': '002',
            '一季报': '003',
            '三季报': '004'
        };
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}-tab-finance-date_type-${dateTypeMap[dateType]}-type-analysis.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const tableData = this.extractTableData(document, '.finance-tab');
        if (englishKey) {
            return tableData.map(item => this.convertKeys(this.keyMappings.companyInfo, item));
        }
        return tableData;
    }
    /**
     * 获取募资明细
     */
    async getStockFundList(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-fund.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const fundInfos = [];
        const titles = document.querySelectorAll('.lc-title');
        const mains = document.querySelectorAll('.lc-main');
        titles.forEach((title, index) => {
            const fundDate = title.querySelector('span:nth-child(1)')?.textContent?.trim() || '';
            const fundType = title.querySelector('span.fr')?.textContent?.trim() || '';
            const main = mains[index];
            const investors = this.extractTableData(main, 'table');
            const fundInfo = {
                fundDate,
                fundType,
                investorList: investors.map(inv => ({
                    investor: inv['投资者'] || '',
                    investorType: inv['类型'] || '',
                    isCompanyExecutive: inv['是否为公司高管'] || '',
                    numberOfSharesHeld: inv['持股数'] || '',
                    investmentAmount: inv['投资额（元）'] || '',
                    lockedState: inv['锁定状态'] || ''
                }))
            };
            // 提取其他募资信息
            const boardItems = main?.querySelectorAll('.boards .board-item') || [];
            boardItems.forEach(item => {
                const key = item.querySelector('span')?.textContent?.trim() || '';
                const value = item.querySelector('p')?.textContent?.trim() || '';
                fundInfo[key] = value;
            });
            fundInfos.push(fundInfo);
        });
        return fundInfos;
    }
    /**
     * 获取交易明细
     */
    async getStockTradeList(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-trade.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const tradeInfos = [];
        const titleDivs = document.querySelectorAll('#J_trade_main .nr_btd');
        const surveyBoxes = document.querySelectorAll('#J_trade_main .surveyBox');
        titleDivs.forEach((titleDiv, index) => {
            const tradeDate = titleDiv.querySelector('span:nth-child(1)')?.textContent?.trim() || '';
            const tradeMoneyText = titleDiv.querySelector('span.fr')?.textContent?.trim() || '';
            const surveyBox = surveyBoxes[index];
            const tradeInfo = {
                tradeDate,
                totalTradeAmount: '',
                tradePrice: '',
                tradeQuantity: '',
                buyerName: '',
                buyerBroker: '',
                sellerName: '',
                sellerBroker: ''
            };
            // 解析交易金额
            if (tradeMoneyText) {
                const [key, value] = tradeMoneyText.split('：');
                if (key && value) {
                    tradeInfo[this.cleanText(key)] = this.cleanText(value);
                }
            }
            // 解析交易详情
            const rows = surveyBox?.querySelectorAll('tr') || [];
            rows.forEach(row => {
                const key = row.querySelector('th')?.textContent?.trim() || '';
                const value = row.querySelector('td')?.textContent?.trim() || '';
                if (key && value) {
                    tradeInfo[key] = value;
                }
            });
            tradeInfos.push(tradeInfo);
        });
        return tradeInfos;
    }
    /**
     * 获取事件提醒
     */
    async getStockEventList(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-notice.html#notice1`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const eventInfos = [];
        const eventItems = document.querySelectorAll('.event-list .event-item');
        eventItems.forEach(item => {
            const eventDate = item.querySelector('.fl')?.textContent?.trim() || '';
            const tags = Array.from(item.querySelectorAll('.event-tag i')).map(tag => tag.textContent?.trim() || '');
            const eventInfo = {
                eventDate,
                eventType: tags[0] || '',
                title: tags[1] || ''
            };
            eventInfos.push(eventInfo);
        });
        return eventInfos;
    }
    /**
     * 获取公告列表
     */
    async getStockNoticeList(stockCode, page = 1) {
        const url = `${this.baseUrl}/company-notice_ajax/stock_code-${stockCode}-p-${page}.html`;
        try {
            const response = await axios_1.default.get(url, {
                timeout: 15000,
                headers: this.defaultHeaders
            });
            const data = response.data.data || {};
            const lists = data.lists || [];
            const noticeInfos = lists.map((item) => ({
                id: item.id || '',
                title: item.title || '',
                downUrl: item.down_url || '',
                originalFileUrl: item.original_file_url || '',
                time: item.time || '',
                detailUrl: item.detail_url ? `${this.baseUrl}${item.detail_url}` : ''
            }));
            return {
                success: true,
                data: noticeInfos,
                pagination: {
                    total: data.total || 0,
                    currentPage: page,
                    nextPage: data.has_more ? page + 1 : undefined,
                    hasNextPage: data.has_more === 1
                },
                source: stock_js_1.DataSource.IPO3
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '获取公告失败'],
                source: stock_js_1.DataSource.IPO3
            };
        }
    }
    /**
     * 获取定增计划
     */
    async getStockSurvey(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-survey.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const surveyInfo = {};
        // 融资进度
        const progressElement = document.querySelector('#content .nr_btd span');
        if (progressElement) {
            const text = progressElement.textContent || '';
            const [key, value] = text.split('：');
            if (key && value) {
                surveyInfo[this.cleanText(key)] = this.cleanText(value);
            }
        }
        // 基本信息
        const boardItems = document.querySelectorAll('#content .boards .board-item');
        boardItems.forEach(item => {
            const key = item.querySelector('span')?.textContent?.trim() || '';
            const value = item.querySelector('p')?.textContent?.trim() || '';
            if (key && value) {
                surveyInfo[key] = value;
            }
        });
        // 表格数据
        const tableRows = document.querySelectorAll('#content table tr');
        tableRows.forEach(row => {
            const key = row.querySelector('th')?.textContent?.trim() || '';
            const value = row.querySelector('td')?.textContent?.trim() || '';
            if (key && value) {
                surveyInfo[key] = value;
            }
        });
        return surveyInfo;
    }
    /**
     * 获取做市商信息
     */
    async getStockBrokerList(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-broker.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const tableData = this.extractTableData(document, '#content table');
        return tableData.map(item => ({
            broker: item['做市商'] || '',
            initialStock: item['初始库存'] || '',
            initialPrice: item['初始价格'] || ''
        }));
    }
    /**
     * 获取质押信息
     */
    async getStockPledgeData(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/tab-pledge-stock_code-${stockCode}.html`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const pledgeTotal = document.querySelector('#pledge_total')?.getAttribute('value') || '0';
        const shareholdersElement = document.querySelector('#pledge_shareholders');
        const pledgeShareholders = shareholdersElement?.getAttribute('value')
            ? JSON.parse(shareholdersElement.getAttribute('value'))
            : [];
        const pledgeeElement = document.querySelector('#pledge_pledgee');
        const pledgePledgee = pledgeeElement?.getAttribute('value')
            ? JSON.parse(pledgeeElement.getAttribute('value'))
            : [];
        return {
            pledgeTotal,
            pledgeShareholders,
            pledgePledgee
        };
    }
    /**
     * 获取研报列表
     */
    async getStockReportList(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-report.html#content`;
        const html = await this.request(url);
        const document = this.parseHTML(html);
        const reportInfos = [];
        const rows = document.querySelectorAll('#content .table-body .table-row');
        rows.forEach(row => {
            const titleElement = row.querySelector('.title');
            const title = titleElement?.getAttribute('title') || '';
            const href = titleElement?.getAttribute('href') || '';
            const publishDate = row.querySelector('.table-colrq')?.textContent?.trim() || '';
            reportInfos.push({
                title,
                detailUrl: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                publishDate
            });
        });
        return reportInfos;
    }
    /**
     * 获取股票基础信息（简化版）
     */
    async getStockInfo(codes) {
        try {
            const stocks = [];
            const errors = [];
            for (const code of codes) {
                try {
                    const companyInfo = await this.getCompanyInfo(code);
                    const stockInfo = {
                        code: companyInfo.code,
                        name: companyInfo.name,
                        price: parseFloat(companyInfo.price) || 0,
                        change: parseFloat(companyInfo.change) || 0,
                        changePercent: companyInfo.changePercent,
                        industry: companyInfo.industry,
                        volume: companyInfo.volume,
                        totalMarketValue: companyInfo.totalMarketValue,
                        turnoverRate: companyInfo.turnoverRate,
                        amount: companyInfo.amount,
                        circulatingMarketValue: companyInfo.circulatingMarketValue,
                        timestamp: Date.now(),
                        market: 'bj'
                    };
                    stocks.push(stockInfo);
                }
                catch (error) {
                    errors.push(`获取股票${code}信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
                }
            }
            return {
                success: stocks.length > 0,
                data: stocks,
                errors: errors.length > 0 ? errors : undefined,
                source: stock_js_1.DataSource.IPO3
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '未知错误'],
                source: stock_js_1.DataSource.IPO3
            };
        }
    }
    /**
     * 键名转换工具
     */
    convertKeys(mapping, data) {
        const converted = {};
        for (const [chineseKey, value] of Object.entries(data)) {
            const englishKey = mapping[chineseKey] || chineseKey;
            converted[englishKey] = value;
        }
        return converted;
    }
    /**
     * 搜索股票
     */
    async searchStock(keyword) {
        try {
            const url = `${this.baseUrl}/search.html?keyword=${encodeURIComponent(keyword)}`;
            const html = await this.request(url);
            // 这里需要根据实际的搜索页面结构来解析
            // 暂时返回空结果
            return {
                success: false,
                data: [],
                errors: ['搜索功能需要进一步实现'],
                source: stock_js_1.DataSource.IPO3
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '搜索失败'],
                source: stock_js_1.DataSource.IPO3
            };
        }
    }
}
exports.IPO3ServiceV2 = IPO3ServiceV2;
