import { StockQueryResult } from '../types/stock.js';
/**
 * 简化版IPO3服务
 * 专注于核心功能
 */
export declare class IPO3Service {
    private readonly baseUrl;
    /**
     * 获取股票信息
     * @param codes 股票代码列表
     */
    getStockInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取单个股票信息
     */
    private getSingleStockInfo;
    /**
     * 解析股票信息
     */
    private parseStockInfo;
    /**
     * 搜索股票
     */
    searchStock(keyword: string): Promise<StockQueryResult>;
    /**
     * 获取热门股票
     */
    getPopularStocks(): Promise<StockQueryResult>;
    /**
     * 其他方法的占位符
     */
    getIncomeStatementList(stockCode: string, dateType?: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getBalanceSheetList(stockCode: string, dateType?: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getCashFlowStatementList(stockCode: string, dateType?: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getFinancialAnalysisList(stockCode: string, dateType?: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockFundList(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockTradeList(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockNoticeList(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockEventList(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockSurvey(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockBrokerList(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockPledgeData(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockPledgeLoanRecords(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockFundedList(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
    getStockReportList(stockCode: string): Promise<{
        success: boolean;
        error: string;
    }>;
}
