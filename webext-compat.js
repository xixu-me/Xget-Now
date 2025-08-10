/**
 * WebExtension API 兼容层
 *
 * 提供跨浏览器的统一 API 接口，解决不同浏览器间的差异：
 * - Firefox 使用 browser API，返回 Promise
 * - Chrome/Chromium 使用 chrome API，使用回调函数
 * - 不同版本的 Manifest API 差异 (V2 vs V3)
 *
 * 功能：
 * - 自动检测当前浏览器环境
 * - 提供统一的 Promise 化 API 接口
 * - 处理 API 调用失败的情况
 * - 兼容不同浏览器的特性差异
 */

/**
 * 检测当前浏览器环境
 *
 * @returns {Object} 浏览器特性信息
 * @property {number} major - 浏览器主版本号
 * @property {Set<string>} soup - 浏览器特性标识集合
 */
const detectBrowser = () => {
  const ua = navigator.userAgent;
  const manifest = chrome.runtime.getManifest();

  const flavor = {
    major: 0,
    soup: new Set(["webext"]),
  };

  // 检测 Firefox
  if (
    typeof browser !== "undefined" &&
    browser.runtime &&
    browser.runtime.getURL("").startsWith("moz-extension://")
  ) {
    flavor.soup.add("firefox");
    const match = /Firefox\/(\d+)/.exec(ua);
    flavor.major = match ? parseInt(match[1], 10) : 115;

    // Firefox 特性检测
    if (CSS.supports("selector(a:has(b))")) {
      flavor.soup.add("native_css_has");
    }
  }
  // 检测基于 Chromium 的浏览器
  else {
    const match = /\bChrom(?:e|ium)\/(\d+)/.exec(ua);
    if (match !== null) {
      flavor.soup.add("chromium");
    }
    flavor.major = match ? parseInt(match[1], 10) : 120;

    // 检测具体浏览器
    if (/\bEdg\/\b/.test(ua)) {
      flavor.soup.add("edge");
    } else if (/\bOPR\/\b/.test(ua)) {
      flavor.soup.add("opera");
    } else {
      flavor.soup.add("chrome");
    }
  }

  // 检测移动端
  if (/\bMobile\b/.test(ua)) {
    flavor.soup.add("mobile");
  }

  // 检测开发版本
  if (/^\d+\.\d+\.\d+\D/.test(manifest.version)) {
    flavor.soup.add("devbuild");
  }

  return flavor;
};

// 浏览器特性检测
const webextFlavor = detectBrowser();

// 统一的 WebExtension API
const webext = (() => {
  // Firefox 使用 browser API，Chrome 使用 chrome API
  const api =
    typeof browser !== "undefined" && browser.runtime ? browser : chrome;

  // Promise 化函数的包装器
  const promisify = (context, methodName) => {
    const method = context[methodName];
    if (!method) {
      throw new Error(`Method ${methodName} not found`);
    }

    return function (...args) {
      return new Promise((resolve, reject) => {
        method.call(context, ...args, (result) => {
          if (api.runtime.lastError) {
            reject(new Error(api.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      });
    };
  };

  // 无失败的 Promise 包装器
  const promisifyNoFail = (context, methodName, defaultValue = undefined) => {
    try {
      const promisified = promisify(context, methodName);
      return async function (...args) {
        try {
          return await promisified(...args);
        } catch (error) {
          console.warn(`WebExt API call failed: ${methodName}`, error);
          return defaultValue;
        }
      };
    } catch (error) {
      // 如果方法不存在，返回空函数
      return async function () {
        console.warn(`WebExt API method not available: ${methodName}`);
        return defaultValue;
      };
    }
  };

  return {
    // Runtime API
    runtime: {
      getManifest: () => api.runtime.getManifest(),
      getURL: (path) => api.runtime.getURL(path),
      sendMessage: promisifyNoFail(api.runtime, "sendMessage"),
      connect: (connectInfo) => api.runtime.connect(connectInfo),
      onMessage: api.runtime.onMessage,
      onConnect: api.runtime.onConnect,
      lastError: api.runtime.lastError,
      id: api.runtime.id,
    },

    // Tabs API
    tabs: {
      query: promisifyNoFail(api.tabs, "query", []),
      get: promisifyNoFail(api.tabs, "get"),
      create: promisifyNoFail(api.tabs, "create"),
      update: promisifyNoFail(api.tabs, "update"),
      remove: promisifyNoFail(api.tabs, "remove"),
      sendMessage: promisifyNoFail(api.tabs, "sendMessage"),
      executeScript: promisifyNoFail(api.tabs, "executeScript"),
      insertCSS: promisifyNoFail(api.tabs, "insertCSS"),
      removeCSS: promisifyNoFail(api.tabs, "removeCSS"),
      onUpdated: api.tabs.onUpdated,
      onActivated: api.tabs.onActivated,
      onRemoved: api.tabs.onRemoved,
    },

    // Storage API
    storage: {
      local: {
        get: promisifyNoFail(api.storage.local, "get", {}),
        set: promisifyNoFail(api.storage.local, "set"),
        remove: promisifyNoFail(api.storage.local, "remove"),
        clear: promisifyNoFail(api.storage.local, "clear"),
        getBytesInUse: promisifyNoFail(api.storage.local, "getBytesInUse", 0),
      },
      sync: api.storage.sync
        ? {
            get: promisifyNoFail(api.storage.sync, "get", {}),
            set: promisifyNoFail(api.storage.sync, "set"),
            remove: promisifyNoFail(api.storage.sync, "remove"),
            clear: promisifyNoFail(api.storage.sync, "clear"),
            getBytesInUse: promisifyNoFail(
              api.storage.sync,
              "getBytesInUse",
              0
            ),
          }
        : null,
    },

    // Downloads API
    downloads: {
      download: promisifyNoFail(api.downloads, "download"),
      search: promisifyNoFail(api.downloads, "search", []),
      cancel: promisifyNoFail(api.downloads, "cancel"),
      pause: promisifyNoFail(api.downloads, "pause"),
      resume: promisifyNoFail(api.downloads, "resume"),
      erase: promisifyNoFail(api.downloads, "erase"),
      removeFile: promisifyNoFail(api.downloads, "removeFile"),
      show: promisifyNoFail(api.downloads, "show"),
      showDefaultFolder: promisifyNoFail(api.downloads, "showDefaultFolder"),
      onCreated: api.downloads.onCreated,
      onChanged: api.downloads.onChanged,
      onErased: api.downloads.onErased,
    },

    // Browser Action / Action API (兼容不同版本)
    action: (() => {
      // Manifest V3 使用 action，V2 使用 browserAction
      const actionAPI = api.action || api.browserAction;
      if (!actionAPI) return null;

      return {
        setTitle: promisifyNoFail(actionAPI, "setTitle"),
        getTitle: promisifyNoFail(actionAPI, "getTitle"),
        setIcon: promisifyNoFail(actionAPI, "setIcon"),
        setPopup: promisifyNoFail(actionAPI, "setPopup"),
        getPopup: promisifyNoFail(actionAPI, "getPopup"),
        setBadgeText: promisifyNoFail(actionAPI, "setBadgeText"),
        getBadgeText: promisifyNoFail(actionAPI, "getBadgeText"),
        setBadgeBackgroundColor: promisifyNoFail(
          actionAPI,
          "setBadgeBackgroundColor"
        ),
        getBadgeBackgroundColor: promisifyNoFail(
          actionAPI,
          "getBadgeBackgroundColor"
        ),
        setBadgeTextColor: promisifyNoFail(actionAPI, "setBadgeTextColor"),
        getBadgeTextColor: promisifyNoFail(actionAPI, "getBadgeTextColor"),
        enable: promisifyNoFail(actionAPI, "enable"),
        disable: promisifyNoFail(actionAPI, "disable"),
        onClicked: actionAPI.onClicked,
      };
    })(),

    // Permissions API
    permissions: {
      contains: promisifyNoFail(api.permissions, "contains", false),
      getAll: promisifyNoFail(api.permissions, "getAll", {
        origins: [],
        permissions: [],
      }),
      request: promisifyNoFail(api.permissions, "request", false),
      remove: promisifyNoFail(api.permissions, "remove", false),
      onAdded: api.permissions?.onAdded,
      onRemoved: api.permissions?.onRemoved,
    },

    // i18n API
    i18n: {
      getMessage: (messageName, substitutions) =>
        api.i18n.getMessage(messageName, substitutions),
      getAcceptLanguages: promisifyNoFail(api.i18n, "getAcceptLanguages", []),
      getUILanguage: () => api.i18n.getUILanguage(),
      detectLanguage: promisifyNoFail(api.i18n, "detectLanguage"),
    },
  };
})();

// 导出接口
if (typeof module !== "undefined" && module.exports) {
  // Node.js 环境
  module.exports = { webext, webextFlavor };
} else {
  // 浏览器环境
  window.webext = webext;
  window.webextFlavor = webextFlavor;
}
