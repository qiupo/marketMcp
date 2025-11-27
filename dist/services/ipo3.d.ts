import { CompanyInfo, StockQueryResult } from '../types/stock.js';
/**
 * IPO3.com API服务
 * 提供详细的股票和公司信息
 */
export declare class IPO3Service {
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
     * 解析HTML页面数据
     */
    private parseCompanyHtml;
    /**
     * 使用CSS选择器提取文本
     */
    private extractTextBySelector;
    /**
     * 提取多个匹配的文本
     */
    private extractMultipleTexts;
    /**
     * 解析公司数据
     */
    private parseCompanyData;
    /**
     * 解析股本信息
     */
    private parseEquityStructure;
    /**
     * 解析高管信息
     */
    private parseSeniorManagement;
    /**
     * 解析新闻资讯
     */
    private parseNews;
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
}
