/**
 * AKTools服务管理器
 * 负责启动、停止和管理AKTools服务的生命周期
 */

import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';

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
      lastCheck: new Date()
    };
  }

  /**
   * 检查AKTools是否已安装
   */
  async checkInstallation(): Promise<boolean> {
    try {
      const { exec } = await import('child_process');
      await new Promise<void>((resolve, reject) => {
        exec('python -c "import aktools; print(\'AKTools installed\')"', (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      this.status.isInstalled = true;
      return true;
    } catch (error) {
      this.status.isInstalled = false;
      return false;
    }
  }

  /**
   * 检查AKTools服务是否运行
   */
  async checkServiceStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`http://127.0.0.1:${this.status.port}/api/public/stock_zh_a_spot_em`, {
        timeout: 5000
      });

      this.status.isRunning = response.status === 200;
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
    if (!await this.checkInstallation()) {
      throw new Error('AKTools未安装。请先运行: pip install aktools');
    }

    // 检查服务是否已经在运行
    if (await this.checkServiceStatus()) {
      return true; // 服务已经在运行
    }

    try {
      console.log('🚀 正在启动AKTools服务...');

      // 启动AKTools服务
      this.process = spawn('python', ['-m', 'aktools'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, AKTOOLS_PORT: this.status.port.toString() }
      });

      this.status.pid = this.process.pid;
      this.status.startTime = new Date();

      // 监听进程输出
      this.process.on('error', (error) => {
        console.error('AKTools进程错误:', error.message);
        this.status.isRunning = false;
      });

      this.process.stderr?.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('WARNING') && !output.includes('INFO')) {
          console.error('AKTools错误:', output);
        }
      });

      // 等待服务启动
      const started = await this.waitForService();
      if (started) {
        console.log(`✅ AKTools服务启动成功！端口: ${this.status.port}`);
        this.status.isRunning = true;
        return true;
      } else {
        console.error('❌ AKTools服务启动超时');
        this.stop(); // 清理进程
        return false;
      }

    } catch (error) {
      console.error('启动AKTools服务失败:', error);
      this.status.isRunning = false;
      return false;
    }
  }

  /**
   * 停止AKTools服务
   */
  async stop(): Promise<void> {
    if (this.process) {
      console.log('🛑 正在停止AKTools服务...');

      return new Promise<void>((resolve) => {
        if (this.process && !this.process.killed) {
          this.process.on('exit', () => {
            console.log('✅ AKTools服务已停止');
            resolve();
          });

          this.process.kill('SIGTERM');

          // 如果进程没有正常退出，强制终止
          setTimeout(() => {
            if (this.process && !this.process.killed) {
              this.process.kill('SIGKILL');
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
        const response = await axios.get(`http://127.0.0.1:${this.status.port}/api/public/stock_zh_a_spot_em`, {
          timeout: 3000
        });

        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        // 服务还未启动，继续等待
      }

      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
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
    status: 'running' | 'stopped' | 'unknown';
    uptime?: number;
    pid?: number;
    port: number;
    lastCheck: Date;
    endpoints: string[];
  }> {
    const isRunning = await this.checkServiceStatus();

    return {
      status: isRunning ? 'running' : 'stopped',
      uptime: this.status.startTime ? Date.now() - this.status.startTime.getTime() : undefined,
      pid: this.status.pid,
      port: this.status.port,
      lastCheck: this.status.lastCheck,
      endpoints: isRunning ? [
        `http://127.0.0.1:${this.status.port}/api/public/stock_zh_a_spot_em`,
        `http://127.0.0.1:${this.status.port}/api/public/stock_zh_a_hist`,
        `http://127.0.0.1:${this.status.port}/api/public/stock_individual_info_em`,
        `http://127.0.0.1:${this.status.port}/docs`
      ] : []
    };
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    await this.stop();
  }
}