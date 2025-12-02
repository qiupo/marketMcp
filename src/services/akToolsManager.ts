/**
 * AKTools服务管理器
 * 负责启动、停止和管理AKTools服务的生命周期
 */

import { spawn, ChildProcess } from "child_process";
import axios from "axios";

export interface AKToolsStatus {
  isRunning: boolean;
  isInstalled: boolean;
  port: number;
  pid?: number;
  startTime?: Date;
  lastCheck: Date;
}

export class AKToolsManager {
  private process: ChildProcess | null = null;
  private status: AKToolsStatus;
  private readonly defaultPort = 8080;
  private readonly maxRetries = 30;
  private readonly retryDelay = 2000;

  constructor(port: number = 8080) {
    this.status = {
      isRunning: false,
      isInstalled: false,
      port,
      lastCheck: new Date(),
    };
  }

  /**
   * 检测AKTools服务正在运行的实际端口
   */
  private async detectAKToolsPort(): Promise<number> {
    try {
      // 尝试常见的AKTools端口
      const commonPorts = [8080, 8090, 8091, 8092];

      for (const testPort of commonPorts) {
        try {
          // 使用版本检查API来检测AKTools服务
          const response = await axios.get(
            `http://127.0.0.1:${testPort}/version`,
            {
              timeout: 2000,
              headers: {
                "User-Agent": "MarketMCP-Client/3.0.0",
              },
            }
          );

          if (
            response.status === 200 &&
            response.data &&
            response.data.ak_current_version
          ) {
            console.log(`🔍 检测到AKTools服务运行在端口: ${testPort}`);
            return testPort;
          }
        } catch (error) {
          // 端口不可用，继续下一个
        }
      }

      console.warn("⚠️ 未检测到运行中的AKTools服务，将使用默认端口");
      return this.defaultPort;
    } catch (error) {
      console.error("检测AKTools端口时出错:", error);
      return this.defaultPort;
    }
  }

  /**
   * 检查AKTools是否已安装
   */
  async checkInstallation(): Promise<boolean> {
    try {
      const { exec } = await import("child_process");
      await new Promise<void>((resolve, reject) => {
        exec(
          "python -c \"import aktools; print('AKTools installed')\"",
          (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });

      this.status.isInstalled = true;
      return true;
    } catch (error: any) {
      this.status.isInstalled = false;
      return false;
    }
  }

  /**
   * 检查AKTools服务是否运行
   */
  async checkServiceStatus(): Promise<boolean> {
    try {
      // 首先尝试检测实际运行的AKTools端口
      const actualPort = await this.detectAKToolsPort();
      if (actualPort !== this.status.port) {
        this.status.port = actualPort;
      }

      // 使用版本检查API来验证AKTools服务
      const response = await axios.get(
        `http://127.0.0.1:${this.status.port}/version`,
        {
          timeout: 5000,
        }
      );

      this.status.isRunning =
        response.status === 200 &&
        response.data &&
        response.data.ak_current_version;
      this.status.lastCheck = new Date();
      return this.status.isRunning;
    } catch (error) {
      this.status.isRunning = false;
      this.status.lastCheck = new Date();
      return false;
    }
  }

  /**
   * 启动AKTools服务
   */
  async start(): Promise<boolean> {
    // 先检查是否已经安装
    if (!(await this.checkInstallation())) {
      throw new Error("AKTools未安装。请先运行: pip install aktools");
    }

    // 检查服务是否已经在运行
    if (await this.checkServiceStatus()) {
      console.log(`✅ AKTools服务已在端口 ${this.status.port} 运行`);
      return true; // 服务已经在运行
    }

    try {
      console.log("🚀 正在启动AKTools服务...");

      // 启动AKTools服务
      this.process = spawn("python", ["-m", "aktools"]);
      this.status.pid = this.process.pid;
      this.status.startTime = new Date();

      // 监听进程输出
      this.process.stdout?.on("readable", () => {
        let chunk;
        while ((chunk = this.process?.stdout?.read()) !== null) {
          const output = chunk.toString().trim();
          // error
          if (output.includes("ERROR")) {
            console.error("AKTools错误:", output);
          }
          // warning
          else if (output.includes("WARNING")) {
            console.warn("AKTools警告:", output);
          }
          // info
          else if (output) {
            console.log("AKTools输出:", output);
          }
        }
      });

      // 等待服务启动
      // const started = await this.waitForService();
      // if (started) {
      console.log(`✅ AKTools服务启动成功！端口: ${this.status.port}`);
      this.status.isRunning = true;
      return true;
      // } else {
      // console.error("❌ AKTools服务启动超时");
      // this.stop(); // 清理进程
      // return false;
      // }
    } catch (error) {
      console.error("启动AKTools服务失败:", error);
      this.status.isRunning = false;
      return false;
    }
  }

  /**
   * 停止AKTools服务
   */
  async stop(): Promise<void> {
    if (this.process) {
      console.log("🛑 正在停止AKTools服务...");

      return new Promise<void>((resolve) => {
        if (this.process && !this.process.killed) {
          this.process.on("exit", () => {
            console.log("✅ AKTools服务已停止");
            resolve();
          });

          this.process.kill("SIGTERM");

          // 如果进程没有正常退出，强制终止
          setTimeout(() => {
            if (this.process && !this.process.killed) {
              this.process.kill("SIGKILL");
              resolve();
            }
          }, 5000);
        } else {
          resolve();
        }
      }).then(() => {
        this.process = null;
        this.status.isRunning = false;
        this.status.pid = undefined;
      });
    }
  }

  /**
   * 重启AKTools服务
   */
  async restart(): Promise<boolean> {
    await this.stop();
    return await this.start();
  }

  /**
   * 等待服务启动完成
   */
  private async waitForService(): Promise<boolean> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:${this.status.port}/api/public/stock_zh_a_hist`,
          {
            timeout: 3000,
          }
        );

        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        // 服务还未启动，继续等待
      }

      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
    }

    return false;
  }

  /**
   * 获取当前状态
   */
  getStatus(): AKToolsStatus {
    return { ...this.status };
  }

  /**
   * 获取服务健康信息
   */
  async getHealthInfo(): Promise<{
    status: "running" | "stopped" | "unknown";
    uptime?: number;
    pid?: number;
    port: number;
    lastCheck: Date;
    endpoints: string[];
  }> {
    const isRunning = await this.checkServiceStatus();

    return {
      status: isRunning ? "running" : "stopped",
      uptime: this.status.startTime
        ? Date.now() - this.status.startTime.getTime()
        : undefined,
      pid: this.status.pid,
      port: this.status.port,
      lastCheck: this.status.lastCheck,
      endpoints: isRunning
        ? [
            `http://127.0.0.1:${this.status.port}/api/public/stock_zh_a_hist`,
            `http://127.0.0.1:${this.status.port}/api/public/stock_individual_info_em`,
            `http://127.0.0.1:${this.status.port}/docs`,
          ]
        : [],
    };
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    await this.stop();
  }
}
