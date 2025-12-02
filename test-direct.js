#!/usr/bin/env node

/**
 * 直接测试 MCP 服务器响应
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔧 启动 MCP 服务器进行测试...");

// 启动服务器
const serverProcess = spawn("node", ["dist/index.js"], {
  cwd: path.join(__dirname),
  stdio: ["pipe", "pipe", "inherit"],
});

let responseData = "";
let resolved = false;

serverProcess.on("error", (error) => {
  console.error("❌ 服务器启动失败:", error);
  if (!resolved) {
    resolved = true;
    process.exit(1);
  }
});

serverProcess.on("exit", (code) => {
  console.log(`📋 服务器进程退出，代码: ${code}`);
  if (!resolved) {
    resolved = true;
    process.exit(code || 0);
  }
});

// 监听输出
serverProcess.stdout.on("data", (data) => {
  responseData += data.toString();

  // 尝试解析响应
  const lines = responseData.trim().split("\n");
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      if (response.result) {
        console.log("✅ 收到响应:");
        const result = response.result;

        if (result.content && result.content.length > 0) {
          const content = result.content[0];
          if (content.type === "text") {
            try {
              const data = JSON.parse(content.text);
              console.log("📊 解析结果:");
              console.log(`- 成功: ${data.success}`);

              if (data.success) {
                console.log(`- 数据条数: ${data.count || data.data?.length || 'unknown'}`);
                console.log(`- 工具: ${data.tool}`);
                console.log("- 前3条数据:");
                if (data.data && data.data.length > 0) {
                  data.data.slice(0, 3).forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.item}: ${item.value}`);
                  });
                }
                console.log("\n🎉 测试成功！函数正常工作。");
              } else {
                console.log(`- 错误: ${data.error}`);
                console.log("\n❌ 测试失败，函数返回错误。");
              }
            } catch (parseError) {
              console.log("📄 原始响应:", content.text.substring(0, 200) + "...");
              console.log("\n❌ 无法解析响应 JSON。");
            }
          }
        }

        serverProcess.kill();
        resolved = true;
        process.exit(data.success ? 0 : 1);
        return;
      }
    } catch (e) {
      // 忽略解析错误，继续等待完整响应
    }
  }
});

// 等待服务器启动
setTimeout(() => {
  if (!resolved) {
    console.log("📤 发送测试请求...");

    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "stock_individual_basic_info_xq",
        arguments: {
          symbol: "600246"
        }
      }
    };

    const requestStr = JSON.stringify(request) + "\n";
    serverProcess.stdin.write(requestStr);

    // 设置超时
    setTimeout(() => {
      if (!resolved) {
        console.log("❌ 请求超时");
        serverProcess.kill();
        process.exit(1);
      }
    }, 30000);
  }
}, 2000);