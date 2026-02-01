# System Configuration API Documentation

## Overview
This document provides detailed information about the System Configuration API endpoints available in the Product Management System.

## Base URL
```
https://localhost:44383/api
```

## Authentication
All endpoints (except `/api/system-config/health/status`) require JWT Bearer token authentication.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Endpoints

### 1. Get All System Configurations
**Endpoint:** `GET /system-config`

**Description:** Retrieve all system configuration settings.

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "key": "AppName",
    "value": "Product Management System",
    "description": "Application name",
    "category": "General",
    "isEncrypted": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "key": "MaxUploadSizeMb",
    "value": "100",
    "description": "Maximum file upload size in MB",
    "category": "General",
    "isEncrypted": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token
- `500 Internal Server Error` - Server error

---

### 2. Get Configuration by Key
**Endpoint:** `GET /system-config/{key}`

**Description:** Retrieve a specific configuration by its key.

**Authentication:** Required

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| key | string (path) | Yes | Configuration key (e.g., "AppName") |

**Response (200 OK):**
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

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Configuration key not found
- `500 Internal Server Error` - Server error

---

### 3. Get Configurations by Category
**Endpoint:** `GET /system-config/category/{category}`

**Description:** Retrieve all configurations in a specific category.

**Authentication:** Required

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| category | string (path) | Yes | Category name (e.g., "General", "Security") |

**Response (200 OK):**
```json
[
  {
    "id": 4,
    "key": "SessionTimeoutMinutes",
    "value": "30",
    "description": "Session timeout in minutes",
    "category": "Security",
    "isEncrypted": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### 4. Update Configuration
**Endpoint:** `PUT /system-config/{key}`

**Description:** Update a specific configuration value.

**Authentication:** Required

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| key | string (path) | Yes | Configuration key |

**Request Body:**
```json
{
  "key": "AppName",
  "value": "Updated App Name",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "key": "AppName",
  "value": "Updated App Name",
  "description": "Updated description",
  "category": "General",
  "isEncrypted": false,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Configuration key not found
- `500 Internal Server Error` - Server error

---

### 5. Bulk Update Configurations
**Endpoint:** `PUT /system-config/bulk/update`

**Description:** Update multiple configurations at once.

**Authentication:** Required

**Request Body:**
```json
{
  "configurations": [
    {
      "key": "AppName",
      "value": "New App Name",
      "description": "Updated"
    },
    {
      "key": "MaxUploadSizeMb",
      "value": "200",
      "description": "Increased limit"
    }
  ]
}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "key": "AppName",
    "value": "New App Name",
    "description": "Updated",
    "category": "General",
    "isEncrypted": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  },
  {
    "id": 2,
    "key": "MaxUploadSizeMb",
    "value": "200",
    "description": "Increased limit",
    "category": "General",
    "isEncrypted": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
]
```

---

### 6. Reset Configuration to Default
**Endpoint:** `POST /system-config/reset/{key}`

**Description:** Reset a specific configuration to its default value.

**Authentication:** Required

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| key | string (path) | Yes | Configuration key |

**Response (200 OK):**
```json
{
  "id": 1,
  "key": "AppName",
  "value": "Product Management System",
  "description": "Reset to default value",
  "category": "General",
  "isEncrypted": false,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T11:35:00Z"
}
```

---

### 7. Reset All Configurations
**Endpoint:** `POST /system-config/reset-all`

**Description:** Reset all configurations to their default values.

**Authentication:** Required

**Response (200 OK):**
```json
true
```

---

### 8. Get System Health Status
**Endpoint:** `GET /system-config/health/status`

**Description:** Get current system health status including CPU, memory, storage, and database information.

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "status": "Healthy",
  "checkTime": "2024-01-15T11:45:00Z",
  "database": {
    "isConnected": true,
    "recordCount": 1500,
    "storageUsageMb": 250.5,
    "lastBackup": "2024-01-15T00:00:00Z",
    "message": "Database is healthy and responsive"
  },
  "api": {
    "isRunning": true,
    "version": "1.0.0",
    "activeConnections": 42,
    "averageResponseTime": 125.5,
    "errorCount": 3
  },
  "storage": {
    "totalStorageMb": 1000.0,
    "usedStorageMb": 350.0,
    "availableStorageMb": 650.0,
    "usagePercentage": 35.0
  },
  "performanceMetrics": {
    "cpuUsagePercent": 45.2,
    "memoryUsagePercent": 62.8,
    "averageResponseTimeMs": 125.5,
    "requestsPerSecond": 156,
    "cacheHitRate": 78
  }
}
```

**Health Status Values:**
- `Healthy` - All systems operating normally
- `Warning` - Some resource usage is high (> 75%)
- `Critical` - Critical resource usage (> 90%)

---

### 9. Get System Statistics
**Endpoint:** `GET /system-config/statistics`

**Description:** Get comprehensive system statistics including user and order counts.

**Authentication:** Required

**Response (200 OK):**
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

---

### 10. Get Activity Logs
**Endpoint:** `GET /system-config/activity-logs`

**Description:** Retrieve system activity logs with pagination support.

**Authentication:** Required

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| page | integer | 1 | Page number for pagination |
| pageSize | integer | 50 | Number of records per page (max 100) |

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user": "admin@example.com",
    "action": "Login",
    "details": "Auth - User logged in successfully",
    "ipAddress": "192.168.1.100",
    "timestamp": "2024-01-15T11:00:00Z",
    "status": "Success"
  },
  {
    "id": 2,
    "user": "user@example.com",
    "action": "Create Product",
    "details": "Products - New product created",
    "ipAddress": "192.168.1.101",
    "timestamp": "2024-01-15T11:15:00Z",
    "status": "Success"
  }
]
```

---

### 11. Create System Backup
**Endpoint:** `POST /system-config/backup/create`

**Description:** Create a new system backup.

**Authentication:** Required

**Request Body:**
```json
{
  "backupName": "Pre-Update Backup",
  "description": "Backup before system update",
  "includeData": true,
  "includeSettings": true
}
```

**Response (201 Created):**
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

### 12. Get All Backups
**Endpoint:** `GET /system-config/backup/list`

**Description:** Retrieve a list of all system backups.

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "backupName": "Auto Backup - 2024-01-15",
    "description": "Automatic daily backup",
    "fileSizeMb": 128.5,
    "createdAt": "2024-01-15T00:00:00Z",
    "status": "Completed",
    "location": "/backups/backup_20240115_000000.bak"
  },
  {
    "id": 2,
    "backupName": "Manual Backup - 2024-01-14",
    "description": "Manual backup before updates",
    "fileSizeMb": 128.3,
    "createdAt": "2024-01-14T12:00:00Z",
    "status": "Completed",
    "location": "/backups/backup_20240114_120000.bak"
  }
]
```

---

### 13. Restore from Backup
**Endpoint:** `POST /system-config/backup/restore/{backupId}`

**Description:** Restore the system from a specific backup.

**Authentication:** Required

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| backupId | integer (path) | Yes | Backup ID to restore from |

**Response (200 OK):**
```json
true
```

**Error Responses:**
- `400 Bad Request` - Invalid backup ID
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Backup not found
- `500 Internal Server Error` - Restore operation failed

---

### 14. Delete Backup
**Endpoint:** `DELETE /system-config/backup/{backupId}`

**Description:** Delete a specific system backup.

**Authentication:** Required

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| backupId | integer (path) | Yes | Backup ID to delete |

**Response (200 OK):**
```json
true
```

---

### 15. Clear Cache
**Endpoint:** `POST /system-config/cache/clear`

**Description:** Clear the system cache to free up memory and refresh data.

**Authentication:** Required

**Response (200 OK):**
```json
true
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized - Invalid or missing JWT token"
}
```

### 404 Not Found
```json
{
  "message": "Configuration 'InvalidKey' not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error retrieving configurations"
}
```

---

## Configuration Categories

The system supports the following configuration categories:

- **General** - Application-wide settings
- **Security** - Security-related configurations
- **Database** - Database connection settings
- **Email** - Email server configurations
- **Backup** - Backup settings

---

## Example Usage in Frontend

### Get All Configurations
```javascript
const configs = await apiClient.get("/system-config");
```

### Update Configuration
```javascript
const updatedConfig = await apiClient.put("/system-config/AppName", {
  key: "AppName",
  value: "New App Name",
  description: "Updated description"
});
```

### Bulk Update
```javascript
const result = await apiClient.put("/system-config/bulk/update", {
  configurations: [
    { key: "AppName", value: "New Name", description: "Updated" },
    { key: "MaxUploadSizeMb", value: "200", description: "Increased" }
  ]
});
```

### Get System Health
```javascript
const health = await apiClient.get("/system-config/health/status");
```

### Create Backup
```javascript
const backup = await apiClient.post("/system-config/backup/create", {
  backupName: "Pre-Update Backup",
  description: "Backup before update",
  includeData: true,
  includeSettings: true
});
```

### Restore Backup
```javascript
const result = await apiClient.post("/system-config/backup/restore/1");
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server-side error |

---

## Rate Limiting

API requests are subject to rate limiting. Check response headers for rate limit information:

- `X-RateLimit-Limit` - Maximum requests per minute
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Time when rate limit resets

---

## Notes

- All timestamps are in UTC format (ISO 8601)
- The API uses JWT Bearer tokens for authentication
- Backup and restore operations may take time; use polling to check status
- System health endpoint does not require authentication for monitoring purposes
- All decimal values are returned with full precision
