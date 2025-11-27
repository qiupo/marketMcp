import { StockQueryParams, StockQueryResult, DataSource } from '../types/stock.js';
/**
 * 股票服务管理器
 * 使用IPO3.com作为主要数据源
 */
export declare class StockService {
    private ipo3Service;
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
