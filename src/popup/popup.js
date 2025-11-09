/**
 * Xget Now - 弹窗脚本
 *
 * 功能：
 * - 管理扩展设置界面
 * - 处理用户交互事件
 * - 同步设置到后台脚本
 * - 提供平台开关控制
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 确保有可用的API
  if (
    typeof webext === "undefined" &&
    typeof browser === "undefined" &&
    !window.firefoxAPI
  ) {
    console.error("No compatible extension API found");
    showStatus("扩展API加载失败", "error");
    return;
  }

  // 延迟执行以确保background脚本已准备就绪
  setTimeout(async () => {
    try {
      // 加载当前设置
      await loadSettings();

      // 设置事件监听器
      setupEventListeners();
    } catch (error) {
      console.error("Initialization error:", error);
      showStatus("初始化失败，请重新打开扩展", "error");
    }
  }, 100);
});

/**
 * 加载并应用当前设置到 UI
 */
async function loadSettings() {
  try {
    console.log("Loading settings...");

    let settings;

    // Firefox 特殊处理
    if (window.firefoxAPI && typeof browser !== "undefined") {
      console.log("Using Firefox direct storage API");
      try {
        // 首先尝试消息传递
        settings = await window.firefoxAPI.sendMessage({
          action: "getSettings",
        });
      } catch (msgError) {
        console.log(
          "Message passing failed, using direct storage access:",
          msgError
        );
        // 如果消息传递失败，直接从存储读取
        settings = await window.firefoxAPI.getSettings();
      }
    } else if (webext && webext.runtime && webext.runtime.sendMessage) {
      // 标准 webext API
      console.log("Using standard webext API");
      settings = await webext.runtime.sendMessage({
        action: "getSettings",
      });
    } else {
      throw new Error("No compatible API available");
    }

    console.log("Settings received:", settings);

    if (!settings) {
      throw new Error("No response from background script");
    }

    // 使用当前设置更新 UI
    const domainValue = settings.xgetDomain || "";
    document.getElementById("domainInput").value = domainValue;

    // 仅在设置了域名时启用切换
    const enabledValue = settings.enabled && domainValue.trim() !== "";
    document.getElementById("enabledToggle").checked = enabledValue;

    // 更新平台切换状态
    const platformToggles = {
      // 代码托管平台
      gh: document.getElementById("ghToggle"),
      gl: document.getElementById("glToggle"),
      gitea: document.getElementById("giteaToggle"),
      codeberg: document.getElementById("codebergToggle"),
      sf: document.getElementById("sfToggle"),
      aosp: document.getElementById("aospToggle"),

      // AI/ML 平台
      hf: document.getElementById("hfToggle"),

      // 包管理平台
      npm: document.getElementById("npmToggle"),
      pypi: document.getElementById("pypiToggle"),
      conda: document.getElementById("condaToggle"),
      maven: document.getElementById("mavenToggle"),
      rubygems: document.getElementById("rubygemsToggle"),
      crates: document.getElementById("cratesToggle"),
      nuget: document.getElementById("nugetToggle"),
      golang: document.getElementById("golangToggle"),

      // 其他平台
      arxiv: document.getElementById("arxivToggle"),
      fdroid: document.getElementById("fdroidToggle"),
    };

    // 设置平台切换状态
    Object.entries(platformToggles).forEach(([platform, toggle]) => {
      if (
        toggle &&
        settings.enabledPlatforms &&
        settings.enabledPlatforms[platform] !== undefined
      ) {
        toggle.checked = settings.enabledPlatforms[platform];
      }
    });

    // 如果缺少域名则显示状态
    if (!domainValue && settings.enabled) {
      showStatus("请配置你的 Xget 域名", "error");
    } else if (domainValue && enabledValue) {
      showStatus("扩展已激活并准备就绪", "success");
    }
  } catch (error) {
    console.error("加载设置时出错：", error);
    showStatus("加载设置时出错", "error");
  }
}

function setupEventListeners() {
  // 启用/禁用切换
  document
    .getElementById("enabledToggle")
    .addEventListener("change", handleEnableToggle);

  // 域名输入
  document
    .getElementById("domainInput")
    .addEventListener("input", debounce(handleDomainChange, 500));
  document
    .getElementById("domainInput")
    .addEventListener("blur", validateDomain);

  // 平台切换
  const platformToggles = [
    "ghToggle",
    "glToggle",
    "giteaToggle",
    "codebergToggle",
    "sfToggle",
    "aospToggle",
    "hfToggle",
    "npmToggle",
    "pypiToggle",
    "condaToggle",
    "mavenToggle",
    "rubygemsToggle",
    "cratesToggle",
    "nugetToggle",
    "golangToggle",
    "arxivToggle",
    "fdroidToggle",
  ];

  platformToggles.forEach((toggleId) => {
    const element = document.getElementById(toggleId);
    if (element) {
      element.addEventListener("change", saveSettings);
    }
  });

  // 滚动优化逻辑
  setupScrollOptimization();
}

function setupScrollOptimization() {
  const contentElement = document.querySelector(".content");
  const platformsElement = document.querySelector(".platforms");

  // 为主内容区域添加滚动优化
  if (contentElement) {
    let scrollTimeout;

    contentElement.addEventListener("scroll", () => {
      // 添加滚动中的视觉反馈
      contentElement.style.scrollbarWidth = "auto";

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // 滚动结束后隐藏滚动条（仅在不悬停时）
        if (!contentElement.matches(":hover")) {
          contentElement.style.scrollbarWidth = "thin";
        }
      }, 1000);
    });

    // 鼠标悬停时显示滚动条
    contentElement.addEventListener("mouseenter", () => {
      contentElement.style.scrollbarWidth = "auto";
    });

    contentElement.addEventListener("mouseleave", () => {
      contentElement.style.scrollbarWidth = "thin";
    });
  }

  // 为平台列表添加滚动优化
  if (platformsElement) {
    let scrollTimeout;

    platformsElement.addEventListener("scroll", () => {
      platformsElement.style.scrollbarWidth = "auto";

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!platformsElement.matches(":hover")) {
          platformsElement.style.scrollbarWidth = "thin";
        }
      }, 1000);
    });

    platformsElement.addEventListener("mouseenter", () => {
      platformsElement.style.scrollbarWidth = "auto";
    });

    platformsElement.addEventListener("mouseleave", () => {
      platformsElement.style.scrollbarWidth = "thin";
    });
  }

  // 添加键盘导航支持
  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    const isInScrollableArea =
      activeElement &&
      (contentElement.contains(activeElement) ||
        platformsElement.contains(activeElement));

    if (isInScrollableArea) {
      switch (e.key) {
        case "ArrowUp":
          if (e.ctrlKey) {
            e.preventDefault();
            const scrollable = contentElement.contains(activeElement)
              ? contentElement
              : platformsElement;
            scrollable.scrollBy({ top: -50, behavior: "smooth" });
          }
          break;
        case "ArrowDown":
          if (e.ctrlKey) {
            e.preventDefault();
            const scrollable = contentElement.contains(activeElement)
              ? contentElement
              : platformsElement;
            scrollable.scrollBy({ top: 50, behavior: "smooth" });
          }
          break;
        case "Home":
          if (e.ctrlKey) {
            e.preventDefault();
            const scrollable = contentElement.contains(activeElement)
              ? contentElement
              : platformsElement;
            scrollable.scrollTo({ top: 0, behavior: "smooth" });
          }
          break;
        case "End":
          if (e.ctrlKey) {
            e.preventDefault();
            const scrollable = contentElement.contains(activeElement)
              ? contentElement
              : platformsElement;
            scrollable.scrollTo({
              top: scrollable.scrollHeight,
              behavior: "smooth",
            });
          }
          break;
      }
    }
  });
}

async function saveSettings() {
  try {
    const domainValue = document.getElementById("domainInput").value.trim();
    const enabledValue = document.getElementById("enabledToggle").checked;

    // 如果没有设置域名则防止启用
    if (enabledValue && !domainValue) {
      document.getElementById("enabledToggle").checked = false;
      showStatus("没有域名不能启用扩展", "error");
      return;
    }

    const settings = {
      enabled: document.getElementById("enabledToggle").checked,
      xgetDomain: domainValue,
      enabledPlatforms: {
        // 代码托管平台
        gh: document.getElementById("ghToggle")?.checked || false,
        gl: document.getElementById("glToggle")?.checked || false,
        gitea: document.getElementById("giteaToggle")?.checked || false,
        codeberg: document.getElementById("codebergToggle")?.checked || false,
        sf: document.getElementById("sfToggle")?.checked || false,
        aosp: document.getElementById("aospToggle")?.checked || false,

        // AI/ML 平台
        hf: document.getElementById("hfToggle")?.checked || false,

        // 包管理平台
        npm: document.getElementById("npmToggle")?.checked || false,
        pypi: document.getElementById("pypiToggle")?.checked || false,
        "pypi-files": true, // 默认开启
        conda: document.getElementById("condaToggle")?.checked || false,
        "conda-community": true, // 默认开启
        maven: document.getElementById("mavenToggle")?.checked || false,
        apache: true, // 默认开启
        gradle: true, // 默认开启
        rubygems: document.getElementById("rubygemsToggle")?.checked || false,
        cran: true, // 默认开启
        cpan: true, // 默认开启
        ctan: true, // 默认开启
        golang: document.getElementById("golangToggle")?.checked || false,
        nuget: document.getElementById("nugetToggle")?.checked || false,
        crates: document.getElementById("cratesToggle")?.checked || false,
        packagist: true, // 默认开启

        // 其他平台
        arxiv: document.getElementById("arxivToggle")?.checked || false,
        fdroid: document.getElementById("fdroidToggle")?.checked || false,
      },
    };

    // 清理域名 URL
    if (settings.xgetDomain) {
      settings.xgetDomain = cleanupDomain(settings.xgetDomain);
    }

    let response;

    // Firefox 特殊处理
    if (window.firefoxAPI && typeof browser !== "undefined") {
      console.log("Saving settings using Firefox API");
      try {
        // 首先尝试消息传递
        response = await window.firefoxAPI.sendMessage({
          action: "saveSettings",
          settings: settings,
        });
      } catch (msgError) {
        console.log("Message passing failed, using direct storage:", msgError);
        // 如果消息传递失败，直接写入存储
        response = await window.firefoxAPI.saveSettings(settings);
      }
    } else if (webext && webext.runtime && webext.runtime.sendMessage) {
      // 标准 webext API
      console.log("Saving settings using standard webext API");
      response = await webext.runtime.sendMessage({
        action: "saveSettings",
        settings: settings,
      });
    } else {
      throw new Error("No compatible API available for saving settings");
    }

    if (response && response.success) {
      // 显示适当的状态
      if (!settings.xgetDomain && settings.enabled) {
        showStatus("请配置你的 Xget 域名", "error");
      } else if (settings.xgetDomain && settings.enabled) {
        showStatus("✅ 设置已保存！查看页面通知中的刷新按钮", "success");
      } else {
        showStatus("✅ 设置已保存！查看页面通知中的刷新按钮", "success");
      }
    } else if (response && response.error) {
      console.error("保存设置失败：", response.error);
      showStatus("保存设置时出错: " + response.error, "error");
    } else {
      // 如果没有响应，可能是消息传递失败
      console.error("未收到后台脚本的响应");
      showStatus("保存设置时出错：无法与后台脚本通信", "error");
    }
  } catch (error) {
    console.error("保存设置时出错：", error);
    showStatus("保存设置时出错", "error");
  }
}

function validateDomain() {
  const domain = document.getElementById("domainInput").value.trim();
  if (domain && !isValidDomain(domain)) {
    showStatus("域名格式无效", "error");
  }
}

function cleanupDomain(domain) {
  // 如果意外包含协议，则删除它
  domain = domain.replace(/^https?:\/\//, "");

  // 删除末尾斜杠
  domain = domain.replace(/\/$/, "");

  return domain;
}

function isValidDomain(domain) {
  // 如果存在协议则删除它
  domain = domain.replace(/^https?:\/\//, "");

  // 基本域名验证模式
  const domainPattern =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return domainPattern.test(domain) && domain.length <= 253;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function showStatus(message, type) {
  const statusElement = document.getElementById("status");
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = "block";
  statusElement.classList.remove("hiding");

  // 自动隐藏成功消息
  if (type === "success") {
    setTimeout(hideStatus, 3000);
  }
}

function hideStatus() {
  const statusElement = document.getElementById("status");
  statusElement.classList.add("hiding");
  statusElement.addEventListener(
    "animationend",
    () => {
      statusElement.style.display = "none";
      statusElement.classList.remove("hiding");
    },
    { once: true }
  );
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function handleEnableToggle() {
  const enabledToggle = document.getElementById("enabledToggle");
  const domainInput = document.getElementById("domainInput");

  if (enabledToggle.checked && !domainInput.value.trim()) {
    // 如果没有设置域名则防止启用
    enabledToggle.checked = false;
    showStatus("启用前请配置你的 Xget 域名", "error");
    return;
  }

  await saveSettings();
}

async function handleDomainChange() {
  const domainInput = document.getElementById("domainInput");
  const enabledToggle = document.getElementById("enabledToggle");

  // 如果域名被清空且扩展已启用，则禁用它
  if (!domainInput.value.trim() && enabledToggle.checked) {
    enabledToggle.checked = false;
    showStatus("扩展已禁用：域名已清空", "error");
  }

  await saveSettings();
}
