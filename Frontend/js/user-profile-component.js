/* ===============================
    USER PROFILE COMPONENT
    Handles user profile display and menu interactions
 =============================== */

// Initialize with fallback for jQuery availability
function initializeUserProfileComponent() {
  if (typeof $ !== "undefined") {
    // jQuery is available
    initializeUserProfile();
  } else {
    // Fallback to vanilla JavaScript
    initializeUserProfileVanilla();
  }
}

// jQuery-based initialization
function initializeUserProfile() {
  // Get current user from API
  const currentUser = apiClient.getStoredUser();

  if (currentUser) {
    const displayName =
      currentUser.username || currentUser.displayName || "User";
    const userEmail = currentUser.email || "user@example.com";

    // Update menu display - with null checks
    const nameEl = document.getElementById("menuUserName");
    const emailEl = document.getElementById("menuUserEmail");
    if (nameEl) {
      nameEl.textContent = displayName;
    }
    if (emailEl) {
      emailEl.textContent = userEmail;
    }

    // Generate profile pic initial
    const initial = displayName.charAt(0).toUpperCase();
    const profilePicUrl = `https://ui-avatars.com/api/?name=${initial}&background=246dec&color=fff&size=32`;

    const profilePicEl = document.getElementById("profilePic");
    const menuProfilePicEl = document.getElementById("menuProfilePic");

    if (profilePicEl) {
      profilePicEl.src = profilePicUrl;
      profilePicEl.style.display = "block";
      profilePicEl.alt = `${displayName} Profile`;
    }
    if (menuProfilePicEl) {
      menuProfilePicEl.src = profilePicUrl;
      menuProfilePicEl.alt = `${displayName} Profile`;
    }
  }

  // User menu toggle with jQuery
  if (typeof $ !== "undefined") {
    $(".user-profile")
      .off("click")
      .on("click", function (e) {
        e.stopPropagation();
        const menu = $(this).find(".user-menu");
        const isExpanded = $(this).attr("aria-expanded") === "true";
        if (isExpanded) {
          menu.removeClass("show");
          $(this).attr("aria-expanded", "false");
        } else {
          menu.addClass("show");
          $(this).attr("aria-expanded", "true");
        }
      });

    // Close menu when clicking outside
    $(document)
      .off("click.userprofile")
      .on("click.userprofile", function (e) {
        if (!$(e.target).closest(".user-profile").length) {
          $(".user-menu").removeClass("show");
          $(".user-profile").attr("aria-expanded", "false");
        }
      });
  }
}

// Vanilla JavaScript fallback initialization
function initializeUserProfileVanilla() {
  // Get current user from API
  const currentUser = apiClient.getStoredUser();

  if (currentUser) {
    const displayName =
      currentUser.username || currentUser.displayName || "User";
    const userEmail = currentUser.email || "user@example.com";

    // Update menu display
    const nameEl = document.getElementById("menuUserName");
    const emailEl = document.getElementById("menuUserEmail");
    if (nameEl) {
      nameEl.textContent = displayName;
    }
    if (emailEl) {
      emailEl.textContent = userEmail;
    }

    // Generate profile pic initial
    const initial = displayName.charAt(0).toUpperCase();
    const profilePicUrl = `https://ui-avatars.com/api/?name=${initial}&background=246dec&color=fff&size=32`;

    const profilePicEl = document.getElementById("profilePic");
    const menuProfilePicEl = document.getElementById("menuProfilePic");

    if (profilePicEl) {
      profilePicEl.src = profilePicUrl;
      profilePicEl.style.display = "block";
      profilePicEl.alt = `${displayName} Profile`;
    }
    if (menuProfilePicEl) {
      menuProfilePicEl.src = profilePicUrl;
      menuProfilePicEl.alt = `${displayName} Profile`;
    }
  }

  // User menu toggle with vanilla JS
  const profileElements = document.querySelectorAll(".user-profile");

  profileElements.forEach((profileEl) => {
    // Remove old listeners by cloning
    const newProfileEl = profileEl.cloneNode(true);
    profileEl.parentNode.replaceChild(newProfileEl, profileEl);

    newProfileEl.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      const menu = this.querySelector(".user-menu");
      if (menu) {
        const isExpanded = this.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
          menu.classList.remove("show");
          this.setAttribute("aria-expanded", "false");
        } else {
          menu.classList.add("show");
          this.setAttribute("aria-expanded", "true");
        }
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    const profileEl = e.target.closest(".user-profile");
    if (!profileEl) {
      document.querySelectorAll(".user-menu").forEach((menu) => {
        menu.classList.remove("show");
      });
      document.querySelectorAll(".user-profile").forEach((el) => {
        el.setAttribute("aria-expanded", "false");
      });
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeUserProfileComponent);
} else {
  initializeUserProfileComponent();
}

// Re-initialize on jQuery ready if it loads later
if (typeof $ !== "undefined") {
  $(document).ready(function () {
    initializeUserProfileComponent();
  });
}

/* ===============================
    USER PROFILE MENU ACTIONS
 =============================== */

/**
 * View Profile - Shows user's profile information
 */
function showProfile() {
  loadAndShowProfile();
}

/**
 * Load profile data and display in modal
 */
async function loadAndShowProfile() {
  try {
    const profileData = await apiClient.getUserProfile();
    if (profileData && profileData.data) {
      const user = profileData.data;

      // Set profile picture
      const profilePic =
        user.profilePictureUrl ||
        `https://ui-avatars.com/api/?name=${user.fullName?.charAt(0) || "U"}&background=246dec&color=fff&size=120`;
      document.getElementById("profileModalPicture").src = profilePic;

      // Set profile information
      document.getElementById("profileFullName").textContent =
        user.fullName || "N/A";
      document.getElementById("profileEmail").textContent = user.email || "N/A";
      document.getElementById("profilePhone").textContent =
        user.phoneNumber || "-";
      document.getElementById("profileDateOfBirth").textContent =
        user.dateOfBirth
          ? new Date(user.dateOfBirth).toLocaleDateString()
          : "-";
      document.getElementById("profileCreatedAt").textContent = new Date(
        user.createdAt,
      ).toLocaleDateString();
      document.getElementById("profileUpdatedAt").textContent = user.updatedAt
        ? new Date(user.updatedAt).toLocaleDateString()
        : "Never";

      openModal("viewProfileModal");
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    alert("Error loading profile. Please try again.");
  }
}

/**
 * Edit Profile Picture - Opens file upload modal
 */
function editProfilePicture() {
  resetPictureModal();
  openModal("changePictureModal");
}

/**
 * Change Password - Opens password change modal
 */
function changePassword() {
  resetPasswordModal();
  openModal("changePasswordModal");
}

/**
 * Account Settings - Opens account settings
 */
function accountSettings() {
  showEditProfileModal();
}

/**
 * Help Support - Shows help information
 */
function helpSupport() {
  alert(
    "Help & Support: Contact support@example.com\n\nCommon Issues:\n1. Forgot Password - Use the login page reset option\n2. Profile Picture - JPG or PNG up to 5MB\n3. Password Requirements - Min 6 characters",
  );
}

/**
 * Logout - Clear authentication and redirect
 */
function logout() {
  // Call the API client logout method
  apiClient.logout();
}
