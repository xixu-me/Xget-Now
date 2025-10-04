# Zen Browser 安装和测试指南

## 🚀 快速安装

### 步骤 1: 下载扩展
- 使用文件：`packages/Xget-Now_zen.zip` (v2.0.5)
- 文件大小：63.0 KB
- 包含完整的 Zen Browser 优化

### 步骤 2: 安装扩展
1. 解压 `Xget-Now_zen.zip` 到任意文件夹
2. 在 Zen Browser 中打开 `about:debugging`
3. 点击 "This Zen Browser"
4. 点击 "Load Temporary Add-on"
5. 选择解压后的 `manifest.json` 文件
6. 扩展图标应该出现在工具栏中

### 步骤 3: 验证安装
点击扩展图标，应该能正常打开设置面板，不再出现错误。

## 🔍 测试工具

### 方法 1: 简单测试（推荐）
1. 按 F12 打开开发者工具
2. 切换到 "控制台" 标签
3. 复制并粘贴 `simple-zen-test.js` 的内容
4. 按回车运行
5. 查看测试结果

**预期结果：**
```
🔍 Zen Browser 简单测试
API 状态:
  Browser API: ✅
  Chrome API: ❌
  Webext API: ✅
  存储 API: ✅
  消息 API: ✅
  Zen Browser: ✅ 是
存储测试: ✅
消息测试: ✅ 有响应
总分: 4/5
🎉 扩展状态: 优秀
```

### 方法 2: 完整测试
1. 在浏览器中打开 `test-zen-fix.html`
2. 点击各个测试按钮
3. 查看详细的测试结果

### 方法 3: 安全测试
如果简单测试出现变量冲突错误，使用 `safe-zen-test.js`：
1. 复制并运行 `safe-zen-test.js` 的内容
2. 或者运行 `runZenTest()` 函数

## ✅ 成功标志

扩展正常工作的标志：
- ✅ 扩展图标出现在工具栏
- ✅ 点击图标能打开设置面板
- ✅ 设置面板显示 "扩展已激活并准备就绪"
- ✅ 能够保存和加载设置
- ✅ 测试工具显示 "优秀" 或 "良好" 状态

## ❌ 故障排除

### 如果扩展图标不出现
1. 检查 `about:debugging` 中扩展是否正确加载
2. 查看是否有错误信息
3. 重新加载扩展

### 如果设置面板出现错误
1. 运行 `simple-zen-test.js` 检查 API 状态
2. 检查浏览器控制台是否有错误信息
3. 尝试重启 Zen Browser

### 如果测试失败
1. 确保使用的是最新版本 (v2.0.5)
2. 检查 Zen Browser 版本是否支持
3. 尝试禁用其他扩展

## 🔧 高级调试

### 检查后台脚本
在 `about:debugging` 中：
1. 找到 Xget Now 扩展
2. 点击 "Inspect" 检查后台脚本
3. 查看控制台输出

**预期输出：**
```
Zen Browser background script starting...
Initializing Xget Now for Zen Browser...
Settings initialized successfully
Zen Browser background script loaded successfully
```

### 检查权限
确保扩展有以下权限：
- ✅ downloads
- ✅ storage
- ✅ activeTab
- ✅ 各种网站权限

## 📞 获取帮助

如果问题仍然存在：

1. **收集信息**
   - 运行测试工具并截图结果
   - 复制控制台错误信息
   - 记录 Zen Browser 版本

2. **报告问题**
   - GitHub Issues: https://github.com/xixu-me/Xget-Now/issues
   - 标题注明 "Zen Browser"
   - 提供上述收集的信息

3. **临时解决方案**
   - 尝试使用标准的 Firefox 版本
   - 检查是否有 Zen Browser 的更新

---

## 📋 检查清单

安装完成后，请确认：

- [ ] 扩展图标出现在工具栏
- [ ] 点击图标能打开设置面板
- [ ] 简单测试显示 "优秀" 或 "良好"
- [ ] 能够配置 Xget 域名
- [ ] 能够启用/禁用平台
- [ ] 设置能够正常保存

如果所有项目都已勾选，恭喜！扩展已成功安装并可以正常使用。