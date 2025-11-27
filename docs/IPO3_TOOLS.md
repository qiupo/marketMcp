# Market MCP - IPO3 集成工具列表

## 📊 基础工具

### 1. get_stock_info
获取股票基本信息（实时行情、价格、涨跌幅等）
- **参数**: `codes` (string|string[]) - 股票代码
- **参数**: `data_source` (string, 可选) - 数据源，默认 "ipo3"

### 2. search_stock
搜索股票信息
- **参数**: `keyword` (string) - 搜索关键词

### 3. get_popular_stocks
获取热门股票列表
- **参数**: `data_source` (string, 可选) - 数据源

### 4. validate_stock_code
验证股票代码格式
- **参数**: `code` (string) - 要验证的股票代码

## 🏢 公司详细信息

### 5. get_company_info
获取公司完整信息
- **参数**: `stock_code` (string) - 股票代码（6位数字）
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名，默认false
- **功能**: 基本资料、股本结构、高管介绍、公司简介、主营业务等

## 💰 财务报表

### 6. get_financial_statements
获取财务报表数据
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `statement_type` (string) - 报表类型
  - `income` - 利润表
  - `balance` - 资产负债表
  - `cashflow` - 现金流量表
  - `analysis` - 财务分析
- **参数**: `date_type` (string, 可选) - 报告期类型
  - `年报` (默认) - 年度报告
  - `中报` - 半年度报告
  - `一季报` - 第一季度报告
  - `三季报` - 第三季度报告
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名

## 💼 募资与交易

### 7. get_stock_funding
获取募资明细
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名
- **功能**: 投资者信息、投资金额、锁定状态等

### 8. get_stock_trades
获取交易明细
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名
- **功能**: 交易价格、交易量、买卖双方信息等

## 📅 事件与公告

### 9. get_stock_events
获取事件提醒
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名
- **功能**: 重要事件日期和类型

### 10. get_stock_notices
获取公告列表
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `page` (number, 可选) - 页码，默认1
- **功能**: 支持分页查询公告信息

## 📋 专项信息

### 11. get_stock_survey
获取定增计划
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名
- **功能**: 融资进度和基本信息

### 12. get_stock_brokers
获取做市商信息
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名
- **功能**: 做市商、初始库存、初始价格等

### 13. get_stock_pledge
获取质押信息
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名
- **功能**: 质押总数和质押方详情

### 14. get_stock_reports
获取研报列表
- **参数**: `stock_code` (string) - 股票代码
- **参数**: `english_key` (boolean, 可选) - 是否返回英文字段名
- **功能**: 研究报告标题和发布时间

## 🎯 优化特性

✅ **代码整合**: 使用通用处理方法，减少重复代码
✅ **最新数据**: 直接从IPO3.com获取最新股票和IPO信息
✅ **完整功能**: 集成所有IPO3.com的数据功能
✅ **中英双语**: 支持中文字段名和英文字段名转换
✅ **多种报告期**: 支持年报、中报、一季报、三季报
✅ **错误处理**: 完善的错误处理和降级机制
✅ **类型安全**: 完整的TypeScript类型定义
✅ **分页支持**: 公告列表支持分页查询
✅ **实时数据**: 获取最新的股票价格和市场信息