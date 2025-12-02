#!/usr/bin/env node

/**
 * AKTools启动脚本
 * 检查AKTools是否已安装并可启动
 */

const { spawn } = require('child_process');
const { exec } = require('child_process');

async function checkAKToolsInstallation() {
  console.log('🔍 检查AKTools安装状态...');

  try {
    // 检查aktools是否已安装
    await new Promise((resolve, reject) => {
      exec('python -c "import aktools; print(\'AKTools installed\')"', (error, stdout, stderr) => {
        if (error) {
          reject(new Error('AKTools未安装'));
        } else {
          resolve(stdout.trim());
        }
      });
    });

    console.log('✅ AKTools已安装');
    return true;
  } catch (error) {
    console.log('❌ AKTools未安装');
    console.log('\n📦 安装AKTools:');
    console.log('pip install aktools');
    return false;
  }
}

async function startAKToolsService() {
  console.log('\n🚀 启动AKTools服务...');

  const aktoolsProcess = spawn('python', ['-m', 'aktools'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  aktoolsProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log('AKTools:', output);
    }
  });

  aktoolsProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.error('AKTools Error:', output);
    }
  });

  aktoolsProcess.on('close', (code) => {
    if (code === 0) {
      console.log('AKTools服务正常退出');
    } else {
      console.error(`AKTools服务异常退出，代码: ${code}`);
    }
  });

  aktoolsProcess.on('error', (error) => {
    console.error('启动AKTools服务失败:', error.message);
  });

  // 等待一段时间检查服务是否启动成功
  setTimeout(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/public/stock_zh_a_spot_em');
      if (response.ok) {
        console.log('✅ AKTools服务启动成功！');
        console.log('🌐 服务地址: http://127.0.0.1:8080');
        console.log('📚 API文档: http://127.0.0.1:8080/docs');
      } else {
        console.log('❌ AKTools服务启动失败');
      }
    } catch (error) {
      console.log('❌ 无法连接到AKTools服务:', error.message);
    }
  }, 3000);

  return aktoolsProcess;
}

async function main() {
  console.log('🔧 MarketMCP - AKTools集成工具\n');

  const isInstalled = await checkAKToolsInstallation();

  if (isInstalled) {
    const process = await startAKToolsService();

    // 处理优雅退出
    process.on('SIGINT', () => {
      console.log('\n🛑 正在关闭AKTools服务...');
      process.kill('SIGTERM');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 正在关闭AKTools服务...');
      process.kill('SIGTERM');
    });

    // 保持进程运行
    await new Promise(() => {});
  } else {
    console.log('\n💡 提示:');
    console.log('1. 确保已安装Python 3.7+');
    console.log('2. 运行: pip install aktools');
    console.log('3. 重新运行此脚本');
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

main().catch(console.error);