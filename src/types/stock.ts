// 股票基础信息接口
export interface StockInfo {
  code: string;                    // 股票代码
  name: string;                    // 股票名称
  price: number;                   // 最新价
  change: number;                  // 涨跌额
  changePercent: string;           // 涨跌幅
  industry?: string;               // 所属行业
  open?: number;                   // 今开
  high?: number;                   // 最高
  avgPrice?: number;               // 平均价
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

// 详细公司信息接口
export interface CompanyInfo {
  name: string;                    // 股票名称
  code: string;                    // 股票代码
  price: string;                   // 最新价
  change: string;                  // 涨跌额
  changePercent: string;           // 涨跌幅
  industry: string;                // 所属行业
  open: string;                    // 今开
  high: string;                    // 最高
  avgPrice: string;                // 平均价
  peRatio: string;                 // 市盈率
  volume: string;                  // 成交量
  totalMarketValue: string;        // 总市值
  prevClose: string;               // 昨收
  low: string;                     // 最低
  turnoverRate: string;            // 换手率
  pbRatio: string;                 // 市净率
  amount: string;                  // 成交额
  circulatingMarketValue: string;  // 流通市值
  companyName: string;             // 公司名称
  companyWebsite: string;          // 公司网址
  companyPhone: string;            // 公司电话
  secretary: string;               // 董秘
  secretaryEmail: string;          // 董秘Email
  secretaryPhone: string;          // 董秘电话
  legalPerson: string;             // 法人
  sponsor: string;                 // 主办券商
  tradingMethod: string;           // 交易方式
  listingDate: string;             // 挂牌日期
  establishmentDate: string;       // 成立日期
  marketMakingDate: string;        // 做市日期
  registeredCapital: string;       // 注册资本
  region: string;                  // 所属地区
  officeAddress: string;           // 办公地址
  companyProfile: string;          // 公司简介
  mainBusiness: string;            // 主营业务
  businessScope: string;           // 经营范围
  financingStatus: string;         // 融资状态
  actualRaisedNetAmount: string;   // 实际募资净额
  financingSuccessRate: string;    // 融资成功率
  financingRanking: string;        // 融资排名
  equityStructure: EquityStructure[]; // 股东结构
  seniorManagement: SeniorManagement[]; // 高管介绍
  news: News[];                    // 新闻资讯
}

// 股本信息
export interface EquityStructure {
  totalEquity: string;             // 总股本
  circulatingEquity: string;       // 流通股本
  statisticalDate: string;         // 统计日期
  shareholderCount: string;        // 股东户数
}

// 股东结构
export interface ShareholderInfo {
  shareholderName: string;         // 股东名称
  shareholdings: string;           // 持股数
  shareholdingRatio: string;       // 持股比例
}

// 高管信息
export interface SeniorManagement {
  name: string;                    // 姓名
  position: string;                // 职位
  highestEducation: string;        // 最高学历
  termStartDate: string;           // 任期开始日期
  profile: string;                 // 简介
}

// 新闻资讯
export interface News {
  title: string;                   // 标题
  summary: string;                 // 摘要
  url: string;                     // 地址
  source: string;                  // 来源
  time: string;                    // 时间
}

// IPO3.com API响应格式
export interface IPO3Response {
  [key: string]: string | number | EquityStructure[] | ShareholderInfo[] | SeniorManagement[] | News[];
}

// API数据源
export enum DataSource {
  IPO3 = 'ipo3'
}

// 查询参数
export interface StockQueryParams {
  codes: string[];        // 股票代码列表
  dataSource?: DataSource; // 数据源选择
}

// MCP工具参数
export interface GetStockInfoParams {
  codes: string | string[];  // 股票代码，支持单个或多个
  market?: string;          // 市场代码 (sh/sz/bj)
  data_source?: string;      // 数据源选择
}

// 批量查询结果
export interface StockQueryResult {
  success: boolean;
  data: StockInfo[];
  errors?: string[];
  source: DataSource;
}