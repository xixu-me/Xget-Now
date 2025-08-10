# Xget Now

为 Chromium 和 Firefox 浏览器提供的 [Xget](https://github.com/xixu-me/Xget) 下载加速扩展，支持 GitHub、GitLab、npm、PyPI 等众多平台的文件下载加速。

## 🚀 功能特性

- **🎯 自动下载加速**：无缝重定向下载通过 Xget 获得更快速度
- **⚙️ 可配置设置**：自定义你的 Xget 域名和平台偏好
- **🔔 智能通知**：下载重定向时的可视化反馈
- **🛡️ 隐私优先**：所有处理都在你的浏览器本地进行
- **🎛️ 按平台控制**：为特定平台启用/禁用加速
- **🌐 跨浏览器支持**：同时支持 Chromium 和 Firefox 浏览器

## 📦 安装

### 商店可用性

- [Chrome 应用商店](https://chromewebstore.google.com/detail/ajiejgobfcifcikbahpijopolfjoodgf?hl=zh-CN)
- [Firefox 附加组件](https://addons.mozilla.org/zh-CN/firefox/addon/xget-now/)
- [Microsoft Edge 加载项](https://microsoftedge.microsoft.com/addons/detail/jigpfhbegabdenhihpplcjhpfdcgnalc?hl=zh-CN&gl=CN)

### 手动安装

如果你更喜欢手动安装扩展或应用商店版本不可用，你可以直接下载并安装：

#### 选项 1：从 GitHub Releases 安装（推荐）

1. **下载扩展**
   - 前往 [Releases 页面](https://github.com/xixu-me/Xget-Now/releases/latest)
   - 下载对应浏览器的扩展文件：
     - `Xget-Now_x.x.x.chromium.zip` - 适用于所有基于 Chromium 的浏览器（Chrome、Microsoft Edge、Opera 等）
     - `Xget-Now_x.x.x.firefox.zip` - 适用于 Firefox 浏览器

2. **在 Chrome 中安装**
   - 解压下载的 Chromium 版本 ZIP 文件
   - 打开 Chrome 并前往 `chrome://extensions/`
   - 启用「开发者模式」（右上角的切换开关）
   - 点击「加载已解压的扩展程序」并选择解压的文件夹

3. **在 Firefox 中安装**
   - 打开 Firefox 并前往 `about:debugging`
   - 点击「此 Firefox」
   - 点击「临时载入附加组件」
   - 选择下载的 Firefox 版本 ZIP 文件或解压后的 `manifest.json` 文件

4. **在 Microsoft Edge 中安装**
   - 解压下载的 Chromium 版本 ZIP 文件
   - 打开 Microsoft Edge 并前往 `edge://extensions/`
   - 启用「开发人员模式」（左侧边栏的切换开关）
   - 点击「加载解压缩的扩展」并选择解压的文件夹

5. **在其他基于 Chromium 的浏览器中安装**
   - 使用 Chromium 版本的扩展包
   - 遵循与 Chrome 或 Microsoft Edge 类似的步骤，确保首先启用「开发者模式」
   - 按照相应浏览器的扩展安装指南进行操作

#### 选项 2：从源码安装

1. **克隆存储库**

   ```bash
   git clone https://github.com/xixu-me/Xget-Now.git
   cd Xget-Now
   ```

2. **构建扩展（可选）**

   如果你想使用优化过的版本：

   ```bash
   # 安装 Python 3.7+
   pip install -r requirements.txt  # 如果有依赖文件
   
   # 构建特定浏览器版本
   python build.py --platform chrome    # 构建 Chrome 版本
   python build.py --platform firefox   # 构建 Firefox 版本
   python build.py --platform all       # 构建所有版本
   ```

3. **在浏览器中加载**

   **Chromium 浏览器：**
   - 打开浏览器的扩展管理页面（`chrome://extensions/` 或 `edge://extensions/`）
   - 启用「开发者模式」
   - 点击「加载已解压的扩展程序」并选择：
     - 源码根目录（如果使用原始源码）
     - `build/chrome/` 目录（如果使用构建版本）

   **Firefox 浏览器：**
   - 打开 `about:debugging`
   - 点击「此 Firefox」
   - 点击「临时载入附加组件」
   - 选择以下文件之一：
     - 源码根目录中的 `manifest-firefox.json`
     - `build/firefox/` 目录中的 `manifest.json`（如果使用构建版本）

#### 验证安装

安装后，你应该在浏览器工具栏中看到 Xget 扩展图标。点击它来配置你的 Xget 域名并开始加速下载！

## ⚙️ 设置

1. **配置 Xget 域名**
   - 点击工具栏中的扩展图标
   - 输入你的 Xget 域名（例如 `xget.xi-xu.me`）
   - 启用扩展

2. **选择平台**
   - 根据需要切换各个平台的开关
   - 默认启用所有平台

3. **开始下载**
   - 访问任何受支持的平台
   - 像往常一样点击下载链接
   - 下载将自动通过 Xget 加速

## 🔧 工作原理

1. **检测**：扩展监控受支持平台上的下载链接
2. **转换**：URL 自动转换为 Xget 兼容格式
3. **重定向**：下载通过你配置的 Xget 域名路由
4. **加速**：Xget 的全球 CDN 和优化功能提供更快的下载速度

### 为什么 Xget 让下载更快

- **边缘缓存**：文件在 Cloudflare 的全球边缘位置进行缓存
- **HTTP/3 支持**：使用最新协议提高性能
- **智能路由**：自动通过最快的可用服务器路由
- **压缩**：自动内容压缩减少传输时间
- **连接优化**：持久连接和预连接功能

## 📈 性能优势

使用 Xget 的实际性能改进：

- **GitHub 发布**：下载速度提升高达 5 倍
- **大型存储库**：多 GB 存档的显著改进  
- **国际用户**：通过边缘缓存显著加快下载速度
- **不稳定连接**：自动重试机制处理网络问题
- **并发下载**：与直接平台下载相比，没有速率限制

## 📋 要求

### 浏览器支持

**Chromium 浏览器：**

- **Chrome**：版本 88+（Manifest V3 支持）
- **Microsoft Edge**：版本 88+
- **Opera**：版本 74+
- **其他基于 Chromium 的浏览器**：支持 Manifest V3 的版本

**Firefox 浏览器：**

- **Firefox**：版本 109+（Manifest V2 支持）
- **Firefox ESR**：版本 109+

### Xget 服务要求

- **Xget 服务**：访问 Xget 实例
  - 使用公共实例：`xget.xi-xu.me`
  - 或部署你自己的：[Xget 存储库](https://github.com/xixu-me/Xget)

### 关于 Xget 服务

Xget 是基于 Cloudflare Workers 构建的高性能、安全的代理服务，提供：

- **全球边缘分发**：通过 Cloudflare 的全球网络加快下载速度
- **高级功能**：HTTP/3 支持、智能缓存、自动重试
- **安全性**：全面的安全标头和内容保护
- **可靠性**：内置超时保护和性能监控

在 [xget.xi-xu.me](https://xget.xi-xu.me) 或 [Xget 存储库](https://github.com/xixu-me/Xget) 了解更多。

## 🔒 隐私与安全

- **本地处理**：所有 URL 转换都在你的浏览器中进行
- **无数据收集**：扩展不收集或传输个人数据
- **最小权限**：仅请求功能所需的必要权限
- **开源**：完整源码可供检查

查看我们的 [隐私政策](PRIVACY_POLICY.md) 了解完整详情。

## 🐛 故障排除

### 常见问题

**扩展不工作？**

- 确保你已配置有效的 Xget 域名
- 检查扩展在弹出窗口中是否已启用
- 验证目标平台是否已启用
- 更改设置后尝试刷新页面

**下载没有被重定向？**

- 更改设置后刷新页面
- 检查浏览器控制台的错误消息（F12 → 控制台）
- 确保链接是被识别的下载类型
- 验证你点击的是实际的下载链接，而不是导航链接

**Xget 域名问题？**

- 域名应该不带 `https://` 协议
- 示例：`xget.xi-xu.me`（不是 `https://xget.xi-xu.me`）
- 检查域名在浏览器中是否可访问
- 尝试使用默认的公共实例：`xget.xi-xu.me`

**性能问题？**

- 检查你的网络连接
- 如果可用，尝试其他 Xget 域名
- 验证目标平台的服务器是否响应
- 清除浏览器缓存并重新加载扩展

**Firefox 特定问题？**

- 确保 Firefox 版本为 109+
- 在 `about:debugging` 中检查扩展是否正确加载
- Firefox 可能需要重启浏览器才能完全应用扩展设置
- 检查 Firefox 的「隐私和安全」设置是否阻止了扩展功能

### 调试模式

**Chromium 浏览器：**

启用 Chrome 开发者工具并检查控制台选项卡中的调试消息：

**Firefox 浏览器：**

1. 打开 `about:debugging`
2. 点击「此 Firefox」
3. 找到 Xget Now 扩展并点击「检查」
4. 在打开的开发者工具中查看控制台消息

**通用调试消息：**

- 扩展加载：「Xget Now：内容脚本已加载」
- 下载重定向：「重定向下载：[原始] -> [Xget]」
- 设置更改：「设置已更新！点击刷新页面」

## 📄 许可证

本存储库采用 GPL-3.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## ❓ 常见问题

### 这个扩展是免费的吗？

是的，扩展完全免费且在 GPL-3.0 许可证下开源。

### 我可以使用自己的 Xget 服务器吗？

当然可以！你可以使用 [Xget 存储库](https://github.com/xixu-me/Xget) 部署自己的 Xget 实例，并配置扩展使用你的域名。

### 为什么有些下载仍然通过原始服务器？

扩展只重定向被识别的下载链接。导航链接、预览链接和一些动态内容可能不会被重定向。

### 我的浏览数据会被收集吗？

不会，扩展完全在本地运行。不收集或传输浏览数据。查看我们的 [隐私政策](PRIVACY_POLICY.md) 了解详情。

### 下载能快多少？

速度提升因你的位置、网络和文件大小而异。典型的改进范围从 2 倍到 10 倍。

### 我可以为特定网站禁用扩展吗？

是的，使用扩展弹出窗口中的按平台切换开关来禁用特定平台的加速。

### 为什么 Chrome 和 Firefox 版本不同？

由于浏览器架构差异，我们针对不同浏览器进行了优化：

- **Chrome 版本**：使用 Manifest V3，支持最新的扩展 API 和安全特性
- **Firefox 版本**：使用 Manifest V2，确保与 Firefox 扩展系统的最佳兼容性

两个版本的核心功能完全相同，只是技术实现略有不同。

### 可以同时在 Chrome 和 Firefox 中使用吗？

当然可以！你可以在多个浏览器中同时安装和使用 Xget Now，它们会独立工作，各自维护自己的设置。

## 🌟 支持我们

如果你觉得这个扩展有用，请：

- ⭐ 为此存储库点星
- 📝 留下评价：
  - [Chrome 应用商店](https://chromewebstore.google.com/detail/ajiejgobfcifcikbahpijopolfjoodgf?hl=zh-CN)
  - [Firefox 附加组件](https://addons.mozilla.org/zh-CN/firefox/addon/xget-now/)
  - [Microsoft Edge 加载项](https://microsoftedge.microsoft.com/addons/detail/jigpfhbegabdenhihpplcjhpfdcgnalc?hl=zh-CN&gl=CN)
- 🐛 通过 [GitHub Issues](https://github.com/xixu-me/Xget-Now/issues) 报告错误或建议功能
- 📢 与其他可能受益于更快下载的人分享
