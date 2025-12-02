/**
 * MCP工具定义配置
 * 统一管理所有工具定义，避免重复
 */
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}
/**
 * IPO3工具配置映射
 * 统一管理工具参数和描述
 */
export declare const IPO3_TOOL_CONFIG: {
    readonly stockCode: {
        readonly type: "string";
        readonly description: "股票代码（6位数字）";
    };
    readonly englishKey: {
        readonly type: "boolean";
        readonly description: "是否返回英文字段名，默认false返回中文字段名";
        readonly default: false;
    };
    readonly page: {
        readonly type: "number";
        readonly description: "页码，默认1";
        readonly default: 1;
        readonly minimum: 1;
    };
    readonly statementType: {
        readonly type: "string";
        readonly enum: readonly ["income", "balance", "cashflow", "analysis"];
        readonly description: "报表类型：income-利润表，balance-资产负债表，cashflow-现金流量表，analysis-财务分析";
    };
    readonly dateType: {
        readonly type: "string";
        readonly enum: readonly ["年报", "中报", "一季报", "三季报"];
        readonly description: "报告期类型，默认年报";
        readonly default: "年报";
    };
};
/**
 * 基础工具定义
 */
export declare const BASIC_TOOLS: ToolDefinition[];
/**
 * IPO3增强工具定义
 */
export declare const IPO3_TOOLS: ToolDefinition[];
/**
 * 所有工具定义
 */
export declare const ALL_TOOLS: ToolDefinition[];
/**
 * 工具名称到方法名的映射
 */
export declare const TOOL_METHOD_MAP: Record<string, string>;
/**
 * 工具显示名称映射
 */
export declare const TOOL_DISPLAY_NAMES: Record<string, string>;
//# sourceMappingURL=toolDefinitions.d.ts.map