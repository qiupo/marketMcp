# AkShare 东方财富接口文档

本文档整理了AkShare库中所有基于东方财富网数据源的股票相关接口。

## 目录

- [A股行情数据](#a股行情数据)
- [B股行情数据](#b股行情数据)
- [科创板数据](#科创板数据)
- [AH股比价](#ah股比价)
- [个股信息查询](#个股信息查询)
- [行业比较数据](#行业比较数据)
- [公告数据](#公告数据)
- [其他特色板块](#其他特色板块)

---

## A股行情数据

### 1. 实时行情数据

#### 1.1 沪深京A股实时行情
**接口**: `stock_zh_a_spot_em`

**描述**: 东方财富网-沪深京A股-实时行情数据

**限量**: 单次返回所有沪深京A股上市公司的实时行情数据

**示例代码**:
```python
import akshare as ak
stock_zh_a_spot_em_df = ak.stock_zh_a_spot_em()
print(stock_zh_a_spot_em_df)
```

**输出字段**:
- 序号、代码、名称
- 最新价、涨跌幅、涨跌额
- 成交量(手)、成交额(元)
- 振幅、最高、最低、今开、昨收
- 量比、换手率、市盈率(动态)、市净率
- 总市值、流通市值
- 涨速、5分钟涨跌、60日涨跌幅、年初至今涨跌幅

#### 1.2 分类板块行情
**沪A股**: `stock_sh_a_spot_em`
**深A股**: `stock_sz_a_spot_em`
**京A股**: `stock_bj_a_spot_em`
**创业板**: `stock_cy_a_spot_em`
**科创板**: `stock_kc_a_spot_em`
**新股**: `stock_new_a_spot_em`
**AB股比价**: `stock_zh_ab_comparison_em`

### 2. 历史行情数据

#### 2.1 日频率历史数据
**接口**: `stock_zh_a_hist`

**描述**: 东方财富-沪深京A股日频率数据

**参数**:
- `symbol`: 股票代码
- `period`: 'daily'(默认), 'weekly', 'monthly'
- `start_date`: 开始查询的日期
- `end_date`: 结束查询的日期
- `adjust`: 复权类型(默认不复权, 'qfq'前复权, 'hfq'后复权)

**示例代码**:
```python
import akshare as ak
stock_zh_a_hist_df = ak.stock_zh_a_hist(symbol="000001", period="daily",
                                      start_date="20210301", end_date="20210616",
                                      adjust="qfq")
print(stock_zh_a_hist_df)
```

#### 2.2 分钟频率历史数据
**接口**: `stock_zh_a_hist_min_em`

**参数**:
- `symbol`: 股票代码
- `start_date`: 开始日期时间
- `end_date`: 结束日期时间
- `period`: '1', '5', '15', '30', '60'分钟
- `adjust`: 复权类型

### 3. 分时数据

#### 3.1 日内分时数据
**接口**: `stock_intraday_em`

**描述**: 东方财富-分时数据，包含盘前数据

**示例代码**:
```python
import akshare as ak
stock_intraday_em_df = ak.stock_intraday_em(symbol="000001")
print(stock_intraday_em_df)
```

#### 3.2 盘前数据
**接口**: `stock_zh_a_hist_pre_min_em`

**描述**: 包含盘前分钟数据的完整交易日分时数据

---

## B股行情数据

### 1. B股实时行情
**接口**: `stock_zh_b_spot_em`

**描述**: 东方财富网-实时行情数据(所有B股)

### 2. B股历史数据
**接口**: `stock_zh_b_daily`

**参数**:
- `symbol`: B股代码(如'sh900901')
- `start_date`: 开始日期
- `end_date`: 结束日期
- `adjust`: 复权类型

### 3. B股分钟数据
**接口**: `stock_zh_b_minute`

---

## 科创板数据

### 1. 科创板实时行情
**接口**: `stock_zh_kcb_spot`

**描述**: 东方财富-科创板实时行情数据

### 2. 科创板历史数据
**接口**: `stock_zh_kcb_daily`

**特色输出字段**:
- `after_volume`: 盘后量
- `after_amount`: 盘后额
(支持科创板盘后固定价格交易数据)

### 3. 科创板公告
**接口**: `stock_zh_kcb_report_em`

**描述**: 东方财富-科创板报告数据

---

## AH股比价

### 1. AH股实时比价
**接口**: `stock_zh_ah_spot_em`

**描述**: 东方财富-沪深港通-AH股比价(延迟15分钟更新)

**输出字段**:
- 名称、H股代码、H股最新价(HKD)、H股涨跌幅
- A股代码、A股最新价(RMB)、A股涨跌幅
- 比价、溢价

### 2. AH股历史数据
**接口**: `stock_zh_ah_daily`

### 3. AH股代码对照
**接口**: `stock_zh_ah_name`

---

## 个股信息查询

### 1. 个股基本信息(东财)
**接口**: `stock_individual_info_em`

**描述**: 东方财富-个股-股票信息

**示例代码**:
```python
import akshare as ak
stock_individual_info_em_df = ak.stock_individual_info_em(symbol="000001")
print(stock_individual_info_em_df)
```

**输出信息**:
- 最新价、股票代码、股票简称
- 总股本、流通股
- 总市值、流通市值
- 行业分类、上市时间

### 2. 行情报价
**接口**: `stock_bid_ask_em`

**描述**: 东方财富-行情报价(买卖五档数据)

### 3. 雪球个股信息
**接口**: `stock_individual_basic_info_xq`

**描述**: 雪球财经-个股-公司概况-公司简介

---

## 行业比较数据

### 1. 成长性比较
**接口**: `stock_zh_growth_comparison_em`

**描述**: 东方财富-行情中心-同行比较-成长性比较

**输出指标**:
- 基本每股收益增长率(3年复合、各年度)
- 营业收入增长率(3年复合、各年度)
- 净利润增长率(3年复合、各年度)

### 2. 估值比较
**接口**: `stock_zh_valuation_comparison_em`

**估值指标**:
- PEG、市盈率(各年度)
- 市销率(各年度)
- 市净率(各年度)
- 市现率PCF、EV/EBITDA

### 3. 杜邦分析比较
**接口**: `stock_zh_dupont_comparison_em`

**杜邦分析要素**:
- ROE(各年度)
- 净利率(各年度)
- 总资产周转率(各年度)
- 权益乘数(各年度)

### 4. 公司规模比较
**接口**: `stock_zh_scale_comparison_em`

**规模指标**:
- 总市值及排名
- 流通市值及排名
- 营业收入及排名
- 净利润及排名

---

## 公告数据

### 1. 科创板公告
**接口**: `stock_zh_kcb_report_em`

**输出字段**:
- 代码、名称、公告标题
- 公告类型、公告日期
- 公告代码(用于获取详情)

---

## 其他特色板块

### 1. 新股上市首日表现
**接口**: `stock_xgsr_ths`

**描述**: 同花顺-数据中心-新股数据-新股上市首日

**字段包括**:
- 股票代码、简称、上市日期
- 发行价、最新价
- 首日开盘价、收盘价、最高价、最低价
- 首日涨跌幅、是否破发

### 2. IPO受益股
**接口**: `stock_ipo_benefit_ths`

**描述**: 同花顺-数据中心-新股数据-IPO受益股

### 3. 风险警示板
**接口**: `stock_zh_a_st_em`

**描述**: 东方财富-行情中心-沪深个股-风险警示板

### 4. 次新股
**接口**: `stock_zh_a_new`

**描述**: 新浪财经-行情中心-沪深股市-次新股

### 5. 股市日历-公司动态
**接口**: `stock_gsrl_gsdt_em`

**描述**: 东方财富-数据中心-股市日历-公司动态

---

## 交易所数据

### 1. 上海证券交易所数据总貌
**接口**: `stock_sse_summary`

**描述**: 上海证券交易所-股票数据总貌

**数据包括**:
- 项目(总体统计)
- 股票(主板)
- 科创板
- 主板

### 2. 深圳证券交易所数据
#### 2.1 证券类别统计
**接口**: `stock_szse_summary`

#### 2.2 地区交易排序
**接口**: `stock_szse_area_summary`

#### 2.3 股票行业成交统计
**接口**: `stock_szse_sector_summary`

#### 2.4 每日概况
**接口**: `stock_sse_deal_daily`

---

## 使用注意事项

### 1. 数据频率限制
- 大部分实时数据有15分钟延迟
- 科创板数据支持盘后固定价格交易信息
- 建议控制API调用频率，避免IP被封

### 2. 复权说明
- **不复权**: 原始价格数据
- **前复权**: 保持当前价格不变，调整历史价格
- **后复权**: 保持历史价格不变，调整当前价格
- 量化投资研究通常使用后复权数据

### 3. 数据更新时间
- 当日数据需在交易所收盘后获取完整统计
- 历史数据按日频率更新
- 部分数据(如公告)在交易日结束后更新

### 4. 特殊数据源
- 雪球数据: 需要token参数
- 同花顺数据: 每周更新一次(如IPO受益股)
- 新浪数据: 容易因频繁调用被封IP

---

## 相关链接

- [东方财富网](https://www.eastmoney.com/)
- [AkShare官方文档](https://akshare.akfamily.xyz/)
- [东方财富数据中心](https://data.eastmoney.com/)

*本文档基于AkShare库文档整理，具体使用请参考最新版本的AkShare库。*