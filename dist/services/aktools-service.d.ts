import { StockQueryResult } from '../types/stock.js';
/**
 * AKTools HTTP API 客户端
 * 基于 aktools 项目实现HTTP API调用
 */
export declare class AKToolsService {
    private readonly baseUrl;
    private readonly headers;
    constructor(baseUrl?: string);
    /**
     * 获取股票实时行情数据
     */
    getStockRealtime(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取股票历史数据
     */
    getStockHistory(codes: string[], period?: string, startDate?: string, endDate?: string, adjust?: string): Promise<StockQueryResult>;
    /**
     * 获取个股基本信息
     */
    getStockBasicInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取行业板块数据
     */
    getSectorData(sector?: string): Promise<any>;
    /**
     * 检查AKTools服务是否可用
     */
    checkService(): Promise<boolean>;
    /**
     * 根据股票代码判断市场
     */
    private getMarketFromCode;
    /**
     * 格式化成交量
     */
    private formatVolume;
    /**
     * 格式化成交额
     */
    private formatAmount;
}
//# sourceMappingURL=aktools-service.d.ts.map