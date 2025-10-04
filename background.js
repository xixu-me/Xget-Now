/**
 * Xget Now - 扩展后台脚本
 *
 * 功能：
 * - 处理扩展设置管理
 * - 监听标签页更新事件
 * - 处理来自内容脚本的消息
 * - 管理扩展状态和配置
 */

// Firefox/Zen Browser 兼容性处理
// 在 Firefox 中不使用 importScripts，而是依赖 manifest 中的脚本加载顺序

// 等待兼容层加载
const waitForWebext = () => {
  return new Promise((resolve) => {
    if (typeof webext !== "undefined") {
      resolve();
    } else {
      // 如果 webext 不可用，创建基本的兼容层
      const api = typeof browser !== "undefined" ? browser : chrome;
      window.webext = {
        runtime: {
          onInstalled: api.runtime.onInstalled,
          onMessage: api.runtime.onMessage,
          sendMessage: api.runtime.sendMessage?.bind(api.runtime) || (() => Promise.resolve(null))
        },
        storage: {
          local: {
            get: (keys) => api.storage.local.get(keys),
            set: (items) => api.storage.local.set(items)
          },
          sync: api.storage.sync ? {
            get: (keys) => api.storage.sync.get(keys),
            set: (items) => api.storage.sync.set(items)
          } : null
        },
        downloads: api.downloads ? {
          onDeterminingFilename: api.downloads.onDeterminingFilename,
          cancel: api.downloads.cancel?.bind(api.downloads) || (() => Promise.resolve()),
          download: api.downloads.download?.bind(api.downloads) || (() => Promise.resolve())
        } : {
          onDeterminingFilename: { addListener: () => {} },
          cancel: () => Promise.resolve(),
          download: () => Promise.resolve()
        },
        tabs: api.tabs ? {
          query: api.tabs.query?.bind(api.tabs) || (() => Promise.resolve([])),
          sendMessage: api.tabs.sendMessage?.bind(api.tabs) || (() => Promise.resolve(null))
        } : {
          query: () => Promise.resolve([]),
          sendMessage: () => Promise.resolve(null)
        }
      };
      resolve();
    }
  });
};

// 初始化
waitForWebext().then(() => {
  console.log("Xget Now background script loaded with webext support");
}).catch(error => {
  console.error("Failed to initialize webext:", error);
});

/**
 * 平台配置定义
 * 支持的下载加速平台列表
 */
const PLATFORMS = {
  // 代码托管平台
  gh: {
    base: "https://github.com",
    name: "GitHub",
    pattern: /^https:\/\/github\.com\//,
  },
  gl: {
    base: "https://gitlab.com",
    name: "GitLab",
    pattern: /^https:\/\/gitlab\.com\//,
  },
  gitea: {
    base: "https://gitea.com",
    name: "Gitea",
    pattern: /^https:\/\/gitea\.com\//,
  },
  codeberg: {
    base: "https://codeberg.org",
    name: "Codeberg",
    pattern: /^https:\/\/codeberg\.org\//,
  },
  sf: {
    base: "https://sourceforge.net",
    name: "SourceForge",
    pattern: /^https:\/\/sourceforge\.net\//,
  },
  aosp: {
    base: "https://android.googlesource.com",
    name: "AOSP",
    pattern: /^https:\/\/android\.googlesource\.com\//,
  },

  // AI/ML 平台
  hf: {
    base: "https://huggingface.co",
    name: "Hugging Face",
    pattern: /^https:\/\/huggingface\.co\//,
  },

  // 包管理平台
  npm: {
    base: "https://registry.npmjs.org",
    name: "npm",
    pattern: /^https:\/\/registry\.npmjs\.org\//,
  },
  pypi: {
    base: "https://pypi.org",
    name: "PyPI",
    pattern: /^https:\/\/pypi\.org\//,
  },
  "pypi-files": {
    base: "https://files.pythonhosted.org",
    name: "PyPI Files",
    pattern: /^https:\/\/files\.pythonhosted\.org\//,
  },
  conda: {
    base: "https://repo.anaconda.com",
    name: "Conda",
    pattern: /^https:\/\/repo\.anaconda\.com\//,
  },
  "conda-community": {
    base: "https://conda.anaconda.org",
    name: "Conda Community",
    pattern: /^https:\/\/conda\.anaconda\.org\//,
  },
  maven: {
    base: "https://repo1.maven.org",
    name: "Maven",
    pattern: /^https:\/\/repo1\.maven\.org\//,
  },
  apache: {
    base: "https://downloads.apache.org",
    name: "Apache",
    pattern: /^https:\/\/downloads\.apache\.org\//,
  },
  gradle: {
    base: "https://plugins.gradle.org",
    name: "Gradle",
    pattern: /^https:\/\/plugins\.gradle\.org\//,
  },
  rubygems: {
    base: "https://rubygems.org",
    name: "RubyGems",
    pattern: /^https:\/\/rubygems\.org\//,
  },
  cran: {
    base: "https://cran.r-project.org",
    name: "CRAN",
    pattern: /^https:\/\/cran\.r-project\.org\//,
  },
  cpan: {
    base: "https://www.cpan.org",
    name: "CPAN",
    pattern: /^https:\/\/www\.cpan\.org\//,
  },
  ctan: {
    base: "https://tug.ctan.org",
    name: "CTAN",
    pattern: /^https:\/\/tug\.ctan\.org\//,
  },
  golang: {
    base: "https://proxy.golang.org",
    name: "Go Modules",
    pattern: /^https:\/\/proxy\.golang\.org\//,
  },
  nuget: {
    base: "https://api.nuget.org",
    name: "NuGet",
    pattern: /^https:\/\/api\.nuget\.org\//,
  },
  crates: {
    base: "https://crates.io",
    name: "Crates.io",
    pattern: /^https:\/\/crates\.io\//,
  },
  packagist: {
    base: "https://repo.packagist.org",
    name: "Packagist",
    pattern: /^https:\/\/repo\.packagist\.org\//,
  },

  // 其他平台
  arxiv: {
    base: "https://arxiv.org",
    name: "arXiv",
    pattern: /^https:\/\/arxiv\.org\//,
  },
  fdroid: {
    base: "https://f-droid.org",
    name: "F-Droid",
    pattern: /^https:\/\/f-droid\.org\//,
  },
};

// 转换URL为Xget格式
function transformUrl(url, xgetDomain, enabledPlatforms) {
  try {
    const platform = detectPlatform(url);
    if (!platform || !enabledPlatforms[platform]) {
      return null;
    }

    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search + urlObj.hash;

    return `https://${xgetDomain}/${platform}${path}`;
  } catch (error) {
    console.error("转换 URL 时出错：", error);
    return null;
  }
}

// 检测平台
function detectPlatform(url) {
  for (const [key, platform] of Object.entries(PLATFORMS)) {
    if (platform.pattern.test(url)) {
      return key;
    }
  }
  return null;
}
const DEFAULT_SETTINGS = {
  enabled: true,
  xgetDomain: "xget.xi-xu.me",
  enabledPlatforms: {
    // 代码托管平台
    gh: true,
    gl: true,
    gitea: true,
    codeberg: true,
    sf: true,
    aosp: true,

    // AI/ML 平台
    hf: true,

    // 包管理平台
    npm: true,
    pypi: true,
    "pypi-files": true,
    conda: true,
    "conda-community": true,
    maven: true,
    apache: true,
    gradle: true,
    rubygems: true,
    cran: true,
    cpan: true,
    ctan: true,
    golang: true,
    nuget: true,
    crates: true,
    packagist: true,

    // 其他平台
    arxiv: true,
    fdroid: true,
  },
};

// 初始化扩展，增强对 Zen Browser 的支持
const initializeExtension = async () => {
  // 等待 webext 可用
  await waitForWebext();
  
  console.log("Xget Now 已安装");

  try {
    // 使用本地存储而不是同步存储以确保兼容性，特别是在 Zen Browser 中
    const storageAPI = webext.storage.sync || webext.storage.local;

    // 检查存储 API 是否可用
    if (!storageAPI || !storageAPI.get || !storageAPI.set) {
      console.error("Storage API not available, using fallback");
      return;
    }

    // 如果尚未设置，则设置默认设置
    const existingSettings = await storageAPI.get(DEFAULT_SETTINGS);
    
    // 合并默认设置和现有设置
    const mergedSettings = { ...DEFAULT_SETTINGS, ...existingSettings };
    await storageAPI.set(mergedSettings);
    
    console.log("Settings initialized successfully");
  } catch (error) {
    console.error("Failed to initialize settings:", error);
    // 在 Zen Browser 中，如果存储初始化失败，尝试使用本地存储
    try {
      const localSettings = await webext.storage.local.get(DEFAULT_SETTINGS);
      await webext.storage.local.set({ ...DEFAULT_SETTINGS, ...localSettings });
      console.log("Fallback to local storage successful");
    } catch (fallbackError) {
      console.error("Fallback storage initialization also failed:", fallbackError);
    }
  }
};

// 监听安装事件
const setupInstallListener = async () => {
  await waitForWebext();
  
  if (webext.runtime.onInstalled) {
    webext.runtime.onInstalled.addListener(initializeExtension);
  } else {
    // 如果没有 onInstalled 事件，直接初始化
    initializeExtension();
  }
};

setupInstallListener();
// 防止监听器被多次注册
let downloadListenerAdded = false;

// 设置下载监听器
const setupDownloadListener = async () => {
  await waitForWebext();
  
  if (!downloadListenerAdded && webext.downloads && webext.downloads.onDeterminingFilename) {
    webext.downloads.onDeterminingFilename.addListener(handleDownload);
    downloadListenerAdded = true;
    console.log("Download listener added");
  }
};

setupDownloadListener();

function handleDownload(downloadItem, suggest) {
  // 立即调用 suggest 来防止多次调用错误
  suggest();

  // 然后异步处理重定向逻辑
  processDownloadRedirect(downloadItem);
}

async function processDownloadRedirect(downloadItem) {
  try {
    const storageAPI = webext.storage.sync || webext.storage.local;
    const settings = await storageAPI.get(DEFAULT_SETTINGS);

    // 检查扩展是否已启用并配置了域名
    if (!settings.enabled || !settings.xgetDomain) {
      return;
    }

    const url = downloadItem.url;
    const redirectedUrl = transformUrl(
      url,
      settings.xgetDomain,
      settings.enabledPlatforms
    );

    if (redirectedUrl && redirectedUrl !== url) {
      console.log("重定向下载：", url, "->", redirectedUrl);

      try {
        // 取消原始下载
        await webext.downloads.cancel(downloadItem.id);

        // 使用重定向的 URL 开始新下载
        await webext.downloads.download({
          url: redirectedUrl,
          filename: downloadItem.filename || undefined,
          conflictAction: "uniquify",
        });

        // 通过内容脚本显示通知
        try {
          await webext.tabs.sendMessage(downloadItem.tabId, {
            action: "showNotification",
            message: "下载已通过 Xget 重定向",
          });
        } catch (error) {
          console.log("无法向标签页发送通知");
        }
      } catch (error) {
        console.error("重定向下载时出错：", error);
      }
    }
  } catch (error) {
    console.error("处理下载重定向时出错：", error);
  }
}

function transformUrlLegacy(url, settings) {
  try {
    // 找到匹配的平台
    for (const [platformKey, platform] of Object.entries(PLATFORMS)) {
      if (!settings.enabledPlatforms[platformKey]) continue;

      if (platform.pattern.test(url)) {
        const urlObj = new URL(url);
        const path = urlObj.pathname + urlObj.search + urlObj.hash;

        // 使用 Xget 域名转换 URL（添加 https:// 协议）
        const xgetUrl = `https://${settings.xgetDomain}/${platformKey}${path}`;
        return xgetUrl;
      }
    }

    return null; // 不需要转换
  } catch (error) {
    console.error("转换 URL 时出错：", error);
    return null;
  }
}

// 设置消息监听器
const setupMessageListener = async () => {
  await waitForWebext();
  
  if (webext.runtime.onMessage) {
    webext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const storageAPI = webext.storage.sync || webext.storage.local;

  if (request.action === "getSettings") {
    // 增强错误处理，特别针对 Zen Browser
    storageAPI.get(DEFAULT_SETTINGS)
      .then(settings => {
        // 确保返回完整的设置对象
        const completeSettings = { ...DEFAULT_SETTINGS, ...settings };
        sendResponse(completeSettings);
      })
      .catch(error => {
        console.error("Failed to get settings:", error);
        // 如果获取设置失败，返回默认设置
        sendResponse(DEFAULT_SETTINGS);
      });
    return true;
  } else if (request.action === "saveSettings") {
    storageAPI.set(request.settings)
      .then(async () => {
        // 通知相关标签页刷新
        try {
          const tabs = await webext.tabs.query({
            url: Object.values(PLATFORMS).map((platform) => platform.base + "/*"),
          });

          for (const tab of tabs) {
            try {
              await webext.tabs.sendMessage(tab.id, {
                action: "showNotification",
                message: "设置已更新！点击刷新页面",
                showRefreshButton: true,
              });
            } catch (error) {
              // 标签页可能没有加载内容脚本，忽略
            }
          }
        } catch (error) {
          console.log("无法通知标签页设置更新");
        }

        sendResponse({ success: true });
      })
      .catch(error => {
        console.error("Failed to save settings:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
    });
    console.log("Message listener added");
  }
};

setupMessageListener();
