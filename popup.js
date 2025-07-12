document.addEventListener("DOMContentLoaded", async () => {
  // 加载当前设置
  await loadSettings();

  // 设置事件监听器
  setupEventListeners();
});

async function loadSettings() {
  try {
    const settings = await chrome.runtime.sendMessage({
      action: "getSettings",
    });

    // 使用当前设置更新 UI
    const domainValue = settings.xgetDomain || "";
    document.getElementById("domainInput").value = domainValue;

    // 仅在设置了域名时启用切换
    const enabledValue = settings.enabled && domainValue.trim() !== "";
    document.getElementById("enabledToggle").checked = enabledValue;

    // 更新平台切换
    document.getElementById("ghToggle").checked = settings.enabledPlatforms.gh;
    document.getElementById("glToggle").checked = settings.enabledPlatforms.gl;
    document.getElementById("hfToggle").checked = settings.enabledPlatforms.hf;

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
  document.getElementById("ghToggle").addEventListener("change", saveSettings);
  document.getElementById("glToggle").addEventListener("change", saveSettings);
  document.getElementById("hfToggle").addEventListener("change", saveSettings);
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
        gh: document.getElementById("ghToggle").checked,
        gl: document.getElementById("glToggle").checked,
        hf: document.getElementById("hfToggle").checked,
      },
    };

    // 清理域名 URL
    if (settings.xgetDomain) {
      settings.xgetDomain = cleanupDomain(settings.xgetDomain);
    }

    const response = await chrome.runtime.sendMessage({
      action: "saveSettings",
      settings: settings,
    });

    if (response.success) {
      // 显示适当的状态
      if (!settings.xgetDomain && settings.enabled) {
        showStatus("请配置你的 Xget 域名", "error");
      } else if (settings.xgetDomain && settings.enabled) {
        showStatus("✅ 设置已保存！查看页面通知中的刷新按钮", "success");
      } else {
        showStatus("✅ 设置已保存！查看页面通知中的刷新按钮", "success");
      }
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

  // 自动隐藏成功消息
  if (type === "success") {
    setTimeout(hideStatus, 3000);
  }
}

function hideStatus() {
  const statusElement = document.getElementById("status");
  statusElement.style.display = "none";
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
