import { IPO3ServiceRegex } from './ipo3-service-regex.js';
import { DataSource } from '../types/stock.js';
/**
 * 股票服务管理器 - 修复版本
 * 使用IPO3.com作为主要数据源，避免JSDOM兼容性问题
 */
export class StockServiceFixed {
    ipo3Service = new IPO3ServiceRegex();
    /**
     * 获取股票信息
     * @param params 查询参数
     */
    async getStockInfo(params) {
        const { codes, dataSource } = params;
        if (dataSource) {
            // 指定数据源
            return this.getFromSpecificSource(codes, dataSource);
        }
        else {
            // 使用默认数据源
            return this.getFromSpecificSource(codes, DataSource.IPO3);
        }
    }
    /**
     * 从指定数据源获取数据
     */
    async getFromSpecificSource(codes, dataSource) {
        switch (dataSource) {
            case DataSource.IPO3:
                return this.ipo3Service.getStockInfo(codes);
            default:
                return this.getFromSpecificSource(codes, DataSource.IPO3);
        }
    }
    /**
     * 获取单个股票信息
     */
    async getSingleStockInfo(code, dataSource) {
        return this.getStockInfo({
            codes: [code],
            dataSource
        });
    }
    /**
     * 批量获取股票信息
     */
    async getBatchStockInfo(codes, dataSource) {
        // IPO3 API建议批量查询，但每批数量不宜过多
        const batchSize = 10; // 每批最多10个股票
        const results = [];
        const allErrors = [];
        let finalSource = DataSource.IPO3;
        for (let i = 0; i < codes.length; i += batchSize) {
            const batch = codes.slice(i, i + batchSize);
            const result = await this.getStockInfo({
                codes: batch,
                dataSource
            });
            if (result.success) {
                results.push(...result.data);
                finalSource = result.source;
            }
            if (result.errors) {
                allErrors.push(...result.errors);
            }
        }
        return {
            success: results.length > 0,
            data: results,
            errors: allErrors.length > 0 ? allErrors : undefined,
            source: finalSource
        };
    }
    /**
     * 搜索股票
     */
    async searchStock(keyword) {
        return this.ipo3Service.searchStock(keyword);
    }
    /**
     * 获取热门股票
     */
    async getPopularStocks() {
        try {
            // 使用搜索功能获取热门股票示例
            const result = await this.ipo3Service.searchStock('热门');
            if (!result.success || result.data.length === 0) {
                // 如果搜索无结果，返回一些示例代码
                return await this.ipo3Service.getStockInfo(['430002', '430003', '430004', '430005', '430006']);
            }
            return result;
        }
        catch (error) {
            // 降级处理：返回一些常见的新三板股票代码
            return await this.ipo3Service.getStockInfo(['430002', '430003', '430004', '430005', '430006']);
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
        // 去除市场前缀，只保留6位数字
        return code.replace(/^(sh|sz|bj)/i, '');
    }
    // ==================== IPO3 增强功能 ====================
    /**
     * 获取公司详细信息
     */
    async getCompanyInfo(stockCode, englishKey = false) {
        return await this.ipo3Service.getCompanyInfo(stockCode, englishKey);
    }
    /**
     * 获取利润表数据
     */
    async getIncomeStatementList(stockCode, dateType = '年报', englishKey = false) {
        return await this.ipo3Service.getIncomeStatementList(stockCode, dateType, englishKey);
    }
    /**
     * 获取资产负债表数据
     */
    async getBalanceSheetList(stockCode, dateType = '年报', englishKey = false) {
        return await this.ipo3Service.getBalanceSheetList(stockCode, dateType, englishKey);
    }
    /**
     * 获取现金流量表数据
     */
    async getCashFlowStatementList(stockCode, dateType = '年报', englishKey = false) {
        return await this.ipo3Service.getCashFlowStatementList(stockCode, dateType, englishKey);
    }
    /**
     * 获取财务分析数据
     */
    async getFinancialAnalysisList(stockCode, dateType = '年报', englishKey = false) {
        return await this.ipo3Service.getFinancialAnalysisList(stockCode, dateType, englishKey);
    }
    /**
     * 获取募资明细
     */
    async getStockFundList(stockCode, englishKey = false) {
        return await this.ipo3Service.getStockFundList(stockCode, englishKey);
    }
    /**
     * 获取交易明细
     */
    async getStockTradeList(stockCode, englishKey = false) {
        return await this.ipo3Service.getStockTradeList(stockCode, englishKey);
    }
    /**
     * 获取事件提醒
     */
    async getStockEventList(stockCode, englishKey = false) {
        return await this.ipo3Service.getStockEventList(stockCode, englishKey);
    }
    /**
     * 获取公告列表
     */
    async getStockNoticeList(stockCode, page = 1) {
        return await this.ipo3Service.getStockNoticeList(stockCode, page);
    }
    /**
     * 获取定增计划
     */
    async getStockSurvey(stockCode, englishKey = false) {
        return await this.ipo3Service.getStockSurvey(stockCode, englishKey);
    }
    /**
     * 获取做市商信息
     */
    async getStockBrokerList(stockCode, englishKey = false) {
        return await this.ipo3Service.getStockBrokerList(stockCode, englishKey);
    }
    /**
     * 获取质押信息
     */
    async getStockPledgeData(stockCode, englishKey = false) {
        return await this.ipo3Service.getStockPledgeData(stockCode, englishKey);
    }
    /**
     * 获取研报列表
     */
    async getStockReportList(stockCode, englishKey = false) {
        return await this.ipo3Service.getStockReportList(stockCode, englishKey);
    }
    // ==================== 演示数据方法（用于测试）====================
    /**
     * 获取演示用的股票数据（不需要网络请求）
     */
    getDemoStockInfo(codes) {
        const demoData = codes.map((code, index) => ({
            code,
            name: `演示股票${code}`,
            price: 10 + Math.random() * 20,
            change: (Math.random() - 0.5) * 2,
            changePercent: `${((Math.random() - 0.5) * 10).toFixed(2)}%`,
            volume: Math.floor(Math.random() * 1000000),
            amount: Math.floor(Math.random() * 10000000),
            market: index % 2 === 0 ? 'NSE' : 'SZSE',
            updateTime: new Date().toISOString()
        }));
        return {
            success: true,
            data: demoData,
            source: 'IPO3 (演示模式)',
            errors: undefined
        };
    }
    /**
     * 获取演示用的公司信息
     */
    getDemoCompanyInfo(stockCode) {
        return {
            success: true,
            data: {
                stockCode,
                stockName: `演示公司${stockCode}`,
                englishName: `Demo Company ${stockCode}`,
                listingDate: '2015-06-18',
                registeredCapital: 5000,
                businessScope: '技术开发、技术服务、技术咨询',
                address: '北京市海淀区',
                website: `www.demo-${stockCode}.com`,
                phone: '010-12345678',
                totalShares: 50000000,
                circulatingShares: 30000000,
                chairman: '张三',
                generalManager: '李四',
                secretary: '王五'
            },
            source: 'IPO3 (演示模式)'
        };
    }
}
