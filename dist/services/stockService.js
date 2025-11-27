import { IPO3Service } from './ipo3-service.js';
import { DataSource } from '../types/stock.js';
/**
 * 股票服务管理器
 * 使用IPO3.com作为主要数据源
 */
export class StockService {
    ipo3Service = new IPO3Service();
    /**
     * 获取股票信息
     * @param params 查询参数
     */
    async getStockInfo(params) {
        const { codes, dataSource } = params;
        if (dataSource) {
            // 指定数据源
            return this.getFromSpecificSource(codes, dataSource);
        }
        else {
            // 使用默认数据源
            return this.getFromSpecificSource(codes, DataSource.IPO3);
        }
    }
    /**
     * 从指定数据源获取数据
     */
    async getFromSpecificSource(codes, dataSource) {
        switch (dataSource) {
            case DataSource.IPO3:
                return this.ipo3Service.getStockInfo(codes);
            default:
                return this.getFromSpecificSource(codes, DataSource.IPO3);
        }
    }
    /**
     * 获取单个股票信息
     */
    async getSingleStockInfo(code, dataSource) {
        return this.getStockInfo({
            codes: [code],
            dataSource
        });
    }
    /**
     * 批量获取股票信息
     */
    async getBatchStockInfo(codes, dataSource) {
        // IPO3 API建议批量查询，但每批数量不宜过多
        const batchSize = 10; // 每批最多10个股票
        const results = [];
        const allErrors = [];
        let finalSource = DataSource.IPO3;
        for (let i = 0; i < codes.length; i += batchSize) {
            const batch = codes.slice(i, i + batchSize);
            const result = await this.getStockInfo({
                codes: batch,
                dataSource
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
     * 搜索股票
     */
    async searchStock(keyword) {
        return this.ipo3Service.searchStock(keyword);
    }
    /**
     * 获取热门股票
     */
    async getPopularStocks() {
        return this.ipo3Service.getPopularStocks();
    }
    /**
     * 验证股票代码格式
     */
    validateStockCode(code) {
        const cleanCode = code.replace(/^(sh|sz|bj)/i, '');
        return /^[0-9]{6}$/.test(cleanCode);
    }
    /**
     * 标准化股票代码
     */
    normalizeStockCode(code) {
        // 去除市场前缀，只保留6位数字
        return code.replace(/^(sh|sz|bj)/i, '');
    }
}
