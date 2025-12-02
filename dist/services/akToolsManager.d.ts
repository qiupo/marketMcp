/**
 * AKTools服务管理器
 * 负责启动、停止和管理AKTools服务的生命周期
 */
export interface AKToolsStatus {
    isRunning: boolean;
    isInstalled: boolean;
    port: number;
    pid?: number;
    startTime?: Date;
    lastCheck: Date;
}
export declare class AKToolsManager {
    private process;
    private status;
    private readonly defaultPort;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(port?: number);
    /**
     * 检测AKTools服务正在运行的实际端口
     */
    private detectAKToolsPort;
    /**
     * 检查AKTools是否已安装
     */
    checkInstallation(): Promise<boolean>;
    /**
     * 检查AKTools服务是否运行
     */
    checkServiceStatus(): Promise<boolean>;
    /**
     * 启动AKTools服务
     */
    start(): Promise<boolean>;
    /**
     * 停止AKTools服务
     */
    stop(): Promise<void>;
    /**
     * 重启AKTools服务
     */
    restart(): Promise<boolean>;
    /**
     * 等待服务启动完成
     */
    private waitForService;
    /**
     * 获取当前状态
     */
    getStatus(): AKToolsStatus;
    /**
     * 获取服务健康信息
     */
    getHealthInfo(): Promise<{
        status: "running" | "stopped" | "unknown";
        uptime?: number;
        pid?: number;
        port: number;
        lastCheck: Date;
        endpoints: string[];
    }>;
    /**
     * 清理资源
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=akToolsManager.d.ts.map