// System Configuration Page - Simplified Version
// Focus on business settings and easy API integration

// Default settings structure
const DEFAULT_SETTINGS = {
  companyName: 'My Company',
  currency: 'USD',
  taxRate: 10,
  lowStockThreshold: 10,
  lowStockNotifications: true,
  emailNotifications: true,
  orderNotifications: true,
  auditRetention: 90,
  recordsPerPage: 25
};

// Initialize page on DOM ready
document.addEventListener('DOMContentLoaded', async function () {
  console.log('📋 System Config page loading...');

  // Verify authentication
  if (!apiClient.isAuthenticated()) {
    console.warn('⚠️  User not authenticated, redirecting to login');
    window.location.href = 'login.html';
    return;
  }

  // Load settings from backend
  await loadSettings();

  // Initialize event listeners
  initializeEventListeners();

  console.log('✅ System Config page initialized');
});

/**
 * Load settings from backend API or localStorage
 */
async function loadSettings() {
  try {
    console.log('📡 Fetching settings from API...');

    // Try to fetch from backend
    const settings = await apiClient.get('/system-settings');

    if (settings && settings.data) {
      populateSettings(settings.data);
      console.log('✅ Settings loaded from backend:', settings.data);
    } else {
      // Fallback to default settings if API call fails
      console.log('ℹ️  Using default settings');
      populateSettings(DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.warn('⚠️  Failed to fetch from API, using defaults:', error.message);
    populateSettings(DEFAULT_SETTINGS);
  }
}

/**
 * Populate form fields with settings data
 */
function populateSettings(settings) {
  console.log('📝 Populating form fields...');

  // Business Settings
  document.getElementById('companyName').value = settings.companyName || '';
  document.getElementById('currency').value = settings.currency || 'USD';
  document.getElementById('taxRate').value = settings.taxRate || 10;
  document.getElementById('lowStockThreshold').value = settings.lowStockThreshold || 10;

  // Notification Settings
  document.getElementById('lowStockNotifications').checked = settings.lowStockNotifications !== false;
  document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
  document.getElementById('orderNotifications').checked = settings.orderNotifications !== false;

  // Data Management Settings
  document.getElementById('auditRetention').value = settings.auditRetention || 90;
  document.getElementById('recordsPerPage').value = settings.recordsPerPage || 25;

  console.log('✅ Form fields populated');
}

/**
 * Gather form data into settings object
 */
function gatherSettings() {
  return {
    companyName: document.getElementById('companyName').value,
    currency: document.getElementById('currency').value,
    taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
    lowStockThreshold: parseInt(document.getElementById('lowStockThreshold').value) || 10,
    lowStockNotifications: document.getElementById('lowStockNotifications').checked,
    emailNotifications: document.getElementById('emailNotifications').checked,
    orderNotifications: document.getElementById('orderNotifications').checked,
    auditRetention: parseInt(document.getElementById('auditRetention').value) || 90,
    recordsPerPage: parseInt(document.getElementById('recordsPerPage').value) || 25
  };
}

/**
 * Save settings to backend
 */
async function saveSettings() {
  try {
    console.log('💾 Saving settings...');

    const settings = gatherSettings();
    console.log('📊 Settings to save:', settings);

    // Validate required fields
    if (!settings.companyName.trim()) {
      showAlert('Company Name is required', 'error');
      return;
    }

    if (settings.taxRate < 0 || settings.taxRate > 100) {
      showAlert('Tax Rate must be between 0 and 100', 'error');
      return;
    }

    if (settings.lowStockThreshold < 1) {
      showAlert('Low Stock Threshold must be at least 1', 'error');
      return;
    }

    // Send to backend
    const response = await apiClient.post('/system-settings', settings);

    if (response) {
      console.log('✅ Settings saved successfully:', response);
      showAlert('Settings saved successfully!', 'success');

      // Save to localStorage as backup
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      console.log('💾 Settings cached to localStorage');
    }
  } catch (error) {
    console.error('❌ Error saving settings:', error);
    showAlert('Failed to save settings: ' + error.message, 'error');
  }
}

/**
 * Reset settings to default values
 */
function resetSettings() {
  const confirmed = confirm(
    'Are you sure you want to reset all settings to their default values? This action cannot be undone.'
  );

  if (!confirmed) {
    console.log('❌ Reset cancelled by user');
    return;
  }

  console.log('🔄 Resetting settings to defaults...');
  populateSettings(DEFAULT_SETTINGS);
  showAlert('Settings reset to defaults. Click "Save Settings" to confirm.', 'info');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  console.log('🎯 Setting up event listeners...');

  // Save button
  const saveBtn = document.querySelector('button[onclick="saveSettings()"]');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveSettings);
  }

  // Reset button
  const resetBtn = document.querySelector('button[onclick="resetSettings()"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetSettings);
  }

  // Input validation
  const taxRateField = document.getElementById('taxRate');
  if (taxRateField) {
    taxRateField.addEventListener('input', function () {
      if (this.value < 0) this.value = 0;
      if (this.value > 100) this.value = 100;
    });
  }

  const lowStockField = document.getElementById('lowStockThreshold');
  if (lowStockField) {
    lowStockField.addEventListener('input', function () {
      if (this.value < 1) this.value = 1;
    });
  }

  const auditRetentionField = document.getElementById('auditRetention');
  if (auditRetentionField) {
    auditRetentionField.addEventListener('input', function () {
      if (this.value < 1) this.value = 1;
      if (this.value > 365) this.value = 365;
    });
  }

  console.log('✅ Event listeners attached');
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
  const alertElement = document.getElementById('alertMessage');

  if (alertElement) {
    alertElement.textContent = message;
    alertElement.className = `alert-message ${type}`;

    // Show for 4 seconds
    setTimeout(() => {
      alertElement.className = 'alert-message';
    }, 4000);

    console.log(`📢 Alert [${type}]: ${message}`);
  }
}
