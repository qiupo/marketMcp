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
    IPO3 = "ipo3"
}
export interface StockQueryParams {
    codes: string[];
    dataSource?: DataSource;
}
export interface GetStockInfoParams {
    codes: string | string[];
    market?: string;
    data_source?: string;
}
export interface StockQueryResult {
    success: boolean;
    data: StockInfo[];
    errors?: string[];
    source: DataSource;
}
