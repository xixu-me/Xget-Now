# Zen Browser 故障排除指南

## 问题：插件提示加载设置时错误

### 最新修复 (2024-12-19 v2)

我们已经完全重写了 Zen Browser 支持，修复了所有已知问题：

1. **✅ `importScripts is not defined`** - 完全移除了 `importScripts` 依赖
2. **✅ `Could not establish connection`** - 重写了消息传递机制
3. **✅ `Invalid settings object received`** - 改进了响应处理逻辑
4. **✅ `Uncaught SyntaxError: return not in function`** - 修复了语法错误
5. **✅ `can't access property "success", response is null`** - 增强了空响应处理

### 可能的原因和解决方案

#### 1. API 兼容性问题 ✅ 已修复
Zen Browser 基于 Firefox，但有一些 API 差异。

**解决方案：**
- 使用最新的 Zen Browser 优化版本：`packages/Xget-Now_zen.zip`
- 这个版本包含了针对 Zen Browser 的特殊修复
- 修复了 `importScripts` 问题和消息传递问题

#### 2. 扩展权限问题
**解决方案：**
1. 在 Zen Browser 中打开 `about:debugging`
2. 找到 Xget Now 扩展
3. 确保所有权限都已授予
4. 如果有权限请求，点击"允许"

#### 3. 存储 API 问题
**解决方案：**
1. 打开浏览器开发者工具 (F12)
2. 在控制台中运行以下命令检查 API 可用性：
   ```javascript
   zenBrowserApiCheck()
   ```
3. 如果显示某些 API 不可用，尝试重新加载扩展

#### 4. 临时文件权限问题
**解决方案：**
1. 确保 Zen Browser 有足够的文件系统权限
2. 尝试以管理员权限运行 Zen Browser
3. 检查防病毒软件是否阻止了扩展

### 安装 Zen Browser 优化版

1. **下载最新优化版本**
   - 使用 `packages/Xget-Now_zen.zip` (v2.0.5 - 完全重写版本)
   - 专门的 Zen Browser 后台脚本 (`background-zen.js`)
   - 简化的消息传递机制，避免所有已知的兼容性问题

2. **安装步骤**
   ```
   1. 解压 Xget-Now_zen.zip
   2. 在 Zen Browser 中打开 about:debugging
   3. 点击 "This Zen Browser"
   4. 点击 "Load Temporary Add-on"
   5. 选择解压后的 manifest.json 文件
   ```

3. **验证安装**
   - 扩展图标应该出现在工具栏
   - 点击图标打开设置面板
   - 应该能正常加载设置，不再出现错误
   - 如果仍有问题，使用测试页面进行诊断

4. **使用测试工具**
   - 打开 `test-zen-fix.html` 进行全面测试
   - 在控制台运行 `quick-test-zen.js` 进行快速验证
   - 检查所有 API 是否正常工作
   - 验证存储和消息传递功能

### 调试命令

在浏览器控制台中可以使用以下调试命令：

#### 方法 1: 简单测试（推荐）
```javascript
// 复制并运行 simple-zen-test.js 的内容
// 这个测试避免了变量冲突，可以安全地多次运行
```

#### 方法 2: 基本检查
```javascript
// 检查基本 API（避免重复声明）
console.log('Browser API:', typeof browser !== 'undefined');
console.log('Chrome API:', typeof chrome !== 'undefined');

// 检查扩展 API
const extAPI = typeof browser !== 'undefined' ? browser : chrome;
console.log('存储 API:', !!(extAPI?.storage?.local));
console.log('消息 API:', !!(extAPI?.runtime?.sendMessage));

// 测试消息传递
extAPI?.runtime?.sendMessage({action: 'getSettings'}).then(console.log);
```

#### 方法 3: Zen Browser 特定检查
```javascript
// 检查 Zen Browser 功能
if (typeof isZenBrowser === 'function') {
    console.log('是否为 Zen Browser:', isZenBrowser());
}

if (typeof zenBrowserApiCheck === 'function') {
    console.log('API 检查结果:', zenBrowserApiCheck());
}
```

### 常见错误信息及解决方案

#### ✅ "importScripts is not defined" - 已修复
**原因：** Firefox/Zen Browser 不支持 `importScripts`
**解决：** 使用最新的优化版本，已移除 `importScripts` 依赖

#### ✅ "Could not establish connection. Receiving end does not exist" - 已修复
**原因：** 后台脚本和弹窗脚本通信问题
**解决：** 最新版本改进了消息传递机制和错误处理

#### ✅ "Invalid settings object received" - 已修复
**原因：** 设置对象验证过于严格
**解决：** 改进了设置验证逻辑，提供默认值回退

#### ✅ "Uncaught SyntaxError: redeclaration of const api" - 已修复
**原因：** 在控制台中多次运行测试脚本导致变量重复声明
**解决：** 使用 `simple-zen-test.js` 避免变量冲突

#### "WebExt compatibility layer not found"
**原因：** 兼容层加载失败
**解决：** 确保使用最新的 Zen Browser 优化版本

#### "Failed to initialize WebExtension API"
**原因：** 浏览器 API 不可用
**解决：** 
1. 重启 Zen Browser
2. 重新安装扩展
3. 检查浏览器版本是否支持

#### "Settings loading timeout"
**原因：** 设置加载超时（超时时间已从5秒减少到3秒）
**解决：**
1. 等待几秒后重试
2. 重新打开扩展面板
3. 使用测试页面检查 API 状态

#### "Storage API not available"
**原因：** 存储 API 不可用
**解决：**
1. 确保扩展有存储权限
2. 重新安装扩展
3. 检查浏览器设置中的隐私选项

### 性能优化建议

1. **减少扩展冲突**
   - 暂时禁用其他扩展测试
   - 检查是否有扩展冲突

2. **清理浏览器数据**
   - 清除缓存和 Cookie
   - 重置扩展设置

3. **更新浏览器**
   - 确保使用最新版本的 Zen Browser
   - 检查是否有已知的兼容性问题

### 报告问题

如果问题仍然存在，请提供以下信息：

1. **浏览器信息**
   ```javascript
   navigator.userAgent
   ```

2. **API 检查结果**
   ```javascript
   zenBrowserApiCheck()
   ```

3. **控制台错误信息**
   - 打开开发者工具 (F12)
   - 复制控制台中的错误信息

4. **扩展版本**
   - 使用的是哪个版本的扩展包
   - 安装方式（临时加载 vs 正式安装）

### 联系支持

- GitHub Issues: https://github.com/xixu-me/Xget-Now/issues
- 在报告问题时请注明使用的是 Zen Browser
- 提供上述调试信息以便快速定位问题

---

## 快速修复清单

- [ ] 使用 Zen Browser 优化版本 (`Xget-Now_zen.zip`)
- [ ] 检查扩展权限
- [ ] 运行 `zenBrowserApiCheck()` 检查 API
- [ ] 重启浏览器
- [ ] 重新安装扩展
- [ ] 检查控制台错误信息
- [ ] 尝试禁用其他扩展
- [ ] 清除浏览器缓存