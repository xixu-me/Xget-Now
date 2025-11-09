/**
 * 平台特定的配置和检测
 *
 * 提供浏览器平台检测和特性识别功能：
 * - 检测当前运行的浏览器类型和版本
 * - 识别 Manifest 版本 (V2/V3)
 * - 检测移动端环境
 * - 识别开发版本
 */

/**
 * 平台检测器
 * 提供浏览器环境检测的核心功能
 */
const platformDetector = {
  /**
   * 检测当前浏览器平台
   *
   * @returns {Object} 平台检测结果
   * @property {string} platform - 浏览器类型 (firefox/chrome/edge/opera/safari/unknown)
   * @property {number} version - 浏览器主版本号
   * @property {number} manifestVersion - Manifest 版本号
   * @property {boolean} isMobile - 是否为移动端
   * @property {boolean} isDevBuild - 是否为开发版本
   */
  detect() {
    const manifest =
      typeof browser !== "undefined" && browser.runtime
        ? browser.runtime.getManifest()
        : chrome.runtime.getManifest();

    const ua = navigator.userAgent;
    const extURL =
      typeof browser !== "undefined" && browser.runtime
        ? browser.runtime.getURL("")
        : chrome.runtime.getURL("");

    let platform = "unknown";
    let version = 0;

    // 根据扩展 URL 前缀检测浏览器类型
    if (extURL.startsWith("moz-extension://")) {
      platform = "firefox";
      const match = /Firefox\/(\d+)/.exec(ua);
      version = match ? parseInt(match[1], 10) : 115;
    } else if (extURL.startsWith("safari-web-extension://")) {
      platform = "safari";
      const match = /Version\/(\d+)/.exec(ua);
      version = match ? parseInt(match[1], 10) : 15;
    } else if (/\bEdg\/\b/.test(ua)) {
      platform = "edge";
      const match = /Edg\/(\d+)/.exec(ua);
      version = match ? parseInt(match[1], 10) : 120;
    } else if (/\bOPR\/\b/.test(ua)) {
      platform = "opera";
      const match = /OPR\/(\d+)/.exec(ua);
      version = match ? parseInt(match[1], 10) : 120;
    } else {
      platform = "chrome";
      const match = /Chrome\/(\d+)/.exec(ua);
      version = match ? parseInt(match[1], 10) : 120;
    }

    return {
      platform,
      version,
      manifestVersion: manifest.manifest_version,
      isMobile: /\bMobile\b/.test(ua),
      isDevBuild: /^\d+\.\d+\.\d+\D/.test(manifest.version),
    };
  },

  /**
   * 获取平台特定的能力
   */
  getCapabilities(platformInfo = null) {
    const info = platformInfo || this.detect();

    const capabilities = {
      // 基础能力
      downloads: true,
      storage: true,
      tabs: true,

      // 高级能力
      declarativeNetRequest: false,
      offscreen: false,
      scripting: false,

      // 特殊能力
      popupResize: true,
      contextMenus: true,
      notifications: true,
    };

    // Firefox 特定能力
    if (info.platform === "firefox") {
      capabilities.webRequest = true;
      capabilities.contentSecurityPolicy = false; // 在 Manifest V2 中有限制
      capabilities.popupResize = false; // Firefox 不支持动态调整弹窗大小
    }

    // Chromium 特定能力
    if (
      info.platform === "chrome" ||
      info.platform === "edge" ||
      info.platform === "opera"
    ) {
      if (info.manifestVersion === 3) {
        capabilities.declarativeNetRequest = true;
        capabilities.offscreen = info.version >= 109;
        capabilities.scripting = true;
        capabilities.webRequest = false; // MV3 中 webRequest 被限制
      } else {
        capabilities.webRequest = true;
      }
    }

    // Safari 特定能力
    if (info.platform === "safari") {
      capabilities.notifications = false; // Safari 扩展通知支持有限
      capabilities.contextMenus = false; // Safari 扩展上下文菜单支持有限
    }

    return capabilities;
  },

  /**
   * 获取平台特定的限制
   */
  getLimitations(platformInfo = null) {
    const info = platformInfo || this.detect();

    const limitations = {
      maxStorageSize: Infinity,
      maxDownloadConcurrency: 10,
      requiresUserGesture: false,
      contentScriptLimitations: [],
    };

    if (info.platform === "firefox") {
      limitations.maxStorageSize = 5 * 1024 * 1024; // 5MB for local storage
      limitations.contentScriptLimitations = [
        "limited-eval", // eval() 受限
        "no-dynamic-import", // 动态导入受限
      ];
    }

    if (info.platform === "safari") {
      limitations.maxStorageSize = 10 * 1024 * 1024; // 10MB
      limitations.requiresUserGesture = true; // 许多操作需要用户手势
      limitations.maxDownloadConcurrency = 3; // 下载并发限制更严格
    }

    return limitations;
  },
};

// 导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = { platformDetector };
} else {
  window.platformDetector = platformDetector;
}
