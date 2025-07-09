// Content script to inject download interception on supported platforms

// Platform detection and URL transformation
const PLATFORMS = {
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
  hf: {
    base: "https://huggingface.co",
    name: "Hugging Face",
    pattern: /^https:\/\/huggingface\.co\//,
  },
};

// Initialize content script
(async function () {
  console.log("Xget for Chrome: Content script loaded");

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showNotification") {
      showNotification(request.message, request.showRefreshButton);
      sendResponse({ success: true });
    }
  });

  // Check if extension is enabled and configured
  const settings = await getSettings();
  if (!settings.enabled || !settings.xgetDomain) {
    return;
  }

  // Find current platform
  const currentPlatform = detectPlatform(window.location.href);
  if (!currentPlatform || !settings.enabledPlatforms[currentPlatform]) {
    return;
  }

  // Add download interception
  interceptDownloadLinks();

  // Monitor for dynamically added content
  observePageChanges();
})();

async function getSettings() {
  try {
    return await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "getSettings" }, resolve);
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    return { enabled: false };
  }
}

function detectPlatform(url) {
  for (const [key, platform] of Object.entries(PLATFORMS)) {
    if (platform.pattern.test(url)) {
      return key;
    }
  }
  return null;
}

function interceptDownloadLinks() {
  // Intercept clicks on download links
  document.addEventListener(
    "click",
    async (event) => {
      const link = event.target.closest("a");
      if (!link || !link.href) return;

      // Check if this is a download link
      if (isDownloadLink(link)) {
        event.preventDefault();
        event.stopPropagation();

        await handleDownloadLink(link.href);
      }
    },
    true
  );
}

function isDownloadLink(link) {
  const href = link.href.toLowerCase();
  const url = new URL(link.href);
  const pathname = url.pathname.toLowerCase();

  // First check: explicit download attributes
  if (link.download || link.hasAttribute("download")) {
    return true;
  }

  // Second check: file extensions that indicate downloadable files
  const fileExtensions = [
    ".zip",
    ".tar.gz",
    ".tar.bz2",
    ".tar.xz",
    ".7z",
    ".rar",
    ".gz",
    ".bz2",
    ".exe",
    ".msi",
    ".dmg",
    ".pkg",
    ".deb",
    ".rpm",
    ".apk",
    ".jar",
    ".war",
    ".ear",
    ".iso",
    ".img",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".mp4",
    ".avi",
    ".mkv",
    ".mov",
    ".wmv",
    ".flv",
    ".mp3",
    ".wav",
    ".flac",
    ".ogg",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".tiff",
    ".svg",
    ".whl",
    ".egg",
    ".gem",
    ".nupkg",
  ];

  // Check if URL ends with a file extension
  if (fileExtensions.some((ext) => pathname.endsWith(ext))) {
    return true;
  }

  // Third check: GitHub-specific patterns
  if (href.includes("github.com")) {
    // GitHub release asset download URLs follow pattern: /releases/download/
    if (pathname.includes("/releases/download/")) {
      return true;
    }
    // GitHub archive download URLs
    if (
      pathname.includes("/archive/") &&
      (pathname.endsWith(".zip") || pathname.endsWith(".tar.gz"))
    ) {
      return true;
    }
    // GitHub raw file URLs - NEW: support for raw file links
    if (pathname.includes("/raw/")) {
      return true;
    }
    // Exclude navigation to releases page (just /releases or /releases/)
    if (pathname.endsWith("/releases") || pathname.endsWith("/releases/")) {
      return false;
    }
  }

  // Fourth check: GitLab-specific patterns
  if (href.includes("gitlab.com")) {
    // GitLab archive downloads
    if (pathname.includes("/-/archive/")) {
      return true;
    }
    // GitLab release downloads
    if (pathname.includes("/-/releases/") && pathname.includes("/downloads/")) {
      return true;
    }
  }

  // Fifth check: Hugging Face file downloads
  if (href.includes("huggingface.co")) {
    // HF file download URLs contain /resolve/
    if (pathname.includes("/resolve/")) {
      return true;
    }
  }

  // Seventh check: explicit download text indicators (be more specific)
  const downloadTextIndicators = ["download", "download file", "get file"];
  const linkText = link.textContent.toLowerCase().trim();
  if (
    downloadTextIndicators.some(
      (indicator) =>
        linkText === indicator || linkText.startsWith(indicator + " ")
    )
  ) {
    return true;
  }

  // Default: not a download link
  return false;
}

async function handleDownloadLink(url) {
  try {
    const settings = await getSettings();
    if (!settings.enabled || !settings.xgetDomain) return;

    const transformedUrl = transformUrl(url, settings);
    if (transformedUrl) {
      // Show notification
      showNotification(`Download redirected through Xget`);

      // Trigger download
      window.location.href = transformedUrl;
    }
  } catch (error) {
    console.error("Error handling download:", error);
  }
}

function transformUrl(url, settings) {
  try {
    const platform = detectPlatform(url);
    if (!platform || !settings.enabledPlatforms[platform]) {
      return null;
    }

    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search + urlObj.hash;

    return `https://${settings.xgetDomain}/${platform}${path}`;
  } catch (error) {
    console.error("Error transforming URL:", error);
    return null;
  }
}

function observePageChanges() {
  const observer = new MutationObserver(() => {
    // Monitor for page changes (no additional actions needed)
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function showNotification(message, showRefreshButton = false) {
  try {
    // Remove any existing notifications first
    const existingNotifications =
      document.querySelectorAll(".xget-notification");
    existingNotifications.forEach((notification) => notification.remove());

    // Create a simple notification
    const notification = document.createElement("div");
    notification.className = "xget-notification";

    // Create message container
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.style.marginBottom = showRefreshButton ? "8px" : "0";
    notification.appendChild(messageDiv);

    // Add refresh button if needed
    if (showRefreshButton) {
      const refreshButton = document.createElement("button");
      refreshButton.textContent = "🔄 Refresh Page";
      refreshButton.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        margin-top: 4px;
        width: 100%;
        transition: background 0.2s;
      `;

      refreshButton.addEventListener("mouseenter", () => {
        refreshButton.style.background = "rgba(255, 255, 255, 0.3)";
      });

      refreshButton.addEventListener("mouseleave", () => {
        refreshButton.style.background = "rgba(255, 255, 255, 0.2)";
      });

      refreshButton.addEventListener("click", () => {
        window.location.reload();
      });

      notification.appendChild(refreshButton);
    }

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 2147483647;
      animation: xgetSlideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 280px;
      word-wrap: break-word;
    `;

    // Add animation styles if not already present
    if (!document.getElementById("xget-notification-styles")) {
      const style = document.createElement("style");
      style.id = "xget-notification-styles";
      style.textContent = `
        @keyframes xgetSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes xgetSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after longer time if has refresh button, shorter if not
    const removeDelay = showRefreshButton ? 8000 : 4000;
    setTimeout(() => {
      notification.style.animation = "xgetSlideOut 0.3s ease-in";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, removeDelay);
  } catch (error) {
    console.error("Error showing notification:", error);
    // Fallback to console log if DOM manipulation fails
    console.log("Xget notification:", message);
  }
}
