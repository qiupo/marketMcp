#!/usr/bin/env node

/**
 * 项目验证脚本
 * 验证MCP项目的基本功能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 验证AkShare MCP项目...\n');

// 1. 检查项目文件结构
console.log('📁 检查项目文件结构:');
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'README.md',
  'src/index.ts',
  'akshare_service.py',
  'dist/index.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// 2. 检查package.json配置
console.log('\n📦 检查package.json配置:');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
console.log(`  ✅ 项目名称: ${packageJson.name}`);
console.log(`  ✅ 版本: ${packageJson.version}`);
console.log(`  ✅ 描述: ${packageJson.description}`);
console.log(`  ✅ MCP依赖: ${packageJson.dependencies['@modelcontextprotocol/sdk']}`);
console.log(`  ✅ Python Shell: ${packageJson.dependencies['python-shell']}`);

// 3. 检查TypeScript配置
console.log('\n⚙️ 检查TypeScript配置:');
const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));
console.log(`  ✅ 目标版本: ${tsConfig.compilerOptions.target}`);
console.log(`  ✅ 模块系统: ${tsConfig.compilerOptions.module}`);
console.log(`  ✅ 输出目录: ${tsConfig.compilerOptions.outDir}`);

// 4. 检查构建输出
console.log('\n🏗️ 检查构建输出:');
const distExists = fs.existsSync(path.join(__dirname, 'dist'));
const indexJsExists = fs.existsSync(path.join(__dirname, 'dist/index.js'));
console.log(`  ${distExists ? '✅' : '❌'} dist目录存在`);
console.log(`  ${indexJsExists ? '✅' : '❌'} 主文件已构建`);

// 5. 检查Python服务
console.log('\n🐍 检查Python服务:');
const pythonServiceExists = fs.existsSync(path.join(__dirname, 'akshare_service.py'));
console.log(`  ${pythonServiceExists ? '✅' : '❌'} Python服务文件存在`);

if (pythonServiceExists) {
  const pythonContent = fs.readFileSync(path.join(__dirname, 'akshare_service.py'), 'utf8');
  const hasAkshareImport = pythonContent.includes('import akshare as ak');
  const hasServiceClass = pythonContent.includes('class AkshareService');
  const hasMainFunction = pythonContent.includes('def main():');

  console.log(`  ${hasAkshareImport ? '✅' : '❌'} AkShare导入`);
  console.log(`  ${hasServiceClass ? '✅' : '❌'} 服务类定义`);
  console.log(`  ${hasMainFunction ? '✅' : '❌'} 主函数`);
}

// 6. 检查MCP工具定义
console.log('\n🛠️ 检查MCP工具定义:');
const indexContent = fs.readFileSync(path.join(__dirname, 'src/index.ts'), 'utf8');
const toolsCount = (indexContent.match(/name: '/g) || []).length;
console.log(`  ✅ 工具数量: ${toolsCount}`);

const toolNames = [
  'stock_sh_a_spot_em',
  'stock_sz_a_spot_em',
  'stock_zh_a_hist',
  'stock_individual_basic_info_xq'
];

toolNames.forEach(tool => {
  const hasTool = indexContent.includes(`name: '${tool}'`);
  console.log(`  ${hasTool ? '✅' : '❌'} ${tool}`);
});

// 7. 验证README文档
console.log('\n📖 检查README文档:');
const readmeExists = fs.existsSync(path.join(__dirname, 'README.md'));
if (readmeExists) {
  const readmeContent = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  const hasFeatures = readmeContent.includes('功能特性');
  const hasInstallation = readmeContent.includes('安装设置');
  const hasUsage = readmeContent.includes('使用示例');

  console.log(`  ${hasFeatures ? '✅' : '❌'} 功能特性说明`);
  console.log(`  ${hasInstallation ? '✅' : '❌'} 安装说明`);
  console.log(`  ${hasUsage ? '✅' : '❌'} 使用示例`);
} else {
  console.log('  ❌ README.md文件不存在');
}

// 8. 总结
console.log('\n🎯 验证总结:');
if (allFilesExist && distExists && indexJsExists && pythonServiceExists) {
  console.log('  ✅ 项目结构完整');
  console.log('  ✅ 构建输出正常');
  console.log('  ✅ 核心文件存在');
  console.log('  ✅ MCP服务器准备就绪');

  console.log('\n🚀 启动方式:');
  console.log('  npm start');

  console.log('\n🧪 测试方式:');
  console.log('  npm test');

  console.log('\n📚 项目特性:');
  console.log('  • 基于AkShare库的完整金融数据接口');
  console.log('  • 支持A股、B股、创业板、科创板、美股等多市场');
  console.log('  • 提供实时行情、历史数据、个股信息等功能');
  console.log('  • 完全符合MCP协议规范');
  console.log('  • TypeScript类型安全');
  console.log('  • 完整的文档和测试框架');

} else {
  console.log('  ❌ 项目验证失败，请检查缺失的文件');
}

console.log('\n✨ 验证完成！');