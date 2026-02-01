# Logout Button Integration Analysis

## Summary

The logout button is **PARTIALLY INTEGRATED** with the frontend, but **NO LOGOUT API ENDPOINT EXISTS in the Backend (AuthController)**.

---

## Frontend Implementation ✅

### 1. Logout Button in HTML

**Locations:** Multiple pages have the logout button

- `system-config.html` (Line 86)
- `audit.html` (Line 159)
- `supplier.html` (Line 90)
- `inventory.html` (Line 91)
- `insights-hub.html` (Line 86)
- `Dashboard.html` (Line 89)

**HTML Code:**

```html
<a href="#" role="menuitem" onclick="logout()">
  <span class="material-icons-outlined">logout</span>
  Logout
</a>
```

### 2. Logout Function Implementation

**File:** `Frontend/js/dashboard.js` (Line 797)

```javascript
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    apiClient.logout();
  }
}
```

### 3. ApiClient Logout Method

**File:** `Frontend/js/api-client.js` (Line 325)

```javascript
/**
 * Logout user
 */
logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  window.location.href = "login.html";
}
```

**Current Behavior:**

- ✅ Clears local storage tokens (accessToken, refreshToken, username)
- ✅ Redirects user to login page
- ✅ ❌ **DOES NOT call any backend API endpoint**

---

## Backend Implementation ❌

### AuthController Analysis

**File:** `WebApplication1/Controllers/AuthController.cs`

**Available Endpoints:**

1. **POST** `/api/auth/register` - Register new user
2. **POST** `/api/auth/login` - Login user
3. **POST** `/api/auth/refresh` - Refresh access token

**Missing Endpoint:**

- ❌ **NO LOGOUT ENDPOINT** - There is no logout method in the AuthController

---

## Issue Identified

The logout flow only clears the frontend tokens locally but doesn't:

1. ❌ Revoke tokens on the server
2. ❌ Invalidate the refresh token in the database
3. ❌ Log the logout action in the audit system
4. ❌ Clean up any server-side session data

---

## Recommendation: Create Logout API

### Create Logout Endpoint

Add the following endpoint to `AuthController.cs`:

```csharp
[Authorize]
[HttpPost("logout")]
public async Task<IActionResult> Logout()
{
    var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

    if (string.IsNullOrEmpty(userEmail))
    {
        return BadRequest("User not found in token");
    }

    // Revoke all refresh tokens for the user
    await _refreshTokenService.RevokeTokensForUserAsync(userEmail);

    _logger.LogInformation("User logged out successfully: {Email}", userEmail);

    return Ok(new { message = "Logout successful" });
}
```

### Update Frontend ApiClient

Modify the `logout()` method in `api-client.js`:

```javascript
async logout() {
    try {
        // Call backend logout API
        await fetch(`${this.authUrl}/logout`, {
            method: "POST",
            headers: this.getAuthHeaders(),
        });
    } catch (error) {
        console.error("Logout API error:", error);
    } finally {
        // Clear local tokens regardless of API success
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        window.location.href = "login.html";
    }
}
```

---

## Implementation Status

| Component               | Status                   | Location               |
| ----------------------- | ------------------------ | ---------------------- |
| Logout Button           | ✅ Implemented           | Multiple HTML pages    |
| Logout Function         | ✅ Implemented           | `dashboard.js`         |
| ApiClient Logout        | ✅ Implemented (Partial) | `api-client.js`        |
| Backend Logout Endpoint | ❌ Missing               | `AuthController.cs`    |
| Token Revocation        | ❌ Missing               | Database/Service layer |
| Audit Logging           | ❌ Missing               | Audit system           |

---

## Next Steps

1. Create the `/api/auth/logout` endpoint in AuthController
2. Update the frontend `apiClient.logout()` to call the backend API
3. Add audit logging for logout events
4. Test the complete logout flow
