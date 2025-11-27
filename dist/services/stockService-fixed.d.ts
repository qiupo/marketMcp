import { StockQueryParams, StockQueryResult, DataSource } from '../types/stock.js';
/**
 * 股票服务管理器 - 修复版本
 * 使用IPO3.com作为主要数据源，避免JSDOM兼容性问题
 */
export declare class StockServiceFixed {
    private ipo3Service;
    /**
     * 获取股票信息
     * @param params 查询参数
     */
    getStockInfo(params: StockQueryParams): Promise<StockQueryResult>;
    /**
     * 从指定数据源获取数据
     */
    private getFromSpecificSource;
    /**
     * 获取单个股票信息
     */
    getSingleStockInfo(code: string, dataSource?: DataSource): Promise<StockQueryResult>;
    /**
     * 批量获取股票信息
     */
    getBatchStockInfo(codes: string[], dataSource?: DataSource): Promise<StockQueryResult>;
    /**
     * 搜索股票
     */
    searchStock(keyword: string): Promise<StockQueryResult>;
    /**
     * 获取热门股票
     */
    getPopularStocks(): Promise<StockQueryResult>;
    /**
     * 验证股票代码格式
     */
    validateStockCode(code: string): boolean;
    /**
     * 标准化股票代码
     */
    normalizeStockCode(code: string): string;
    /**
     * 获取公司详细信息
     */
    getCompanyInfo(stockCode: string, englishKey?: boolean): Promise<import("../types/stock.js").CompanyInfo>;
    /**
     * 获取利润表数据
     */
    getIncomeStatementList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<import("../types/stock.js").IncomeStatement[]>;
    /**
     * 获取资产负债表数据
     */
    getBalanceSheetList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<import("../types/stock.js").BalanceSheet[]>;
    /**
     * 获取现金流量表数据
     */
    getCashFlowStatementList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<import("../types/stock.js").CashFlowStatement[]>;
    /**
     * 获取财务分析数据
     */
    getFinancialAnalysisList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<import("../types/stock.js").FinancialAnalysis[]>;
    /**
     * 获取募资明细
     */
    getStockFundList(stockCode: string, englishKey?: boolean): Promise<import("../types/stock.js").FundInfo[]>;
    /**
     * 获取交易明细
     */
    getStockTradeList(stockCode: string, englishKey?: boolean): Promise<import("../types/stock.js").TradeInfo[]>;
    /**
     * 获取事件提醒
     */
    getStockEventList(stockCode: string, englishKey?: boolean): Promise<import("../types/stock.js").EventInfo[]>;
    /**
     * 获取公告列表
     */
    getStockNoticeList(stockCode: string, page?: number): Promise<{
        success: boolean;
        data: any;
        pagination: {
            total: any;
            currentPage: number;
            nextPage: number;
            hasNextPage: boolean;
        };
        source: DataSource;
        errors?: undefined;
    } | {
        success: boolean;
        data: any[];
        errors: string[];
        source: DataSource;
        pagination?: undefined;
    }>;
    /**
     * 获取定增计划
     */
    getStockSurvey(stockCode: string, englishKey?: boolean): Promise<import("../types/stock.js").SurveyInfo>;
    /**
     * 获取做市商信息
     */
    getStockBrokerList(stockCode: string, englishKey?: boolean): Promise<import("../types/stock.js").BrokerInfo[]>;
    /**
     * 获取质押信息
     */
    getStockPledgeData(stockCode: string, englishKey?: boolean): Promise<import("../types/stock.js").PledgeData>;
    /**
     * 获取研报列表
     */
    getStockReportList(stockCode: string, englishKey?: boolean): Promise<import("../types/stock.js").ReportInfo[]>;
    /**
     * 获取演示用的股票数据（不需要网络请求）
     */
    getDemoStockInfo(codes: string[]): StockQueryResult;
    /**
     * 获取演示用的公司信息
     */
    getDemoCompanyInfo(stockCode: string): {
        success: boolean;
        data: {
            stockCode: string;
            stockName: string;
            englishName: string;
            listingDate: string;
            registeredCapital: number;
            businessScope: string;
            address: string;
            website: string;
            phone: string;
            totalShares: number;
            circulatingShares: number;
            chairman: string;
            generalManager: string;
            secretary: string;
        };
        source: string;
    };
}
