"use strict";
/**
 * AKTools服务
 * 基于AKTools HTTP API获取AkShare数据
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AKToolsService = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
/**
 * AKTools服务类
 */
class AKToolsService {
    constructor(baseUrl = 'http://127.0.0.1:8080/api/public/', timeout = 15000, enabled = true) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
        this.enabled = enabled;
    }
    /**
     * 检查AKTools服务是否可用
     */
    async checkService() {
        if (!this.enabled) {
            return false;
        }
        try {
            // 使用 stock_individual_info_em 接口来检测服务可用性
            const response = await axios_1.default.get(`${this.baseUrl}stock_individual_info_em`, {
                params: { symbol: '000001' }, // 使用平安银行作为测试
                headers: {
                    'User-Agent': 'MarketMCP-Client/3.0.0'
                },
                timeout: 5000
            });
            return response.status === 200 && Array.isArray(response.data);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * 获取股票实时行情数据
     * 注意：由于 stock_zh_a_spot_em 接口无法使用，此方法暂时禁用
     */
    async getStockRealtime(codes) {
        return {
            success: false,
            data: [],
            errors: ['实时行情接口 stock_zh_a_spot_em 暂时无法使用，请使用其他数据源'],
            source: types_1.DataSource.AKTOOLS
        };
    }
    /**
     * 获取股票历史数据
     */
    async getStockHistory(codes, period = 'daily', startDate, endDate, adjust = '') {
        if (!this.enabled) {
            return {
                success: false,
                data: [],
                errors: ['AKTools服务未启用或不可用'],
                source: types_1.DataSource.AKTOOLS
            };
        }
        try {
            const results = [];
            const allErrors = [];
            for (const code of codes) {
                try {
                    const response = await axios_1.default.get(`${this.baseUrl}stock_zh_a_hist`, {
                        params: {
                            symbol: code,
                            period,
                            start_date: startDate,
                            end_date: endDate,
                            adjust
                        },
                        headers: {
                            'User-Agent': 'MarketMCP-Client/3.0.0'
                        },
                        timeout: this.timeout
                    });
                    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                        // 取最新的历史数据点作为当前数据
                        const latestData = response.data[response.data.length - 1];
                        const stockInfo = {
                            code: code,
                            name: latestData['股票代码'] || code,
                            price: parseFloat(latestData['收盘']) || 0,
                            change: parseFloat(latestData['涨跌额']) || 0,
                            changePercent: latestData['涨跌幅'] ? `${latestData['涨跌幅']}` : '0.00%',
                            open: parseFloat(latestData['开盘']) || 0,
                            high: parseFloat(latestData['最高']) || 0,
                            low: parseFloat(latestData['最低']) || 0,
                            volume: this.formatVolume(latestData['成交量'] || 0),
                            amount: this.formatAmount(latestData['成交额'] || 0),
                            market: this.getMarketFromCode(code),
                            timestamp: Date.now()
                        };
                        results.push(stockInfo);
                    }
                }
                catch (codeError) {
                    allErrors.push(`${code}: ${codeError instanceof Error ? codeError.message : '查询失败'}`);
                }
            }
            return {
                success: results.length > 0,
                data: results,
                errors: allErrors.length > 0 ? allErrors : undefined,
                source: types_1.DataSource.AKTOOLS
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '历史数据查询失败'],
                source: types_1.DataSource.AKTOOLS
            };
        }
    }
    /**
     * 获取股票基本信息
     */
    async getStockBasicInfo(codes) {
        if (!this.enabled) {
            return {
                success: false,
                data: [],
                errors: ['AKTools服务未启用或不可用'],
                source: types_1.DataSource.AKTOOLS
            };
        }
        try {
            const results = [];
            const allErrors = [];
            for (const code of codes) {
                try {
                    const response = await axios_1.default.get(`${this.baseUrl}stock_individual_info_em`, {
                        params: { symbol: code },
                        headers: {
                            'User-Agent': 'MarketMCP-Client/3.0.0'
                        },
                        timeout: this.timeout
                    });
                    if (response.data && Array.isArray(response.data)) {
                        const infoData = response.data;
                        let price = 0;
                        let name = '';
                        let industry = '';
                        let totalMarketValue = '';
                        let circulatingMarketValue = '';
                        let peRatio = '';
                        let pbRatio = '';
                        // 解析基本信息
                        for (const item of infoData) {
                            if (item['item'] === '最新') {
                                price = parseFloat(item['value']) || 0;
                            }
                            if (item['item'] === '股票简称') {
                                name = item['value'] || '';
                            }
                            if (item['item'] === '所属行业') {
                                industry = item['value'] || '';
                            }
                            if (item['item'] === '总市值') {
                                totalMarketValue = item['value'] || '';
                            }
                            if (item['item'] === '流通市值') {
                                circulatingMarketValue = item['value'] || '';
                            }
                            if (item['item'] === '市盈率-动态') {
                                peRatio = item['value'] || '';
                            }
                            if (item['item'] === '市净率') {
                                pbRatio = item['value'] || '';
                            }
                        }
                        const stockInfo = {
                            code: code,
                            name: name,
                            price: price,
                            change: 0,
                            changePercent: '0.00%',
                            industry,
                            volume: '0',
                            amount: '0',
                            totalMarketValue,
                            circulatingMarketValue,
                            peRatio,
                            pbRatio,
                            market: this.getMarketFromCode(code),
                            timestamp: Date.now()
                        };
                        results.push(stockInfo);
                    }
                }
                catch (codeError) {
                    allErrors.push(`${code}: ${codeError instanceof Error ? codeError.message : '基本信息查询失败'}`);
                }
            }
            return {
                success: results.length > 0,
                data: results,
                errors: allErrors.length > 0 ? allErrors : undefined,
                source: types_1.DataSource.AKTOOLS
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                errors: [error instanceof Error ? error.message : '基本信息查询失败'],
                source: types_1.DataSource.AKTOOLS
            };
        }
    }
    /**
     * 获取市场概览
     * 注意：由于 stock_zh_a_spot_em 接口无法使用，此方法暂时禁用
     */
    async getMarketOverview(options = {}) {
        return {
            success: false,
            error: '市场概览接口 stock_zh_a_spot_em 暂时无法使用，请使用其他数据源',
            source: types_1.DataSource.AKTOOLS
        };
    }
    /**
     * 根据股票代码判断市场
     */
    getMarketFromCode(code) {
        const cleanCode = code.replace(/^(sh|sz|bj)/i, '');
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
     * 格式化成交量
     */
    formatVolume(volume) {
        const num = typeof volume === 'number' ? volume : parseFloat(volume) || 0;
        if (num >= 100000000) {
            return (num / 100000000).toFixed(2) + '亿手';
        }
        else if (num >= 10000) {
            return (num / 10000).toFixed(2) + '万手';
        }
        else {
            return num.toString();
        }
    }
    /**
     * 格式化成交额
     */
    formatAmount(amount) {
        const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        if (num >= 100000000) {
            return (num / 100000000).toFixed(2) + '亿元';
        }
        else if (num >= 10000) {
            return (num / 10000).toFixed(2) + '万元';
        }
        else {
            return num.toFixed(2) + '元';
        }
    }
}
exports.AKToolsService = AKToolsService;
//# sourceMappingURL=akToolsService.js.map