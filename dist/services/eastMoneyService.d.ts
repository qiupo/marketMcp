/**
 * 东方财富网数据服务
 * 专门处理东方财富网的股票数据
 */
import { MarketOverview, StockQueryResult, DataSource } from '../types';
/**
 * 东方财富网服务类
 */
export declare class EastMoneyService {
    private readonly baseUrl;
    private readonly timeout;
    constructor(baseUrl?: string, timeout?: number);
    /**
     * 根据股票代码获取东方财富格式
     * 东方财富格式：0.000001,1.600519 (0=深市，1=沪市)
     */
    private getEastMoneyCode;
    /**
     * 检查服务状态
     */
    checkService(): Promise<{
        status: 'ok' | 'error';
        message?: string;
    }>;
    /**
     * 获取股票实时行情数据
     */
    getStockRealtime(codes: string[]): Promise<StockQueryResult>;
    /**
     * 获取股票历史数据
     * 注意：东方财富网的历史数据接口有限，建议使用AKTools获取完整历史数据
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
//# sourceMappingURL=eastMoneyService.d.ts.map