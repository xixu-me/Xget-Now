/**
 * Xget Now - 内容脚本
 *
 * 功能：
 * - 在支持的平台页面上注入下载拦截功能
 * - 监听页面上的下载链接点击事件
 * - 将下载请求重定向到加速服务
 * - 处理不同平台的特殊下载逻辑
 */

// 确保兼容层可用
if (typeof webext === "undefined") {
  console.error("WebExt compatibility layer not found in content script");
}

/**
 * 平台配置定义
 * 与后台脚本保持同步的平台列表
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

// 初始化内容脚本
(async function () {
  console.log("Xget Now：内容脚本已加载");

  // 监听来自后台脚本的消息
  webext.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showNotification") {
      showNotification(request.message, request.showRefreshButton);
      sendResponse({ success: true });
    }
  });

  // 检查扩展是否已启用并配置
  const settings = await getSettings();
  if (!settings.enabled || !settings.xgetDomain) {
    return;
  }

  // 找到当前平台
  const currentPlatform = detectPlatform(window.location.href);
  if (!currentPlatform || !settings.enabledPlatforms[currentPlatform]) {
    return;
  }

  // 添加下载拦截
  interceptDownloadLinks();

  // 监控动态添加的内容
  observePageChanges();
})();

async function getSettings() {
  try {
    return await new Promise((resolve) => {
      webext.runtime.sendMessage({ action: "getSettings" }, resolve);
    });
  } catch (error) {
    console.error("获取设置时出错：", error);
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
  // 拦截下载链接的点击事件
  document.addEventListener(
    "click",
    async (event) => {
      const link = event.target.closest("a");
      if (!link || !link.href) return;

      // 检查这是否是下载链接
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

  // 第一检查：明确的下载属性
  if (link.download || link.hasAttribute("download")) {
    return true;
  }

  // 第二检查：表示可下载文件的文件扩展名
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

  // 检查 URL 是否以文件扩展名结尾
  if (fileExtensions.some((ext) => pathname.endsWith(ext))) {
    return true;
  }

  // 第三检查：GitHub 特定模式
  const allowedGitHubHosts = ["github.com"];
  try {
    const parsedUrl = new URL(href);
    if (allowedGitHubHosts.includes(parsedUrl.host)) {
      // GitHub 发布资源下载 URL 遵循模式：/releases/download/
      if (pathname.includes("/releases/download/")) {
        return true;
      }
      // GitHub 存档下载 URL
      if (
        pathname.includes("/archive/") &&
        (pathname.endsWith(".zip") || pathname.endsWith(".tar.gz"))
      ) {
        return true;
      }
      // GitHub 原始文件 URL - 新增：支持原始文件链接
      if (pathname.includes("/raw/")) {
        return true;
      }
      // 排除导航到发布页面（仅 /releases 或 /releases/）
      if (pathname.endsWith("/releases") || pathname.endsWith("/releases/")) {
        return false;
      }
    }
  } catch (e) {
    console.error("无效的 URL：", href, e);
  }

  // 第四检查：GitLab 特定模式
  const allowedGitLabHosts = ["gitlab.com"];
  try {
    const parsedUrl = new URL(href);
    if (allowedGitLabHosts.includes(parsedUrl.host)) {
      // GitLab 存档下载
      if (pathname.includes("/-/archive/")) {
        return true;
      }
      // GitLab 发布下载
      if (
        pathname.includes("/-/releases/") &&
        pathname.includes("/downloads/")
      ) {
        return true;
      }
    }
  } catch (e) {
    console.error("无效的 URL：", href, e);
  }

  // 第五检查：Hugging Face 文件下载
  const allowedHuggingFaceHosts = ["huggingface.co"];
  try {
    const parsedUrl = new URL(href);
    if (allowedHuggingFaceHosts.includes(parsedUrl.host)) {
      // HF 文件下载 URL 包含 /resolve/
      if (pathname.includes("/resolve/")) {
        return true;
      }
    }
  } catch (e) {
    console.error("无效的 URL：", href, e);
  }

  // 第六检查：npm 包下载
  const allowedNpmHosts = ["registry.npmjs.org"];
  try {
    const parsedUrl = new URL(href);
    if (allowedNpmHosts.includes(parsedUrl.host)) {
      // npm tarball URL 包含 /-/
      if (pathname.includes("/-/") && pathname.endsWith(".tgz")) {
        return true;
      }
    }
  } catch (e) {
    console.error("无效的 URL：", href, e);
  }

  // 第七检查：PyPI 包下载
  const allowedPypiHosts = ["pypi.org", "files.pythonhosted.org"];
  try {
    const parsedUrl = new URL(href);
    if (allowedPypiHosts.includes(parsedUrl.host)) {
      // PyPI 包文件下载
      if (
        pathname.includes("/packages/") &&
        (pathname.endsWith(".tar.gz") ||
          pathname.endsWith(".whl") ||
          pathname.endsWith(".egg"))
      ) {
        return true;
      }
    }
  } catch (e) {
    console.error("无效的 URL：", href, e);
  }

  // 第八检查：SourceForge 下载
  const allowedSourceForgeHosts = ["sourceforge.net"];
  try {
    const parsedUrl = new URL(href);
    if (allowedSourceForgeHosts.includes(parsedUrl.host)) {
      // SourceForge 下载 URL 包含 /download
      if (
        pathname.includes("/download") ||
        url.searchParams.get("use_mirror")
      ) {
        return true;
      }
    }
  } catch (e) {
    console.error("无效的 URL：", href, e);
  }

  // 第九检查：Conda 包下载
  const allowedCondaHosts = ["repo.anaconda.com", "conda.anaconda.org"];
  try {
    const parsedUrl = new URL(href);
    if (allowedCondaHosts.includes(parsedUrl.host)) {
      // Conda 包文件
      if (pathname.endsWith(".conda") || pathname.endsWith(".tar.bz2")) {
        return true;
      }
    }
  } catch (e) {
    console.error("无效的 URL：", href, e);
  }

  // 第十检查：其他包管理平台
  const packageManagerHosts = [
    "rubygems.org",
    "cran.r-project.org",
    "crates.io",
    "repo.packagist.org",
    "api.nuget.org",
    "proxy.golang.org",
  ];
  try {
    const parsedUrl = new URL(href);
    if (packageManagerHosts.includes(parsedUrl.host)) {
      // 各种包管理器的下载文件
      const packageExtensions = [
        ".gem",
        ".tar.gz",
        ".crate",
        ".zip",
        ".nupkg",
        ".tgz",
        ".tar.bz2",
      ];
      if (packageExtensions.some((ext) => pathname.endsWith(ext))) {
        return true;
      }
    }
  } catch (e) {
    console.error("无效的 URL：", href, e);
  }

  // 第十一检查：明确的下载文本指示器（更具体）
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

  // 默认：不是下载链接
  return false;
}

async function handleDownloadLink(url) {
  try {
    const settings = await getSettings();
    if (!settings.enabled || !settings.xgetDomain) return;

    const transformedUrl = transformUrl(url, settings);
    if (transformedUrl) {
      // 显示通知
      showNotification(`下载已通过 Xget 重定向`);

      // 触发下载
      window.location.href = transformedUrl;
    }
  } catch (error) {
    console.error("处理下载时出错：", error);
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
    console.error("转换 URL 时出错：", error);
    return null;
  }
}

function observePageChanges() {
  const observer = new MutationObserver(() => {
    // 监控页面变化（无需额外操作）
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function showNotification(message, showRefreshButton = false) {
  try {
    // 首先删除所有现有通知
    const existingNotifications =
      document.querySelectorAll(".xget-notification");
    existingNotifications.forEach((notification) => notification.remove());

    // 创建一个简单的通知
    const notification = document.createElement("div");
    notification.className = "xget-notification";

    // 创建消息容器
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.style.marginBottom = showRefreshButton ? "8px" : "0";
    notification.appendChild(messageDiv);

    // 如果需要，添加刷新按钮
    if (showRefreshButton) {
      const refreshButton = document.createElement("button");
      refreshButton.textContent = "🔄 刷新页面";
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

    // 如果尚未存在则添加动画样式
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

    // 如果有刷新按钮则在较长时间后删除，否则在较短时间后删除
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
    console.error("显示通知时出错：", error);
    // 如果 DOM 操作失败则回退到控制台日志
    console.log("Xget 通知：", message);
  }
}
