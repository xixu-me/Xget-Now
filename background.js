// Platform configurations matching the worker.js
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

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  xgetDomain: "xget.xi-xu.me",
  enabledPlatforms: {
    gh: true,
    gl: true,
    hf: true,
  },
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Xget for Chrome installed");

  // Set default settings if not already set
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set(settings);
});

// Listen for download events
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  handleDownload(downloadItem, suggest);
});

async function handleDownload(downloadItem, suggest) {
  try {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

    // Check if extension is enabled and domain is configured
    if (!settings.enabled || !settings.xgetDomain) {
      suggest();
      return;
    }

    const url = downloadItem.url;
    const redirectedUrl = transformUrl(url, settings);

    if (redirectedUrl && redirectedUrl !== url) {
      console.log("Redirecting download:", url, "->", redirectedUrl);

      // Cancel the original download
      chrome.downloads.cancel(downloadItem.id);

      // Start new download with redirected URL
      chrome.downloads.download({
        url: redirectedUrl,
        filename: downloadItem.filename || undefined,
        conflictAction: "uniquify",
      });

      // Show notification via content script
      try {
        await chrome.tabs.sendMessage(downloadItem.tabId, {
          action: "showNotification",
          message: "Download redirected through Xget",
        });
      } catch (error) {
        console.log("Could not send notification to tab");
      }
    } else {
      suggest();
    }
  } catch (error) {
    console.error("Error handling download:", error);
    suggest();
  }
}

function transformUrl(url, settings) {
  try {
    // Find matching platform
    for (const [platformKey, platform] of Object.entries(PLATFORMS)) {
      if (!settings.enabledPlatforms[platformKey]) continue;

      if (platform.pattern.test(url)) {
        const urlObj = new URL(url);
        const path = urlObj.pathname + urlObj.search + urlObj.hash;

        // Transform the URL using Xget domain (add https:// protocol)
        const xgetUrl = `https://${settings.xgetDomain}/${platformKey}${path}`;
        return xgetUrl;
      }
    }

    return null; // No transformation needed
  } catch (error) {
    console.error("Error transforming URL:", error);
    return null;
  }
}

// Listen for messages from popup/options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    chrome.storage.sync.get(DEFAULT_SETTINGS).then(sendResponse);
    return true;
  } else if (request.action === "saveSettings") {
    chrome.storage.sync.set(request.settings).then(async () => {
      // Notify relevant tabs to refresh
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
              message: "Settings updated! Click to refresh page",
              showRefreshButton: true,
            });
          } catch (error) {
            // Tab might not have content script loaded, ignore
          }
        }
      } catch (error) {
        console.log("Could not notify tabs about settings update");
      }

      sendResponse({ success: true });
    });
    return true;
  }
});
