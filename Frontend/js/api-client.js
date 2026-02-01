/**
 * Centralized API Client for Product Management System
 * Handles authentication, token refresh, error handling, and API versioning
 */

class ApiClient {
  constructor() {
    this.baseUrl = "https://localhost:44383/api"; // Base API URL
    this.authUrl = "https://localhost:44383/api/auth"; // Auth endpoints
  }

  /**
   * Get authorization headers with current access token
   */
  getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  /**
   * Check if JWT token is expired
   */
  isTokenExpired(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.warn("Error parsing JWT token:", error);
      return true;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${this.authUrl}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return data.accessToken;
      } else {
        // Refresh failed, redirect to login
        this.handleAuthError();
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      this.handleAuthError();
      throw error;
    }
  }

  /**
   * Handle authentication errors by clearing tokens and redirecting to login
   */
  handleAuthError() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    window.location.href = "login.html";
  }

  /**
   * Parse RFC 7807 Problem Details error response
   */
  parseProblemDetails(response) {
    try {
      const problem = response;

      // Handle validation errors
      if (problem.errors) {
        const errorMessages = Object.values(problem.errors).flat();
        return errorMessages.join(", ");
      }

      // Handle business errors
      if (problem.detail) {
        return problem.detail;
      }

      // Handle generic errors
      if (problem.title) {
        return problem.title;
      }

      return "An unexpected error occurred";
    } catch (error) {
      console.warn("Error parsing problem details:", error);
      return "An unexpected error occurred";
    }
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  async makeRequest(url, options = {}) {
    const maxRetries = 1; // Only retry once for token refresh
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        // Check if token is expired before making request
        const token = localStorage.getItem("accessToken");
        if (token && this.isTokenExpired(token)) {
          console.log("Access token expired, attempting refresh...");
          await this.refreshAccessToken();
        }

        // Merge headers
        const headers = { ...this.getAuthHeaders(), ...options.headers };
        const requestOptions = { ...options, headers };

        const response = await fetch(url, requestOptions);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || "60";
          throw new Error(
            `Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`,
          );
        }

        // Handle authentication errors
        if (response.status === 401) {
          if (attempt === 0) {
            // Try refreshing token once
            console.log("Received 401, attempting token refresh...");
            await this.refreshAccessToken();
            attempt++;
            continue; // Retry with new token
          } else {
            // Token refresh failed or already attempted
            this.handleAuthError();
            throw new Error("Authentication failed. Please log in again.");
          }
        }

        // Handle other errors
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            const errorData = await response.json();
            errorMessage = this.parseProblemDetails(errorData);
          } catch (parseError) {
            console.warn("Could not parse error response:", parseError);
            // Try to get text error
            try {
              const textError = await response.text();
              if (textError) {
                errorMessage = textError;
              }
            } catch (textError) {
              console.warn("Could not get error text:", textError);
            }
          }

          throw new Error(errorMessage);
        }

        return response;
      } catch (error) {
        if (
          attempt >= maxRetries ||
          error.message.includes("Authentication failed")
        ) {
          throw error;
        }
        attempt++;
        console.log(
          `Request failed, attempt ${attempt}/${maxRetries + 1}:`,
          error.message,
        );
      }
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    const url = endpoint.startsWith("/")
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    return this.makeRequest(url);
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    const url = endpoint.startsWith("/")
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    return this.makeRequest(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    const url = endpoint.startsWith("/")
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    return this.makeRequest(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    const url = endpoint.startsWith("/")
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    return this.makeRequest(url, {
      method: "DELETE",
    });
  }

  /**
   * Authentication methods
   */
  async login(email, password) {
    const response = await fetch(`${this.authUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data;
    } else {
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        errorMessage = this.parseProblemDetails(errorData);
      } catch (error) {
        console.warn("Could not parse login error:", error);
      }
      throw new Error(errorMessage);
    }
  }

  async register(userData) {
    const response = await fetch(`${this.authUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      let errorMessage = "Registration failed";
      try {
        const errorData = await response.json();
        errorMessage = this.parseProblemDetails(errorData);
      } catch (error) {
        console.warn("Could not parse registration error:", error);
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Get stored user data from localStorage
   */
  getStoredUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.warn("Error parsing stored user data:", error);
        return null;
      }
    }

    // Fallback to username if user object doesn't exist
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    if (username || email) {
      return {
        username: username || "User",
        email: email || "user@example.com",
      };
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem("accessToken");
    return token && !this.isTokenExpired(token);
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const token = localStorage.getItem("accessToken");

      // Call backend logout API to revoke tokens
      if (token) {
        await fetch(`${this.authUrl}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error (non-critical):", error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      window.location.href = "login.html";
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile() {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/user-profile/me`,
        {
          method: "GET",
        },
      );
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(profileData) {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/user-profile/update`,
        {
          method: "PUT",
          body: JSON.stringify(profileData),
        },
      );
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile picture
   */
  async updateProfilePicture(pictureUrl) {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/user-profile/profile-picture`,
        {
          method: "PUT",
          body: JSON.stringify({ pictureUrl }),
        },
      );
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/user-profile/change-password`,
        {
          method: "POST",
          body: JSON.stringify({
            oldPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }
}

// Create global instance
const apiClient = new ApiClient();
