/**
 * 数据服务抽象层
 * 统一管理不同数据源的接口调用
 */
import { MarketOverview, StockQueryResult, DataSource } from '../types';
/**
 * 数据服务类
 * 负责统一的数据访问接口，支持多种数据源
 */
export declare class DataService {
    private eastMoneyService;
    private akToolsService;
    private config;
    constructor();
    /**
     * 获取股票实时行情
     */
    getStockRealtime(codes: string[], dataSource?: DataSource): Promise<StockQueryResult>;
    /**
     * 获取股票历史数据
     */
    getStockHistory(codes: string[], options: {
        period?: string;
        startDate?: string;
        endDate?: string;
        adjust?: string;
    }, dataSource?: DataSource): Promise<StockQueryResult>;
    /**
     * 获取股票基本信息
     */
    getStockBasicInfo(codes: string[], dataSource?: DataSource): Promise<StockQueryResult>;
    /**
     * 获取市场概览
     */
    getMarketOverview(options?: {
        market?: string;
        sector?: string;
    }, dataSource?: DataSource): Promise<{
        success: boolean;
        data?: MarketOverview;
        error?: string;
        source: DataSource;
    }>;
    /**
     * 检查服务状态
     */
    checkServices(): Promise<{
        eastmoney: boolean;
        aktools: boolean;
        auto: DataSource;
        recommended: DataSource;
    }>;
    /**
     * 自动选择最佳数据源
     */
    private determineBestDataSource;
    /**
     * 确定推荐的数据源
     */
    private determineRecommendedDataSource;
    /**
     * 检查AKTools是否可用
     */
    private isAKToolsAvailable;
    /**
     * 格式化股票数据为统一格式
     */
    private formatStockData;
    /**
     * 根据股票代码判断市场
     */
    private getMarketFromCode;
    /**
     * 处理股票代码数组
     */
    private normalizeCodes;
}
//# sourceMappingURL=dataService.d.ts.map