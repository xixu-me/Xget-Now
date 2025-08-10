/**
 * Xget Now - 扩展后台脚本
 *
 * 功能：
 * - 处理扩展设置管理
 * - 监听标签页更新事件
 * - 处理来自内容脚本的消息
 * - 管理扩展状态和配置
 */

// 导入兼容层
importScripts("webext-compat.js");

// 确保兼容层可用
if (typeof webext === "undefined") {
  // 在非模块环境中，兼容层应该已经通过脚本标签加载
  console.error("WebExt compatibility layer not found");
}

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

// 初始化扩展
webext.runtime.onInstalled.addListener(async () => {
  console.log("Xget Now 已安装");

  // 使用本地存储而不是同步存储以确保兼容性
  const storageAPI = webext.storage.sync || webext.storage.local;

  // 如果尚未设置，则设置默认设置
  const settings = await storageAPI.get(DEFAULT_SETTINGS);
  await storageAPI.set(settings);
});

// 防止监听器被多次注册
let downloadListenerAdded = false;

// 监听下载事件
if (!downloadListenerAdded && webext.downloads.onDeterminingFilename) {
  webext.downloads.onDeterminingFilename.addListener(handleDownload);
  downloadListenerAdded = true;
}

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

// 监听来自弹出窗口/选项的消息
webext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const storageAPI = webext.storage.sync || webext.storage.local;

  if (request.action === "getSettings") {
    storageAPI.get(DEFAULT_SETTINGS).then(sendResponse);
    return true;
  } else if (request.action === "saveSettings") {
    storageAPI.set(request.settings).then(async () => {
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
    });
    return true;
  }
});
