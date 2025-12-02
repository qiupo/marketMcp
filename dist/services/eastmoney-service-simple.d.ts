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
     * 根据股票代码判断市场
     */
    private getMarketFromCode;
}
//# sourceMappingURL=eastmoney-service-simple.d.ts.map