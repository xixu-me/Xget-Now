/**
 * Firefox 特定兼容性修复
 * 直接使用 browser API 处理 Firefox 中的消息传递问题
 */

// 在 Firefox 中，直接使用 browser API
if (
  typeof browser !== "undefined" &&
  browser.runtime &&
  browser.runtime.sendMessage
) {
  console.log("Firefox environment detected, using native browser API");

  // 为popup.js提供一个简化的API
  window.firefoxAPI = {
    sendMessage: function (message) {
      return new Promise((resolve, reject) => {
        try {
          browser.runtime.sendMessage(message, (response) => {
            if (browser.runtime.lastError) {
              console.error(
                "Firefox sendMessage error:",
                browser.runtime.lastError
              );
              reject(browser.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        } catch (error) {
          console.error("Firefox sendMessage exception:", error);
          reject(error);
        }
      });
    },

    getSettings: async function () {
      try {
        return await browser.storage.local.get({
          enabled: true,
          xgetDomain: "xget.xi-xu.me",
          enabledPlatforms: {
            gh: true,
            gl: true,
            gitea: true,
            codeberg: true,
            sf: true,
            aosp: true,
            hf: true,
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
            arxiv: true,
            fdroid: true,
          },
        });
      } catch (error) {
        console.error("Failed to get settings from storage:", error);
        throw error;
      }
    },

    saveSettings: async function (settings) {
      try {
        await browser.storage.local.set(settings);
        return { success: true };
      } catch (error) {
        console.error("Failed to save settings to storage:", error);
        return { success: false, error: error.message };
      }
    },
  };
}
