# Quick Reference Guide - System Configuration API

## 🚀 Quick Start

### Run Backend
```bash
cd WebApplication1
dotnet build
dotnet run
```
API will be available at: `https://localhost:44383/api`

### Access Frontend
Open `Frontend/system-config.html` in browser after logging in.

---

## 📋 Quick API Reference

### Authentication
```javascript
// Login
const response = await apiClient.login("admin@example.com", "password");

// Check if authenticated
if (apiClient.isAuthenticated()) {
  // Make API calls
}
```

### Configuration Management
```javascript
// Get all configurations
const all = await apiClient.get("/system-config");

// Get specific configuration
const config = await apiClient.get("/system-config/AppName");

// Update configuration
const updated = await apiClient.put("/system-config/AppName", {
  key: "AppName",
  value: "New Value",
  description: "Updated description"
});

// Bulk update
const results = await apiClient.put("/system-config/bulk/update", {
  configurations: [
    { key: "Key1", value: "Value1", description: "Desc1" },
    { key: "Key2", value: "Value2", description: "Desc2" }
  ]
});

// Reset single config
const reset = await apiClient.post("/system-config/reset/AppName");

// Reset all configs
const resetAll = await apiClient.post("/system-config/reset-all");

// Get configs by category
const general = await apiClient.get("/system-config/category/General");
const security = await apiClient.get("/system-config/category/Security");
```

### Health & Monitoring
```javascript
// Get system health (no auth required)
const health = await apiClient.get("/system-config/health/status");
console.log(health.status); // "Healthy", "Warning", or "Critical"
console.log(health.database.isConnected);
console.log(health.performanceMetrics.cpuUsagePercent);

// Get statistics
const stats = await apiClient.get("/system-config/statistics");
console.log(stats.totalUsers);
console.log(stats.totalRevenue);

// Get activity logs
const logs = await apiClient.get("/system-config/activity-logs?page=1&pageSize=20");
```

### Backup Operations
```javascript
// Create backup
const backup = await apiClient.post("/system-config/backup/create", {
  backupName: "Pre-Update Backup",
  description: "Backup before major update",
  includeData: true,
  includeSettings: true
});

// List backups
const backups = await apiClient.get("/system-config/backup/list");

// Restore from backup
const restored = await apiClient.post("/system-config/backup/restore/1");

// Delete backup
const deleted = await apiClient.delete("/system-config/backup/1");
```

### Cache & Utilities
```javascript
// Clear cache
const cleared = await apiClient.post("/system-config/cache/clear");
```

---

## 🔧 Configuration Categories

| Category | Examples |
|----------|----------|
| **General** | AppName, MaxUploadSizeMb, EnableNotifications |
| **Security** | SessionTimeoutMinutes, EnableTwoFactorAuth |
| **Database** | ConnectionString, BackupPath |
| **Email** | SmtpServer, EmailFrom, EmailPassword |
| **Backup** | BackupFrequency, BackupRetention |

---

## 📊 Response Objects

### SystemConfigDto
```json
{
  "id": 1,
  "key": "AppName",
  "value": "Product Management System",
  "description": "Application name",
  "category": "General",
  "isEncrypted": false,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### SystemHealthDto
```json
{
  "status": "Healthy",
  "checkTime": "2024-01-15T11:45:00Z",
  "database": { "isConnected": true, "recordCount": 1500, ... },
  "api": { "isRunning": true, "version": "1.0.0", ... },
  "storage": { "totalStorageMb": 1000, "usagePercentage": 35.0, ... },
  "performanceMetrics": { "cpuUsagePercent": 45.2, ... }
}
```

### SystemStatisticsDto
```json
{
  "totalUsers": 150,
  "activeUsersToday": 45,
  "totalProducts": 280,
  "totalOrders": 1250,
  "totalRevenue": 45250.75,
  "systemErrors": 3,
  "systemUptimeSince": "2024-01-14T10:00:00Z"
}
```

### ActivityLogDto
```json
{
  "id": 1,
  "user": "admin@example.com",
  "action": "Login",
  "details": "Auth - User logged in successfully",
  "ipAddress": "192.168.1.100",
  "timestamp": "2024-01-15T11:00:00Z",
  "status": "Success"
}
```

### SystemBackupDto
```json
{
  "id": 10,
  "backupName": "Pre-Update Backup",
  "description": "Backup before system update",
  "fileSizeMb": 128.5,
  "createdAt": "2024-01-15T11:50:00Z",
  "status": "Completed",
  "location": "/backups/Pre-Update_Backup_20240115_115000.bak"
}
```

---

## ❌ Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Login and get JWT token |
| 404 | Not Found | Verify endpoint URL |
| 500 | Server Error | Check backend logs |

### Error Response Format
```json
{
  "message": "Error description here"
}
```

### Error Handling in Code
```javascript
try {
  const result = await apiClient.get("/system-config");
} catch (error) {
  console.error("Error:", error);
  showNotification("Failed to load configuration", "error");
}
```

---

## 🔐 Authentication

### Token Management
```javascript
// Check if user is authenticated
const isAuth = apiClient.isAuthenticated();

// Get stored user
const user = apiClient.getStoredUser();
console.log(user.email, user.username);

// Logout
apiClient.logout();
```

### Token Headers
All authenticated requests automatically include:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 📝 Frontend Integration Examples

### System Config Page Integration
```javascript
// Load all data on page load
async function loadSystemConfig() {
  const configs = await apiClient.get("/system-config");
  updateForm(configs);
}

// Save changes
async function saveConfiguration() {
  const request = {
    configurations: [
      { key: "AppName", value: "New Value", description: "Desc" }
    ]
  };
  await apiClient.put("/system-config/bulk/update", request);
  showNotification("Saved successfully", "success");
}

// Clear cache
async function clearCache() {
  if (confirm("Clear cache?")) {
    await apiClient.post("/system-config/cache/clear");
    showNotification("Cache cleared", "success");
  }
}
```

### Health Monitoring Integration
```javascript
// Show health status
async function showHealth() {
  const health = await apiClient.get("/system-config/health/status");
  
  const statusClass = 
    health.status === "Healthy" ? "success" :
    health.status === "Warning" ? "warning" : "danger";
  
  console.log(`Status: ${health.status}`);
  console.log(`CPU: ${health.performanceMetrics.cpuUsagePercent}%`);
  console.log(`Memory: ${health.performanceMetrics.memoryUsagePercent}%`);
}
```

### Backup Management Integration
```javascript
// Create backup with user input
async function createBackup() {
  const name = prompt("Backup name?");
  if (!name) return;
  
  const backup = await apiClient.post("/system-config/backup/create", {
    backupName: name,
    description: prompt("Description?") || "",
    includeData: true,
    includeSettings: true
  });
  
  showNotification(`Backup created: ${backup.backupName}`, "success");
}

// List and restore
async function showBackups() {
  const backups = await apiClient.get("/system-config/backup/list");
  
  backups.forEach(backup => {
    console.log(`${backup.backupName} - ${backup.fileSizeMb}MB`);
    
    const restoreBtn = document.createElement("button");
    restoreBtn.onclick = () => restoreFromBackup(backup.id);
  });
}
```

---

## 🔍 Debugging Tips

### Check Network Requests
```javascript
// Add logging before API calls
console.log("Calling: GET /api/system-config");
const result = await apiClient.get("/system-config");
console.log("Response:", result);
```

### Check Token
```javascript
// Verify token is stored
const token = localStorage.getItem("accessToken");
console.log("Token:", token ? "Found" : "Missing");

// Check if expired
const expired = apiClient.isTokenExpired();
console.log("Token expired:", expired);
```

### Browser Console Errors
```javascript
// All errors are logged to console
// Check for: 401, 404, 500 errors
// Check for: "Unauthorized" messages
```

### Backend Logs
```bash
# Check console output when running backend
# Look for: INFO, WARNING, ERROR messages
# Verify: Database connection successful
```

---

## 📚 File Locations

### Backend Files
- **Controller:** `WebApplication1/Controllers/SystemConfigController.cs`
- **Service Interface:** `WebApplication1/Services/Interfaces/ISystemConfigService.cs`
- **Service Implementation:** `WebApplication1/Services/Implementations/SystemConfigService.cs`
- **DTOs:** `WebApplication1/DTOs/Requests/SystemConfigRequest.cs`
- **DTOs:** `WebApplication1/DTOs/Responses/SystemConfigResponse.cs`
- **Configuration:** `WebApplication1/Program.cs`

### Frontend Files
- **HTML:** `Frontend/system-config.html`
- **JavaScript:** `Frontend/js/system-config.js`
- **API Client:** `Frontend/js/api-client.js`
- **CSS:** `Frontend/Css/inventory.css` (used by system-config)

### Documentation Files
- **Complete API Docs:** `SYSTEM_CONFIG_API_DOCUMENTATION.md`
- **Integration Guide:** `API_INTEGRATION_GUIDE.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`

---

## ⚡ Common Tasks

### Task: Update Single Configuration
```javascript
const updated = await apiClient.put("/system-config/AppName", {
  key: "AppName",
  value: "New App Name",
  description: "Updated"
});
```

### Task: Update Multiple Configurations
```javascript
const results = await apiClient.put("/system-config/bulk/update", {
  configurations: [
    { key: "AppName", value: "New Name", description: "Updated" },
    { key: "MaxUploadSizeMb", value: "200", description: "Increased" }
  ]
});
```

### Task: Reset to Defaults
```javascript
// Single
await apiClient.post("/system-config/reset/AppName");

// All
await apiClient.post("/system-config/reset-all");
```

### Task: Get System Status
```javascript
const health = await apiClient.get("/system-config/health/status");
const stats = await apiClient.get("/system-config/statistics");
```

### Task: Create and Restore Backup
```javascript
// Create
const backup = await apiClient.post("/system-config/backup/create", {
  backupName: "Backup Name",
  description: "Description",
  includeData: true,
  includeSettings: true
});

// List
const backups = await apiClient.get("/system-config/backup/list");

// Restore
await apiClient.post(`/system-config/backup/restore/${backup.id}`);

// Delete
await apiClient.delete(`/system-config/backup/${backup.id}`);
```

---

## 🆘 Quick Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| 401 Unauthorized | No JWT token | Login first |
| 404 Not Found | Wrong endpoint | Check endpoint URL |
| 500 Server Error | Backend error | Check backend logs |
| No response | Network issue | Check API URL |
| Slow response | Too much data | Use pagination |
| Token expired | Old token | Auto-refreshes, retry |

---

## 📞 Support Resources

1. **API Documentation:** SYSTEM_CONFIG_API_DOCUMENTATION.md
2. **Integration Guide:** API_INTEGRATION_GUIDE.md
3. **Source Code Comments:** Inline in all files
4. **Code Examples:** See both docs above

---

**Last Updated:** January 15, 2024
**Version:** 1.0
