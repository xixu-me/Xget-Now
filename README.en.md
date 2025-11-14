# Xget Now

***[汉语](README.md)***

A cross-browser extension for Chromium and Firefox that accelerates file downloads by seamlessly forwarding them to an [Xget](https://github.com/xixu-me/Xget) instance.

## 🚀 Features

- **🎯 Automatic Download Acceleration**: Seamlessly redirect downloads through Xget for faster speeds
- **⚙️ Configurable Settings**: Customize your Xget domain and platform preferences
- **🔔 Smart Notifications**: Visual feedback when downloads are redirected
- **🛡️ Privacy-First**: All processing happens locally in your browser
- **🎛️ Per-Platform Control**: Enable/disable acceleration for specific platforms
- **🌐 Cross-Browser Support**: Works on both Chromium and Firefox browsers

## 📦 Installation

### Store Availability

- [Chrome Web Store](https://chromewebstore.google.com/detail/ajiejgobfcifcikbahpijopolfjoodgf?hl=en)
- [Chrome Web Store Mirror](https://chromewebstore.xi-xu.me/detail/ajiejgobfcifcikbahpijopolfjoodgf)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/xget-now/)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/jigpfhbegabdenhihpplcjhpfdcgnalc)

### Manual Installation

If you prefer to manually install the extension or if the store version is unavailable, you can download and install it directly:

#### Option 1: Install from GitHub Releases (Recommended)

1. **Download the Extension**
   - Go to the [Releases page](https://github.com/xixu-me/Xget-Now/releases/latest)
   - Download the appropriate extension file for your browser:
     - `Xget-Now_x.x.x.chromium.zip` - For all Chromium-based browsers (Chrome, Edge, Opera, etc.)
     - `Xget-Now_x.x.x.firefox.zip` - For Firefox browsers

2. **Install in Chrome**
   - Extract the downloaded Chromium version .zip file
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right corner)
   - Click "Load unpacked" and select the extracted folder

3. **Install in Firefox**
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the downloaded Firefox version .zip file or the `manifest.json` file from the extracted folder

4. **Install in Edge**
   - Extract the downloaded Chromium version .zip file
   - Open Edge and navigate to `edge://extensions/`
   - Enable "Developer mode" (toggle in the left sidebar)
   - Click "Load unpacked" and select the extracted folder

5. **Install in Other Chromium-Based Browsers**
   - Use the Chromium version of the extension package
   - Follow similar steps as Chrome or Edge, ensuring "Developer mode" is enabled first
   - Refer to your specific browser's extension installation guide

#### Option 2: Install from Source

1. **Clone the Repository**

   ```bash
   git clone https://github.com/xixu-me/Xget-Now.git
   cd Xget-Now
   ```

2. **Build the Extension (Optional)**

   If you want to use the optimized version:

   ```bash
   # Install Python 3.7+
   pip install -r requirements.txt  # If there's a requirements file

   # Build for specific browser
   python build.py --platform chrome    # Build Chrome version
   python build.py --platform firefox   # Build Firefox version
   python build.py --platform all       # Build all versions
   ```

3. **Load in Browser**

   **Chromium Browsers:**
   - Open your browser's extensions management page (`chrome://extensions/` or `edge://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked" and select:
     - The repository root directory (if using raw source)
     - The `build/chrome/` directory (if using built version)

   **Firefox Browser:**
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select either:
     - `manifest-firefox.json` from the repository root (if using raw source)
     - `manifest.json` from the `build/firefox/` directory (if using built version)

#### Verify Installation

After installation, you should see the Xget extension icon in your browser toolbar. Click it to configure your Xget domain and start accelerating downloads!

## ⚙️ Configuration

1. **Configure Xget Domain**
   - Click the extension icon in the toolbar
   - Enter your Xget domain (e.g., `xget.xi-xu.me`)
   - Enable the extension

2. **Select Platforms**
   - Toggle switches for individual platforms as needed
   - All platforms are enabled by default

3. **Start Downloading**
   - Visit any supported platform
   - Click download links as usual
   - Downloads will automatically be accelerated through Xget

## 🔧 How It Works

1. **Detection**: The extension monitors download links on supported platforms
2. **Transformation**: URLs are automatically converted to Xget-compatible format
3. **Redirection**: Downloads are routed through your configured Xget domain
4. **Acceleration**: Xget's global CDN and optimization features provide faster download speeds

## 📋 Requirements

### Browser Support

**Chromium Browsers:**

- **Chrome**: Version 88+
- **Edge**: Version 88+
- **Opera**: Version 74+
- **Other Chromium-based browsers**: Versions supporting Manifest V3

**Firefox Browsers:**

- **Firefox**: Version 109+
- **Firefox ESR**: Version 109+

### Xget Instance

Use the pre-deployed instance `xget.xi-xu.me` or deploy your own by following the [Xget deployment documentation](https://github.com/xixu-me/Xget#-deployment).

## 🔒 Privacy & Security

- **Local Processing**: All URL transformations happen in your browser
- **No Data Collection**: The extension doesn't collect or transmit personal data
- **Minimal Permissions**: Only requests necessary permissions for functionality
- **Open Source**: Full source code available for inspection

See our [Privacy Policy](PRIVACY_POLICY.md) for complete details.

## 🐛 Troubleshooting

### Common Issues

**Extension Not Working?**

- Ensure you've configured a valid Xget domain
- Check if the extension is enabled in the popup
- Verify the target platform is enabled
- Try refreshing the page after changing settings

**Downloads Not Being Redirected?**

- Refresh the page after changing settings
- Check browser console for error messages (F12 → Console)
- Ensure the link is a recognized download type
- Verify you're clicking an actual download link, not a navigation link

**Xget Domain Issues?**

- Domain should be without the `https://` protocol
- Example: `xget.xi-xu.me` (not `https://xget.xi-xu.me`)
- Check if the domain is accessible in your browser
- Try using the default pre-deployed instance: `xget.xi-xu.me`

**Performance Issues?**

- Check your network connection
- Try a different Xget domain if available
- Verify the target platform's servers are responsive
- Clear browser cache and reload the extension

**Firefox-Specific Issues?**

- Ensure Firefox version is 109+
- Check if the extension is properly loaded in `about:debugging`
- Firefox may require a browser restart to fully apply extension settings
- Check Firefox's Privacy & Security settings aren't blocking extension features

### Debug Mode

**Chromium Browsers:**

Enable Chrome DevTools and check the Console tab for debug messages:

**Firefox Browser:**

1. Open `about:debugging`
2. Click "This Firefox"
3. Find the Xget Now extension and click "Inspect"
4. View console messages in the opened developer tools

**Common Debug Messages:**

- Extension loaded: "Xget Now: Content script loaded"
- Download redirect: "Redirecting download: [original] -> [Xget]"
- Settings changed: "Settings updated! Click to refresh page"

## 📄 License

This repository is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## ❓ FAQ

### Is this extension free?

Yes, the extension is completely free and open source under the GPL-3.0 license.

### Can I use my own Xget server?

Absolutely! You can deploy your own Xget instance using the [Xget repository](https://github.com/xixu-me/Xget) and configure the extension to use your domain.

### Why are some downloads still going through the original server?

The extension only redirects recognized download links. Navigation links, preview links, and some dynamic content may not be redirected.

### Will my browsing data be collected?

No, the extension runs entirely locally. No browsing data is collected or transmitted. See our [Privacy Policy](PRIVACY_POLICY.md) for details.

### How much faster are the downloads?

Speed improvements vary depending on your location, network, and file size. Typical improvements range from 2x to 10x faster.

### Can I disable the extension for specific websites?

Yes, use the per-platform toggle switches in the extension popup to disable acceleration for specific platforms.

### Why are there different versions for Chrome and Firefox?

Due to browser architecture differences, we've optimized for each browser:

- **Chrome version**: Uses Manifest V3, supporting the latest extension APIs and security features
- **Firefox version**: Uses Manifest V2, ensuring optimal compatibility with Firefox's extension system

The core functionality is identical across both versions, with only slight technical implementation differences.

### Can I use it in both Chrome and Firefox simultaneously?

Absolutely! You can install and use Xget Now in multiple browsers simultaneously, and they'll work independently with their own settings.

## 🌟 Support Us

If you find this extension useful, please:

- ⭐ Star this repository
- 📝 Leave a review:
  - [Chrome Web Store](https://chromewebstore.google.com/detail/ajiejgobfcifcikbahpijopolfjoodgf?hl=en)
  - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/xget-now/)
  - [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/jigpfhbegabdenhihpplcjhpfdcgnalc)
- 🐛 Report bugs or suggest features via [GitHub Issues](https://github.com/xixu-me/Xget-Now/issues)
- 📢 Share with others who might benefit from faster downloads
