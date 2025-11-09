/**
 * WebExtension API 兼容层
 *
 * 提供跨浏览器的统一 API 接口，解决不同浏览器间的差异：
 * - Firefox 使用 browser API，返回 Promise
 * - Chromium 使用 chrome API，使用回调函数
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
  let manifest;

  try {
    manifest = chrome.runtime.getManifest();
  } catch (error) {
    console.warn("Could not get manifest in current context:", error);
    manifest = { version: "0.0.0" }; // 默认版本
  }

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
  let api;
  try {
    api = typeof browser !== "undefined" && browser.runtime ? browser : chrome;
    if (!api || !api.runtime) {
      throw new Error("No WebExtension API available");
    }
  } catch (error) {
    console.error("Failed to initialize WebExtension API:", error);
    // 创建一个最小的 API 存根
    api = {
      runtime: { getManifest: () => ({ version: "0.0.0" }) },
      storage: { local: {}, sync: {} },
      tabs: {},
      downloads: {},
    };
  }

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

  // 专门的 sendMessage 包装器
  const createSendMessage = (runtimeAPI) => {
    if (!runtimeAPI || !runtimeAPI.sendMessage) {
      return async () => {
        console.warn("runtime.sendMessage not available");
        return null;
      };
    }

    return function (...args) {
      return new Promise((resolve, reject) => {
        try {
          if (args.length === 1) {
            // sendMessage(message)
            runtimeAPI.sendMessage(args[0], (response) => {
              if (api.runtime.lastError) {
                console.warn(
                  "SendMessage failed:",
                  api.runtime.lastError.message
                );
                resolve(null);
              } else {
                resolve(response);
              }
            });
          } else if (args.length === 2) {
            // 检查第二个参数是否是函数（回调）
            if (typeof args[1] === "function") {
              // sendMessage(message, callback) - 直接调用回调，不使用 Promise
              runtimeAPI.sendMessage(args[0], args[1]);
              resolve(undefined); // 立即解析 Promise
            } else if (typeof args[0] === "string" && args[0].length > 10) {
              // sendMessage(extensionId, message)
              runtimeAPI.sendMessage(args[0], args[1], (response) => {
                if (api.runtime.lastError) {
                  console.warn(
                    "SendMessage failed:",
                    api.runtime.lastError.message
                  );
                  resolve(null);
                } else {
                  resolve(response);
                }
              });
            } else {
              // sendMessage(message, options)
              runtimeAPI.sendMessage(args[0], args[1], (response) => {
                if (api.runtime.lastError) {
                  console.warn(
                    "SendMessage failed:",
                    api.runtime.lastError.message
                  );
                  resolve(null);
                } else {
                  resolve(response);
                }
              });
            }
          } else if (args.length === 3) {
            // 检查第三个参数是否是函数（回调）
            if (typeof args[2] === "function") {
              // sendMessage(extensionId, message, callback) 或 sendMessage(message, options, callback)
              runtimeAPI.sendMessage(args[0], args[1], args[2]);
              resolve(undefined); // 立即解析 Promise
            } else {
              // sendMessage(extensionId, message, options)
              runtimeAPI.sendMessage(args[0], args[1], args[2], (response) => {
                if (api.runtime.lastError) {
                  console.warn(
                    "SendMessage failed:",
                    api.runtime.lastError.message
                  );
                  resolve(null);
                } else {
                  resolve(response);
                }
              });
            }
          } else if (args.length === 4 && typeof args[3] === "function") {
            // sendMessage(extensionId, message, options, callback)
            runtimeAPI.sendMessage(args[0], args[1], args[2], args[3]);
            resolve(undefined); // 立即解析 Promise
          } else {
            console.warn("Invalid arguments for sendMessage:", args);
            resolve(null);
          }
        } catch (error) {
          console.warn("SendMessage error:", error);
          resolve(null);
        }
      });
    };
  };

  // 专门的 tabs.sendMessage 包装器
  const createTabsSendMessage = (tabsAPI) => {
    if (!tabsAPI || !tabsAPI.sendMessage) {
      return async () => {
        console.warn("tabs.sendMessage not available");
        return null;
      };
    }

    return function (tabId, message, options = {}) {
      return new Promise((resolve, reject) => {
        try {
          if (arguments.length === 2) {
            // sendMessage(tabId, message)
            tabsAPI.sendMessage(tabId, message, (response) => {
              if (api.runtime.lastError) {
                console.warn(
                  "Tabs sendMessage failed:",
                  api.runtime.lastError.message
                );
                resolve(null);
              } else {
                resolve(response);
              }
            });
          } else {
            // sendMessage(tabId, message, options)
            tabsAPI.sendMessage(tabId, message, options, (response) => {
              if (api.runtime.lastError) {
                console.warn(
                  "Tabs sendMessage failed:",
                  api.runtime.lastError.message
                );
                resolve(null);
              } else {
                resolve(response);
              }
            });
          }
        } catch (error) {
          console.warn("Tabs sendMessage error:", error);
          resolve(null);
        }
      });
    };
  };

  return {
    // Runtime API
    runtime: {
      getManifest: () => api.runtime.getManifest(),
      getURL: (path) => api.runtime.getURL(path),
      sendMessage: createSendMessage(api.runtime),
      connect: (connectInfo) => api.runtime.connect(connectInfo),
      onMessage: api.runtime.onMessage,
      onConnect: api.runtime.onConnect,
      onInstalled: api.runtime.onInstalled,
      onStartup: api.runtime.onStartup,
      lastError: api.runtime.lastError,
      id: api.runtime.id,
    },

    // Tabs API
    tabs: api.tabs
      ? {
          query: promisifyNoFail(api.tabs, "query", []),
          get: promisifyNoFail(api.tabs, "get"),
          create: promisifyNoFail(api.tabs, "create"),
          update: promisifyNoFail(api.tabs, "update"),
          remove: promisifyNoFail(api.tabs, "remove"),
          sendMessage: createTabsSendMessage(api.tabs),
          executeScript: promisifyNoFail(api.tabs, "executeScript"),
          insertCSS: promisifyNoFail(api.tabs, "insertCSS"),
          removeCSS: promisifyNoFail(api.tabs, "removeCSS"),
          onUpdated: api.tabs.onUpdated,
          onActivated: api.tabs.onActivated,
          onRemoved: api.tabs.onRemoved,
        }
      : {
          query: async () => [],
          get: async () => null,
          create: async () => null,
          update: async () => null,
          remove: async () => null,
          sendMessage: async () => null,
          executeScript: async () => null,
          insertCSS: async () => null,
          removeCSS: async () => null,
          onUpdated: { addListener: () => {}, removeListener: () => {} },
          onActivated: { addListener: () => {}, removeListener: () => {} },
          onRemoved: { addListener: () => {}, removeListener: () => {} },
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
    downloads: api.downloads
      ? {
          download: promisifyNoFail(api.downloads, "download"),
          search: promisifyNoFail(api.downloads, "search", []),
          cancel: promisifyNoFail(api.downloads, "cancel"),
          pause: promisifyNoFail(api.downloads, "pause"),
          resume: promisifyNoFail(api.downloads, "resume"),
          erase: promisifyNoFail(api.downloads, "erase"),
          removeFile: promisifyNoFail(api.downloads, "removeFile"),
          show: promisifyNoFail(api.downloads, "show"),
          showDefaultFolder: promisifyNoFail(
            api.downloads,
            "showDefaultFolder"
          ),
          onCreated: api.downloads.onCreated,
          onChanged: api.downloads.onChanged,
          onErased: api.downloads.onErased,
          onDeterminingFilename: api.downloads.onDeterminingFilename,
        }
      : {
          download: async () => null,
          search: async () => [],
          cancel: async () => null,
          pause: async () => null,
          resume: async () => null,
          erase: async () => null,
          removeFile: async () => null,
          show: async () => null,
          showDefaultFolder: async () => null,
          onCreated: { addListener: () => {}, removeListener: () => {} },
          onChanged: { addListener: () => {}, removeListener: () => {} },
          onErased: { addListener: () => {}, removeListener: () => {} },
          onDeterminingFilename: {
            addListener: () => {},
            removeListener: () => {},
          },
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
} else if (typeof window !== "undefined") {
  // 浏览器环境（内容脚本、弹出窗口等）
  window.webext = webext;
  window.webextFlavor = webextFlavor;
  console.log("WebExt compatibility layer loaded in browser environment");
} else if (typeof self !== "undefined") {
  // 服务工作器环境
  self.webext = webext;
  self.webextFlavor = webextFlavor;
  console.log(
    "WebExt compatibility layer loaded in service worker environment"
  );
} else {
  // 全局环境
  this.webext = webext;
  this.webextFlavor = webextFlavor;
  console.log("WebExt compatibility layer loaded in global environment");
}
