import { CompanyInfo, StockQueryResult } from '../types/stock.js';
/**
 * 增强版IPO3.com API服务
 * 基于stock_open_api项目，提供完整的股票和公司信息
 */
export declare class IPO3EnhancedService {
    private readonly baseUrl;
    /**
     * 获取股票信息
     * @param codes 股票代码列表
     */
    getStockInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取公司详细信息
     * @param stockCode 股票代码
     */
    getCompanyDetail(stockCode: string): Promise<CompanyInfo | null>;
    /**
     * 增强版HTML解析
     */
    private parseCompanyHtmlEnhanced;
    /**
     * 映射公司数据
     */
    private mapCompanyData;
    /**
     * 转换为股票信息
     */
    private convertToStockInfo;
    /**
     * 搜索股票
     */
    searchStock(keyword: string): Promise<StockQueryResult>;
    /**
     * 获取热门股票
     */
    getPopularStocks(): Promise<StockQueryResult>;
    /**
     * 获取利润表
     */
    getIncomeStatementList(stockCode: string, dateType?: string): Promise<any>;
    /**
     * 获取资产负债表
     */
    getBalanceSheetList(stockCode: string, dateType?: string): Promise<any>;
    /**
     * 获取现金流量表
     */
    getCashFlowStatementList(stockCode: string, dateType?: string): Promise<any>;
    /**
     * 获取财务分析表
     */
    getFinancialAnalysisList(stockCode: string, dateType?: string): Promise<any>;
    /**
     * 映射财务数据
     */
    private mapFinancialData;
    /**
     * 获取融资明细
     */
    getStockFundList(stockCode: string): Promise<any>;
    /**
     * 获取交易明细
     */
    getStockTradeList(stockCode: string): Promise<any>;
    /**
     * 获取最新公告
     */
    getStockNoticeList(stockCode: string): Promise<any>;
    /**
     * 获取大事提醒
     */
    getStockEventList(stockCode: string): Promise<any>;
    /**
     * 获取定增计划
     */
    getStockSurvey(stockCode: string): Promise<any>;
    /**
     * 获取做市商持股成本
     */
    getStockBrokerList(stockCode: string): Promise<any>;
    /**
     * 获取质押信息
     */
    getStockPledgeData(stockCode: string): Promise<any>;
    /**
     * 获取质押贷款记录
     */
    getStockPledgeLoanRecords(stockCode: string): Promise<any>;
    /**
     * 获取投资者持股成本
     */
    getStockFundedList(stockCode: string): Promise<any>;
    /**
     * 获取研报信息
     */
    getStockReportList(stockCode: string): Promise<any>;
}
