"use strict";
/**
 * 应用配置
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = exports.defaultConfig = void 0;
const types_1 = require("../types");
exports.defaultConfig = {
    dataSources: {
        default: types_1.DataSource.EASTMONEY,
        eastmoney: {
            baseUrl: 'https://push2.eastmoney.com/api/qt/ulist.np/get',
            timeout: 10000
        },
        aktools: {
            baseUrl: 'http://127.0.0.1:8080/api/public/',
            timeout: 15000,
            enabled: true // 需要手动启动AKTools服务
        }
    },
    server: {
        name: 'market-mcp-enhanced',
        version: '3.0.0'
    },
    features: {
        enableHistory: true,
        enableBasicInfo: true,
        enableMarketOverview: true,
        enableServiceCheck: true
    }
};
// 环境变量配置
const envConfig = () => ({
    dataSources: {
        default: types_1.DataSource.EASTMONEY,
        eastmoney: {
            baseUrl: process.env.EASTMONEY_BASE_URL || 'https://push2.eastmoney.com/api/qt/ulist.np/get',
            timeout: parseInt(process.env.EASTMONEY_TIMEOUT || '10000')
        },
        aktools: {
            baseUrl: process.env.AKTOOLS_BASE_URL || 'http://127.0.0.1:8080/api/public/',
            timeout: parseInt(process.env.AKTOOLS_TIMEOUT || '15000'),
            enabled: process.env.AKTOOLS_ENABLED === 'true'
        }
    }
});
exports.envConfig = envConfig;
//# sourceMappingURL=index.js.map