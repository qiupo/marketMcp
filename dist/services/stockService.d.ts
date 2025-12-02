import { StockQueryParams, StockQueryResult } from '../types/stock.js';
/**
 * 股票服务管理器
 * 支持东方财富网和AKTools数据源
 */
export declare class StockService {
    private eastMoneyService;
    private aktoolsService;
    /**
     * 获取股票信息
     * @param params 查询参数
     */
    getStockInfo(params: StockQueryParams): Promise<StockQueryResult>;
    /**
     * 获取单个股票信息
     */
    getSingleStockInfo(code: string, dataSource?: string): Promise<StockQueryResult>;
    /**
     * 批量获取股票信息
     */
    getBatchStockInfo(codes: string[], dataSource?: string): Promise<StockQueryResult>;
    /**
     * 获取股票历史数据
     */
    getStockHistory(codes: string[], period?: string, startDate?: string, endDate?: string, adjust?: string): Promise<StockQueryResult>;
    /**
     * 获取股票基本信息
     */
    getStockBasicInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取行业板块数据
     */
    getSectorData(sector?: string): Promise<any>;
    /**
     * 检查AKTools服务状态
     */
    checkAKToolsService(): Promise<boolean>;
    /**
     * 获取市场概览
     */
    getMarketOverview(market?: string): Promise<any>;
}
//# sourceMappingURL=stockService.d.ts.map