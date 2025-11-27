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
     * 获取公司详细信息（完整版）
     * @param stockCode 股票代码
     */
    getCompanyDetail(stockCode: string): Promise<CompanyInfo | null>;
    /**
     * 增强版HTML解析
     */
    private parseCompanyHtmlEnhanced;
    /**
     * 创建类似CSS选择器的HTML解析器
     */
    private createSelector;
    /**
     * 获取元素文本内容
     */
    private extractTextContent;
    /**
     * 获取元素文本
     */
    private getElementText;
    /**
     * 解析结构化内容（股本、股东结构等）
     */
    private parseStructuredContent;
    /**
     * 解析公司数据
     */
    private parseCompanyData;
    /**
     * 将CompanyInfo转换为StockInfo
     */
    private convertToStockInfo;
    /**
     * 根据股票代码判断市场
     */
    private getMarketFromCode;
    /**
     * 搜索股票（基于IPO3的搜索功能）
     */
    searchStock(keyword: string): Promise<StockQueryResult>;
    /**
     * 从搜索结果中提取股票代码
     */
    private extractStockCodesFromSearch;
    /**
     * 获取实时行情（单个股票）
     */
    getRealtimeQuote(code: string): Promise<StockQueryResult>;
    /**
     * 获取热门股票（基于IPO3的热门股票列表）
     */
    getPopularStocks(): Promise<StockQueryResult>;
    /**
     * 获取利润表信息
     */
    getIncomeStatementList(stockCode: string, dateType?: string): Promise<any>;
    /**
     * 获取资产负债表信息
     */
    getBalanceSheetList(stockCode: string, dateType?: string): Promise<any>;
    /**
     * 获取现金流量表信息
     */
    getCashFlowStatementList(stockCode: string, dateType?: string): Promise<any>;
    /**
     * 获取财务分析信息
     */
    getFinancialAnalysisList(stockCode: string, dateType?: string): Promise<any>;
    /**
     * 获取融资信息
     */
    getStockFundList(stockCode: string): Promise<any>;
    /**
     * 获取交易明细
     */
    getStockTradeList(stockCode: string): Promise<any>;
    /**
     * 获取最新公告
     */
    getStockNoticeList(stockCode: string, page?: number): Promise<any>;
    /**
     * 获取大事提醒
     */
    getStockEventList(stockCode: string): Promise<any>;
    /**
     * 获取研报信息
     */
    getStockReportList(stockCode: string): Promise<any>;
    /**
     * 获取定增计划
     */
    getStockSurvey(stockCode: string): Promise<any>;
    /**
     * 获取质押信息
     */
    getStockPledgeData(stockCode: string): Promise<any>;
    /**
     * 获取质押贷款记录
     */
    getStockPledgeLoanRecords(stockCode: string): Promise<any>;
    /**
     * 获取做市商持股成本
     */
    getStockBrokerList(stockCode: string): Promise<any>;
    /**
     * 获取持股成本-投资者持股成本
     */
    getStockFundedList(stockCode: string): Promise<any>;
    /**
     * 辅助方法：获取财务报告类型对应的编号
     */
    private getFinanceDateType;
    /**
     * 解析财务表格
     */
    private parseFinanceTable;
    /**
     * 解析融资表格
     */
    private parseFundTable;
    /**
     * 解析交易表格
     */
    private parseTradeTable;
    /**
     * 解析事件表格
     */
    private parseEventTable;
    /**
     * 解析报告表格
     */
    private parseReportTable;
    /**
     * 解析调查表格
     */
    private parseSurveyTable;
    /**
     * 解析质押表格
     */
    private parsePledgeTable;
    /**
     * 解析质押贷款记录表格
     */
    private parsePledgeLoanTable;
    /**
     * 解析做市商表格
     */
    private parseBrokerTable;
}
