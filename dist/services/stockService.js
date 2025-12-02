"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const eastmoney_service_simple_js_1 = require("./eastmoney-service-simple.js");
const akToolsService_js_1 = require("./akToolsService.js");
const stock_js_1 = require("../types/stock.js");
/**
 * 股票服务管理器
 * 支持东方财富网和AKTools数据源
 */
class StockService {
    constructor() {
        this.eastMoneyService = new eastmoney_service_simple_js_1.EastMoneyServiceSimple();
        this.aktoolsService = new akToolsService_js_1.AKToolsService();
    }
    /**
     * 获取股票信息
     * @param params 查询参数
     */
    async getStockInfo(params) {
        const { codes, dataSource = stock_js_1.DataSource.EASTMONEY } = params;
        // 根据数据源选择服务
        switch (dataSource) {
            case 'aktools':
                return this.aktoolsService.getStockRealtime(codes);
            case 'eastmoney':
            default:
                return this.eastMoneyService.getStockInfo(codes);
        }
    }
    /**
     * 获取单个股票信息
     */
    async getSingleStockInfo(code, dataSource = 'eastmoney') {
        return this.getStockInfo({
            codes: [code],
            dataSource: dataSource
        });
    }
    /**
     * 批量获取股票信息
     */
    async getBatchStockInfo(codes, dataSource = 'eastmoney') {
        if (dataSource === 'aktools') {
            return this.aktoolsService.getStockRealtime(codes);
        }
        // 东方财富API支持批量查询，但建议分批处理以提高性能
        const batchSize = 20; // 每批最多20个股票
        const results = [];
        const allErrors = [];
        let finalSource = dataSource;
        for (let i = 0; i < codes.length; i += batchSize) {
            const batch = codes.slice(i, i + batchSize);
            const result = await this.getStockInfo({
                codes: batch,
                dataSource: dataSource
            });
            if (result.success) {
                results.push(...result.data);
                finalSource = result.source;
            }
            if (result.errors) {
                allErrors.push(...result.errors);
            }
        }
        return {
            success: results.length > 0,
            data: results,
            errors: allErrors.length > 0 ? allErrors : undefined,
            source: finalSource
        };
    }
    /**
     * 获取股票历史数据
     */
    async getStockHistory(codes, period = 'daily', startDate, endDate, adjust = '') {
        return this.aktoolsService.getStockHistory(codes, period, startDate, endDate, adjust);
    }
    /**
     * 获取股票基本信息
     */
    async getStockBasicInfo(codes) {
        return this.aktoolsService.getStockBasicInfo(codes);
    }
    /**
     * 获取行业板块数据
     * 注意：由于 stock_zh_a_spot_em 接口无法使用，此方法暂时禁用
     */
    async getSectorData(sector) {
        return {
            success: false,
            error: '行业板块数据接口暂时无法使用，请使用其他数据源',
            source: 'aktools'
        };
    }
    /**
     * 检查AKTools服务状态
     */
    async checkAKToolsService() {
        return this.aktoolsService.checkService();
    }
    /**
     * 获取市场概览
     * 注意：由于 stock_zh_a_spot_em 接口无法使用，此方法暂时禁用
     */
    async getMarketOverview(market = 'all') {
        return {
            success: false,
            error: '市场概览接口暂时无法使用，请使用其他数据源',
            market,
            source: 'aktools'
        };
    }
}
exports.StockService = StockService;
//# sourceMappingURL=stockService.js.map