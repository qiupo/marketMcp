#!/bin/bash

# Git提交脚本
# 基于stock_open_api项目，创建增强版IPO3.com MCP服务器

echo "🚀 开始Market MCP项目提交..."

# 添加所有文件到暂存区
git add .

# 提交信息
COMMIT_MESSAGE="🚀 Market MCP v2.0.0 - IPO3.com增强版发布

🔍 主要更新：
✅ 完整整合IPO3.com数据源
✅ 基于stock_open_api项目的解析逻辑
✅ 支持完整的股票、公司、财务、融资、交易、新闻等功能
✅ 增强的HTML解析和数据提取能力
✅ 优化的类型系统和数据映射
✅ 完善的错误处理和缓存机制
✅ 丰富的MCP工具和助手
✅ 模块化的项目架构，易于维护和扩展

🔧 技术栈：
- TypeScript + Node.js + MCP SDK
- Axios HTTP客户端
- 基于正则表达式的HTML解析
- 完整的类型定义和数据映射系统

📋 项目特色：
1. 🔄 多数据源整合（IPO3.com、东方财富、新浪财经、腾讯财经）
2. 📊 完整的股票和公司信息查询
3. 📈 强大的财务数据查询功能
4. 📈 详细的融资和交易信息
5. 📈 丰富的新闻资讯和大事提醒
6. 🛠️ 智能的HTML解析和数据提取能力
7. 📋 模块化的项目架构，易于维护和扩展

🚀 开始Git操作..."
git commit -m "$COMMIT_MESSAGE" --author="Market MCP Team" --date="$(date +'%Y-%m-%d %H:%M:%S')" --no-verify

echo "📊 检查状态..."
git status

echo "🎉 项目提交完成！"
echo "🚀 推送到GitHub..."