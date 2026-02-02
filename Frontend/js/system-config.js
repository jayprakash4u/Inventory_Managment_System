const DEFAULT_SETTINGS = {
  companyName: "My Company",
  currency: "USD",
  taxRate: 10,
  lowStockThreshold: 10,
  lowStockNotifications: true,
  emailNotifications: true,
  orderNotifications: true,
  auditRetention: 90,
  recordsPerPage: 25,
};

document.addEventListener("DOMContentLoaded", async function () {
  if (!apiClient.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }
  await loadSettings();
  initializeEventListeners();
});

async function loadSettings() {
  try {
    const settings = await apiClient.get("/system-settings");
    if (settings && settings.data) {
      populateSettings(settings.data);
    } else {
      populateSettings(DEFAULT_SETTINGS);
    }
  } catch (error) {
    populateSettings(DEFAULT_SETTINGS);
  }
}

function populateSettings(settings) {
  document.getElementById("companyName").value = settings.companyName || "";
  document.getElementById("currency").value = settings.currency || "USD";
  document.getElementById("taxRate").value = settings.taxRate || 10;
  document.getElementById("lowStockThreshold").value =
    settings.lowStockThreshold || 10;
  document.getElementById("lowStockNotifications").checked =
    settings.lowStockNotifications !== false;
  document.getElementById("emailNotifications").checked =
    settings.emailNotifications !== false;
  document.getElementById("orderNotifications").checked =
    settings.orderNotifications !== false;
  document.getElementById("auditRetention").value =
    settings.auditRetention || 90;
  document.getElementById("recordsPerPage").value =
    settings.recordsPerPage || 25;
}

function gatherSettings() {
  return {
    companyName: document.getElementById("companyName").value,
    currency: document.getElementById("currency").value,
    taxRate: parseFloat(document.getElementById("taxRate").value) || 0,
    lowStockThreshold:
      parseInt(document.getElementById("lowStockThreshold").value) || 10,
    lowStockNotifications: document.getElementById("lowStockNotifications")
      .checked,
    emailNotifications: document.getElementById("emailNotifications").checked,
    orderNotifications: document.getElementById("orderNotifications").checked,
    auditRetention:
      parseInt(document.getElementById("auditRetention").value) || 90,
    recordsPerPage:
      parseInt(document.getElementById("recordsPerPage").value) || 25,
  };
}

async function saveSettings() {
  try {
    const settings = gatherSettings();
    if (!settings.companyName.trim()) {
      showAlert("Company Name is required", "error");
      return;
    }
    if (settings.taxRate < 0 || settings.taxRate > 100) {
      showAlert("Tax Rate must be between 0 and 100", "error");
      return;
    }
    if (settings.lowStockThreshold < 1) {
      showAlert("Low Stock Threshold must be at least 1", "error");
      return;
    }
    const response = await apiClient.post("/system-settings", settings);
    if (response) {
      showAlert("Settings saved successfully!", "success");
      localStorage.setItem("systemSettings", JSON.stringify(settings));
    }
  } catch (error) {
    showAlert("Failed to save settings: " + error.message, "error");
  }
}

function resetSettings() {
  if (
    confirm(
      "Are you sure you want to reset all settings to their default values? This action cannot be undone.",
    )
  ) {
    populateSettings(DEFAULT_SETTINGS);
    showAlert(
      'Settings reset to defaults. Click "Save Settings" to confirm.',
      "info",
    );
  }
}

function initializeEventListeners() {
  const saveBtn = document.querySelector('button[onclick="saveSettings()"]');
  if (saveBtn) saveBtn.addEventListener("click", saveSettings);
  const resetBtn = document.querySelector('button[onclick="resetSettings()"]');
  if (resetBtn) resetBtn.addEventListener("click", resetSettings);
  const taxRateField = document.getElementById("taxRate");
  if (taxRateField)
    taxRateField.addEventListener("input", function () {
      if (this.value < 0) this.value = 0;
      if (this.value > 100) this.value = 100;
    });
  const lowStockField = document.getElementById("lowStockThreshold");
  if (lowStockField)
    lowStockField.addEventListener("input", function () {
      if (this.value < 1) this.value = 1;
    });
  const auditRetentionField = document.getElementById("auditRetention");
  if (auditRetentionField)
    auditRetentionField.addEventListener("input", function () {
      if (this.value < 1) this.value = 1;
      if (this.value > 365) this.value = 365;
    });
}

function showAlert(message, type = "info") {
  const alertElement = document.getElementById("alertMessage");
  if (alertElement) {
    alertElement.textContent = message;
    alertElement.className = `alert-message ${type}`;
    setTimeout(() => {
      alertElement.className = "alert-message";
    }, 4000);
  }
}
