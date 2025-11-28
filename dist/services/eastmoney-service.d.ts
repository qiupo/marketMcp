import { CompanyInfo, StockQueryResult, IncomeStatement, BalanceSheet, CashFlowStatement, FinancialAnalysis, FundInfo, TradeInfo, EventInfo, NoticeInfo, SurveyInfo, BrokerInfo, PledgeData, ReportInfo, PaginatedResponse } from '../types/stock.js';
/**
 * 东方财富网 数据服务类
 * 替换IPO3.com，提供完整的股票数据功能
 */
export declare class EastMoneyService {
    private readonly baseUrl;
    private readonly dataBaseUrl;
    private readonly defaultHeaders;
    /**
     * 通用HTTP请求方法
     */
    private request;
    /**
     * 解析HTML文档
     */
    private parseHTML;
    /**
     * 清理文本内容
     */
    private cleanText;
    /**
     * 获取股票基础信息（基于东方财富API）
     * 通过AKShare风格的接口调用东财数据
     */
    getStockInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 标准化股票代码
     */
    private standardizeStockCode;
    /**
     * 获取单个股票的详细信息
     */
    private getSingleStockInfo;
    /**
     * 获取实时行情数据
     */
    private getRealtimeQuote;
    /**
     * 根据股票代码获取市场代码
     */
    private getMarketCode;
    /**
     * 根据股票代码判断市场
     */
    private getMarketFromCode;
    /**
     * 搜索股票
     */
    searchStock(keyword: string): Promise<StockQueryResult>;
    /**
     * 获取热门股票
     */
    getPopularStocks(): Promise<StockQueryResult>;
    /**
     * 获取公司详细信息
     */
    getCompanyInfo(stockCode: string, englishKey?: boolean): Promise<CompanyInfo>;
    /**
     * 获取财务报表数据
     */
    getIncomeStatementList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<IncomeStatement[]>;
    /**
     * 获取资产负债表数据
     */
    getBalanceSheetList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<BalanceSheet[]>;
    /**
     * 获取现金流量表数据
     */
    getCashFlowStatementList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<CashFlowStatement[]>;
    /**
     * 获取财务分析数据
     */
    getFinancialAnalysisList(stockCode: string, dateType?: string, englishKey?: boolean): Promise<FinancialAnalysis[]>;
    /**
     * 获取公告列表
     */
    getStockNoticeList(stockCode: string, page?: number): Promise<PaginatedResponse<NoticeInfo>>;
    /**
     * 获取日期类型代码
     */
    private getDateTypeCode;
    /**
     * 占位方法，保持接口兼容性
     */
    getStockFundList(stockCode: string, englishKey?: boolean): Promise<FundInfo[]>;
    getStockTradeList(stockCode: string, englishKey?: boolean): Promise<TradeInfo[]>;
    getStockEventList(stockCode: string, englishKey?: boolean): Promise<EventInfo[]>;
    getStockSurvey(stockCode: string, englishKey?: boolean): Promise<SurveyInfo>;
    getStockBrokerList(stockCode: string, englishKey?: boolean): Promise<BrokerInfo[]>;
    getStockPledgeData(stockCode: string, englishKey?: boolean): Promise<PledgeData>;
    getStockReportList(stockCode: string, englishKey?: boolean): Promise<ReportInfo[]>;
}
