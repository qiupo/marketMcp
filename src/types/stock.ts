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
export interface CompanyBasicInfo {
  code: string;                     // 股票代码
  name: string;                     // 股票名称
  price: number;                     // 最新价
  market: string;                     // 市场
  industry?: string;                  // 行业
}

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
  IPO3 = 'ipo3',           // IPO3.com（已废弃）
  EASTMONEY = 'eastmoney', // 东方财富网（推荐）
  AKTOOLS = 'aktools',     // AKTools HTTP API
  AUTO = 'auto'            // 自动选择
}

// 数据源类型联合，兼容字符串字面量
export type DataSourceType = DataSource.IPO3 | DataSource.EASTMONEY | DataSource.AKTOOLS | 'auto';

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

// 财务数据接口
export interface FinancialData {
  [key: string]: string | number;
}

// 利润表数据
export interface IncomeStatement extends FinancialData {
  reportDate?: string;           // 报告期
  totalSalesRevenue?: string;    // 营业总收入
  salesRevenue?: string;         // 营业收入
  totalSalesCost?: string;       // 营业总成本
  salesCost?: string;            // 营业成本
  additionalTax?: string;        // 营业税金及附加
  sellingExpenses?: string;      // 销售费用
  managementExpenses?: string;  // 管理费用
  financialExpenses?: string;    // 财务费用
  salesProfit?: string;          // 营业利润
  totalProfit?: string;          // 利润总额
  netProfit?: string;             // 净利润
  publishDate?: string;          // 公告日期
}

// 资产负债表数据
export interface BalanceSheet extends FinancialData {
  reportDate?: string;           // 报告期
  cashAndBank?: string;           // 货币资金
  notesReceivable?: string;      // 应收票据
  accountsReceivable?: string;   // 应收账款
  inventory?: string;            // 存货
  totalCurrentAssets?: string;   // 流动资产合计
  fixedAsset?: string;           // 固定资产
  intangibleAsset?: string;      // 无形资产
  totalAssets?: string;          // 资产总计
  totalCurrentLiabilities?: string; // 流动负债合计
  totalLiabilities?: string;     // 负债合计
  totalEquity?: string;          // 股东权益合计
  publishDate?: string;          // 公告日期
}

// 现金流量表数据
export interface CashFlowStatement extends FinancialData {
  reportDate?: string;           // 报告期
  cashFromGoodsAndServices?: string; // 销售商品、提供劳务收到的现金
  netCashFromOperatingActivities?: string; // 经营活动产生的现金流量净额
  netCashFromInvestingActivities?: string; // 投资活动产生的现金流量净额
  netIncreaseInCash?: string;   // 现金及现金等价物净增加额
  openingBalance?: string;       // 期初现金及现金等价物余额
  closingBalance?: string;       // 期末现金及现金等价物余额
  netProfit?: string;             // 净利润
  publishDate?: string;          // 公告日期
}

// 财务分析数据
export interface FinancialAnalysis extends FinancialData {
  reportDate?: string;           // 报告期
  earningsPerShareOfBase?: string; // 每股收益-基本
  netAssetValuePerShare?: string; // 每股净资产
  returnOnEquityDiluted?: string; // 净资产收益率-摊薄
  totalAssetReturnRate?: string;  // 总资产报酬率
  salesNetProfitMargin?: string;  // 销售净利率
  salesGrossProfitMargin?: string; // 销售毛利率
  assetLiabilityRatio?: string;   // 资产负债率
  currentRatio?: string;          // 流动比率
  quickRatio?: string;            // 速动比率
  inventoryTurnover?: string;     // 存货周转率
  totalAssetTurnoverRate?: string; // 总资产周转率
}

// 募资信息
export interface FundInfo {
  fundDate: string;               // 募资日期
  fundType: string;               // 募资类型
  fundMoney?: string;             // 募集资金
  additionalIssuanceQuantity?: string; // 增发数量
  additionalIssuancePrice?: string; // 增发价格
  investorList: InvestorInfo[];  // 投资人列表
}

// 投资者信息
export interface InvestorInfo {
  investor: string;              // 投资者
  investorType: string;           // 类型
  isCompanyExecutive: string;     // 是否为公司高管
  numberOfSharesHeld: string;    // 持股数
  investmentAmount: string;       // 投资额（元）
  lockedState: string;            // 锁定状态
}

// 交易明细
export interface TradeInfo {
  tradeDate: string;              // 交易日期
  totalTradeAmount: string;       // 总成交额（元）
  tradePrice: string;             // 成交价格（元）
  tradeQuantity: string;          // 成交数量（股）
  buyerName: string;              // 买方账号名称
  buyerBroker: string;            // 买方主办券商
  sellerName: string;             // 卖方账号名称
  sellerBroker: string;           // 卖方主办券商
}

// 事件信息
export interface EventInfo {
  eventDate: string;              // 事件日期
  eventType: string;             // 事件类型
  title: string;                  // 事件标题
}

// 公告信息
export interface NoticeInfo {
  id: string;                     // 数据id
  title: string;                  // 公告标题
  downUrl: string;                // 公告文件
  originalFileUrl: string;        // 公告原始文件
  time: string;                   // 发布日期
  detailUrl: string;              // 公告详情
}

// 定增计划
export interface SurveyInfo {
  financingProgress: string;       // 融资进度
  financingMoney: string;         // 融资金额
  transferOfShares: string;        // 出让股份
  pricePerShare: string;           // 每股价格
  latestAnnouncementDate: string; // 最新公告日
  planAnnouncementDate: string;    // 预案公告日
  companySecretary: string;       // 董秘
  companySecretaryPhone: string;  // 董秘电话
  companySecretaryEmail: string;  // 董秘邮箱
  industry: string;               // 行业分类
  broker: string;                 // 主办券商
  additionalIssuanceTarget: string; // 增发对象
  purposeOfIssuance: string;      // 增发目的
}

// 做市商信息
export interface BrokerInfo {
  broker: string;                 // 做市商
  initialStock: string;            // 初始库存
  initialPrice: string;            // 初始价格
}

// 质押信息
export interface PledgeData {
  pledgeTotal: string;             // 累计质押
  pledgeShareholders: Array<{
    name: string;
    value: number;
  }>;
  pledgePledgee: Array<{
    name: string;
    value: number;
  }>;
}

// 质押贷款记录
export interface PledgeLoanRecord {
  shareholderName: string;        // 股东名称
  pledgeDate: string;              // 质押日期
  loanAmount: string;              // 贷款金额
  pledgee: string;                 // 质权人
  pledgeToTotalRatio: string;      // 质押占总股比
  pledgeToEquityRatio: string;     // 质押占所持股比
  pledgeRate: string;              // 质押率
  pledgedShares: string;           // 质押股数
  pledgeStartDate: string;         // 质押起初日
  pledgeEndDate: string;          // 质押截止日
  pledgeDescription: string;       // 质押说明
}

// 研报信息
export interface ReportInfo {
  title: string;                   // 研报标题
  detailUrl: string;               // 详情地址
  publishDate: string;             // 发布日期
}

// API响应格式
export interface APIResponse<T> {
  success: boolean;
  data: T;
  errors?: string[];
  source: DataSource;
}

// 分页响应
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    total: number;
    currentPage: number;
    nextPage?: number;
    hasNextPage: boolean;
  };
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