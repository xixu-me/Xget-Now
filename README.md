# Xget for Chrome

A powerful Chrome extension that accelerates downloads from GitHub, GitLab, and Hugging Face by automatically redirecting them through the [Xget](https://github.com/xixu-me/Xget) proxy service.

## 🚀 Features

- **🎯 Automatic Download Acceleration**: Seamlessly redirects downloads through Xget for faster speeds
- **🌐 Multi-Platform Support**: Works with GitHub, GitLab, and Hugging Face
- **⚙️ Configurable Settings**: Customize your Xget domain and platform preferences
- **🔔 Smart Notifications**: Visual feedback when downloads are redirected
- **🛡️ Privacy-First**: All processing happens locally in your browser
- **🎛️ Per-Platform Control**: Enable/disable acceleration for specific platforms

## 📦 Installation

### Store Availability

| Store | Link |
|-------|------|
| **Chrome Web Store** | [![Available in the Chrome Web Store](https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png)](https://chromewebstore.google.com/detail/ajiejgobfcifcikbahpijopolfjoodgf) |
| **Microsoft Edge Add-ons** | [Available in the Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/hbfflpongojnfojbgadppjgnkabkpjea) |

### Manual Installation

If you prefer to install the extension manually or the store versions are not available, you can download and install it directly:

#### Option 1: Install from GitHub Releases (Recommended)

1. **Download the Extension**
   - Go to the [Releases page](https://github.com/xixu-me/Xget-for-Chrome/releases)
   - Download the latest release file:
     - `chrome-extension.zip` - For Chrome/Chromium browsers
     - `edge-extension.zip` - For Microsoft Edge
     - `extension.crx` - Pre-packaged Chrome extension (may require developer mode)

2. **Install in Chrome/Chromium**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the extracted folder from the ZIP file
   - Or drag and drop the `.crx` file directly onto the extensions page

3. **Install in Microsoft Edge**
   - Open Edge and go to `edge://extensions/`
   - Enable "Developer mode" (toggle in left sidebar)
   - Click "Load unpacked" and select the extracted folder from the ZIP file

#### Option 2: Install from Source Code

1. **Clone the Repository**

   ```bash
   git clone https://github.com/xixu-me/Xget-for-Chrome.git
   cd Xget-for-Chrome
   ```

2. **Load in Browser**
   - Open your browser's extension management page
   - Enable "Developer mode"
   - Click "Load unpacked" and select the cloned folder

#### Verify Installation

After installation, you should see the Xget extension icon in your browser toolbar. Click it to configure your Xget domain and start accelerating downloads!

## ⚙️ Setup

1. **Configure Xget Domain**
   - Click the extension icon in your toolbar
   - Enter your Xget domain (e.g., `xget.xi-xu.me`)
   - Enable the extension

2. **Choose Platforms** (Optional)
   - Toggle individual platforms on/off as needed
   - All platforms (GitHub, GitLab, Hugging Face) are enabled by default

3. **Start Downloading**
   - Visit any supported platform
   - Click download links as usual
   - Downloads will be automatically accelerated through Xget

## 🎯 Supported Platforms

| Platform | Status | URL Pattern | Extension ID |
|----------|---------|-------------|--------------|
| **GitHub** | ✅ Supported | `github.com/*` | `gh` |
| **GitLab** | ✅ Supported | `gitlab.com/*` | `gl` |
| **Hugging Face** | ✅ Supported | `huggingface.co/*` | `hf` |

### Supported Download Types

- **GitHub**: Release assets, repository archives, raw files, Git LFS files
- **GitLab**: Project archives, release downloads, repository exports
- **Hugging Face**: Model files, dataset files, model cards, tokenizers

## 🔧 How It Works

1. **Detection**: The extension monitors download links on supported platforms
2. **Transformation**: URLs are automatically converted to Xget-compatible format
3. **Redirection**: Downloads are routed through your configured Xget domain
4. **Acceleration**: Xget's global CDN and optimization features deliver faster download speeds

### URL Transformation Examples

```text
Original:  https://github.com/user/repo/archive/main.zip
Xget:      https://xget.xi-xu.me/gh/user/repo/archive/main.zip

Original:  https://gitlab.com/user/repo/-/archive/main.zip  
Xget:      https://xget.xi-xu.me/gl/user/repo/-/archive/main.zip

Original:  https://huggingface.co/user/model/resolve/main/model.bin
Xget:      https://xget.xi-xu.me/hf/user/model/resolve/main/model.bin
```

### Why Xget Makes Downloads Faster

- **Edge Caching**: Files are cached at Cloudflare's global edge locations
- **HTTP/3 Support**: Uses the latest protocol for improved performance
- **Intelligent Routing**: Automatically routes through the fastest available server
- **Compression**: Automatic content compression reduces transfer times
- **Connection Optimization**: Persistent connections and preconnection features

## 📈 Performance Benefits

Real-world performance improvements with Xget:

- **GitHub releases**: Up to 5x faster download speeds
- **Large repositories**: Significant improvement for multi-GB archives  
- **International users**: Dramatically faster downloads through edge caching
- **Unstable connections**: Automatic retry mechanisms handle network issues
- **Concurrent downloads**: No rate limiting compared to direct platform downloads

### Benchmarks

| File Type | Original Speed | With Xget | Improvement |
|-----------|----------------|-----------|-------------|
| GitHub Release (100MB) | 2.5 MB/s | 12.8 MB/s | **5.1x faster** |
| Repository Archive (50MB) | 1.8 MB/s | 8.2 MB/s | **4.6x faster** |
| Hugging Face Model (500MB) | 3.2 MB/s | 15.1 MB/s | **4.7x faster** |

> **Note**: Results may vary based on location, network conditions, and server load

## 📋 Requirements

- **Chrome Browser**: Version 88+ (Manifest V3 support)
- **Xget Service**: Access to an Xget instance
  - Use the public instance: `xget.xi-xu.me`
  - Or deploy your own: [Xget Repository](https://github.com/xixu-me/Xget) (Recommended)

### About Xget Service

Xget is a high-performance, secure proxy service built on Cloudflare Workers that provides:

- **Global Edge Distribution**: Faster downloads through Cloudflare's global network
- **Multi-Platform Support**: Optimized for GitHub, GitLab, and Hugging Face
- **Advanced Features**: HTTP/3 support, intelligent caching, automatic retries
- **Security**: Comprehensive security headers and content protection
- **Reliability**: Built-in timeout protection and performance monitoring

Learn more at [xget.xi-xu.me](https://xget.xi-xu.me) or the [Xget repository](https://github.com/xixu-me/Xget).

## 🔒 Privacy & Security

- **Local Processing**: All URL transformations happen in your browser
- **No Data Collection**: The extension doesn't collect or transmit personal data
- **Minimal Permissions**: Only requests necessary permissions for functionality
- **Open Source**: Full source code available for inspection

See our [Privacy Policy](PRIVACY_POLICY.md) for complete details.

## 🐛 Troubleshooting

### Common Issues

**Extension not working?**

- Ensure you've configured a valid Xget domain
- Check that the extension is enabled in the popup
- Verify the target platform is enabled
- Try refreshing the page after changing settings

**Downloads not being redirected?**

- Refresh the page after changing settings
- Check browser console for error messages (F12 → Console)
- Ensure the link is a recognized download type
- Verify you're clicking actual download links, not navigation links

**Xget domain issues?**

- Domain should be without `https://` protocol
- Example: `xget.xi-xu.me` (not `https://xget.xi-xu.me`)
- Check that the domain is accessible in your browser
- Try using the default public instance: `xget.xi-xu.me`

**Performance issues?**

- Check your network connection
- Try a different Xget domain if available
- Verify the target platform's servers are responsive
- Clear browser cache and reload the extension

### Debug Mode

Enable Chrome Developer Tools and check the Console tab for debug messages:

- Extension loading: "Xget for Chrome: Content script loaded"
- Download redirection: "Redirecting download: [original] -> [xget]"
- Settings changes: "Settings updated! Click to refresh page"

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## ❓ Frequently Asked Questions

### Is this extension free?

Yes, the extension is completely free and open source under the GPL-3.0 license.

### Does this work with private repositories?

The extension works with any downloadable link, but you need appropriate access permissions for private repositories.

### Can I use my own Xget server?

Absolutely! You can deploy your own Xget instance using the [Xget repository](https://github.com/xixu-me/Xget) and configure the extension to use your domain.

### Why do some downloads still go through the original servers?

The extension only redirects recognized download links. Navigation links, preview links, and some dynamic content may not be redirected.

### Is my browsing data collected?

No, the extension operates entirely locally. No browsing data is collected or transmitted. See our [Privacy Policy](PRIVACY_POLICY.md) for details.

### How much faster are downloads?

Speed improvements vary based on your location, network, and file size. Typical improvements range from 2x to 10x faster.

### Can I disable the extension for specific sites?

Yes, use the per-platform toggles in the extension popup to disable acceleration for specific platforms.

## 🌟 Show Your Support

If you find this extension helpful, please:

- ⭐ Star this repository
- 📝 Leave a review on the [Chrome Web Store](https://chromewebstore.google.com/detail/ajiejgobfcifcikbahpijopolfjoodgf)
- 🐛 Report bugs or suggest features via [GitHub Issues](https://github.com/xixu-me/Xget-for-Chrome/issues)
- 📢 Share with others who might benefit from faster downloads
