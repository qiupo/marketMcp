import { EastMoneyServiceSimple } from './eastmoney-service-simple.js';
import { DataSource } from '../types/stock.js';
/**
 * 股票服务管理器
 * 专用于东方财富网数据源
 */
export class StockService {
    eastMoneyService = new EastMoneyServiceSimple();
    /**
     * 获取股票信息
     * @param params 查询参数
     */
    async getStockInfo(params) {
        const { codes } = params;
        // 直接使用东方财富网数据源
        return this.eastMoneyService.getStockInfo(codes);
    }
    /**
     * 获取单个股票信息
     */
    async getSingleStockInfo(code) {
        return this.getStockInfo({
            codes: [code]
        });
    }
    /**
     * 批量获取股票信息
     */
    async getBatchStockInfo(codes) {
        // 东方财富API支持批量查询，但建议分批处理以提高性能
        const batchSize = 20; // 每批最多20个股票
        const results = [];
        const allErrors = [];
        let finalSource = DataSource.EASTMONEY;
        for (let i = 0; i < codes.length; i += batchSize) {
            const batch = codes.slice(i, i + batchSize);
            const result = await this.eastMoneyService.getStockInfo(batch);
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
     * 搜索股票
     */
    async searchStock(keyword) {
        return this.eastMoneyService.searchStock(keyword);
    }
    /**
     * 获取热门股票
     */
    async getPopularStocks() {
        return this.eastMoneyService.getPopularStocks();
    }
    /**
     * 验证股票代码格式
     */
    validateStockCode(code) {
        return this.eastMoneyService.validateStockCode(code);
    }
    /**
     * 标准化股票代码
     */
    normalizeStockCode(code) {
        return this.eastMoneyService.normalizeStockCode(code);
    }
}
