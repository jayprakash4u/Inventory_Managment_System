# Backend API Documentation - System Settings Endpoints

## Overview
This document describes the backend API endpoints for system settings management, which support the redesigned System Config page.

## Architecture Changes

### New Components Added

#### 1. **DTOs (Data Transfer Objects)**

**SystemSettingsRequest.cs** - Request DTO for saving settings
```csharp
{
  "companyName": "string",
  "currency": "string (USD|EUR|GBP|INR|JPY)",
  "taxRate": decimal (0-100),
  "lowStockThreshold": int (min: 1),
  "lowStockNotifications": boolean,
  "emailNotifications": boolean,
  "orderNotifications": boolean,
  "auditRetention": int (1-365 days),
  "recordsPerPage": int (5-500)
}
```

**SystemSettingsResponse.cs** - Response DTO for all settings operations
```csharp
{
  "companyName": "string",
  "currency": "string",
  "taxRate": decimal,
  "lowStockThreshold": int,
  "lowStockNotifications": boolean,
  "emailNotifications": boolean,
  "orderNotifications": boolean,
  "auditRetention": int,
  "recordsPerPage": int,
  "lastUpdated": "datetime",
  "updatedBy": "string"
}
```

#### 2. **Controllers**

**SystemSettingsController.cs** (NEW)
- Dedicated controller for `/api/system-settings` endpoint
- Handles business settings management
- Includes comprehensive validation and logging

**SystemConfigController.cs** (UPDATED)
- Added new endpoints for system settings
- Maintained backward compatibility with existing endpoints
- Added logging with visual indicators (emojis)

#### 3. **Service Layer**

**ISystemConfigService.cs** (UPDATED)
- Added `GetSystemSettingsAsync()` method
- Added `SaveSystemSettingsAsync()` method

**SystemConfigService.cs** (UPDATED)
- Implemented `GetSystemSettingsAsync()`
- Implemented `SaveSystemSettingsAsync()`
- Added detailed logging

## API Endpoints

### 1. Get System Settings
**Endpoint:** `GET /api/system-settings`

**Authentication:** Required (Bearer Token)

**Description:** Retrieves current system business settings

**Request:**
```bash
curl -X GET "https://localhost:44383/api/system-settings" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "companyName": "Product Management Inc.",
  "currency": "USD",
  "taxRate": 10.0,
  "lowStockThreshold": 10,
  "lowStockNotifications": true,
  "emailNotifications": true,
  "orderNotifications": true,
  "auditRetention": 90,
  "recordsPerPage": 25,
  "lastUpdated": "2026-01-29T10:30:00Z",
  "updatedBy": "system"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.3.2",
  "title": "Unauthorized",
  "status": 401
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Error retrieving system settings",
  "message": "Database connection failed"
}
```

---

### 2. Save System Settings
**Endpoint:** `POST /api/system-settings`

**Authentication:** Required (Bearer Token)

**Description:** Saves or updates system business settings with validation

**Request:**
```bash
curl -X POST "https://localhost:44383/api/system-settings" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "New Company Name",
    "currency": "EUR",
    "taxRate": 20.5,
    "lowStockThreshold": 15,
    "lowStockNotifications": true,
    "emailNotifications": true,
    "orderNotifications": false,
    "auditRetention": 180,
    "recordsPerPage": 50
  }'
```

**Response (200 OK):**
```json
{
  "companyName": "New Company Name",
  "currency": "EUR",
  "taxRate": 20.5,
  "lowStockThreshold": 15,
  "lowStockNotifications": true,
  "emailNotifications": true,
  "orderNotifications": false,
  "auditRetention": 180,
  "recordsPerPage": 50,
  "lastUpdated": "2026-01-29T10:35:00Z",
  "updatedBy": "user"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Tax rate must be between 0 and 100"
}
```

**Validation Rules:**
| Field | Validation | Error Message |
|-------|-----------|---------------|
| companyName | Required, not empty | "Company name is required" |
| currency | Must be: USD, EUR, GBP, INR, JPY | Format validation in frontend |
| taxRate | Must be 0-100 | "Tax rate must be between 0 and 100" |
| lowStockThreshold | Must be >= 1 | "Low stock threshold must be at least 1" |
| auditRetention | Must be 1-365 | "Audit retention must be between 1 and 365 days" |
| recordsPerPage | Must be 5-500 | "Records per page must be between 5 and 500" |

---

## Integration with Frontend

The frontend (`system-config.html` and `system-config.js`) uses these endpoints:

### Frontend API Calls

**Load Settings on Page Load:**
```javascript
const settings = await apiClient.get('/system-settings');
populateSettings(settings);
```

**Save Settings:**
```javascript
const settings = gatherSettings();
const response = await apiClient.post('/system-settings', settings);
showAlert('Settings saved successfully!', 'success');
```

### Data Flow

```
Frontend (system-config.html)
  ↓
apiClient.js (API client wrapper)
  ↓
HTTP GET/POST Request
  ↓
SystemSettingsController (ASP.NET Core)
  ↓
ISystemConfigService (Business Logic)
  ↓
Database / Configuration Store
  ↓
SystemSettingsResponse DTO
  ↓
Frontend (Display / Alert)
```

---

## Settings Explanation

### Business Settings

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| Company Name | String | "My Company" | Name of business for reports/invoices |
| Currency | Select | USD | Default currency for all transactions |
| Tax Rate | Decimal | 10% | Default tax applied to orders |
| Low Stock Threshold | Integer | 10 | Product quantity threshold for alerts |

### Notification Settings

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| Low Stock Notifications | Boolean | true | Alert when product quantity drops below threshold |
| Email Notifications | Boolean | true | Send notifications via email |
| Order Notifications | Boolean | true | Alert on new customer/supplier orders |

### Data Management Settings

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| Audit Retention | Integer (days) | 90 | How long to keep audit logs |
| Records Per Page | Integer | 25 | Default pagination size for tables |

---

## Implementation Details

### Current Implementation (MVP)

**Note:** The current implementation returns mock/default data. For production, you should:

1. **Create a SystemSettings Model** in the Data layer
2. **Create Database Migration** to store settings persistently
3. **Update SystemConfigService** to use database instead of mock data
4. **Implement Caching** for frequently accessed settings

### Example: Persistent Storage (TODO)

```csharp
// Model
public class SystemSettings
{
    public int Id { get; set; }
    public string CompanyName { get; set; }
    public string Currency { get; set; }
    public decimal TaxRate { get; set; }
    public int LowStockThreshold { get; set; }
    public bool LowStockNotifications { get; set; }
    public bool EmailNotifications { get; set; }
    public bool OrderNotifications { get; set; }
    public int AuditRetention { get; set; }
    public int RecordsPerPage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string UpdatedBy { get; set; }
}

// In AppDbContext
public DbSet<SystemSettings> SystemSettings { get; set; }
```

---

## Logging

The backend includes comprehensive logging with visual indicators:

| Icon | Meaning | Example |
|------|---------|---------|
| 🔍 | Fetching | "🔍 Fetching system settings from backend" |
| ✅ | Success | "✅ System settings retrieved successfully" |
| ❌ | Error | "❌ Validation failed: Tax rate out of range" |
| 💾 | Saving | "💾 Saving system settings" |

**Log Example:**
```
2026-01-29 10:35:22.456 [Information] 💾 Saving system settings: Company=New Company Name
2026-01-29 10:35:22.502 [Information] ✅ System settings saved successfully
```

---

## Error Handling

### Common Errors and Solutions

**401 Unauthorized**
- **Cause:** Missing or invalid authentication token
- **Solution:** Ensure `Authorization: Bearer {token}` header is included

**400 Bad Request**
- **Cause:** Invalid input data or validation failure
- **Solution:** Check error message and validate input against rules

**500 Internal Server Error**
- **Cause:** Server-side exception
- **Solution:** Check server logs for detailed error information

---

## Testing with Postman

### Create a Postman Request

1. **Method:** GET
2. **URL:** `https://localhost:44383/api/system-settings`
3. **Headers:**
   - `Authorization: Bearer {your_jwt_token}`
   - `Content-Type: application/json`

4. **For POST:**
   - **Body (raw JSON):**
   ```json
   {
     "companyName": "Test Company",
     "currency": "USD",
     "taxRate": 15,
     "lowStockThreshold": 20,
     "lowStockNotifications": true,
     "emailNotifications": false,
     "orderNotifications": true,
     "auditRetention": 120,
     "recordsPerPage": 50
   }
   ```

---

## Production Recommendations

1. **Persistent Storage:** Migrate from mock data to database
2. **Caching Strategy:** Cache settings in-memory with refresh interval
3. **Audit Logging:** Log all settings changes with user information
4. **Validation:** Add additional business logic validation
5. **Security:** Implement role-based access control (only admins can update)
6. **Versioning:** Version settings changes for historical tracking
7. **Encryption:** Encrypt sensitive settings (e.g., API keys, secrets)
8. **Multi-tenancy:** Support settings per tenant if needed

---

## Files Created/Modified

### New Files
- `/WebApplication1/DTOs/Requests/SystemSettingsRequest.cs` - Request DTO
- `/WebApplication1/DTOs/Responses/SystemSettingsResponse.cs` - Response DTO
- `/WebApplication1/Controllers/SystemSettingsController.cs` - Dedicated controller

### Modified Files
- `/WebApplication1/Services/Interfaces/ISystemConfigService.cs` - Added interface methods
- `/WebApplication1/Services/Implementations/SystemConfigService.cs` - Implemented methods
- `/WebApplication1/Controllers/SystemConfigController.cs` - Added new endpoints

### Frontend Files (Already Updated)
- `/Frontend/system-config.html` - Redesigned UI
- `/Frontend/js/system-config.js` - Simplified logic

---

## Quick Start

1. Build the project: `dotnet build`
2. Run the project: `dotnet run`
3. Frontend will call `GET /api/system-settings` on page load
4. User can modify and click "Save Settings" to POST new values
5. Backend validates and returns updated settings
6. Frontend displays success/error message

---

## Support

For issues or questions:
- Check server logs in `/bin/Debug/` folder
- Review validation rules in `SystemSettingsController.cs`
- Verify JWT token validity in `Authorization` header
- Ensure frontend is calling correct endpoint: `/api/system-settings`
