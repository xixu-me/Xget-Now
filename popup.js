document.addEventListener("DOMContentLoaded", async () => {
  // Load current settings
  await loadSettings();

  // Set up event listeners
  setupEventListeners();
});

async function loadSettings() {
  try {
    const settings = await chrome.runtime.sendMessage({
      action: "getSettings",
    });

    // Update UI with current settings
    const domainValue = settings.xgetDomain || "";
    document.getElementById("domainInput").value = domainValue;

    // Only enable the toggle if domain is set
    const enabledValue = settings.enabled && domainValue.trim() !== "";
    document.getElementById("enabledToggle").checked = enabledValue;

    // Update platform toggles
    document.getElementById("ghToggle").checked = settings.enabledPlatforms.gh;
    document.getElementById("glToggle").checked = settings.enabledPlatforms.gl;
    document.getElementById("hfToggle").checked = settings.enabledPlatforms.hf;

    // Show status if domain is missing
    if (!domainValue && settings.enabled) {
      showStatus("Please configure your Xget domain", "error");
    } else if (domainValue && enabledValue) {
      showStatus("Extension is active and ready", "success");
    }
  } catch (error) {
    console.error("Error loading settings:", error);
    showStatus("Error loading settings", "error");
  }
}

function setupEventListeners() {
  // Enable/disable toggle
  document
    .getElementById("enabledToggle")
    .addEventListener("change", handleEnableToggle);

  // Domain input
  document
    .getElementById("domainInput")
    .addEventListener("input", debounce(handleDomainChange, 500));
  document
    .getElementById("domainInput")
    .addEventListener("blur", validateDomain);

  // Platform toggles
  document.getElementById("ghToggle").addEventListener("change", saveSettings);
  document.getElementById("glToggle").addEventListener("change", saveSettings);
  document.getElementById("hfToggle").addEventListener("change", saveSettings);
}

async function saveSettings() {
  try {
    const domainValue = document.getElementById("domainInput").value.trim();
    const enabledValue = document.getElementById("enabledToggle").checked;

    // Prevent enabling if no domain is set
    if (enabledValue && !domainValue) {
      document.getElementById("enabledToggle").checked = false;
      showStatus("Cannot enable extension without a domain", "error");
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

    // Clean up domain URL
    if (settings.xgetDomain) {
      settings.xgetDomain = cleanupDomain(settings.xgetDomain);
    }

    const response = await chrome.runtime.sendMessage({
      action: "saveSettings",
      settings: settings,
    });

    if (response.success) {
      // Show appropriate status
      if (!settings.xgetDomain && settings.enabled) {
        showStatus("Please configure your Xget domain", "error");
      } else if (settings.xgetDomain && settings.enabled) {
        showStatus(
          "✅ Settings saved! Check page notifications for refresh button",
          "success"
        );
      } else {
        showStatus(
          "✅ Settings saved! Check page notifications for refresh button",
          "success"
        );
      }
    }
  } catch (error) {
    console.error("Error saving settings:", error);
    showStatus("Error saving settings", "error");
  }
}

function validateDomain() {
  const domain = document.getElementById("domainInput").value.trim();
  if (domain && !isValidDomain(domain)) {
    showStatus("Invalid domain format", "error");
  }
}

function cleanupDomain(domain) {
  // Remove any protocol if accidentally included
  domain = domain.replace(/^https?:\/\//, "");

  // Remove trailing slash
  domain = domain.replace(/\/$/, "");

  return domain;
}

function isValidDomain(domain) {
  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, "");

  // Basic domain validation pattern
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

  // Auto-hide success messages
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
    // Prevent enabling if no domain is set
    enabledToggle.checked = false;
    showStatus("Please configure your Xget domain before enabling", "error");
    return;
  }

  await saveSettings();
}

async function handleDomainChange() {
  const domainInput = document.getElementById("domainInput");
  const enabledToggle = document.getElementById("enabledToggle");

  // If domain is cleared and extension is enabled, disable it
  if (!domainInput.value.trim() && enabledToggle.checked) {
    enabledToggle.checked = false;
    showStatus("Extension disabled: domain cleared", "error");
  }

  await saveSettings();
}
