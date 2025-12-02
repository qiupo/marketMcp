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
export interface CompanyInfo {
    name: string;
    code: string;
    price: string;
    change: string;
    changePercent: string;
    industry: string;
    open: string;
    high: string;
    avgPrice: string;
    peRatio: string;
    volume: string;
    totalMarketValue: string;
    prevClose: string;
    low: string;
    turnoverRate: string;
    pbRatio: string;
    amount: string;
    circulatingMarketValue: string;
    companyName: string;
    companyWebsite: string;
    companyPhone: string;
    secretary: string;
    secretaryEmail: string;
    secretaryPhone: string;
    legalPerson: string;
    sponsor: string;
    tradingMethod: string;
    listingDate: string;
    establishmentDate: string;
    marketMakingDate: string;
    registeredCapital: string;
    region: string;
    officeAddress: string;
    companyProfile: string;
    mainBusiness: string;
    businessScope: string;
    financingStatus: string;
    actualRaisedNetAmount: string;
    financingSuccessRate: string;
    financingRanking: string;
    equityStructure: EquityStructure[];
    seniorManagement: SeniorManagement[];
    news: News[];
}
export interface EquityStructure {
    totalEquity: string;
    circulatingEquity: string;
    statisticalDate: string;
    shareholderCount: string;
}
export interface ShareholderInfo {
    shareholderName: string;
    shareholdings: string;
    shareholdingRatio: string;
}
export interface SeniorManagement {
    name: string;
    position: string;
    highestEducation: string;
    termStartDate: string;
    profile: string;
}
export interface News {
    title: string;
    summary: string;
    url: string;
    source: string;
    time: string;
}
export interface IPO3Response {
    [key: string]: string | number | EquityStructure[] | ShareholderInfo[] | SeniorManagement[] | News[];
}
export declare enum DataSource {
    IPO3 = "ipo3",// IPO3.com（已废弃）
    EASTMONEY = "eastmoney",// 东方财富网（推荐）
    AKTOOLS = "aktools"
}
export type DataSourceType = DataSource.IPO3 | DataSource.EASTMONEY | DataSource.AKTOOLS | 'auto';
export interface StockQueryParams {
    codes: string[];
    dataSource?: DataSource;
}
export interface GetStockInfoParams {
    codes: string | string[];
    market?: string;
    data_source?: string;
}
export interface FinancialData {
    [key: string]: string | number;
}
export interface IncomeStatement extends FinancialData {
    reportDate?: string;
    totalSalesRevenue?: string;
    salesRevenue?: string;
    totalSalesCost?: string;
    salesCost?: string;
    additionalTax?: string;
    sellingExpenses?: string;
    managementExpenses?: string;
    financialExpenses?: string;
    salesProfit?: string;
    totalProfit?: string;
    netProfit?: string;
    publishDate?: string;
}
export interface BalanceSheet extends FinancialData {
    reportDate?: string;
    cashAndBank?: string;
    notesReceivable?: string;
    accountsReceivable?: string;
    inventory?: string;
    totalCurrentAssets?: string;
    fixedAsset?: string;
    intangibleAsset?: string;
    totalAssets?: string;
    totalCurrentLiabilities?: string;
    totalLiabilities?: string;
    totalEquity?: string;
    publishDate?: string;
}
export interface CashFlowStatement extends FinancialData {
    reportDate?: string;
    cashFromGoodsAndServices?: string;
    netCashFromOperatingActivities?: string;
    netCashFromInvestingActivities?: string;
    netIncreaseInCash?: string;
    openingBalance?: string;
    closingBalance?: string;
    netProfit?: string;
    publishDate?: string;
}
export interface FinancialAnalysis extends FinancialData {
    reportDate?: string;
    earningsPerShareOfBase?: string;
    netAssetValuePerShare?: string;
    returnOnEquityDiluted?: string;
    totalAssetReturnRate?: string;
    salesNetProfitMargin?: string;
    salesGrossProfitMargin?: string;
    assetLiabilityRatio?: string;
    currentRatio?: string;
    quickRatio?: string;
    inventoryTurnover?: string;
    totalAssetTurnoverRate?: string;
}
export interface FundInfo {
    fundDate: string;
    fundType: string;
    fundMoney?: string;
    additionalIssuanceQuantity?: string;
    additionalIssuancePrice?: string;
    investorList: InvestorInfo[];
}
export interface InvestorInfo {
    investor: string;
    investorType: string;
    isCompanyExecutive: string;
    numberOfSharesHeld: string;
    investmentAmount: string;
    lockedState: string;
}
export interface TradeInfo {
    tradeDate: string;
    totalTradeAmount: string;
    tradePrice: string;
    tradeQuantity: string;
    buyerName: string;
    buyerBroker: string;
    sellerName: string;
    sellerBroker: string;
}
export interface EventInfo {
    eventDate: string;
    eventType: string;
    title: string;
}
export interface NoticeInfo {
    id: string;
    title: string;
    downUrl: string;
    originalFileUrl: string;
    time: string;
    detailUrl: string;
}
export interface SurveyInfo {
    financingProgress: string;
    financingMoney: string;
    transferOfShares: string;
    pricePerShare: string;
    latestAnnouncementDate: string;
    planAnnouncementDate: string;
    companySecretary: string;
    companySecretaryPhone: string;
    companySecretaryEmail: string;
    industry: string;
    broker: string;
    additionalIssuanceTarget: string;
    purposeOfIssuance: string;
}
export interface BrokerInfo {
    broker: string;
    initialStock: string;
    initialPrice: string;
}
export interface PledgeData {
    pledgeTotal: string;
    pledgeShareholders: Array<{
        name: string;
        value: number;
    }>;
    pledgePledgee: Array<{
        name: string;
        value: number;
    }>;
}
export interface PledgeLoanRecord {
    shareholderName: string;
    pledgeDate: string;
    loanAmount: string;
    pledgee: string;
    pledgeToTotalRatio: string;
    pledgeToEquityRatio: string;
    pledgeRate: string;
    pledgedShares: string;
    pledgeStartDate: string;
    pledgeEndDate: string;
    pledgeDescription: string;
}
export interface ReportInfo {
    title: string;
    detailUrl: string;
    publishDate: string;
}
export interface APIResponse<T> {
    success: boolean;
    data: T;
    errors?: string[];
    source: DataSource;
}
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
export interface StockQueryResult {
    success: boolean;
    data: StockInfo[];
    errors?: string[];
    source: DataSource;
}
//# sourceMappingURL=stock.d.ts.map