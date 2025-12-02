#!/usr/bin/env node
/**
 * 测试 realtime_quote 函数修复
 */

import { PythonShell } from "python-shell";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PYTHON_SERVICE_PATH = path.join(__dirname, "akshare_service.py");

async function testRealtimeQuote() {
    console.log("开始测试 realtime_quote 函数...");

    try {
        // 检查 Python 服务文件是否存在
        if (!fs.existsSync(PYTHON_SERVICE_PATH)) {
            console.error("❌ Python 服务文件不存在");
            return;
        }

        const args = {
            function: "realtime_quote",
            params: { symbol: "600246" }
        };

        const result = await new Promise((resolve, reject) => {
            const options = {
                mode: "json",
                pythonOptions: ["-u"],
                args: [JSON.stringify(args)],
            };

            const pyshell = new PythonShell(PYTHON_SERVICE_PATH, options);

            let result = null;
            pyshell.on("message", (message) => {
                result = message;
            });

            pyshell.on("error", (err) => {
                reject(new Error(`Python服务调用失败: ${err.message}`));
            });

            pyshell.on("close", (code) => {
                if (code === 0 && result) {
                    resolve(result);
                } else {
                    reject(new Error("Python服务执行失败"));
                }
            });
        });

        console.log("✓ realtime_quote 调用成功！");
        console.log("结果类型:", typeof result);
        console.log("结果预览:", JSON.stringify(result, null, 2).substring(0, 1000) + "...");

        // 检查结果结构
        if (result && result.success === true && result.data && Array.isArray(result.data)) {
            console.log("✓ 返回了数组格式的数据");
            console.log(`✓ 数据条数: ${result.data.length}`);

            if (result.data.length > 0) {
                const firstItem = result.data[0];
                console.log("✓ 第一条数据字段:", Object.keys(firstItem));
                console.log("✓ 第一条数据样本:", JSON.stringify(firstItem, null, 2));
            }

            // 检查是否包含常见的股票数据字段
            const commonFields = ['代码', '名称', '最新价', '涨跌幅', '成交量'];
            const firstItemFields = Object.keys(result.data[0]);
            const hasCommonFields = commonFields.some(field =>
                firstItemFields.some(itemField =>
                    itemField.includes(field) || field.includes(itemField)
                )
            );

            if (hasCommonFields) {
                console.log("✓ 数据包含常见的股票字段");
            }
        } else {
            console.log("⚠ 数据格式可能不符合预期");
            console.log("success:", result?.success);
            console.log("data type:", typeof result?.data);
        }

    } catch (error) {
        console.error("❌ realtime_quote 调用失败:", error.message);
    }
}

testRealtimeQuote();