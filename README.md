# Xget for Chromium

一个强大的 Chromium 浏览器扩展，通过自动将下载重定向到 [Xget](https://github.com/xixu-me/Xget) 代理服务，从而加速 GitHub、GitLab 和 Hugging Face 的下载。

## 🚀 功能特性

- **🎯 自动下载加速**：无缝重定向下载通过 Xget 获得更快速度
- **🌐 多平台支持**：支持 GitHub、GitLab 和 Hugging Face
- **⚙️ 可配置设置**：自定义你的 Xget 域名和平台偏好
- **🔔 智能通知**：下载重定向时的可视化反馈
- **🛡️ 隐私优先**：所有处理都在你的浏览器本地进行
- **🎛️ 按平台控制**：为特定平台启用/禁用加速

## 📦 安装

### 应用商店可用性

| 商店 | 链接 |
|-------|------|
| **Chrome 应用商店** | [![Available in the Chrome Web Store](https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png)](https://chromewebstore.google.com/detail/xget-for-chrome/ajiejgobfcifcikbahpijopolfjoodgf?hl=zh-CN) |
| **Microsoft Edge 加载项** | [Available in the Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/jigpfhbegabdenhihpplcjhpfdcgnalc?hl=zh-CN&gl=CN) |

### 手动安装

如果你更喜欢手动安装扩展或应用商店版本不可用，你可以直接下载并安装：

#### 选项 1：从 GitHub Releases 安装（推荐）

1. **下载扩展**
   - 前往 [Releases 页面](https://github.com/xixu-me/Xget-for-Chromium/releases)
   - 下载最新发布文件：
     - `chrome-extension.zip` - 适用于 Chrome 浏览器
     - `edge-extension.zip` - 适用于 Microsoft Edge
     - `extension.crx` - 适用于所有基于 Chromium 的浏览器的预打包扩展文件

2. **在 Chrome 中安装**
   - 打开 Chrome 并前往 `chrome://extensions/`
   - 启用「开发者模式」（右上角的切换开关）
   - 点击「加载已解压的扩展程序」并选择从 ZIP 文件解压的文件夹
   - 或者直接将 `.crx` 文件拖放到扩展页面

3. **在 Microsoft Edge 中安装**
   - 打开 Microsoft Edge 并前往 `edge://extensions/`
   - 启用「开发人员模式」（左侧边栏的切换开关）
   - 点击「加载解压缩的扩展」并选择从 ZIP 文件解压的文件夹
   - 或者直接将 `.crx` 文件拖放到扩展页面

4. **在其他基于 Chromium 的浏览器中安装**
   - 遵循与 Chrome 或 Microsoft Edge 类似的步骤，确保首先启用「开发者模式」
   - 直接将 `.crx` 文件拖放到扩展页面

#### 选项 2：从源码安装

1. **克隆存储库**

   ```bash
   git clone https://github.com/xixu-me/Xget-for-Chromium.git
   cd Xget-for-Chromium
   ```

2. **在浏览器中加载**
   - 打开浏览器的扩展管理页面
   - 启用「开发者模式」
   - 点击「加载已解压的扩展程序」并选择克隆的文件夹

#### 验证安装

安装后，你应该在浏览器工具栏中看到 Xget 扩展图标。点击它来配置你的 Xget 域名并开始加速下载！

## ⚙️ 设置

1. **配置 Xget 域名**
   - 点击工具栏中的扩展图标
   - 输入你的 Xget 域名（例如 `xget.xi-xu.me`）
   - 启用扩展

2. **选择平台**（可选）
   - 根据需要切换各个平台的开关
   - 默认启用所有平台（GitHub、GitLab、Hugging Face）

3. **开始下载**
   - 访问任何受支持的平台
   - 像往常一样点击下载链接
   - 下载将自动通过 Xget 加速

## 🎯 支持的平台

| 平台 | 状态 | URL 模式 | 扩展 ID |
|----------|---------|-------------|--------------|
| **GitHub** | ✅ 支持 | `github.com/*` | `gh` |
| **GitLab** | ✅ 支持 | `gitlab.com/*` | `gl` |
| **Hugging Face** | ✅ 支持 | `huggingface.co/*` | `hf` |

### 支持的下载类型

- **GitHub**：发布资源、存储库存档、原始文件、Git LFS 文件
- **GitLab**：项目存档、发布下载、存储库导出
- **Hugging Face**：模型文件、数据集文件、模型卡片、分词器

## 🔧 工作原理

1. **检测**：扩展监控受支持平台上的下载链接
2. **转换**：URL 自动转换为 Xget 兼容格式
3. **重定向**：下载通过你配置的 Xget 域名路由
4. **加速**：Xget 的全球 CDN 和优化功能提供更快的下载速度

### URL 转换示例

```text
原始：     https://github.com/user/repo/archive/main.zip
Xget：     https://xget.xi-xu.me/gh/user/repo/archive/main.zip

原始：     https://gitlab.com/user/repo/-/archive/main.zip  
Xget：     https://xget.xi-xu.me/gl/user/repo/-/archive/main.zip

原始：     https://huggingface.co/user/model/resolve/main/model.bin
Xget：     https://xget.xi-xu.me/hf/user/model/resolve/main/model.bin
```

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

### 基准测试

| 文件类型 | 原始速度 | 使用 Xget | 提升 |
|-----------|----------------|-----------|-------------|
| GitHub Release (100MB) | 2.5 MB/s | 12.8 MB/s | **快 5.1 倍** |
| 存储库存档 (50MB) | 1.8 MB/s | 8.2 MB/s | **快 4.6 倍** |
| Hugging Face 模型 (500MB) | 3.2 MB/s | 15.1 MB/s | **快 4.7 倍** |

> **注意**：结果可能因位置、网络条件和服务器负载而异

## 📋 要求

- **Chrome 浏览器**：版本 88+（Manifest V3 支持）
- **Xget 服务**：访问 Xget 实例
  - 使用公共实例：`xget.xi-xu.me`
  - 或部署你自己的：[Xget 存储库](https://github.com/xixu-me/Xget)（推荐）

### 关于 Xget 服务

Xget 是基于 Cloudflare Workers 构建的高性能、安全的代理服务，提供：

- **全球边缘分发**：通过 Cloudflare 的全球网络加快下载速度
- **多平台支持**：针对 GitHub、GitLab 和 Hugging Face 进行优化
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

### 调试模式

启用 Chrome 开发者工具并检查控制台选项卡中的调试消息：

- 扩展加载：「Xget for Chromium：内容脚本已加载」
- 下载重定向：「重定向下载：[原始] -> [xget]」
- 设置更改：「设置已更新！点击刷新页面」

## 📄 许可证

本项目采用 GPL-3.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## ❓ 常见问题

### 这个扩展是免费的吗？

是的，扩展完全免费且在 GPL-3.0 许可证下开源。

### 这对私有存储库有效吗？

扩展适用于任何可下载链接，但你需要对私有存储库有适当的访问权限。

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

## 🌟 支持我们

如果你觉得这个扩展有用，请：

- ⭐ 为此存储库点星
- 📝 在 [Chrome 应用商店](https://chromewebstore.google.com/detail/xget-for-chrome/ajiejgobfcifcikbahpijopolfjoodgf?hl=zh-CN) 留下评价
- 🐛 通过 [GitHub Issues](https://github.com/xixu-me/Xget-for-Chromium/issues) 报告错误或建议功能
- 📢 与其他可能受益于更快下载的人分享
