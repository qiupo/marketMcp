"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlParser = void 0;
exports.createHtmlParser = createHtmlParser;
/**
 * HTML解析工具类
 * 使用正则表达式解析HTML内容，提供轻量级解析能力
 */
class HtmlParser {
    constructor(html) {
        this.html = html;
    }
    /**
     * 简单的CSS选择器解析器
     */
    $(selector) {
        // 确保selector是字符串类型
        if (typeof selector !== 'string') {
            console.warn('Selector must be a string, got:', typeof selector);
            return { text: () => '', attr: () => undefined, length: 0, each: () => { }, find: () => ({ text: () => '', each: () => { }, length: 0 }) };
        }
        const elements = [];
        // ID选择器
        if (selector.includes('#')) {
            const id = selector.replace('#', '');
            const regex = new RegExp(`<[^>]*id=["']?${id}["']?[^>]*>([^<]*|.*?</[^>]*>)`, 'gi');
            let match;
            while ((match = regex.exec(this.html)) !== null) {
                const content = match[0];
                elements.push({
                    text: () => content.replace(/<[^>]*>/g, '').trim(),
                    attr: (attr) => {
                        const attrRegex = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
                        const attrMatch = content.match(attrRegex);
                        return attrMatch ? attrMatch[1] : undefined;
                    },
                    length: 1
                });
            }
        }
        // 类选择器
        else if (selector.includes('.')) {
            const className = selector.replace('.', '');
            const regex = new RegExp(`<[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([^<]*|.*?</[^>]*>)`, 'gi');
            let match;
            while ((match = regex.exec(this.html)) !== null) {
                const content = match[0];
                elements.push({
                    text: () => content.replace(/<[^>]*>/g, '').trim(),
                    attr: (attr) => {
                        const attrRegex = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
                        const attrMatch = content.match(attrRegex);
                        return attrMatch ? attrMatch[1] : undefined;
                    },
                    length: 1
                });
            }
        }
        // 标签选择器
        else {
            const regex = new RegExp(`<${selector}[^>]*>([^<]*|.*?</${selector}>)`, 'gi');
            let match;
            while ((match = regex.exec(this.html)) !== null) {
                const content = match[0];
                elements.push({
                    text: () => content.replace(/<[^>]*>/g, '').trim(),
                    attr: (attr) => {
                        const attrRegex = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
                        const attrMatch = content.match(attrRegex);
                        return attrMatch ? attrMatch[1] : undefined;
                    },
                    length: 1
                });
            }
        }
        return {
            text: () => elements.map(el => el.text()).join(' '),
            attr: (attr) => elements[0]?.attr(attr),
            length: elements.length,
            each: (callback) => {
                elements.forEach((element, index) => callback(index, element));
            },
            find: (innerSelector) => {
                // 简化实现：在第一个元素的内容中继续查找
                if (elements[0]) {
                    const content = elements[0].text();
                    const innerParser = new HtmlParser(content);
                    return innerParser.$(innerSelector);
                }
                return { text: () => '', each: () => { }, length: 0 };
            }
        };
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
exports.HtmlParser = HtmlParser;
/**
 * 创建HTML解析器实例
 */
function createHtmlParser(html) {
    return new HtmlParser(html);
}
//# sourceMappingURL=html-parser.js.map