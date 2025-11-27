/**
 * IPO3.com 工具函数
 */
/**
 * 清理文本内容，移除多余空格和特殊字符
 */
export declare function cleanText(text: string): string;
/**
 * 格式化数字字符串
 */
export declare function formatNumber(value: string): string;
/**
 * 格式化百分比
 */
export declare function formatPercent(value: string): string;
/**
 * 格式化日期字符串
 */
export declare function formatDate(dateStr: string): string;
/**
 * 转换字段名（中英文映射）
 */
export declare function convertKeys(mapping: Record<string, string>, data: Record<string, any>): Record<string, any>;
/**
 * 提取表格数据
 */
export declare function extractTableData(document: Document | Element, selector: string): Array<Record<string, string>>;
/**
 * 提取财务表格数据（用于财务报表解析）
 */
export declare function extractFinanceTable(document: Document): Array<Record<string, string>>;
/**
 * 解析股本结构数据
 */
export declare function parseEquityStructure(mainElement: Element | null): Array<{
    totalEquity: string;
    circulatingEquity: string;
    statisticalDate: string;
    shareholderCount: string;
}>;
/**
 * 解析高管介绍数据
 */
export declare function parseSeniorManagement(mainElement: Element | null): Array<{
    name: string;
    position: string;
    highestEducation: string;
    termStartDate: string;
    introduction: string;
}>;
/**
 * 解析新闻列表数据
 */
export declare function parseNewsList(mainElement: Element | null): Array<{
    title: string;
    summary: string;
    url: string;
    source: string;
    time: string;
}>;
/**
 * 解析股东结构数据
 */
export declare function parseShareholderStructure(mainElement: Element | null): Array<{
    shareholderName: string;
    sharesNumber: string;
    shareholdingRatio: string;
}>;
/**
 * 解析投资者信息
 */
export declare function parseInvestorInfo(mainElement: Element | null): Array<{
    investor: string;
    investorType: string;
    isCompanyExecutive: string;
    numberOfSharesHeld: string;
    investmentAmount: string;
    lockedState: string;
}>;
/**
 * 验证股票代码格式
 */
export declare function validateStockCode(code: string): boolean;
/**
 * 格式化股票代码
 */
export declare function formatStockCode(code: string): string;
/**
 * 错误处理工具
 */
export declare class IPO3Error extends Error {
    readonly code?: string;
    readonly stockCode?: string;
    constructor(message: string, code?: string, stockCode?: string);
}
/**
 * 重试机制
 */
export declare function retryRequest<T>(fn: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
/**
 * 请求选项接口
 */
export interface RequestOptions {
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
}
/**
 * 默认请求配置
 */
export declare const DEFAULT_REQUEST_CONFIG: Required<Omit<RequestOptions, 'headers'>>;
/**
 * 默认请求头
 */
export declare const DEFAULT_HEADERS: {
    'User-Agent': string;
    Accept: string;
    'Accept-Language': string;
    'Accept-Encoding': string;
    Connection: string;
    'Upgrade-Insecure-Requests': string;
    'Cache-Control': string;
};
