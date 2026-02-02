/**
 * Centralized API Client - Handles authentication, token refresh, error handling, and caching
 */
class ApiClient {
  constructor() {
    this.baseUrl = "https://localhost:44383/api";
    this.authUrl = "https://localhost:44383/api/auth";
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
  }

  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clearCache() {
    this.cache.clear();
  }

  getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

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
        this.handleAuthError();
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      this.handleAuthError();
      throw error;
    }
  }

  handleAuthError() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    this.clearCache();

    if (typeof ToastNotification !== "undefined") {
      ToastNotification.error("Your session has expired. Please log in again.");
    }

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }

  parseErrorResponse(response, text) {
    try {
      if (text && (text.startsWith("{") || text.startsWith("["))) {
        const json = JSON.parse(text);
        return this.parseProblemDetails(json);
      }
      if (text && text.trim().length > 0) {
        return text.trim();
      }
      return `HTTP ${response.status}: ${response.statusText}`;
    } catch (error) {
      return `HTTP ${response.status}: ${response.statusText}`;
    }
  }

  parseProblemDetails(problem) {
    try {
      if (problem.errors) {
        const errorMessages = Object.values(problem.errors).flat();
        return errorMessages.join(", ");
      }

      if (problem.detail) {
        return problem.detail;
      }

      if (problem.message) {
        return problem.message;
      }
      if (problem.error && problem.message) {
        return problem.message;
      }

      if (problem.title) {
        return problem.title;
      }

      return "An unexpected error occurred";
    } catch (error) {
      console.warn("Error parsing problem details:", error);
      return "An unexpected error occurred";
    }
  }

  async makeRequest(url, options = {}) {
    const maxRetries = 1;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const token = localStorage.getItem("accessToken");
        if (token && this.isTokenExpired(token)) {
          await this.refreshAccessToken();
        }

        const headers = { ...this.getAuthHeaders(), ...options.headers };
        const requestOptions = { ...options, headers };

        const response = await fetch(url, requestOptions);

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || "60";
          throw new Error(
            `Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`,
          );
        }

        if (response.status === 401) {
          if (attempt === 0) {
            await this.refreshAccessToken();
            attempt++;
            continue;
          } else {
            this.handleAuthError();
            throw new Error("Authentication failed. Please log in again.");
          }
        }

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            const errorData = await response.json();
            errorMessage = this.parseProblemDetails(errorData);
          } catch (parseError) {
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
      }
    }
  }

  async get(endpoint, useCache = true) {
    const url = endpoint.startsWith("/")
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;

    if (useCache) {
      const cacheKey = `GET:${url}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return {
          ok: true,
          json: () => Promise.resolve(cached),
          clone: () => this,
        };
      }
    }

    const response = await this.makeRequest(url);

    if (useCache && response.ok) {
      try {
        const data = await response.clone().json();
        const cacheKey = `GET:${url}`;
        this.setCache(cacheKey, data);
      } catch (e) {
        // Ignore cache errors
      }
    }

    return response;
  }

  async post(endpoint, data) {
    const url = endpoint.startsWith("/")
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    return this.makeRequest(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    const url = endpoint.startsWith("/")
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    return this.makeRequest(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    const url = endpoint.startsWith("/")
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;
    return this.makeRequest(url, {
      method: "DELETE",
    });
  }

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
      let errorMessage = "Login failed. Please check your credentials.";
      try {
        const text = await response.text();
        errorMessage = this.parseErrorResponse(response, text);
      } catch (error) {
        errorMessage = `Login failed (HTTP ${response.status})`;
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

  isAuthenticated() {
    const token = localStorage.getItem("accessToken");
    return token && !this.isTokenExpired(token);
  }

  async logout() {
    try {
      const token = localStorage.getItem("accessToken");

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
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      this.clearCache();
      window.location.href = "login.html";
    }
  }

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

const apiClient = new ApiClient();
