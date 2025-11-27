import { CompanyInfo, StockQueryResult, IncomeStatement, BalanceSheet, CashFlowStatement, FinancialAnalysis, FundInfo, TradeInfo, EventInfo, NoticeInfo, SurveyInfo, BrokerInfo, PledgeData, ReportInfo, PaginatedResponse } from '../types/stock.js';
/**
 * IPO3.com 数据服务类
 * 完整实现IPO3网站的所有功能
 */
export declare class IPO3ServiceV2 {
    private readonly baseUrl;
    private readonly defaultHeaders;
    /**
     * 字段映射配置（基于config.py）
     */
    private readonly keyMappings;
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
     * 提取表格数据
     */
    private extractTableData;
    /**
     * 获取公司详细信息（核心功能）
     */
    getCompanyInfo(stockCode: string, englishKey?: boolean): Promise<CompanyInfo>;
    /**
     * 解析复杂的数据部分（股本、股东结构、高管介绍、新闻资讯）
     */
    private parseComplexSections;
    /**
     * 解析股本结构
     */
    private parseEquityStructureFromHTML;
    /**
     * 解析高管介绍
     */
    private parseSeniorManagementFromHTML;
    /**
     * 解析新闻列表
     */
    private parseNewsListFromHTML;
    /**
     * 获取利润表数据
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
     * 获取募资明细
     */
    getStockFundList(stockCode: string, englishKey?: boolean): Promise<FundInfo[]>;
    /**
     * 获取交易明细
     */
    getStockTradeList(stockCode: string, englishKey?: boolean): Promise<TradeInfo[]>;
    /**
     * 获取事件提醒
     */
    getStockEventList(stockCode: string, englishKey?: boolean): Promise<EventInfo[]>;
    /**
     * 获取公告列表
     */
    getStockNoticeList(stockCode: string, page?: number): Promise<PaginatedResponse<NoticeInfo>>;
    /**
     * 获取定增计划
     */
    getStockSurvey(stockCode: string, englishKey?: boolean): Promise<SurveyInfo>;
    /**
     * 获取做市商信息
     */
    getStockBrokerList(stockCode: string, englishKey?: boolean): Promise<BrokerInfo[]>;
    /**
     * 获取质押信息
     */
    getStockPledgeData(stockCode: string, englishKey?: boolean): Promise<PledgeData>;
    /**
     * 获取研报列表
     */
    getStockReportList(stockCode: string, englishKey?: boolean): Promise<ReportInfo[]>;
    /**
     * 获取股票基础信息（简化版）
     */
    getStockInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 键名转换工具
     */
    private convertKeys;
    /**
     * 搜索股票
     */
    searchStock(keyword: string): Promise<StockQueryResult>;
}
