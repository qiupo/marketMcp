/**
 * 股票相关类型定义
 */
export interface StockInfo {
    code: string;
    name: string;
    price: number;
    change: number;
    changePercent: string;
    industry?: string;
    open?: number;
    high?: number;
    avgPrice?: number;
    peRatio?: string;
    volume: string;
    totalMarketValue?: string;
    prevClose?: number;
    low?: number;
    turnoverRate?: string;
    pbRatio?: string;
    amount: string;
    circulatingMarketValue?: string;
    market: string;
    timestamp: number;
}
export interface StockHistoryData {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    amount: number;
    amplitude?: number;
    changePercent?: number;
    changeAmount?: number;
    turnoverRate?: number;
}
export interface MarketOverview {
    totalCount: number;
    totalAmount: number;
    sectorStats: Record<string, SectorStats>;
    updateTime: string;
}
export interface SectorStats {
    count: number;
    totalAmount: number;
    avgChange?: number;
}
export interface CompanyBasicInfo {
    code: string;
    name: string;
    price: number;
    market: string;
    industry?: string;
}
export declare enum DataSource {
    EASTMONEY = "eastmoney",// 东方财富网
    AKTOOLS = "aktools",// AKTools HTTP API
    AUTO = "auto"
}
export interface StockQueryParams {
    codes: string[];
    dataSource?: DataSource;
}
export interface GetStockInfoParams {
    codes: string | string[];
    market?: string;
    data_source?: DataSource;
}
export interface GetStockHistoryParams {
    codes: string | string[];
    period?: string;
    start_date?: string;
    end_date?: string;
    adjust?: string;
    data_source?: DataSource;
}
export interface GetStockBasicParams {
    codes: string | string[];
    data_source?: DataSource;
}
export interface GetMarketOverviewParams {
    market?: string;
    sector?: string;
    data_source?: DataSource;
}
export interface APIResponse<T> {
    success: boolean;
    data: T;
    errors?: string[];
    source: DataSource;
}
export interface StockQueryResult {
    success: boolean;
    data: StockInfo[];
    errors?: string[];
    source: DataSource;
}
//# sourceMappingURL=index.d.ts.map