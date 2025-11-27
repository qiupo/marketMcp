# Market MCP - 快速开始指南

## 🎯 概述

Market MCP 是一个强大的金融股票数据查询工具，集成了IPO3.com数据源，提供12个核心工具和2个智能分析助手。

## 🚀 快速启动

### 1. 启动MCP服务器

```bash
# 构建项目（如果还没有构建）
npm run build

# 启动MCP服务器
node dist/index.js
```

### 2. 在Claude中配置

1. 打开Claude配置
2. 添加MCP服务器：
   - 名称: `market-mcp`
   - 命令: `node /path/to/marketMcp/dist/index.js`
   - 工作目录: `/path/to/marketMcp`

### 3. 开始使用

启动后，您可以在Claude中直接使用所有股票查询功能！

## 🛠️ 核心工具

### 🔍 基础查询工具

#### 1. get_stock_info - 股票信息查询
```javascript
// 查询单个股票
{
  "tool": "get_stock_info",
  "arguments": {
    "codes": "600000",
    "data_source": "ipo3"
  }
}

// 批量查询股票
{
  "tool": "get_stock_info",
  "arguments": {
    "codes": ["600000", "000001", "430002"],
    "data_source": "ipo3"
  }
}
```

#### 2. search_stock - 股票搜索
```javascript
{
  "tool": "search_stock",
  "arguments": {
    "keyword": "科技"
  }
}
```

#### 3. get_popular_stocks - 热门股票
```javascript
{
  "tool": "get_popular_stocks",
  "arguments": {
    "data_source": "ipo3"
  }
}
```

#### 4. validate_stock_code - 代码验证
```javascript
{
  "tool": "validate_stock_code",
  "arguments": {
    "code": "600000"
  }
}
```

### 🏢 IPO3增强功能

#### 5. get_company_info - 公司信息
```javascript
{
  "tool": "get_company_info",
  "arguments": {
    "stock_code": "430002",
    "english_key": false
  }
}
```

#### 6. get_financial_statements - 财务报表
```javascript
{
  "tool": "get_financial_statements",
  "arguments": {
    "stock_code": "430002",
    "statement_type": "income", // income/balance/cashflow/analysis
    "date_type": "年报",         // 年报/中报/一季报/三季报
    "english_key": false
  }
}
```

#### 7. get_stock_funding - 募资明细
```javascript
{
  "tool": "get_stock_funding",
  "arguments": {
    "stock_code": "430002",
    "english_key": false
  }
}
```

#### 8. get_stock_events - 事件提醒
```javascript
{
  "tool": "get_stock_events",
  "arguments": {
    "stock_code": "430002",
    "english_key": false
  }
}
```

### 💡 智能分析助手

#### 9. stock_analysis - 股票分析
```javascript
{
  "prompt": "stock_analysis",
  "arguments": {
    "stock_codes": "600000,000001,430002",
    "analysis_type": "comprehensive" // basic/technical/comprehensive
  }
}
```

#### 10. market_overview - 市场概览
```javascript
{
  "prompt": "market_overview",
  "arguments": {
    "market": "all",      // all/sh/sz/bj
    "sector": "科技"       // 可选行业板块
  }
}
```

## 📊 使用示例

### 示例1：股票投资组合分析
```
请帮我分析以下股票的投资价值：
浦发银行(600000)、平安银行(000001)、易安科技(430002)
```

Claude会自动调用stock_analysis工具，提供综合分析报告。

### 示例2：科技板块热点搜索
```
帮我搜索最近表现较好的科技股
```

Claude会使用search_stock和get_popular_stocks工具找到相关股票。

### 示例3：公司深度调研
```
我想了解易安科技(430002)的详细情况，包括公司基本信息和财务状况
```

Claude会调用get_company_info和get_financial_statements等工具。

## 🔧 工具完整列表

| 工具名称 | 功能描述 | 主要参数 |
|---------|---------|---------|
| get_stock_info | 股票详细信息查询 | codes, data_source |
| search_stock | 股票搜索 | keyword |
| get_popular_stocks | 热门股票行情 | data_source |
| validate_stock_code | 股票代码验证 | code |
| get_company_info | 公司详细信息 | stock_code, english_key |
| get_financial_statements | 财务报表数据 | stock_code, statement_type, date_type |
| get_stock_funding | 股票募资明细 | stock_code, english_key |
| get_stock_trades | 股票交易明细 | stock_code, english_key |
| get_stock_events | 股票事件提醒 | stock_code, english_key |
| get_stock_notices | 股票公告列表 | stock_code, page |
| get_stock_survey | 股票定增计划 | stock_code, english_key |
| get_stock_brokers | 做市商信息 | stock_code, english_key |
| get_stock_pledge | 股票质押信息 | stock_code, english_key |
| get_stock_reports | 研报列表 | stock_code, english_key |

## 💬 Prompt助手列表

| 助手名称 | 功能描述 | 主要参数 |
|---------|---------|---------|
| stock_analysis | 股票分析助手 | stock_codes, analysis_type |
| market_overview | 市场概览助手 | market, sector |

## 🛡️ 支持的市场

- **上海证券交易所** (SH/沪市)
- **深圳证券交易所** (SZ/深市)
- **北京证券交易所** (BJ/北交所)
- **新三板** (NSE)

## 📈 数据特性

- ✅ 实时股票行情数据
- ✅ 历史财务报表
- ✅ 公司基本信息
- ✅ 市场热点分析
- ✅ 事件提醒
- ✅ 批量查询支持
- ✅ 中英文输出切换
- ✅ 分页查询支持

## 🔍 故障排除

### 常见问题

1. **MCP服务器启动失败**
   ```bash
   # 确保项目已构建
   npm run build

   # 检查Node.js版本（建议v18+）
   node --version
   ```

2. **工具调用失败**
   - 检查网络连接
   - 验证股票代码格式（6位数字）
   - 确认IPO3.com服务可用

3. **数据不更新**
   - 数据源可能存在延迟
   - 建议在交易日时间查询

### 调试模式

启用详细日志输出：
```bash
DEBUG=mcp* node dist/index.js
```

## 📚 更多资源

- `README.md` - 详细项目说明
- `IPO3_TOOLS.md` - 完整工具文档
- `MCP_INTEGRATION_COMPLETE.md` - 集成指南
- `src/types/stock.ts` - TypeScript类型定义

## 🎉 开始使用

现在您已经了解了Market MCP的所有功能，开始探索股票数据的强大能力吧！

有任何问题，请查看项目文档或提交Issue。