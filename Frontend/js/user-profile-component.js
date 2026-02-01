/* ===============================
    USER PROFILE COMPONENT
    Handles user profile display and menu interactions
=============================== */

$(document).ready(function () {
  initializeUserProfile();
});

function initializeUserProfile() {
  // Get current user from API
  const currentUser = apiClient.getStoredUser();

  if (currentUser) {
    const displayName = currentUser.username || "User";
    const userEmail = currentUser.email || "user@example.com";

    // Update menu display
    $("#menuUserName").text(displayName);
    $("#menuUserEmail").text(userEmail);

    // Generate profile pic initial
    const initial = displayName.charAt(0).toUpperCase();
    const profilePicUrl = `https://ui-avatars.com/api/?name=${initial}&background=246dec&color=fff&size=32`;
    $("#profilePic").attr("src", profilePicUrl);
    $("#menuProfilePic").attr("src", profilePicUrl);
  }

  // User menu toggle
  $(".user-profile").on("click", function (e) {
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
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".user-profile").length) {
      $(".user-menu").removeClass("show");
      $(".user-profile").attr("aria-expanded", "false");
    }
  });
}

/* ===============================
    USER PROFILE MENU ACTIONS
=============================== */

/**
 * View Profile - Shows user's profile information
 */
function showProfile() {
  console.log("View Profile clicked");
  loadAndShowProfile();
}

/**
 * Load profile data and display in modal
 */
async function loadAndShowProfile() {
  try {
    console.log("Loading profile data...");
    const profileData = await apiClient.getUserProfile();
    if (profileData && profileData.data) {
      const user = profileData.data;
      console.log("Profile data loaded:", user);

      // Set profile picture
      const profilePic = user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.fullName?.charAt(0) || 'U'}&background=246dec&color=fff&size=120`;
      document.getElementById("profileModalPicture").src = profilePic;

      // Set profile information
      document.getElementById("profileFullName").textContent = user.fullName || "N/A";
      document.getElementById("profileEmail").textContent = user.email || "N/A";
      document.getElementById("profilePhone").textContent = user.phoneNumber || "-";
      document.getElementById("profileDateOfBirth").textContent = user.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString()
        : "-";
      document.getElementById("profileCreatedAt").textContent = new Date(user.createdAt).toLocaleDateString();
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
  console.log("Change Picture clicked");
  resetPictureModal();
  openModal("changePictureModal");
}

/**
 * Change Password - Opens password change modal
 */
function changePassword() {
  console.log("Change Password clicked");
  resetPasswordModal();
  openModal("changePasswordModal");
}

/**
 * Account Settings - Opens account settings
 */
function accountSettings() {
  console.log("Account Settings clicked");
  showEditProfileModal();
}

/**
 * Help Support - Shows help information
 */
function helpSupport() {
  console.log("Help & Support clicked");
  alert("Help & Support: Contact support@example.com\n\nCommon Issues:\n1. Forgot Password - Use the login page reset option\n2. Profile Picture - JPG or PNG up to 5MB\n3. Password Requirements - Min 6 characters");
}

/**
 * Logout - Clear authentication and redirect
 */
function logout() {
  console.log("Logout clicked");
  // Call the API client logout method
  apiClient.logout();
}
