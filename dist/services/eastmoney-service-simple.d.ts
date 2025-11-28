import { StockQueryResult } from '../types/stock.js';
/**
 * 简化的东方财富网数据服务类
 * 先提供基本功能，后续可以逐步完善
 */
export declare class EastMoneyServiceSimple {
    private readonly baseUrl;
    private readonly dataBaseUrl;
    /**
     * 获取股票信息
     */
    getStockInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取单个股票的模拟数据（等待真实的东方财富API集成）
     */
    private getSingleStockInfo;
    /**
     * 搜索股票
     */
    searchStock(keyword: string): Promise<StockQueryResult>;
    /**
     * 获取热门股票
     */
    getPopularStocks(): Promise<StockQueryResult>;
    /**
     * 根据股票代码判断市场
     */
    private getMarketFromCode;
    /**
     * 占位方法，保持接口兼容性
     */
    getCompanyInfo(stockCode: string, englishKey?: boolean): Promise<any>;
    getIncomeStatementList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<any[]>;
    getBalanceSheetList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<any[]>;
    getCashFlowStatementList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<any[]>;
    getFinancialAnalysisList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<any[]>;
    getStockNoticeList(stockCode: string, page?: number): Promise<any>;
    getStockFundList(stockCode: string, englishKey?: boolean): Promise<any[]>;
    getStockTradeList(stockCode: string, englishKey?: boolean): Promise<any[]>;
    getStockEventList(stockCode: string, englishKey?: boolean): Promise<any[]>;
    getStockSurvey(stockCode: string, englishKey?: boolean): Promise<any>;
    getStockBrokerList(stockCode: string, englishKey?: boolean): Promise<any[]>;
    getStockPledgeData(stockCode: string, englishKey?: boolean): Promise<any>;
    getStockReportList(stockCode: string, englishKey?: boolean): Promise<any[]>;
}
