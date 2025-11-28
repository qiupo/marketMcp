import { StockQueryParams, StockQueryResult } from '../types/stock.js';
/**
 * 股票服务管理器
 * 专用于东方财富网数据源
 */
export declare class StockService {
    private eastMoneyService;
    /**
     * 获取股票信息
     * @param params 查询参数
     */
    getStockInfo(params: StockQueryParams): Promise<StockQueryResult>;
    /**
     * 获取单个股票信息
     */
    getSingleStockInfo(code: string): Promise<StockQueryResult>;
    /**
     * 批量获取股票信息
     */
    getBatchStockInfo(codes: string[]): Promise<StockQueryResult>;
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
}
