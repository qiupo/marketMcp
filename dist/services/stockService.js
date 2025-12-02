"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const eastmoney_service_simple_js_1 = require("./eastmoney-service-simple.js");
const aktools_service_js_1 = require("./aktools-service.js");
const stock_js_1 = require("../types/stock.js");
/**
 * 股票服务管理器
 * 支持东方财富网和AKTools数据源
 */
class StockService {
    constructor() {
        this.eastMoneyService = new eastmoney_service_simple_js_1.EastMoneyServiceSimple();
        this.aktoolsService = new aktools_service_js_1.AKToolsService();
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
     */
    async getSectorData(sector) {
        return this.aktoolsService.getSectorData(sector);
    }
    /**
     * 检查AKTools服务状态
     */
    async checkAKToolsService() {
        return this.aktoolsService.checkService();
    }
    /**
     * 获取市场概览
     */
    async getMarketOverview(market = 'all') {
        try {
            const sectorData = await this.aktoolsService.getSectorData();
            if (sectorData.success) {
                return {
                    success: true,
                    market,
                    totalCount: sectorData.data.totalCount,
                    totalAmount: sectorData.data.totalAmount,
                    sectorStats: sectorData.data.sectorStats,
                    updateTime: sectorData.data.updateTime
                };
            }
            return {
                success: false,
                error: '无法获取市场数据'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            };
        }
    }
}
exports.StockService = StockService;
//# sourceMappingURL=stockService.js.map