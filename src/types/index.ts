/**
 * 股票相关类型定义
 */

export interface StockInfo {
  code: string;                    // 股票代码
  name: string;                    // 股票名称
  price: number;                   // 最新价
  change: number;                  // 涨跌额
  changePercent: string;           // 涨跌幅
  industry?: string;               // 所属行业
  open?: number;                   // 今开
  high?: number;                   // 最高
  avgPrice?: number;               // 均价
  peRatio?: string;                // 市盈率
  volume: string;                  // 成交量
  totalMarketValue?: string;       // 总市值
  prevClose?: number;              // 昨收
  low?: number;                    // 最低
  turnoverRate?: string;           // 换手率
  pbRatio?: string;                // 市净率
  amount: string;                  // 成交额
  circulatingMarketValue?: string; // 流通市值
  market: string;                  // 市场（sh/sz/bj）
  timestamp: number;               // 时间戳
}

export interface StockHistoryData {
  date: string;                    // 日期
  open: number;                    // 开盘价
  close: number;                   // 收盘价
  high: number;                    // 最高价
  low: number;                     // 最低价
  volume: number;                  // 成交量
  amount: number;                   // 成交额
  amplitude?: number;               // 振幅
  changePercent?: number;            // 涨跌幅
  changeAmount?: number;             // 涨跌额
  turnoverRate?: number;            // 换手率
}

export interface MarketOverview {
  totalCount: number;               // 总股数
  totalAmount: number;               // 总成交额
  sectorStats: Record<string, SectorStats>; // 行业统计
  updateTime: string;                // 更新时间
}

export interface SectorStats {
  count: number;                     // 股票数量
  totalAmount: number;               // 总成交额
  avgChange?: number;                // 平均涨跌幅
}

export interface CompanyBasicInfo {
  code: string;                     // 股票代码
  name: string;                     // 股票名称
  price: number;                     // 最新价
  market: string;                     // 市场
  industry?: string;                  // 行业
}

export enum DataSource {
  EASTMONEY = 'eastmoney',  // 东方财富网
  AKTOOLS = 'aktools',      // AKTools HTTP API
  AUTO = 'auto'               // 自动选择
}

// 查询参数
export interface StockQueryParams {
  codes: string[];          // 股票代码列表
  dataSource?: DataSource; // 数据源选择
}

// MCP工具参数
export interface GetStockInfoParams {
  codes: string | string[];  // 股票代码，支持单个或多个
  market?: string;          // 市场代码 (sh/sz/bj)
  data_source?: DataSource; // 数据源选择
}

export interface GetStockHistoryParams {
  codes: string | string[];     // 股票代码
  period?: string;              // 周期: daily/weekly/monthly
  start_date?: string;          // 开始日期: 20240101
  end_date?: string;            // 结束日期: 20241231
  adjust?: string;              // 复权: 空不复权/qfq前复权/hfq后复权
  data_source?: DataSource;   // 数据源
}

export interface GetStockBasicParams {
  codes: string | string[];   // 股票代码
  data_source?: DataSource; // 数据源
}

export interface GetMarketOverviewParams {
  market?: string;      // 市场范围: all/sh/sz/bj
  sector?: string;       // 行业板块
  data_source?: DataSource; // 数据源
}

// API响应格式
export interface APIResponse<T> {
  success: boolean;
  data: T;
  errors?: string[];
  source: DataSource;
}

// 批量查询结果
export interface StockQueryResult {
  success: boolean;
  data: StockInfo[];
  errors?: string[];
  source: DataSource;
}