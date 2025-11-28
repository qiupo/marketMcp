import { StockInfo, StockQueryResult } from '../types/stock.js';
/**
 * 东方财富网数据服务类
 * 提供完整的股票数据查询功能
 */
export declare class EastMoneyServiceSimple {
    private readonly baseUrl;
    /**
     * 根据股票代码获取东方财富代码格式
     * 东方财富的格式：0.000001,1.600519 (0=深市，1=沪市)
     */
    private getEastMoneyCode;
    /**
     * 获取股票信息
     */
    getStockInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取单个股票信息
     */
    getSingleStockInfo(code: string): Promise<StockInfo | null>;
    /**
     * 搜索股票（使用热门股票接口进行简单搜索）
     */
    searchStock(keyword: string): Promise<StockQueryResult>;
    /**
     * 获取热门股票（使用一些知名股票代码）
     */
    getPopularStocks(): Promise<StockQueryResult>;
    /**
     * 根据股票代码判断市场
     */
    private getMarketFromCode;
    /**
     * 验证股票代码格式
     */
    validateStockCode(code: string): boolean;
    /**
     * 标准化股票代码
     */
    normalizeStockCode(code: string): string;
}
