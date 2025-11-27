/**
 * IPO3.com 工具函数
 */

/**
 * 清理文本内容，移除多余空格和特殊字符
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * 格式化数字字符串
 */
export function formatNumber(value: string): string {
  if (!value || value === '-') return '';
  return value.replace(/,/g, '');
}

/**
 * 格式化百分比
 */
export function formatPercent(value: string): string {
  if (!value || value === '-') return '0%';
  return value.replace('%', '') + '%';
}

/**
 * 格式化日期字符串
 */
export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === '-') return '';

  // 处理 YYYY-MM 格式，补全为 YYYY-MM-DD
  if (dateStr.match(/^\d{4}-\d{2}$/)) {
    return dateStr + '-01';
  }

  return dateStr;
}

/**
 * 转换字段名（中英文映射）
 */
export function convertKeys(mapping: Record<string, string>, data: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};

  for (const [chineseKey, value] of Object.entries(data)) {
    const englishKey = mapping[chineseKey] || chineseKey;
    converted[englishKey] = value;
  }

  return converted;
}

/**
 * 提取表格数据
 */
export function extractTableData(document: Document | Element, selector: string): Array<Record<string, string>> {
  const table = document.querySelector(selector);
  if (!table) return [];

  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return [];

  // 提取表头
  const headers = Array.from(rows[0].querySelectorAll('th, td')).map(th =>
    cleanText(th.textContent || '')
  );

  // 提取数据行
  return rows.slice(1).map(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      const cell = cells[index];
      if (cell) {
        const value = cleanText(cell.textContent || '');
        obj[header] = value === '-' ? '' : value;
      }
    });

    return obj;
  });
}

/**
 * 提取财务表格数据（用于财务报表解析）
 */
export function extractFinanceTable(document: Document): Array<Record<string, string>> {
  const financeTable = document.querySelector('.finance-tab');
  if (!financeTable) return [];

  const headers = Array.from(financeTable.querySelectorAll('tr th')).map(th =>
    cleanText(th.textContent || '')
  );

  if (headers.length === 0) return [];

  const rows = Array.from(financeTable.querySelectorAll('tr'));
  const dataRows: Array<Record<string, string>> = [];

  // 转置表格数据：将列转换为行
  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const row: Record<string, string> = {};

    rows.forEach((tr, rowIndex) => {
      const cells = Array.from(tr.querySelectorAll('td'));
      const header = headers[colIndex];
      const cell = cells[colIndex];

      if (cell) {
        const value = cleanText(cell.textContent || '');
        row[header] = value === '-' ? '' : value;
      }
    });

    dataRows.push(row);
  }

  return dataRows;
}

/**
 * 解析股本结构数据
 */
export function parseEquityStructure(mainElement: Element | null): Array<{
  totalEquity: string;
  circulatingEquity: string;
  statisticalDate: string;
  shareholderCount: string;
}> {
  if (!mainElement) return [];

  const tableData = extractTableData(mainElement, 'table');

  return tableData.map(item => ({
    totalEquity: item['总股本'] || '',
    circulatingEquity: item['流通股本'] || '',
    statisticalDate: item['统计日期'] || '',
    shareholderCount: item['股东户数'] || ''
  }));
}

/**
 * 解析高管介绍数据
 */
export function parseSeniorManagement(mainElement: Element | null): Array<{
  name: string;
  position: string;
  highestEducation: string;
  termStartDate: string;
  introduction: string;
}> {
  if (!mainElement) return [];

  const headers = Array.from(mainElement.querySelectorAll('thead th')).map(th =>
    cleanText(th.textContent || '')
  );

  const management: Array<any> = [];
  const rows = mainElement.querySelectorAll('tbody tr.J_click');
  const detailRows = mainElement.querySelectorAll('tbody tr.info-detail');

  rows.forEach((row, index) => {
    const cells = Array.from(row.querySelectorAll('td'));
    const item: any = {};

    headers.forEach((header, cellIndex) => {
      const cell = cells[cellIndex];
      if (header === '简介') {
        const detailRow = detailRows[index];
        item[header] = detailRow?.textContent?.trim() || '';
      } else {
        item[header] = cell?.textContent?.trim() || '';
      }
    });

    // 格式化任期开始日期
    if (item['任期开始日期'] && item['任期开始日期'].length === 7) {
      item['任期开始日期'] = item['任期开始日期'] + '-01';
    }

    management.push({
      name: item['姓名'] || '',
      position: item['职位'] || '',
      highestEducation: item['最高学历'] || '',
      termStartDate: item['任期开始日期'] || '',
      introduction: item['简介'] || ''
    });
  });

  return management;
}

/**
 * 解析新闻列表数据
 */
export function parseNewsList(mainElement: Element | null): Array<{
  title: string;
  summary: string;
  url: string;
  source: string;
  time: string;
}> {
  if (!mainElement) return [];

  const newsItems: Array<any> = [];
  const newsElements = mainElement.querySelectorAll('.news-item');

  newsElements.forEach(element => {
    const titleElement = element.querySelector('h3 a');
    const title = titleElement?.textContent?.trim() || '';
    const href = titleElement?.getAttribute('href') || '';
    const summary = element.querySelector('p')?.textContent?.trim() || '';

    const news: any = {
      title,
      summary,
      url: href.startsWith('http') ? href : `https://www.ipo3.com${href}`
    };

    // 提取来源和时间
    const spans = element.querySelectorAll('.about span');
    spans.forEach(span => {
      const text = span.textContent || '';
      const [key, value] = text.split('：');
      if (key && value) {
        news[cleanText(key)] = cleanText(value);
      }
    });

    newsItems.push({
      title: news.title,
      summary: news.summary,
      url: news.url,
      source: news['来源'] || '',
      time: news['时间'] || ''
    });
  });

  return newsItems;
}

/**
 * 解析股东结构数据
 */
export function parseShareholderStructure(mainElement: Element | null): Array<{
  shareholderName: string;
  sharesNumber: string;
  shareholdingRatio: string;
}> {
  if (!mainElement) return [];

  const tableData = extractTableData(mainElement, 'table');

  return tableData.map(item => ({
    shareholderName: item['股东名称'] || '',
    sharesNumber: item['持股数'] || '',
    shareholdingRatio: item['持股比例'] || ''
  }));
}

/**
 * 解析投资者信息
 */
export function parseInvestorInfo(mainElement: Element | null): Array<{
  investor: string;
  investorType: string;
  isCompanyExecutive: string;
  numberOfSharesHeld: string;
  investmentAmount: string;
  lockedState: string;
}> {
  if (!mainElement) return [];

  const tableData = extractTableData(mainElement, 'table');

  return tableData.map(item => ({
    investor: item['投资者'] || '',
    investorType: item['类型'] || '',
    isCompanyExecutive: item['是否为公司高管'] || '',
    numberOfSharesHeld: item['持股数'] || '',
    investmentAmount: item['投资额（元）'] || '',
    lockedState: item['锁定状态'] || ''
  }));
}

/**
 * 验证股票代码格式
 */
export function validateStockCode(code: string): boolean {
  // 北交所股票代码通常是6位数字
  return /^\d{6}$/.test(code);
}

/**
 * 格式化股票代码
 */
export function formatStockCode(code: string): string {
  return code.toString().trim().replace(/\D/g, '').slice(0, 6);
}

/**
 * 错误处理工具
 */
export class IPO3Error extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly stockCode?: string
  ) {
    super(message);
    this.name = 'IPO3Error';
  }
}

/**
 * 重试机制
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
}

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
export const DEFAULT_REQUEST_CONFIG: Required<Omit<RequestOptions, 'headers'>> = {
  timeout: 15000,
  retries: 3
};

/**
 * 默认请求头
 */
export const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0'
};