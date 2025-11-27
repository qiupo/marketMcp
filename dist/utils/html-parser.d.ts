/**
 * HTML解析工具类
 * 使用Cheerio提供CSS选择器解析功能
 */
export declare class HtmlParser {
    $: any;
    constructor(html: string);
    /**
     * 提取文本内容
     */
    text(selector: string): string;
    /**
     * 提取属性值
     */
    attr(selector: string, attribute: string): string | undefined;
    /**
     * 检查元素是否存在
     */
    exists(selector: string): boolean;
    /**
     * 获取元素数量
     */
    count(selector: string): number;
    /**
     * 提取表格数据
     * 将表格转换为对象数组
     */
    tableToJson(tableSelector: string): Record<string, string>[];
    /**
     * 提取表格数据为键值对
     */
    tableToKeyValue(tableSelector: string): Record<string, string>;
    /**
     * 提取数字（去除格式化字符）
     */
    extractNumber(text: string): number;
    /**
     * 提取百分比数值
     */
    extractPercentage(text: string): number;
    /**
     * 清理和规范化文本
     */
    cleanText(text: string): string;
}
/**
 * 创建HTML解析器实例
 */
export declare function createHtmlParser(html: string): HtmlParser;
