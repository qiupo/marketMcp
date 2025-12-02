/**
 * AKTools服务
 * 基于AKTools HTTP API获取AkShare数据
 */
import { MarketOverview, StockQueryResult, DataSource } from '../types';
/**
 * AKTools服务类
 */
export declare class AKToolsService {
    private readonly baseUrl;
    private readonly timeout;
    private readonly enabled;
    constructor(baseUrl?: string, timeout?: number, enabled?: boolean);
    /**
     * 检查AKTools服务是否可用
     */
    checkService(): Promise<boolean>;
    /**
     * 获取股票实时行情数据
     */
    getStockRealtime(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取股票历史数据
     */
    getStockHistory(codes: string[], period?: string, startDate?: string, endDate?: string, adjust?: string): Promise<StockQueryResult>;
    /**
     * 获取股票基本信息
     */
    getStockBasicInfo(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取市场概览
     */
    getMarketOverview(options?: {
        market?: string;
        sector?: string;
    }): Promise<{
        success: boolean;
        data?: MarketOverview;
        error?: string;
        source: DataSource;
    }>;
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
//# sourceMappingURL=akToolsService.d.ts.map