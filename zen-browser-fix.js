/**
 * Zen Browser 兼容性修复
 * 
 * 这个脚本专门解决 Zen Browser 中的兼容性问题
 */

// 检测是否在 Zen Browser 中运行
const isZenBrowser = () => {
  const ua = navigator.userAgent;
  return /\bZen\//.test(ua) || /\bzen\b/i.test(ua);
};

// Zen Browser 特定的修复
if (isZenBrowser()) {
  console.log("Zen Browser detected, applying compatibility fixes");

  // 修复 1: 存储 API 兼容性
  const originalStorageGet = browser?.storage?.local?.get || chrome?.storage?.local?.get;
  const originalStorageSet = browser?.storage?.local?.set || chrome?.storage?.local?.set;

  if (originalStorageGet && originalStorageSet) {
    // 包装存储 API 以提供更好的错误处理
    const wrappedStorageGet = function(keys) {
      return new Promise((resolve, reject) => {
        try {
          const result = originalStorageGet.call(this, keys);
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch(reject);
          } else {
            // 回调方式
            originalStorageGet.call(this, keys, (data) => {
              if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
                reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
              } else {
                resolve(data || {});
              }
            });
          }
        } catch (error) {
          reject(error);
        }
      });
    };

    const wrappedStorageSet = function(items) {
      return new Promise((resolve, reject) => {
        try {
          const result = originalStorageSet.call(this, items);
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch(reject);
          } else {
            // 回调方式
            originalStorageSet.call(this, items, () => {
              if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
                reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
              } else {
                resolve();
              }
            });
          }
        } catch (error) {
          reject(error);
        }
      });
    };

    // 应用包装的方法
    if (browser?.storage?.local) {
      browser.storage.local.get = wrappedStorageGet;
      browser.storage.local.set = wrappedStorageSet;
    }
    if (chrome?.storage?.local) {
      chrome.storage.local.get = wrappedStorageGet;
      chrome.storage.local.set = wrappedStorageSet;
    }
  }

  // 修复 2: 消息传递兼容性
  const originalSendMessage = browser?.runtime?.sendMessage || chrome?.runtime?.sendMessage;
  
  if (originalSendMessage) {
    const wrappedSendMessage = function(message, options) {
      return new Promise((resolve, reject) => {
        try {
          const result = originalSendMessage.call(this, message, options);
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch(reject);
          } else {
            // 回调方式
            originalSendMessage.call(this, message, options, (response) => {
              if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
                console.warn("SendMessage error:", chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message);
                resolve(null); // 不要拒绝，返回 null
              } else {
                resolve(response);
              }
            });
          }
        } catch (error) {
          console.warn("SendMessage exception:", error);
          resolve(null); // 不要拒绝，返回 null
        }
      });
    };

    // 应用包装的方法
    if (browser?.runtime) {
      browser.runtime.sendMessage = wrappedSendMessage;
    }
    if (chrome?.runtime) {
      chrome.runtime.sendMessage = wrappedSendMessage;
    }
  }

  // 修复 3: DOM 加载检测
  const originalAddEventListener = document.addEventListener;
  document.addEventListener = function(type, listener, options) {
    if (type === 'DOMContentLoaded') {
      // 在 Zen Browser 中，确保 DOM 完全加载
      if (document.readyState === 'loading') {
        originalAddEventListener.call(this, type, listener, options);
      } else {
        // DOM 已经加载，立即执行
        setTimeout(listener, 0);
      }
    } else {
      originalAddEventListener.call(this, type, listener, options);
    }
  };

  // 修复 4: 扩展 API 可用性检查
  window.zenBrowserApiCheck = function() {
    const checks = {
      browser: typeof browser !== 'undefined',
      chrome: typeof chrome !== 'undefined',
      browserRuntime: !!(browser?.runtime),
      chromeRuntime: !!(chrome?.runtime),
      browserStorage: !!(browser?.storage?.local),
      chromeStorage: !!(chrome?.storage?.local),
      webext: typeof webext !== 'undefined'
    };
    
    console.log("Zen Browser API availability:", checks);
    return checks;
  };

  // 在控制台中提供调试信息
  console.log("Zen Browser compatibility fixes applied");
  console.log("Run zenBrowserApiCheck() to check API availability");
}

// 导出检测函数
if (typeof window !== 'undefined') {
  window.isZenBrowser = isZenBrowser;
}