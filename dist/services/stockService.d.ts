import { StockQueryParams, StockQueryResult, DataSource } from '../types/stock.js';
/**
 * 股票服务管理器
 * 支持东方财富网数据源
 */
export declare class StockService {
    private eastMoneyService;
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
    searchStock(keyword: string, dataSource?: DataSource): Promise<StockQueryResult>;
    /**
     * 获取热门股票
     */
    getPopularStocks(dataSource?: DataSource): Promise<StockQueryResult>;
    /**
     * 验证股票代码格式
     */
    validateStockCode(code: string): boolean;
    /**
     * 标准化股票代码
     */
    normalizeStockCode(code: string): string;
    /**
     * 获取公司详细信息（待实现）
     */
    getCompanyInfo(stockCode: string, englishKey?: boolean): Promise<any>;
    /**
     * 获取利润表数据（待实现）
     */
    getIncomeStatementList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<any[]>;
    /**
     * 获取资产负债表数据（待实现）
     */
    getBalanceSheetList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<any[]>;
    /**
     * 获取现金流量表数据（待实现）
     */
    getCashFlowStatementList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<any[]>;
    /**
     * 获取财务分析数据（待实现）
     */
    getFinancialAnalysisList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<any[]>;
    /**
     * 获取募资明细（待实现）
     */
    getStockFundList(stockCode: string, englishKey?: boolean): Promise<any[]>;
    /**
     * 获取交易明细（待实现）
     */
    getStockTradeList(stockCode: string, englishKey?: boolean): Promise<any[]>;
    /**
     * 获取事件提醒（待实现）
     */
    getStockEventList(stockCode: string, englishKey?: boolean): Promise<any[]>;
    /**
     * 获取公告列表（待实现）
     */
    getStockNoticeList(stockCode: string, page?: number): Promise<any>;
    /**
     * 获取定增计划（待实现）
     */
    getStockSurvey(stockCode: string, englishKey?: boolean): Promise<any>;
    /**
     * 获取做市商信息（待实现）
     */
    getStockBrokerList(stockCode: string, englishKey?: boolean): Promise<any[]>;
    /**
     * 获取质押信息（待实现）
     */
    getStockPledgeData(stockCode: string, englishKey?: boolean): Promise<any>;
    /**
     * 获取研报列表（待实现）
     */
    getStockReportList(stockCode: string, englishKey?: boolean): Promise<any[]>;
}
