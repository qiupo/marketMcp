# Market MCP 项目结构

## 📂 标准目录结构

```
marketMcp/                              # 项目根目录
├── 📄 README.md                       # 项目主要文档
├── 📄 package.json                     # 项目配置和依赖
├── 📄 tsconfig.json                    # TypeScript配置
├── 📄 .gitignore                       # Git忽略文件
│
├── 📁 src/                            # 源代码目录
│   ├── 📄 index.ts                     # MCP服务器主入口
│   ├── 📁 types/                      # 类型定义
│   │   └── 📄 stock.ts                # 股票相关类型定义
│   ├── 📁 services/                   # 服务层
│   │   ├── 📄 stockService.ts         # 股票服务管理器
│   │   ├── 📄 ipo3-service-v2.ts      # IPO3.com数据服务
│   │   └── 📄 ipo3-service-regex.ts   # 正则表达式解析服务
│   └── 📁 config/                     # 配置文件
│       └── 📄 toolDefinitions.ts     # MCP工具定义配置
│
├── 📁 dist/                           # 编译输出目录
│   ├── 📄 index.js                     # 编译后的服务器文件
│   └── 📁 services/                   # 编译后的服务文件
│
├── 📁 test/                            # 测试文件目录
│   ├── 📄 test-simple.js               # 基础功能测试
│   ├── 📄 test-final.js               # 完整功能测试
│   ├── 📄 test-mcp-demo.js            # MCP功能演示
│   ├── 📄 test-quick.js               # 快速验证测试
│   └── 📄 test-basic.js               # 基础验证测试
│
├── 📁 docs/                            # 文档目录
│   ├── 📄 QUICK_START.md              # 快速使用指南
│   ├── 📄 IPO3_TOOLS.md             # IPO3工具详细文档
│   ├── 📄 MCP_INTEGRATION_COMPLETE.md # MCP集成完成报告
│   ├── 📄 CHANGELOG.md                # 更新日志
│   ├── 📄 IPO3_SERVICE_README.md     # IPO3服务说明
│   ├── 📄 README_UPDATE_SUMMARY.md    # README更新总结
│   └── 📄 PROJECT_STRUCTURE.md        # 项目结构说明（本文件）
│
├── 📁 scripts/                         # 脚本和配置目录
│   ├── 📄 claude-config.json          # Claude Desktop配置模板
│   └── 📄 commit.sh                  # Git提交脚本
│
├── 📁 examples/                        # 使用示例目录
│   └── 📄 ipo3-usage.ts              # IPO3功能使用示例
│
├── 📁 tools/                           # 工具目录（未来扩展）
│   └── 📄 (预留)                      # 为未来工具扩展预留
│
├── 📁 node_modules/                     # Node.js依赖包
└── 📁 .git/                           # Git版本控制
```

## 🏗️ 目录说明

### 📂 `/src` - 源代码
项目的核心源代码目录，包含所有TypeScript源文件。

**主要文件:**
- `index.ts` - MCP服务器的主入口文件
- `types/` - 完整的TypeScript类型定义
- `services/` - 业务逻辑层，包含所有数据服务
- `config/` - 配置文件和工具定义

### 📂 `/dist` - 编译输出
TypeScript编译后的JavaScript文件，用于生产环境运行。

**主要文件:**
- `index.js` - 编译后的主服务器文件
- `services/` - 编译后的服务文件

### 📂 `/test` - 测试文件
所有测试脚本和验证工具。

**测试类型:**
- `test-simple.js` - 基础功能验证（12个测试）
- `test-final.js` - 完整功能测试（包含演示）
- `test-mcp-demo.js` - MCP功能演示
- `test-quick.js` - 快速验证测试
- `test-basic.js` - 基础验证测试

### 📂 `/docs` - 项目文档
完整的项目文档和用户指南。

**文档类型:**
- `QUICK_START.md` - 快速开始指南
- `IPO3_TOOLS.md` - 详细工具文档
- `MCP_INTEGRATION_COMPLETE.md` - 集成指南
- `CHANGELOG.md` - 版本更新日志
- `PROJECT_STRUCTURE.md` - 项目结构说明（本文件）

### 📂 `/scripts` - 脚本和配置
项目相关的脚本、配置和工具。

**包含内容:**
- `claude-config.json` - Claude Desktop配置模板
- `commit.sh` - 自动化Git提交脚本

### 📂 `/examples` - 使用示例
代码示例和最佳实践演示。

**示例内容:**
- `ipo3-usage.ts` - IPO3服务使用示例

### 📂 `/tools` - 工具目录
为未来功能扩展预留的目录。

## 🔧 开发工作流

### 🏗 构建流程
```bash
# 开发模式（监听文件变化）
npm run dev

# 构建项目
npm run build

# 启动服务
npm start

# 清理构建文件
npm run clean
```

### 🧪 测试流程
```bash
# 运行所有测试
npm test

# 基础功能测试
npm run test:basic

# 完整功能测试
npm run test:full

# 演示测试
npm run test:demo

# 快速验证
npm run test:quick
```

### 📋 代码质量
```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 📦 依赖管理

### 生产依赖
- `@modelcontextprotocol/sdk` - MCP协议SDK
- `axios` - HTTP客户端
- `jsdom` - HTML解析（可选）
- `typescript` - TypeScript编译器

### 开发依赖
- `tsx` - TypeScript执行工具
- `@types/node` - Node.js类型定义
- 其他开发工具

## 🎯 文件组织原则

### 1. 职责分离
- **`src/`** - 源代码，包含业务逻辑
- **`test/`** - 测试代码，与源代码分离
- **`docs/`** - 文档，集中管理
- **`scripts/`** - 脚本和配置

### 2. 模块化设计
- **`services/`** - 数据服务层
- **`types/`** - 类型定义
- **`config/`** - 配置管理

### 3. 可扩展性
- **`examples/`** - 使用示例
- **`tools/`** - 未来工具扩展
- **`docs/`** - 文档可独立维护

### 4. 规范化
- **命名规范** - 使用清晰、一致的文件命名
- **目录结构** - 遵循标准Node.js项目结构
- **文档完整** - 每个目录都有相应的说明文档

## 🚀 新增文件指南

### 添加新测试
1. 在 `/test/` 目录创建测试文件
2. 命名规范: `test-{功能名}.js`
3. 更新 `package.json` 中的测试脚本

### 添加新文档
1. 在 `/docs/` 目录创建文档文件
2. 更新 `README.md` 中的文档链接
3. 确保文档格式一致

### 添加新服务
1. 在 `/src/services/` 目录创建服务文件
2. 在 `/src/types/` 添加相关类型定义
3. 在主服务中注册新服务

### 添加新示例
1. 在 `/examples/` 目录创建示例文件
2. 提供完整的使用说明
3. 确保示例可执行

## 📊 目录统计

| 目录 | 文件数 | 主要用途 | 维护频率 |
|------|--------|----------|----------|
| `/src` | 5+ | 源代码 | 高 |
| `/test` | 5 | 测试验证 | 中 |
| `/docs` | 7 | 项目文档 | 低 |
| `/scripts` | 2 | 配置脚本 | 低 |
| `/examples` | 1 | 使用示例 | 低 |
| `/tools` | 0 | 未来扩展 | 无 |

## 🎯 最佳实践

### 文件命名
- 使用kebab-case（短横线分隔）
- 测试文件以`test-`开头
- 文档文件使用大写单词

### 目录组织
- 按功能分类，而非技术分类
- 保持目录层级扁平（不超过3层）
- 相关文件就近放置

### 文档维护
- 每个功能模块都有对应文档
- 文档与代码保持同步
- 提供完整的使用示例

这个项目结构为Market MCP提供了清晰、可维护、可扩展的代码组织方式。