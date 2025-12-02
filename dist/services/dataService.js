"use strict";
/**
 * 数据服务抽象层
 * 统一管理不同数据源的接口调用
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const types_1 = require("../types");
const eastMoneyService_1 = require("./eastMoneyService");
const akToolsService_1 = require("./akToolsService");
const config_1 = require("../config");
/**
 * 数据服务类
 * 负责统一的数据访问接口，支持多种数据源
 */
class DataService {
    constructor() {
        this.config = config_1.defaultConfig;
        this.eastMoneyService = new eastMoneyService_1.EastMoneyService(this.config.dataSources.eastmoney.baseUrl, this.config.dataSources.eastmoney.timeout);
        this.akToolsService = new akToolsService_1.AKToolsService(this.config.dataSources.aktools.baseUrl, this.config.dataSources.aktools.timeout, this.config.dataSources.aktools.enabled);
    }
    /**
     * 获取股票实时行情
     */
    async getStockRealtime(codes, dataSource = this.config.dataSources.default) {
        try {
            switch (dataSource) {
                case types_1.DataSource.AKTOOLS:
                    if (!this.isAKToolsAvailable()) {
                        console.warn('AKTools服务不可用，回退到东方财富');
                        return await this.eastMoneyService.getStockRealtime(codes);
                    }
                    return await this.akToolsService.getStockRealtime(codes);
                case types_1.DataSource.EASTMONEY:
                default:
                    return await this.eastMoneyService.getStockRealtime(codes);
            }
        }
        catch (error) {
            console.error(`获取实时行情失败:`, error);
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '未知错误'],
                source: dataSource
            };
        }
    }
    /**
     * 获取股票历史数据
     */
    async getStockHistory(codes, options, dataSource = this.config.dataSources.default) {
        try {
            switch (dataSource) {
                case types_1.DataSource.AKTOOLS:
                    if (!this.isAKToolsAvailable()) {
                        console.warn('AKTools服务不可用，回退到东方财富');
                        return await this.eastMoneyService.getStockHistory(codes, options.period || 'daily', options.startDate, options.endDate, options.adjust || '');
                    }
                    return await this.akToolsService.getStockHistory(codes, options.period || 'daily', options.startDate, options.endDate, options.adjust || '');
                case types_1.DataSource.EASTMONEY:
                default:
                    return await this.eastMoneyService.getStockHistory(codes, options.period || 'daily', options.startDate, options.endDate, options.adjust || '');
            }
        }
        catch (error) {
            console.error(`获取历史数据失败:`, error);
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '未知错误'],
                source: dataSource
            };
        }
    }
    /**
     * 获取股票基本信息
     */
    async getStockBasicInfo(codes, dataSource = this.config.dataSources.default) {
        try {
            switch (dataSource) {
                case types_1.DataSource.AKTOOLS:
                    if (!this.isAKToolsAvailable()) {
                        console.warn('AKTools服务不可用，回退到东方财富');
                        return await this.eastMoneyService.getStockBasicInfo(codes);
                    }
                    return await this.akToolsService.getStockBasicInfo(codes);
                case types_1.DataSource.EASTMONEY:
                default:
                    return await this.eastMoneyService.getStockBasicInfo(codes);
            }
        }
        catch (error) {
            console.error(`获取基本信息失败:`, error);
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '未知错误'],
                source: dataSource
            };
        }
    }
    /**
     * 获取市场概览
     */
    async getMarketOverview(options = {}, dataSource = this.config.dataSources.default) {
        try {
            switch (dataSource) {
                case types_1.DataSource.AKTOOLS:
                    if (!this.isAKToolsAvailable()) {
                        console.warn('AKTools服务不可用，回退到东方财富');
                        return await this.eastMoneyService.getMarketOverview(options);
                    }
                    return await this.akToolsService.getMarketOverview(options);
                case types_1.DataSource.EASTMONEY:
                default:
                    return await this.eastMoneyService.getMarketOverview(options);
            }
        }
        catch (error) {
            console.error(`获取市场概览失败:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '未知错误',
                source: dataSource
            };
        }
    }
    /**
     * 检查服务状态
     */
    async checkServices() {
        const [eastmoneyStatus, aktoolsStatus] = await Promise.allSettled([
            this.eastMoneyService.checkService(),
            this.akToolsService.checkService()
        ]);
        return {
            eastmoney: eastmoneyStatus.status === 'fulfilled',
            aktools: aktoolsStatus.status === 'fulfilled' && this.config.dataSources.aktools.enabled,
            auto: this.determineBestDataSource(),
            recommended: this.determineRecommendedDataSource()
        };
    }
    /**
     * 自动选择最佳数据源
     */
    determineBestDataSource() {
        if (this.isAKToolsAvailable() && this.config.dataSources.aktools.enabled) {
            return types_1.DataSource.AKTOOLS;
        }
        return types_1.DataSource.EASTMONEY;
    }
    /**
     * 确定推荐的数据源
     */
    determineRecommendedDataSource() {
        // AKTools功能更丰富，如果可用则推荐使用
        if (this.isAKToolsAvailable() && this.config.dataSources.aktools.enabled) {
            return types_1.DataSource.AKTOOLS;
        }
        // 东方财富网稳定可靠，作为备选
        return types_1.DataSource.EASTMONEY;
    }
    /**
     * 检查AKTools是否可用
     */
    isAKToolsAvailable() {
        return this.config.dataSources.aktools.enabled;
    }
    /**
     * 格式化股票数据为统一格式
     */
    formatStockData(data, source) {
        if (!Array.isArray(data)) {
            return [];
        }
        return data.map(item => {
            // 统一字段名处理
            const code = item.代码 || item.code || item.f12 || '';
            const name = item.名称 || item.name || item.f14 || '';
            const price = parseFloat(item.最新价 || item.price || item.f2 || 0);
            const change = parseFloat(item.涨跌额 || item.change || item.f4 || 0);
            const changePercent = item.涨跌幅 || item.changePercent || item.f3 || 0;
            return {
                code,
                name,
                price,
                change,
                changePercent: typeof changePercent === 'string' ? changePercent : `${changePercent}%`,
                industry: item.行业 || item.industry || '',
                volume: item.成交量 || item.volume || '0',
                amount: item.成交额 || item.amount || '0',
                market: this.getMarketFromCode(code),
                timestamp: Date.now()
            };
        });
    }
    /**
     * 根据股票代码判断市场
     */
    getMarketFromCode(code) {
        const cleanCode = code.replace(/^(sh|sz|bj)/i, '').replace(/^\d+/, '');
        if (code.startsWith('6') || code.startsWith('9')) {
            return 'sh'; // 上海证券交易所
        }
        else if (code.startsWith('0') || code.startsWith('2') || code.startsWith('3')) {
            return 'sz'; // 深圳证券交易所
        }
        else if (code.startsWith('4') || code.startsWith('8')) {
            return 'bj'; // 北京证券交易所
        }
        else {
            return 'sh'; // 默认上海证券交易所
        }
    }
    /**
     * 处理股票代码数组
     */
    normalizeCodes(codes) {
        if (typeof codes === 'string') {
            return codes.split(/[,，\s]+/).filter(code => code.trim());
        }
        else if (Array.isArray(codes)) {
            return codes;
        }
        else {
            return [];
        }
    }
}
exports.DataService = DataService;
//# sourceMappingURL=dataService.js.map