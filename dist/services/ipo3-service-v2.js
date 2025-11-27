import axios from 'axios';
import * as cheerio from 'cheerio';
import { DataSource } from '../types/stock.js';
/**
 * IPO3.com 数据服务类
 * 完整实现IPO3网站的所有功能
 */
export class IPO3ServiceV2 {
    baseUrl = 'https://www.ipo3.com';
    defaultHeaders = {
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
    keyMappings = {
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
     * 提取表格数据
     */
    extractTableData($, selector) {
        const table = $(selector);
        if (table.length === 0)
            return [];
        const rows = table.find('tr');
        if (rows.length === 0)
            return [];
        const headers = [];
        rows.first().find('th, td').each((_, el) => {
            headers.push(this.cleanText($(el).text() || ''));
        });
        const result = [];
        rows.slice(1).each((_, row) => {
            const cells = $(row).find('td');
            const obj = {};
            headers.forEach((header, index) => {
                const cell = cells.eq(index);
                if (cell.length > 0) {
                    const value = this.cleanText(cell.text() || '');
                    obj[header] = value === '-' ? '' : value;
                }
            });
            result.push(obj);
        });
        return result;
    }
    /**
     * 获取公司详细信息（核心功能）
     */
    async getCompanyInfo(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock_code-${stockCode}.html`;
        const html = await this.request(url);
        const $ = this.parseHTML(html);
        // 基础信息提取
        const stockName = $('#stockName').text().trim() || '';
        const curPrice = $('.company-detail .cur-price span').text().trim() || '0';
        const rangeNum = $('.company-detail .range-num').text().trim() || '0';
        const rangePercent = $('.company-detail .range-percent').text().trim() || '0%';
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
        const industryElement = $('.industry');
        if (industryElement.length > 0) {
            const industryText = industryElement.text() || '';
            const [, value] = industryText.split('：');
            data.industry = this.cleanText(value);
        }
        // 市值信息提取
        $('.exponent .item').each((_, item) => {
            const key = $(item).find('span').text().replace(':', '').trim() || '';
            const value = $(item).find('strong').text().trim() || '';
            data[key.replace(/\s+/g, '')] = value;
        });
        // 基本信息提取
        $('.company-sheet .sheet-item').each((_, item) => {
            const key = $(item).find('span').text().replace('：', '').trim() || '';
            const value = $(item).find('strong').attr('title') || '';
            data[key] = key === '所属地区' ? value.replace(/\s+/g, '') : value;
        });
        // 定增融资信息
        $('.strategy-info .strategy-item').each((_, item) => {
            const key = $(item).find('.strategy-tit').text().trim() || '';
            const value = $(item).find('.strategy-status, span').text().trim() || '';
            data[key] = key === '融资排名' ? value.replace(/\s+/g, '') : value;
        });
        // 复杂数据结构解析
        this.parseComplexSections($, data);
        // 英文字段名转换
        if (englishKey) {
            return this.convertKeys(this.keyMappings.companyInfo, data);
        }
        return data;
    }
    /**
     * 解析复杂的数据部分（股本、股东结构、高管介绍、新闻资讯）
     */
    parseComplexSections($, data) {
        // 解析各个标签页
        const titles = $('.company-total .lc-title span');
        const mains = $('.company-total .lc-main');
        titles.each((index, title) => {
            const key = this.cleanText($(title).text() || '');
            const main = mains.eq(index);
            if (key === '公司简介' || key === '主营业务' || key === '经营范围') {
                data[key === '公司简介' ? 'companyProfile' : key === '主营业务' ? 'mainBusiness' : 'businessScope'] =
                    main.text().trim() || '';
            }
            else if (key === '股本') {
                data.equityStructure = this.parseEquityStructureFromHTML(main.html() || '');
            }
            else if (key === '股东结构') {
                const items = this.extractTableData($, 'table');
                data.equityStructure = items.map((item) => ({
                    shareholderName: item['股东名称'],
                    shareholdings: item['持股数'],
                    shareholdingRatio: item['持股比例']
                }));
            }
            else if (key === '高管介绍') {
                data.seniorManagement = this.parseSeniorManagementFromHTML(main.html() || '');
            }
            else if (key === '新闻资讯') {
                data.news = this.parseNewsListFromHTML(main.html() || '');
            }
        });
    }
    /**
     * 解析股本结构
     */
    parseEquityStructureFromHTML(html) {
        const $ = cheerio.load(html);
        const items = this.extractTableData($, 'table');
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
    parseSeniorManagementFromHTML(html) {
        const $ = cheerio.load(html);
        const management = [];
        // 简化实现，提取基本信息
        $('tbody tr').each((_, row) => {
            const item = {};
            $(row).find('td').each((index, cell) => {
                const text = $(cell).text().trim();
                if (text) {
                    item[`field_${index}`] = text;
                }
            });
            if (Object.keys(item).length > 0) {
                management.push(item);
            }
        });
        return management;
    }
    /**
     * 解析新闻列表
     */
    parseNewsListFromHTML(html) {
        const $ = cheerio.load(html);
        const newsItems = [];
        $('.news-item').each((_, element) => {
            const title = $(element).find('h3 a').text().trim() || '';
            const href = $(element).find('h3 a').attr('href') || '';
            const summary = $(element).find('p').text().trim() || '';
            const news = {
                title,
                summary,
                url: href.startsWith('http') ? href : `${this.baseUrl}${href}`
            };
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
        const $ = this.parseHTML(html);
        const tableData = this.extractTableData($, '.finance-tab');
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
        const $ = this.parseHTML(html);
        const tableData = this.extractTableData($, '.finance-tab');
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
        const $ = this.parseHTML(html);
        const tableData = this.extractTableData($, '.finance-tab');
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
        const $ = this.parseHTML(html);
        const tableData = this.extractTableData($, '.finance-tab');
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
        const $ = this.parseHTML(html);
        const fundInfos = [];
        const titles = $('.lc-title');
        const mains = $('.lc-main');
        titles.each((index, title) => {
            const $title = $(title);
            const fundDate = $title.find('span:nth-child(1)').text().trim() || '';
            const fundType = $title.find('span.fr').text().trim() || '';
            const $main = mains.eq(index);
            const investors = this.extractTableData($, 'table');
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
            const boardItems = $main.find('.boards .board-item');
            boardItems.each((_, item) => {
                const $item = $(item);
                const key = $item.find('span').text().trim() || '';
                const value = $item.find('p').text().trim() || '';
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
        const $ = this.parseHTML(html);
        const tradeInfos = [];
        const titleDivs = $('#J_trade_main .nr_btd');
        const surveyBoxes = $('#J_trade_main .surveyBox');
        titleDivs.each((index, titleDiv) => {
            const $titleDiv = $(titleDiv);
            const tradeDate = $titleDiv.find('span:nth-child(1)').text().trim() || '';
            const tradeMoneyText = $titleDiv.find('span.fr').text().trim() || '';
            const $surveyBox = surveyBoxes.eq(index);
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
            const rows = $surveyBox.find('tr');
            rows.each((_, row) => {
                const $row = $(row);
                const key = $row.find('th').text().trim() || '';
                const value = $row.find('td').text().trim() || '';
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
        const $ = this.parseHTML(html);
        const eventInfos = [];
        const eventItems = $('.event-list .event-item');
        eventItems.each((_, item) => {
            const $item = $(item);
            const eventDate = $item.find('.fl').text().trim() || '';
            const tags = [];
            $item.find('.event-tag i').each((_, tag) => {
                tags.push($(tag).text().trim() || '');
            });
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
            const response = await axios.get(url, {
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
     * 获取定增计划
     */
    async getStockSurvey(stockCode, englishKey = false) {
        const url = `${this.baseUrl}/company-show/stock-${stockCode}-tab-survey.html#content`;
        const html = await this.request(url);
        const $ = this.parseHTML(html);
        const surveyInfo = {};
        // 融资进度
        const progressElement = $('#content .nr_btd span');
        if (progressElement.length > 0) {
            const text = progressElement.text() || '';
            const [key, value] = text.split('：');
            if (key && value) {
                surveyInfo[this.cleanText(key)] = this.cleanText(value);
            }
        }
        // 基本信息
        const boardItems = $('#content .boards .board-item');
        boardItems.each((_, item) => {
            const $item = $(item);
            const key = $item.find('span').text().trim() || '';
            const value = $item.find('p').text().trim() || '';
            if (key && value) {
                surveyInfo[key] = value;
            }
        });
        // 表格数据
        const tableRows = $('#content table tr');
        tableRows.each((_, row) => {
            const $row = $(row);
            const key = $row.find('th').text().trim() || '';
            const value = $row.find('td').text().trim() || '';
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
        const $ = this.parseHTML(html);
        const tableData = this.extractTableData($, '#content table');
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
        const $ = this.parseHTML(html);
        const pledgeTotal = $('#pledge_total').attr('value') || '0';
        const shareholdersElement = $('#pledge_shareholders');
        const shareholdersValue = shareholdersElement.attr('value');
        const pledgeShareholders = shareholdersValue ? JSON.parse(shareholdersValue) : [];
        const pledgeeElement = $('#pledge_pledgee');
        const pledgeeValue = pledgeeElement.attr('value');
        const pledgePledgee = pledgeeValue ? JSON.parse(pledgeeValue) : [];
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
        const $ = this.parseHTML(html);
        const reportInfos = [];
        const rows = $('#content .table-body .table-row');
        rows.each((_, row) => {
            const $row = $(row);
            const titleElement = $row.find('.title');
            const title = titleElement.attr('title') || '';
            const href = titleElement.attr('href') || '';
            const publishDate = $row.find('.table-colrq').text().trim() || '';
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
}
