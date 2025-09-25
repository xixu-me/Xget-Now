/**
 * Xget Now - Zen Browser 专用后台脚本
 * 
 * 简化版本，专门解决 Zen Browser 兼容性问题
 */

console.log("Zen Browser background script starting...");

// 默认设置
const DEFAULT_SETTINGS = {
  enabled: true,
  xgetDomain: "xget.xi-xu.me",
  enabledPlatforms: {
    gh: true, gl: true, gitea: true, codeberg: true, sf: true, aosp: true,
    hf: true, npm: true, pypi: true, "pypi-files": true, conda: true,
    "conda-community": true, maven: true, apache: true, gradle: true,
    rubygems: true, cran: true, cpan: true, ctan: true, golang: true,
    nuget: true, crates: true, packagist: true, arxiv: true, fdroid: true,
  },
};

// 获取 API 引用
const api = typeof browser !== "undefined" ? browser : chrome;

// 初始化扩展
async function initializeExtension() {
  console.log("Initializing Xget Now for Zen Browser...");
  
  try {
    // 使用本地存储
    const existingSettings = await api.storage.local.get(DEFAULT_SETTINGS);
    const mergedSettings = { ...DEFAULT_SETTINGS, ...existingSettings };
    await api.storage.local.set(mergedSettings);
    console.log("Settings initialized successfully");
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
}

// 监听安装事件
if (api.runtime.onInstalled) {
  api.runtime.onInstalled.addListener(initializeExtension);
} else {
  // 直接初始化
  initializeExtension();
}

// 监听消息
if (api.runtime.onMessage) {
  api.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message:", request.action);
    
    if (request.action === "getSettings") {
      api.storage.local.get(DEFAULT_SETTINGS)
        .then(settings => {
          const completeSettings = { ...DEFAULT_SETTINGS, ...settings };
          console.log("Sending settings:", completeSettings);
          sendResponse(completeSettings);
        })
        .catch(error => {
          console.error("Failed to get settings:", error);
          sendResponse(DEFAULT_SETTINGS);
        });
      return true; // 保持消息通道开放
      
    } else if (request.action === "saveSettings") {
      api.storage.local.set(request.settings)
        .then(() => {
          console.log("Settings saved successfully");
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error("Failed to save settings:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // 保持消息通道开放
    }
    
    // 对于未知消息，返回 false
    return false;
  });
}

console.log("Zen Browser background script loaded successfully");