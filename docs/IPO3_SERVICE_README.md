# IPO3.com 数据服务 v2.0 - 完整版

## 概述

这是一个完整的IPO3.com网站数据获取服务，基于Python版本的`config.py`和`q.py`重新设计和优化，实现了所有IPO3网站的功能，包括：

- ✅ 公司详细信息获取
- ✅ 财务报表数据（利润表、资产负债表、现金流量表、财务分析）
- ✅ 融资和交易数据
- ✅ 公告和事件信息
- ✅ 研报和做市商信息
- ✅ 质押信息
- ✅ 完整的中英文字段名映射

## 文件结构

```
src/
├── services/
│   └── ipo3-service-v2.ts          # 主要服务类
├── types/
│   └── stock.ts                      # TypeScript类型定义
├── config/
│   └── ipo3-mappings.ts              # 字段映射配置
├── utils/
│   └── ipo3-utils.ts                 # 工具函数
└── examples/
    └── ipo3-usage.ts                 # 使用示例
```

## 主要特性

### 🔧 核心功能

1. **公司信息获取** - 完整的公司基础信息、股本结构、高管介绍、新闻资讯
2. **财务报表** - 支持年报、中报、一季报、三季报的完整财务数据
3. **融资数据** - 募资明细、定增计划、投资者信息
4. **交易数据** - 交易明细、做市商信息
5. **公告信息** - 最新公告、大事提醒、研报列表
6. **质押信息** - 质押企业详情、质押贷款记录

### 🛠 技术特性

1. **完整的TypeScript支持** - 所有接口都有完整的类型定义
2. **中英文字段映射** - 基于原始Python配置的完整映射
3. **错误处理和重试** - 自动重试机制和详细错误信息
4. **模块化设计** - 清晰的模块分离，易于维护和扩展
5. **HTML解析优化** - 使用JSDOM进行可靠的HTML解析

## 安装依赖

```bash
npm install axios jsdom @types/jsdom
```

## 基础使用

### 1. 创建服务实例

```typescript
import { IPO3ServiceV2 } from './src/services/ipo3-service-v2.js';

const ipo3Service = new IPO3ServiceV2();
```

### 2. 获取股票基础信息

```typescript
async function getStockBasicInfo() {
  const stockCodes = ['430510', '832468', '870299'];
  const result = await ipo3Service.getStockInfo(stockCodes);

  if (result.success) {
    result.data.forEach(stock => {
      console.log(`${stock.name}(${stock.code}): ${stock.price}元 ${stock.changePercent}`);
    });
  }
}
```

### 3. 获取公司详细信息

```typescript
async function getCompanyDetails() {
  const companyInfo = await ipo3Service.getCompanyInfo('430510');

  console.log(`公司名称: ${companyInfo.name}`);
  console.log(`最新价格: ${companyInfo.price}元`);
  console.log(`主营业务: ${companyInfo.mainBusiness}`);
  console.log(`成立日期: ${companyInfo.establishDate}`);

  // 查看股本结构
  companyInfo.equityStructure.forEach(equity => {
    console.log(`总股本: ${equity.totalEquity}, 流通股本: ${equity.circulatingEquity}`);
  });
}
```

## 高级功能

### 1. 获取财务报表数据

```typescript
// 获取利润表
const incomeStatements = await ipo3Service.getIncomeStatementList('430510', '年报');
const latestIncome = incomeStatements[incomeStatements.length - 1];
console.log(`营业收入: ${latestIncome.salesRevenue}`);
console.log(`净利润: ${latestIncome.netProfit}`);

// 获取资产负债表
const balanceSheets = await ipo3Service.getBalanceSheetList('430510', '年报');
const latestBalance = balanceSheets[balanceSheets.length - 1];
console.log(`总资产: ${latestBalance.totalAssets}`);
console.log(`总负债: ${latestBalance.totalLiabilities}`);

// 获取现金流量表
const cashFlowStatements = await ipo3Service.getCashFlowStatementList('430510', '年报');
const latestCashFlow = cashFlowStatements[cashFlowStatements.length - 1];
console.log(`经营现金流净额: ${latestCashFlow.netCashFromOperatingActivities}`);

// 获取财务分析
const financialAnalysis = await ipo3Service.getFinancialAnalysisList('430510', '年报');
const latestAnalysis = financialAnalysis[financialAnalysis.length - 1];
console.log(`ROE: ${latestAnalysis.returnOnEquityDiluted}%`);
console.log(`资产负债率: ${latestAnalysis.assetLiabilityRatio}%`);
```

### 2. 获取融资和交易信息

```typescript
// 获取募资明细
const fundList = await ipo3Service.getStockFundList('430510');
fundList.forEach(fund => {
  console.log(`${fund.fundDate}: ${fund.fundType} ${fund.fundMoney}`);
  console.log(`投资者数量: ${fund.investorList.length}`);
});

// 获取交易明细
const tradeList = await ipo3Service.getStockTradeList('430510');
tradeList.slice(-5).forEach(trade => {
  console.log(`${trade.tradeDate}: ${trade.tradePrice}元 ${trade.tradeQuantity}股`);
});
```

### 3. 获取公告和事件

```typescript
// 获取大事提醒
const eventList = await ipo3Service.getStockEventList('430510');
eventList.forEach(event => {
  console.log(`${event.eventDate}: ${event.eventType} - ${event.title}`);
});

// 获取最新公告（支持分页）
const noticeList = await ipo3Service.getStockNoticeList('430510', 1);
if (noticeList.success) {
  noticeList.data.forEach(notice => {
    console.log(`${notice.time}: ${notice.title}`);
    console.log(`详情链接: ${notice.detailUrl}`);
  });
}

// 获取定增计划
const survey = await ipo3Service.getStockSurvey('430510');
console.log(`融资进度: ${survey.financingProgress}`);
console.log(`融资金额: ${survey.financingMoney}`);
```

### 4. 获取研报和做市商信息

```typescript
// 获取研报
const reportList = await ipo3Service.getStockReportList('430510');
reportList.forEach(report => {
  console.log(`${report.publishDate}: ${report.title}`);
});

// 获取做市商信息
const brokerList = await ipo3Service.getStockBrokerList('430510');
brokerList.forEach(broker => {
  console.log(`${broker.broker}: 初始库存${broker.initialStock}`);
});

// 获取质押信息
const pledgeData = await ipo3Service.getStockPledgeData('430510');
console.log(`累计质押: ${pledgeData.pledgeTotal}`);
```

## 字段映射

### 中英文映射

服务支持完整的中英文字段名映射，可以通过`englishKey=true`参数启用：

```typescript
// 使用中文字段名（默认）
const companyInfoCN = await ipo3Service.getCompanyInfo('430510', false);
console.log(companyInfoCN.股票名称); // "丰光精密"

// 使用英文字段名
const companyInfoEN = await ipo3Service.getCompanyInfo('430510', true);
console.log(companyInfoEN.stockName); // "丰光精密"
```

### 支持的报表类型

- **年报** (`'年报'`) - 年度报告
- **中报** (`'中报'`) - 半年度报告
- **一季报** (`'一季报'`) - 第一季度报告
- **三季报** (`'三季报'`) - 第三季度报告

## 数据结构

### 主要接口类型

```typescript
// 公司信息
interface CompanyInfo {
  name: string;
  code: string;
  price: string;
  change: string;
  changePercent: string;
  industry: string;
  equityStructure: EquityStructure[];
  seniorManagement: SeniorManagement[];
  news: News[];
  // ... 更多字段
}

// 财务数据
interface IncomeStatement {
  reportDate: string;
  salesRevenue: string;
  netProfit: string;
  // ... 更多字段
}

// 募资信息
interface FundInfo {
  fundDate: string;
  fundType: string;
  fundMoney: string;
  investorList: InvestorInfo[];
}
```

## 错误处理

服务提供了完整的错误处理机制：

```typescript
try {
  const result = await ipo3Service.getCompanyInfo('430510');
  // 处理成功结果
} catch (error) {
  if (error instanceof Error) {
    console.error('请求失败:', error.message);
  }
}
```

## 完整示例

查看 `examples/ipo3-usage.ts` 文件获取完整的使用示例，包括：

1. 基础股票信息获取
2. 公司详细信息分析
3. 财务报表数据分析
4. 融资和交易数据获取
5. 公告和事件信息查询
6. 研报和做市商信息获取
7. 批量股票分析

## 性能优化建议

1. **批量请求** - 对于多个股票，使用数组参数进行批量查询
2. **缓存机制** - 对不经常变化的数据实施缓存策略
3. **并发控制** - 避免同时发起过多请求
4. **错误重试** - 使用内置的重试机制处理网络波动

## 注意事项

1. **请求频率** - 请合理控制请求频率，避免对IPO3.com服务器造成过大压力
2. **数据准确性** - 所有数据均来自IPO3.com，请以官方数据为准
3. **合规使用** - 请遵守相关网站的使用条款和robots.txt规则
4. **网络环境** - 确保网络环境可以正常访问IPO3.com

## 版本历史

- **v2.0.0** - 完整重构，实现所有IPO3功能
  - 新增完整财务报表支持
  - 新增融资、交易、公告等功能
  - 新增完整TypeScript类型支持
  - 优化错误处理和重试机制

- **v1.0.0** - 基础版本，仅支持基础股票信息获取

## 贡献

欢迎提交Issue和Pull Request来改进这个服务。在提交代码前，请确保：

1. 代码符合TypeScript规范
2. 添加必要的类型定义和注释
3. 运行测试确保功能正常
4. 更新相关文档

## 许可证

本项目仅供学习和研究使用，请勿用于商业用途。