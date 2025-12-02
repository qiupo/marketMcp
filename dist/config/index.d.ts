/**
 * 应用配置
 */
export interface Config {
    dataSources: {
        default: DataSource;
        eastmoney: {
            baseUrl: string;
            timeout: number;
        };
        aktools: {
            baseUrl: string;
            timeout: number;
            enabled: boolean;
        };
    };
    server: {
        name: string;
        version: string;
        port?: number;
    };
    features: {
        enableHistory: boolean;
        enableBasicInfo: boolean;
        enableMarketOverview: boolean;
        enableServiceCheck: boolean;
    };
}
import { DataSource } from '../types';
export declare const defaultConfig: Config;
export declare const envConfig: () => Partial<Config>;
//# sourceMappingURL=index.d.ts.map