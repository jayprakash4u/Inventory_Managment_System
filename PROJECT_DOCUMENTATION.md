# Inventory Management System - Project Documentation

## Overview

This is a full-stack Inventory Management System with a modern frontend and ASP.NET Core backend. The system provides comprehensive inventory management, order processing, analytics, and system configuration capabilities.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Frontend Documentation](#frontend-documentation)
3. [Backend Documentation](#backend-documentation)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Configuration](#configuration)
7. [Installation & Setup](#installation--setup)

---

## Project Structure

```
Productfronttend/
├── Frontend/                      # Frontend Application
│   ├── Html/                      # HTML Pages
│   │   ├── Dashboard.html         # Main dashboard with analytics
│   │   ├── inventory.html         # Product stock management
│   │   ├── audit.html             # Audit trail logs
│   │   ├── supplier.html          # Supplier orders management
│   │   ├── customer-orders.html   # Customer orders processing
│   │   ├── insights-hub.html      # Analytics and reports
│   │   ├── system-config.html     # System settings
│   │   ├── login.html             # Authentication page
│   │   └── register.html          # User registration
│   ├── Css/                       # Stylesheets
│   │   ├── style.css              # Main global styles
│   │   ├── dashboard-redesign.css # Dashboard specific styles
│   │   ├── inventory.css          # Inventory page styles
│   │   ├── table.css              # Table styling
│   │   ├── user-profile.css       # User profile styles
│   │   └── auth.css               # Authentication page styles
│   ├── js/                        # JavaScript Files
│   │   ├── api-client.js          # Centralized API client
│   │   ├── dashboard.js           # Dashboard functionality
│   │   ├── inventory.js           # Inventory management
│   │   ├── audit.js               # Audit trail logic
│   │   ├── supplier.js            # Supplier orders
│   │   ├── customer-orders.js     # Customer orders
│   │   ├── insights.js            # Analytics charts
│   │   ├── profile.js             # User profile
│   │   ├── profile-management.js  # Profile management
│   │   ├── profile-api.js         # Profile API integration
│   │   ├── system-config.js       # System configuration
│   │   ├── toast-notification.js  # Toast notifications
│   │   ├── form-validator.js      # Form validation
│   │   ├── global-profile-init.js # Global profile initialization
│   │   ├── user-profile-component.js # User profile component
│   │   └── script.js              # General scripts
│   └── index.html                 # Entry point
│
└── WebApplication1/               # Backend Application (ASP.NET Core)
    └── WebApplication1/
        ├── Controllers/           # API Controllers
        │   ├── AuthController.cs      # Authentication endpoints
        │   ├── SystemSettingsController.cs # System settings
        │   └── [Other controllers]
        ├── DTOs/                  # Data Transfer Objects
        │   ├── Requests/          # Request DTOs
        │   │   └── SystemSettingsRequest.cs
        │   └── Responses/         # Response DTOs
        │       └── SystemSettingsResponse.cs
        ├── CrossCutting/         # Cross-cutting concerns
        │   └── Filters/
        │       └── GlobalExceptionFilter.cs
        ├── Program.cs             # Application entry point
        ├── appsettings.json       # Application settings
        └── WebApplication1.csproj # Project file
```

---

## Frontend Documentation

### Technologies Used

#### Core Technologies

- **HTML5** - Semantic markup language for structure
- **CSS3** - Styling with modern features (Flexbox, Grid, Variables)
- **JavaScript (ES6+)** - Modern JavaScript with async/await, classes

#### External Libraries & Frameworks

| Library                   | Version | Purpose                                           |
| ------------------------- | ------- | ------------------------------------------------- |
| **ApexCharts.js**         | Latest  | Interactive charts and analytics visualizations   |
| **Google Fonts**          | -       | Montserrat and Roboto fonts                       |
| **Google Material Icons** | -       | Material Design icon set                          |
| **jQuery**                | 3.x     | DOM manipulation (used in user-profile-component) |

#### Key Features

##### 1. Dashboard (`Dashboard.html`)

- Key Performance Indicators (KPIs) display
- Revenue & Orders Trend chart (ApexCharts Area Chart)
- Top Products bar chart
- Sales by Category pie chart
- Inventory Health donut chart
- Monthly Performance radar chart
- Quick Actions panel
- Recent Activity timeline
- Time range and category filters

##### 2. Authentication System

- Login page with email/password
- Registration page with form validation
- JWT token-based authentication
- Session management with localStorage
- Protected routes (redirect to login if not authenticated)

##### 3. Inventory Management

- Product listing with search and filter
- Add/Edit/Delete products
- Stock level tracking
- Low stock and out of stock alerts
- Category-based organization

##### 4. Order Management

- Purchase Orders (Supplier orders)
- Sales Orders (Customer orders)
- Order status tracking
- Order history and audit trail

##### 5. Analytics & Insights

- Interactive charts (bar, line, pie, donut, radar, area)
- Time range filtering (7d, 30d, 90d, 1y)
- Category filtering
- Export functionality
- Trend analysis

##### 6. System Configuration

- Global settings management
- User preferences
- System configuration API integration

### CSS Architecture

#### Style Files

- **style.css** - Main styles, variables, reset, layout
- **dashboard-redesign.css** - Dashboard-specific styles, metrics, action cards
- **inventory.css** - Inventory page specific styles
- **table.css** - Reusable table styles
- **user-profile.css** - User profile and menu styles
- **auth.css** - Login/register page styles

#### Key CSS Features

- CSS Custom Properties (variables) for theming
- Flexbox and Grid layouts
- Responsive design with media queries
- Hover effects and transitions
- Material Design inspired components
- Dark mode support (via CSS variables)

### JavaScript Architecture

#### Core Modules

##### 1. API Client (`api-client.js`)

- Centralized API communication
- Authentication token management
- Request/response interceptors
- Error handling

```javascript
// Key methods
apiClient.get(endpoint);
apiClient.post(endpoint, data);
apiClient.put(endpoint, data);
apiClient.delete(endpoint);
apiClient.isAuthenticated();
apiClient.getUserProfile();
```

##### 2. Toast Notifications (`toast-notification.js`)

- Success, error, warning, info notifications
- Animated display
- Auto-dismiss

##### 3. Form Validator (`form-validator.js`)

- Email validation
- Password strength checks
- Required field validation
- Custom validation rules

##### 4. Charts & Analytics

- ApexCharts integration
- Dynamic chart rendering
- Chart update mechanisms
- Export functionality

### API Integration

#### Base URL

```
https://localhost:44383/api
```

#### Authentication Header

```javascript
Authorization: Bearer {accessToken}
```

#### Common Endpoints Used

- `GET /api/insights` - Dashboard analytics data
- `GET /api/audit/recent` - Recent audit logs
- `GET /api/products` - Product listing
- `POST /api/auth/login` - User authentication

---

## Backend Documentation

### Technologies Used

#### Core Framework

- **ASP.NET Core 10.0** - Modern, cross-platform .NET framework
- **C#** - Programming language

#### NuGet Packages

| Package                                           | Purpose                       |
| ------------------------------------------------- | ----------------------------- |
| **Microsoft.AspNetCore.Authentication.JwtBearer** | JWT authentication            |
| **Microsoft.EntityFrameworkCore**                 | ORM for database operations   |
| **Microsoft.EntityFrameworkCore.SqlServer**       | SQL Server database provider  |
| **Microsoft.AspNetCore.Mvc.Versioning**           | API versioning                |
| **Microsoft.AspNetCore.OpenApi**                  | OpenAPI/Swagger support       |
| **Swashbuckle.AspNetCore**                        | Swagger/OpenAPI documentation |
| **AutoMapper**                                    | Object-to-object mapping      |
| **FluentValidation.AspNetCore**                   | Request validation            |
| **AspNetCoreRateLimit**                           | Rate limiting                 |
| **BCrypt.Net-Next**                               | Password hashing              |
| **Newtonsoft.Json**                               | JSON serialization            |

### Project Structure

```
WebApplication1/
├── Controllers/
│   ├── AuthController.cs
│   ├── SystemSettingsController.cs
│   └── [Other controllers]
├── DTOs/
│   ├── Requests/
│   │   └── SystemSettingsRequest.cs
│   └── Responses/
│       └── SystemSettingsResponse.cs
├── CrossCutting/
│   └── Filters/
│       └── GlobalExceptionFilter.cs
├── Program.cs
├── appsettings.json
└── WebApplication1.csproj
```

### Key Components

#### 1. Controllers

- **AuthController** - Handles authentication (login, register, logout)
- **SystemSettingsController** - System configuration management
- Additional controllers for Products, Orders, Audit, etc.

#### 2. DTOs (Data Transfer Objects)

- **Request DTOs** - Input validation models
- **Response DTOs** - API response models

#### 3. Cross-Cutting Concerns

- **GlobalExceptionFilter** - Centralized exception handling
- Authentication filters
- Validation filters

### Configuration

#### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=InventoryDB;Trusted_Connection=True;"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "InventorySystem",
    "Audience": "InventorySystemUsers"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/login`    | User login        |
| POST   | `/api/auth/register` | User registration |
| POST   | `/api/auth/logout`   | User logout       |
| GET    | `/api/auth/profile`  | Get user profile  |

### Insights/Analytics

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| GET    | `/api/insights`         | Get dashboard analytics |
| GET    | `/api/insights/summary` | Get summary metrics     |
| GET    | `/api/insights/charts`  | Get chart data          |

### Inventory

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| GET    | `/api/products`      | Get all products  |
| GET    | `/api/products/{id}` | Get product by ID |
| POST   | `/api/products`      | Create product    |
| PUT    | `/api/products/{id}` | Update product    |
| DELETE | `/api/products/{id}` | Delete product    |

### Orders

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| GET    | `/api/orders/purchase` | Get purchase orders |
| GET    | `/api/orders/sales`    | Get sales orders    |
| POST   | `/api/orders`          | Create order        |

### Audit

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| GET    | `/api/audit`        | Get all audit logs    |
| GET    | `/api/audit/recent` | Get recent audit logs |
| GET    | `/api/audit/{id}`   | Get audit log by ID   |

### System Settings

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| GET    | `/api/systemsettings`       | Get all settings   |
| PUT    | `/api/systemsettings`       | Update settings    |
| GET    | `/api/systemsettings/{key}` | Get setting by key |

---

## Database Schema

### Core Tables

#### Users Table

- UserId (PK)
- Email
- PasswordHash
- FullName
- ProfilePictureUrl
- CreatedAt
- UpdatedAt

#### Products Table

- ProductId (PK)
- Name
- SKU
- Description
- Price
- StockQuantity
- LowStockThreshold
- CategoryId (FK)
- CreatedAt
- UpdatedAt

#### Categories Table

- CategoryId (PK)
- Name
- Description

#### Orders Table

- OrderId (PK)
- OrderNumber
- OrderType (Purchase/Sales)
- Status
- TotalAmount
- UserId (FK)
- CreatedAt
- UpdatedAt

#### OrderItems Table

- OrderItemId (PK)
- OrderId (FK)
- ProductId (FK)
- Quantity
- UnitPrice

#### AuditLogs Table

- AuditId (PK)
- UserId (FK)
- Action
- Entity
- EntityId
- Details
- Timestamp
- IPAddress

---

## Configuration

### Environment Variables

```bash
# Backend
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection=your-connection-string
Jwt__SecretKey=your-jwt-secret
Jwt__Issuer=your-issuer
Jwt__Audience=your-audience

# Frontend (in code)
API_BASE_URL=https://localhost:44383/api
```

### CORS Configuration

```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000")
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});
```

---

## Installation & Setup

### Prerequisites

- .NET 10.0 SDK or later
- Node.js 18+ and npm
- SQL Server (or SQL Server Express)

### Backend Setup

1. Navigate to backend directory:

```bash
cd WebApplication1/WebApplication1
```

2. Restore dependencies:

```bash
dotnet restore
```

3. Apply migrations:

```bash
dotnet ef database update
```

4. Run the application:

```bash
dotnet run
```

The API will be available at `https://localhost:44383`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd Frontend
```

2. Serve the files using a local server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js http-server
npx http-server -p 3000

# Using VS Code Live Server
# Right-click index.html and select "Open with Live Server"
```

The frontend will be available at `http://localhost:3000`

### Development Mode

1. Start the backend API
2. Start the frontend development server
3. Open browser to frontend URL
4. Login with credentials
5. Access the dashboard

---

## Security Features

- JWT-based authentication
- Password hashing with BCrypt
- Role-based authorization (if implemented)
- API rate limiting
- Input validation
- CORS configuration
- Global exception handling
- Secure HTTP headers

---

## Performance Considerations

- Server-side pagination for large datasets
- Client-side caching of API responses
- Efficient database queries
- Chart data optimization
- Lazy loading of components

---

## Future Enhancements

- Real-time notifications with WebSockets
- Advanced search and filtering
- Export to PDF/Excel
- Multi-language support
- Dark mode toggle
- Mobile-responsive improvements
- Advanced reporting features
- Integration with external systems

---

## License

This project is proprietary software.

---

## Support

For issues and questions, contact the development team.
