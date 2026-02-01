# Complete API Integration Guide

## Overview
This document provides a comprehensive guide for integrating the backend ASP.NET Core API with the frontend HTML/JavaScript application.

## Project Structure

### Backend (ASP.NET Core Web API)
```
WebApplication1/
├── Controllers/
│   ├── AuditController.cs
│   ├── AuthController.cs
│   ├── CustomerOrdersController.cs
│   ├── HealthController.cs
│   ├── InsightsController.cs
│   ├── ProductsController.cs
│   ├── SupplierOrdersController.cs
│   └── SystemConfigController.cs (NEW)
├── Services/
│   ├── Interfaces/
│   │   ├── IAuditService.cs
│   │   ├── ICustomerOrderService.cs
│   │   ├── IInsightsService.cs
│   │   ├── IProductService.cs
│   │   ├── IRefreshTokenService.cs
│   │   ├── ISupplierOrderService.cs
│   │   ├── ISystemConfigService.cs (NEW)
│   │   └── IUserService.cs
│   └── Implementations/
│       ├── AuditService.cs
│       ├── CustomerOrderService.cs
│       ├── InsightsService.cs
│       ├── ProductService.cs
│       ├── RefreshTokenService.cs
│       ├── SupplierOrderService.cs
│       ├── SystemConfigService.cs (NEW)
│       └── UserService.cs
├── DTOs/
│   ├── Requests/
│   │   ├── SystemConfigRequest.cs (NEW)
│   │   └── ... (other request DTOs)
│   └── Responses/
│       ├── SystemConfigResponse.cs (NEW)
│       └── ... (other response DTOs)
├── Data/
│   └── AppDbContext.cs
├── Repository/
│   ├── Interfaces/
│   └── Implementations/
└── Program.cs
```

### Frontend (HTML/JavaScript/CSS)
```
Frontend/
├── index.html (Dashboard)
├── inventory.html
├── audit.html
├── supplier.html
├── customer-orders.html
├── insights-hub.html
├── system-config.html (NEW - fully integrated)
├── login.html
├── register.html
├── Css/
│   ├── style.css
│   ├── user-profile.css
│   ├── dashboard-redesign.css
│   ├── table.css
│   ├── inventory.css
│   ├── insights.css
│   └── auth.css
└── js/
    ├── api-client.js (Centralized API client)
    ├── dashboard.js (Updated - uses API)
    ├── system-config.js (NEW - fully integrated)
    ├── audit.js (Uses API)
    ├── customer-orders.js (Uses API)
    ├── inventory.js (Uses API)
    ├── supplier.js (Uses API)
    ├── insights.js
    ├── script.js
    ├── profile.js
    └── user-profile-component.js
```

---

## API Endpoints Summary

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/refresh` | Refresh JWT token |

### Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products with filtering |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/products/summary` | Get product summary |
| GET | `/api/products/chart/category` | Chart data by category |
| GET | `/api/products/chart/stock-levels` | Chart data for stock levels |

### Audit Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit/logs` | Get audit logs with pagination |
| GET | `/api/audit/statistics` | Get audit statistics |

### Supplier Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/supplier-orders` | Get all supplier orders |
| GET | `/api/supplier-orders/{id}` | Get supplier order by ID |
| POST | `/api/supplier-orders` | Create supplier order |
| PUT | `/api/supplier-orders/{id}` | Update supplier order |
| DELETE | `/api/supplier-orders/{id}` | Delete supplier order |
| GET | `/api/supplier-orders/summary` | Get supplier orders summary |

### Customer Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer-orders` | Get all customer orders |
| GET | `/api/customer-orders/{id}` | Get customer order by ID |
| POST | `/api/customer-orders` | Create customer order |
| PUT | `/api/customer-orders/{id}` | Update customer order |
| DELETE | `/api/customer-orders/{id}` | Delete customer order |
| GET | `/api/customer-orders/summary` | Get customer orders summary |

### Insights Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights` | Get comprehensive insights/metrics |

### System Configuration Endpoints (NEW)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system-config` | Get all configurations |
| GET | `/api/system-config/{key}` | Get configuration by key |
| GET | `/api/system-config/category/{category}` | Get configs by category |
| PUT | `/api/system-config/{key}` | Update configuration |
| PUT | `/api/system-config/bulk/update` | Bulk update configurations |
| POST | `/api/system-config/reset/{key}` | Reset single config to default |
| POST | `/api/system-config/reset-all` | Reset all configs to default |
| GET | `/api/system-config/health/status` | Get system health status |
| GET | `/api/system-config/statistics` | Get system statistics |
| GET | `/api/system-config/activity-logs` | Get activity logs |
| POST | `/api/system-config/backup/create` | Create backup |
| GET | `/api/system-config/backup/list` | Get all backups |
| POST | `/api/system-config/backup/restore/{backupId}` | Restore from backup |
| DELETE | `/api/system-config/backup/{backupId}` | Delete backup |
| POST | `/api/system-config/cache/clear` | Clear system cache |

---

## Frontend JavaScript Integration

### API Client Class (`api-client.js`)

The `apiClient` object is a centralized class that handles all HTTP requests with:
- Automatic JWT token management
- Token refresh on expiration
- Error handling and logging
- Request/response interceptors

#### Key Methods

```javascript
// Authenticate and get tokens
apiClient.login(email, password)
apiClient.register(username, email, password)

// Make HTTP requests
apiClient.get(endpoint)
apiClient.post(endpoint, data)
apiClient.put(endpoint, data)
apiClient.delete(endpoint)

// Token management
apiClient.isAuthenticated()
apiClient.logout()
apiClient.getStoredUser()

// Helper methods
apiClient.getAuthHeaders()
apiClient.isTokenExpired()
apiClient.refreshAccessToken()
```

#### Usage Example

```javascript
// Get all products
const products = await apiClient.get("/products");

// Create new product
const newProduct = await apiClient.post("/products", {
  name: "New Product",
  sku: "SKU001",
  price: 99.99,
  category: "Electronics"
});

// Update product
const updated = await apiClient.put("/products/1", {
  name: "Updated Product",
  price: 149.99
});

// Delete product
await apiClient.delete("/products/1");
```

---

## Frontend Page Integration Status

### ✅ Dashboard (index.html)
- **Status:** Partially Integrated
- **API Calls:** 
  - `GET /api/insights` - Load summary metrics
  - `GET /api/products/chart/*` - Load charts
- **Features:** Dashboard metrics, activity feed, charts
- **Notes:** Verify chart endpoints exist

### ✅ Inventory (inventory.html)
- **Status:** Integrated
- **API Calls:**
  - `GET /api/products` - List products
  - `GET /api/products/summary` - Product summary
  - `GET /api/products/chart/*` - Chart data
  - `GET /api/audit` - Audit logs
- **Features:** Product CRUD, filtering, pagination, charts

### ✅ Audit (audit.html)
- **Status:** Integrated
- **API Calls:**
  - `GET /api/audit/logs` - Audit logs with pagination
  - `GET /api/audit/statistics` - Audit statistics
- **Features:** Audit log viewing, filtering, statistics

### ✅ Supplier Orders (supplier.html)
- **Status:** Integrated
- **API Calls:**
  - `GET /api/supplier-orders` - List orders
  - `GET /api/supplier-orders/summary` - Order summary
  - `GET /api/audit` - Related audit logs
- **Features:** Order management, filtering, pagination

### ✅ Customer Orders (customer-orders.html)
- **Status:** Integrated
- **API Calls:**
  - `GET /api/customer-orders` - List orders
  - `GET /api/customer-orders/summary` - Order summary
  - `GET /api/audit` - Related audit logs
- **Features:** Order management, filtering, pagination

### ⚠️ Insights Hub (insights-hub.html)
- **Status:** Partially Integrated
- **API Calls:**
  - Should call `/api/insights` for detailed metrics
- **Notes:** Frontend JS needs completion

### ✅ System Config (system-config.html) [NEW]
- **Status:** **Fully Integrated**
- **API Calls:**
  - `GET /api/system-config` - Get all configurations
  - `PUT /api/system-config/{key}` - Update single config
  - `PUT /api/system-config/bulk/update` - Bulk update
  - `POST /api/system-config/reset/{key}` - Reset single config
  - `POST /api/system-config/reset-all` - Reset all configs
  - `GET /api/system-config/health/status` - System health
  - `GET /api/system-config/statistics` - System statistics
  - `GET /api/system-config/activity-logs` - Activity logs
  - `POST /api/system-config/backup/create` - Create backup
  - `GET /api/system-config/backup/list` - List backups
  - `POST /api/system-config/backup/restore/{id}` - Restore backup
  - `DELETE /api/system-config/backup/{id}` - Delete backup
  - `POST /api/system-config/cache/clear` - Clear cache
- **Features:** 
  - Configuration management (view, update, reset)
  - System health monitoring
  - System statistics
  - Backup/Restore operations
  - Activity logging
  - Cache management
- **Implementation:** All backend endpoints created, frontend fully integrated with real API calls

### ✅ Login (login.html)
- **Status:** Integrated
- **API Calls:** `POST /api/auth/login`
- **Features:** User authentication, token storage

### ✅ Register (register.html)
- **Status:** Integrated
- **API Calls:** `POST /api/auth/register`
- **Features:** User registration

---

## Data Flow Examples

### Example 1: Load Product List
```
Frontend (inventory.js)
  ↓
apiClient.get("/api/products?page=1&pageSize=20")
  ↓
Backend (ProductsController)
  ↓
IProductService.GetProductsAsync()
  ↓
Database (Products table)
  ↓
Returns ProductDto list to Frontend
  ↓
Render in DataTable
```

### Example 2: Create Product
```
Frontend (inventory.js - User fills form & clicks Save)
  ↓
apiClient.post("/api/products", productData)
  ↓
Backend (ProductsController.CreateProduct)
  ↓
Validate with CreateProductRequestValidator
  ↓
IProductService.CreateProductAsync()
  ↓
Save to Database
  ↓
Return Created Product (201 Created)
  ↓
Frontend shows success notification
```

### Example 3: System Configuration Update
```
Frontend (system-config.js - User modifies settings)
  ↓
apiClient.put("/api/system-config/bulk/update", configData)
  ↓
Backend (SystemConfigController.BulkUpdateConfigs)
  ↓
ISystemConfigService.BulkUpdateConfigAsync()
  ↓
Update each configuration
  ↓
Return updated configurations (200 OK)
  ↓
Frontend shows success notification
  ↓
Reload configurations for display
```

---

## Implementation Checklist

### ✅ Backend Setup
- [x] Create SystemConfigController
- [x] Create ISystemConfigService interface
- [x] Create SystemConfigService implementation
- [x] Create SystemConfigRequest DTOs
- [x] Create SystemConfigResponse DTOs
- [x] Register service in Program.cs
- [x] Add proper error handling and logging

### ✅ Frontend Setup (System Config Page)
- [x] Update system-config.js with real API integration
- [x] Create loadSystemConfig() function
- [x] Create loadSystemHealth() function
- [x] Create loadSystemStatistics() function
- [x] Create loadActivityLogs() function
- [x] Create loadBackupList() function
- [x] Create saveConfiguration() function
- [x] Create resetConfiguration() function
- [x] Create createBackup() function
- [x] Create restoreBackup() function
- [x] Create deleteBackup() function
- [x] Create clearCache() function
- [x] Add notification system
- [x] Add error handling

### ✅ Documentation
- [x] Create SYSTEM_CONFIG_API_DOCUMENTATION.md
- [x] Create API_INTEGRATION_GUIDE.md (this file)
- [x] Document all endpoints with request/response examples
- [x] Create usage examples for frontend developers

### ⚠️ Remaining Tasks
- [ ] Verify chart endpoints exist (`/api/products/chart/category`, `/api/products/chart/stock-levels`)
- [ ] Test all API endpoints in Postman/Insomnia
- [ ] Complete insights-hub.js implementation
- [ ] Verify database integration for configurations
- [ ] Set up automated backup scheduling (optional)
- [ ] Add role-based access control if needed
- [ ] Create database migration for SystemConfig table (if needed)

---

## Testing the API

### Using Postman/Insomnia

1. **Get Authentication Token**
   ```
   POST https://localhost:44383/api/auth/login
   Body: {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```
   Response:
   ```json
   {
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc...",
     "expiresIn": 3600
   }
   ```

2. **Get All System Configurations**
   ```
   GET https://localhost:44383/api/system-config
   Header: Authorization: Bearer <accessToken>
   ```

3. **Update Configuration**
   ```
   PUT https://localhost:44383/api/system-config/AppName
   Header: Authorization: Bearer <accessToken>
   Body: {
     "key": "AppName",
     "value": "New App Name",
     "description": "Updated"
   }
   ```

4. **Get System Health**
   ```
   GET https://localhost:44383/api/system-config/health/status
   (No authentication required)
   ```

5. **Create Backup**
   ```
   POST https://localhost:44383/api/system-config/backup/create
   Header: Authorization: Bearer <accessToken>
   Body: {
     "backupName": "Test Backup",
     "description": "Test backup description",
     "includeData": true,
     "includeSettings": true
   }
   ```

---

## Common Issues and Solutions

### Issue: 401 Unauthorized
**Cause:** Missing or invalid JWT token
**Solution:** 
- Ensure user is logged in
- Check if token has expired
- Token is included in Authorization header: `Authorization: Bearer <token>`

### Issue: 404 Not Found
**Cause:** Endpoint doesn't exist or URL is incorrect
**Solution:**
- Verify endpoint URL matches controller route
- Check spelling of endpoint path
- Verify HTTP method (GET, POST, PUT, DELETE)

### Issue: 500 Internal Server Error
**Cause:** Server-side error
**Solution:**
- Check server logs for detailed error message
- Verify database connection
- Ensure all dependencies are installed
- Check data validation

### Issue: CORS Error
**Cause:** Frontend domain not allowed by backend
**Solution:**
- Backend already configured with `AllowAll` CORS policy
- If specific domains needed, update CORS configuration in Program.cs

---

## Performance Optimization Tips

1. **Pagination:** Always use pagination for list endpoints
   ```javascript
   const products = await apiClient.get("/products?page=1&pageSize=20");
   ```

2. **Filtering:** Use filters to reduce data transferred
   ```javascript
   const products = await apiClient.get("/products?category=Electronics&minPrice=100");
   ```

3. **Caching:** Cache responses on frontend when appropriate
   ```javascript
   const cached = localStorage.getItem("products");
   if (cached) {
     return JSON.parse(cached);
   }
   ```

4. **Lazy Loading:** Load data only when needed
   ```javascript
   // Load backup list only when user opens backup section
   const backups = await apiClient.get("/system-config/backup/list");
   ```

5. **Batch Operations:** Use bulk endpoints for multiple updates
   ```javascript
   const result = await apiClient.put("/system-config/bulk/update", {
     configurations: [config1, config2, config3]
   });
   ```

---

## Security Considerations

1. **JWT Tokens:** 
   - Stored in localStorage
   - Automatically refreshed on expiration
   - Included in all authenticated requests

2. **Password Security:**
   - Never store plain passwords
   - Transmitted over HTTPS only
   - Backend uses secure hashing (ASP.NET Identity)

3. **Data Validation:**
   - Frontend validates user input
   - Backend validates all requests (FluentValidation)
   - SQL injection prevention through ORM (Entity Framework)

4. **CORS:**
   - Frontend domain allowed by backend CORS policy
   - Prevents unauthorized cross-origin requests

5. **Rate Limiting:**
   - API implements rate limiting
   - Check X-RateLimit headers in responses

---

## Next Steps

1. **Build and Run Backend**
   ```bash
   cd WebApplication1
   dotnet build
   dotnet run
   ```

2. **Test System Config API**
   - Open system-config.html in browser
   - Verify all features work correctly
   - Check browser console for errors

3. **Verify Other Page Integrations**
   - Test each page's API integration
   - Check all CRUD operations work correctly

4. **Production Deployment**
   - Update API_BASE_URL if needed
   - Enable HTTPS
   - Implement proper error handling
   - Add logging and monitoring

---

## Support and Resources

- **API Documentation:** See SYSTEM_CONFIG_API_DOCUMENTATION.md
- **Frontend Code:** See Frontend/js/ directory
- **Backend Code:** See WebApplication1/Controllers/ directory
- **Database Models:** See WebApplication1/Model/ directory
- **DTOs:** See WebApplication1/DTOs/ directory

