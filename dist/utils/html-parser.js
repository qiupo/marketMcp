import * as cheerio from 'cheerio';
/**
 * HTML解析工具类
 * 使用Cheerio提供CSS选择器解析功能
 */
export class HtmlParser {
    $;
    constructor(html) {
        this.$ = cheerio.load(html);
    }
    /**
     * 提取文本内容
     */
    text(selector) {
        return this.$(selector).text().trim();
    }
    /**
     * 提取属性值
     */
    attr(selector, attribute) {
        return this.$(selector).attr(attribute);
    }
    /**
     * 检查元素是否存在
     */
    exists(selector) {
        return this.$(selector).length > 0;
    }
    /**
     * 获取元素数量
     */
    count(selector) {
        return this.$(selector).length;
    }
    /**
     * 提取表格数据
     * 将表格转换为对象数组
     */
    tableToJson(tableSelector) {
        const result = [];
        this.$(tableSelector).each((_tableIndex, table) => {
            const $table = this.$(table);
            // 获取表头
            const headers = [];
            $table.find('thead th, tr:first-child td').each((_, header) => {
                headers.push(this.$(header).text().trim());
            });
            // 获取数据行
            $table.find('tbody tr, tr').each((rowIndex, row) => {
                // 跳过第一行（如果是表头）
                if (rowIndex === 0 && $table.find('thead').length > 0)
                    return;
                const rowData = {};
                this.$(row).find('td').each((colIndex, cell) => {
                    if (headers[colIndex]) {
                        rowData[headers[colIndex]] = this.$(cell).text().trim();
                    }
                });
                if (Object.keys(rowData).length > 0) {
                    result.push(rowData);
                }
            });
        });
        return result;
    }
    /**
     * 提取表格数据为键值对
     */
    tableToKeyValue(tableSelector) {
        const result = {};
        this.$(tableSelector).find('tr').each((_, row) => {
            const $row = this.$(row);
            const cells = $row.find('td');
            if (cells.length >= 2) {
                const key = this.$(cells[0]).text().trim();
                const value = this.$(cells[1]).text().trim();
                if (key) {
                    result[key] = value;
                }
            }
        });
        return result;
    }
    /**
     * 提取数字（去除格式化字符）
     */
    extractNumber(text) {
        if (!text)
            return 0;
        const cleanText = text.replace(/[^\d.-]/g, '');
        return parseFloat(cleanText) || 0;
    }
    /**
     * 提取百分比数值
     */
    extractPercentage(text) {
        if (!text)
            return 0;
        const cleanText = text.replace(/[^\d.-]/g, '');
        return parseFloat(cleanText) || 0;
    }
    /**
     * 清理和规范化文本
     */
    cleanText(text) {
        if (!text)
            return '';
        return text
            .replace(/\s+/g, ' ') // 多个空白字符替换为单个空格
            .replace(/[\r\n]/g, '') // 移除换行符
            .trim();
    }
}
/**
 * 创建HTML解析器实例
 */
export function createHtmlParser(html) {
    return new HtmlParser(html);
}
