// 与 worker.js 匹配的平台配置
const PLATFORMS = {
  gh: {
    base: "https://github.com",
    name: "GitHub",
    transform: (path) => path.replace(/^\/gh\//, "/"),
    pattern: /^https:\/\/github\.com\//,
  },
  gl: {
    base: "https://gitlab.com",
    name: "GitLab",
    transform: (path) => path.replace(/^\/gl\//, "/"),
    pattern: /^https:\/\/gitlab\.com\//,
  },
  hf: {
    base: "https://huggingface.co",
    name: "Hugging Face",
    transform: (path) => path.replace(/^\/hf\//, "/"),
    pattern: /^https:\/\/huggingface\.co\//,
  },
};

// 默认设置
const DEFAULT_SETTINGS = {
  enabled: true,
  xgetDomain: "xget.xi-xu.me",
  enabledPlatforms: {
    gh: true,
    gl: true,
    hf: true,
  },
};

// 初始化扩展
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Xget for Chromium 已安装");

  // 如果尚未设置，则设置默认设置
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set(settings);
});

// 监听下载事件
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  handleDownload(downloadItem, suggest);
});

async function handleDownload(downloadItem, suggest) {
  try {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

    // 检查扩展是否已启用并配置了域名
    if (!settings.enabled || !settings.xgetDomain) {
      suggest();
      return;
    }

    const url = downloadItem.url;
    const redirectedUrl = transformUrl(url, settings);

    if (redirectedUrl && redirectedUrl !== url) {
      console.log("重定向下载：", url, "->", redirectedUrl);

      // 取消原始下载
      chrome.downloads.cancel(downloadItem.id);

      // 使用重定向的 URL 开始新下载
      chrome.downloads.download({
        url: redirectedUrl,
        filename: downloadItem.filename || undefined,
        conflictAction: "uniquify",
      });

      // 通过内容脚本显示通知
      try {
        await chrome.tabs.sendMessage(downloadItem.tabId, {
          action: "showNotification",
          message: "下载已通过 Xget 重定向",
        });
      } catch (error) {
        console.log("无法向标签页发送通知");
      }
    } else {
      suggest();
    }
  } catch (error) {
    console.error("处理下载时出错：", error);
    suggest();
  }
}

function transformUrl(url, settings) {
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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    chrome.storage.sync.get(DEFAULT_SETTINGS).then(sendResponse);
    return true;
  } else if (request.action === "saveSettings") {
    chrome.storage.sync.set(request.settings).then(async () => {
      // 通知相关标签页刷新
      try {
        const tabs = await chrome.tabs.query({
          url: [
            "https://github.com/*",
            "https://gitlab.com/*",
            "https://huggingface.co/*",
          ],
        });

        for (const tab of tabs) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
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
