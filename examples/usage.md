# Market MCP 使用示例

## 基础工具使用

### 1. 获取股票信息

```
使用get_stock_info工具查询：
- 股票代码: "000001" 或 ["000001", "600000", "sz300750"]
- 数据源: "eastmoney" (可选，默认自动选择)

示例:
{
  "tool": "get_stock_info",
  "arguments": {
    "codes": ["000001", "600036", "sz000002"],
    "data_source": "eastmoney"
  }
}
```

### 2. 搜索股票

```
使用search_stock工具搜索：
- 关键词: "平安银行" 或 "000001"

示例:
{
  "tool": "search_stock",
  "arguments": {
    "keyword": "平安银行"
  }
}
```

### 3. 获取热门股票

```
使用get_popular_stocks工具：
- 自动获取热门股票列表

示例:
{
  "tool": "get_popular_stocks",
  "arguments": {}
}
```

### 4. 验证股票代码

```
使用validate_stock_code工具：
- 验证代码格式是否正确

示例:
{
  "tool": "validate_stock_code",
  "arguments": {
    "code": "sh600000"
  }
}
```

## 提示模板使用

### 股票分析提示

```
使用stock_analysis提示：
- stock_codes: "000001,600000" (要分析的股票代码)
- analysis_type: "basic" | "technical" | "comprehensive" (分析类型)

示例调用：
请使用stock_analysis提示分析000001和600000两只股票
```

### 市场概览提示

```
使用market_overview提示：
- market: "all" | "sh" | "sz" | "bj" (市场范围)
- sector: "银行" | "科技" (可选，特定板块)

示例调用：
请使用market_overview提示获取上海市场概览
```

## 实际使用场景

### 场景1: 投资组合监控
```
用户: 帮我查看我的持仓股票表现：000001, 600036, 000002, sz300750

MCP调用:
- get_stock_info 查询所有持仓股票
- 返回实时价格、涨跌幅、成交量等信息
```

### 场景2: 股票筛选
```
用户: 我想找一些科技股

MCP调用:
- search_stock 搜索"科技"相关股票
- get_popular_stocks 获取热门股票
- 分析结果并推荐
```

### 场景3: 市场分析
```
用户: 今天市场表现如何？

MCP调用:
- get_popular_stocks 获取热门股票
- market_overview 提示获取市场概览
- 综合分析市场趋势
```

## 数据源说明

- **东方财富**: 优先级最高，数据最稳定
- **新浪财经**: 备用数据源，数据全面
- **腾讯财经**: 第三备用，响应快速

## 注意事项

1. 股票代码支持6位数字，可带市场前缀(sh/sz/bj)
2. 批量查询建议每次不超过50只股票
3. 数据为实时行情，有15-20分钟延迟
4. 建议交易时间外使用历史数据分析