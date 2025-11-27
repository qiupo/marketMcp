import axios from 'axios';
import { DataSource } from '../types/stock.js';
/**
 * IPO3.com API服务
 * 提供详细的股票和公司信息
 */
export class IPO3Service {
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
            return this.parseCompanyHtml(html, stockCode);
        }
        catch (error) {
            console.error(`获取公司${stockCode}信息失败:`, error);
            return null;
        }
    }
    /**
     * 解析HTML页面数据
     */
    parseCompanyHtml(html, stockCode) {
        try {
            // 基础数据
            const stockName = this.extractTextBySelector(html, '#stockName::text');
            const curPrice = this.extractTextBySelector(html, '.company-detail .cur-price span::text');
            const rangeNum = this.extractTextBySelector(html, '.company-detail .range-num::text');
            const rangePercent = this.extractTextBySelector(html, '.company-detail .range-percent::text');
            if (!stockName && !curPrice) {
                throw new Error('无法解析页面数据，可能页面结构已改变');
            }
            const data = {
                '股票名称': stockName || '',
                '股票代码': stockCode,
                '最新价': curPrice || '0',
                '涨跌额': rangeNum || '0',
                '涨跌幅': rangePercent || '0%',
            };
            // 提取所属行业
            const industryText = this.extractTextBySelector(html, '.industry::text');
            if (industryText && industryText.includes('：')) {
                const parts = industryText.split('：');
                if (parts.length === 2) {
                    data['所属行业'] = parts[1].trim();
                }
            }
            // 提取市值相关数据
            const exponentItems = this.extractMultipleTexts(html, '.exponent .item');
            exponentItems.forEach(itemText => {
                const match = itemText.match(/(.+?)\s*(.+)/);
                if (match) {
                    const key = match[1].replace(/[：:\s]/g, '');
                    data[key] = match[2].trim();
                }
            });
            // 提取公司基本信息
            const sheetItems = this.extractMultipleTexts(html, '.company-sheet .sheet-item');
            sheetItems.forEach(itemText => {
                const match = itemText.match(/(.+?)\s*(.+)/);
                if (match) {
                    let key = match[1].replace(/[：:\s]/g, '');
                    let value = match[2].trim();
                    if (key === '所属地区') {
                        value = value.replace(/\s+/g, '');
                    }
                    data[key] = value;
                }
            });
            // 提取定增融资信息
            const strategyItems = this.extractMultipleTexts(html, '.strategy-info .strategy-item');
            strategyItems.forEach(itemText => {
                const lines = itemText.split('\n').map(line => line.trim()).filter(line => line);
                if (lines.length >= 2) {
                    const key = lines[0].replace(/[：:\s]/g, '');
                    const value = lines[1];
                    data[key] = value;
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
     * 使用CSS选择器提取文本
     */
    extractTextBySelector(html, selector) {
        try {
            // 简单的CSS选择器实现
            if (selector.includes('#stockName')) {
                const match = html.match(/<[^>]*id="stockName"[^>]*>([^<]*)</);
                return match ? match[1].trim() : '';
            }
            if (selector.includes('.company-detail .cur-price span')) {
                const match = html.match(/<[^>]*class="[^"]*cur-price[^"]*"[^>]*>\s*<[^>]*>([^<]*)</);
                return match ? match[1].trim() : '';
            }
            if (selector.includes('.company-detail .range-num')) {
                const match = html.match(/<[^>]*class="[^"]*range-num[^"]*"[^>]*>([^<]*)</);
                return match ? match[1].trim() : '';
            }
            if (selector.includes('.company-detail .range-percent')) {
                const match = html.match(/<[^>]*class="[^"]*range-percent[^"]*"[^>]*>([^<]*)</);
                return match ? match[1].trim() : '';
            }
            if (selector.includes('.industry')) {
                const match = html.match(/<[^>]*class="[^"]*industry[^"]*"[^>]*>([^<]*)</);
                return match ? match[1].trim() : '';
            }
            // 其他选择器的通用处理
            const classMatch = selector.match(/\.([^:\s]+)/);
            if (classMatch) {
                const className = classMatch[1];
                const regex = new RegExp(`<[^>]*class="[^"]*${className}[^"]*"[^>]*>([^<]*)</`);
                const match = html.match(regex);
                return match ? match[1].trim() : '';
            }
            return '';
        }
        catch (error) {
            console.error(`CSS选择器提取失败: ${selector}`, error);
            return '';
        }
    }
    /**
     * 提取多个匹配的文本
     */
    extractMultipleTexts(html, selector) {
        try {
            if (selector.includes('.exponent .item')) {
                // 匹配市值相关的项
                const regex = /<[^>]*class="[^"]*item[^"]*"[^>]*>\s*<[^>]*class="[^"]*span[^"]*"[^>]*>([^<]*)<\/[^>]*>\s*<[^>]*class="[^"]*strong[^"]*"[^>]*>([^<]*)<\/[^>]*>/g;
                const matches = [];
                let match;
                while ((match = regex.exec(html)) !== null) {
                    matches.push(`${match[1]} ${match[2]}`);
                }
                return matches;
            }
            if (selector.includes('.company-sheet .sheet-item')) {
                // 匹配公司基本信息的项
                const regex = /<[^>]*class="[^"]*sheet-item[^"]*"[^>]*>\s*<[^>]*>([^<]*)<\/[^>]*>\s*<[^>]*[^>]*title="([^"]*)"[^>]*>/g;
                const matches = [];
                let match;
                while ((match = regex.exec(html)) !== null) {
                    matches.push(`${match[1]} ${match[2]}`);
                }
                return matches;
            }
            if (selector.includes('.strategy-info .strategy-item')) {
                // 匹配定增融资信息的项
                const regex = /<[^>]*class="[^"]*strategy-item[^"]*"[^>]*>[\s\S]*?<\/div>/g;
                const matches = [];
                let match;
                while ((match = regex.exec(html)) !== null) {
                    matches.push(match[0]);
                }
                return matches.map(item => {
                    // 从HTML中提取文本
                    return item.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                });
            }
            return [];
        }
        catch (error) {
            console.error(`批量CSS选择器提取失败: ${selector}`, error);
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
            equityStructure: this.parseEquityStructure(data['股本']),
            seniorManagement: this.parseSeniorManagement(data['高管介绍']),
            news: this.parseNews(data['新闻资讯'])
        };
    }
    /**
     * 解析股本信息
     */
    parseEquityStructure(data) {
        if (!Array.isArray(data))
            return [];
        return data;
    }
    /**
     * 解析高管信息
     */
    parseSeniorManagement(data) {
        if (!Array.isArray(data))
            return [];
        return data;
    }
    /**
     * 解析新闻资讯
     */
    parseNews(data) {
        if (!Array.isArray(data))
            return [];
        return data;
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
}
