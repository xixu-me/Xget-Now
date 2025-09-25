/**
 * Xget Now - 弹窗脚本
 *
 * 功能：
 * - 管理扩展设置界面
 * - 处理用户交互事件
 * - 同步设置到后台脚本
 * - 提供平台开关控制
 */

// 等待 webext 可用的函数
const waitForWebext = () => {
  return new Promise((resolve) => {
    if (typeof webext !== "undefined") {
      resolve();
    } else {
      // 创建基本的 webext 兼容层
      const api = typeof browser !== "undefined" ? browser : chrome;
      if (api && api.runtime) {
        window.webext = {
          runtime: {
            sendMessage: (message) => {
              return new Promise((resolve, reject) => {
                try {
                  if (api.runtime.sendMessage) {
                    api.runtime.sendMessage(message, (response) => {
                      if (api.runtime.lastError) {
                        console.warn("SendMessage error:", api.runtime.lastError.message);
                        resolve(null);
                      } else {
                        resolve(response);
                      }
                    });
                  } else {
                    resolve(null);
                  }
                } catch (error) {
                  console.warn("SendMessage exception:", error);
                  resolve(null);
                }
              });
            }
          }
        };
      } else {
        // 创建一个最小的存根
        window.webext = {
          runtime: {
            sendMessage: () => Promise.resolve(null)
          }
        };
      }
      resolve();
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 等待兼容层可用
    await waitForWebext();
    console.log("WebExt compatibility layer loaded in popup");

    // 加载当前设置
    await loadSettings();

    // 设置事件监听器
    setupEventListeners();
  } catch (error) {
    console.error("Failed to initialize popup:", error);
    showStatus("初始化失败，请重新打开扩展", "error");
  }
});

/**
 * 加载并应用当前设置到 UI，增强 Zen Browser 兼容性
 */
async function loadSettings() {
  try {
    // 确保 webext 可用
    await waitForWebext();
    
    // 增加超时处理，防止在 Zen Browser 中无限等待
    const settingsPromise = webext.runtime.sendMessage({
      action: "getSettings",
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Settings loading timeout")), 3000);
    });
    
    const settings = await Promise.race([settingsPromise, timeoutPromise]);

    // 验证设置对象的完整性
    if (!settings || typeof settings !== 'object') {
      console.warn("Invalid settings received, using defaults");
      // 使用默认设置而不是抛出错误
      const defaultSettings = {
        enabled: false,
        xgetDomain: "",
        enabledPlatforms: {
          gh: true, gl: true, gitea: true, codeberg: true, sf: true, aosp: true,
          hf: true, npm: true, pypi: true, conda: true, maven: true,
          rubygems: true, crates: true, nuget: true, golang: true,
          arxiv: true, fdroid: true
        }
      };
      
      // 使用默认设置初始化 UI
      initializeUIWithSettings(defaultSettings);
      showStatus("使用默认设置，请配置域名", "error");
      return;
    }

    // 使用设置初始化 UI
    initializeUIWithSettings(settings);
  } catch (error) {
    console.error("加载设置时出错：", error);
    
    // 在 Zen Browser 中提供更详细的错误信息
    let errorMessage = "加载设置时出错";
    if (error.message === "Settings loading timeout") {
      errorMessage = "设置加载超时，请重试";
    } else if (error.message.includes("sendMessage")) {
      errorMessage = "与后台脚本通信失败";
    }
    
    showStatus(errorMessage, "error");
    
    // 尝试使用默认设置初始化 UI
    try {
      const defaultSettings = {
        enabled: false,
        xgetDomain: "",
        enabledPlatforms: {}
      };
      
      const domainInput = document.getElementById("domainInput");
      const enabledToggle = document.getElementById("enabledToggle");
      
      if (domainInput) domainInput.value = "";
      if (enabledToggle) enabledToggle.checked = false;
      
      console.log("Initialized with default settings due to loading error");
    } catch (fallbackError) {
      console.error("Failed to initialize default UI:", fallbackError);
    }
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

    const response = await webext.runtime.sendMessage({
      action: "saveSettings",
      settings: settings,
    });

    if (response && response.success) {
      // 显示适当的状态
      if (!settings.xgetDomain && settings.enabled) {
        showStatus("请配置你的 Xget 域名", "error");
      } else if (settings.xgetDomain && settings.enabled) {
        showStatus("✅ 设置已保存！查看页面通知中的刷新按钮", "success");
      } else {
        showStatus("✅ 设置已保存！查看页面通知中的刷新按钮", "success");
      }
    } else {
      // 如果没有收到响应或响应无效，仍然显示成功消息
      showStatus("⚠️ 设置可能已保存，但无法确认", "warning");
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

/**
 * 使用给定的设置初始化 UI
 */
function initializeUIWithSettings(settings) {
  // 使用当前设置更新 UI，提供默认值
  const domainValue = settings.xgetDomain || "";
  const domainInput = document.getElementById("domainInput");
  if (domainInput) {
    domainInput.value = domainValue;
  }

  // 仅在设置了域名时启用切换
  const enabledValue = settings.enabled && domainValue.trim() !== "";
  const enabledToggle = document.getElementById("enabledToggle");
  if (enabledToggle) {
    enabledToggle.checked = enabledValue;
  }

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
}
