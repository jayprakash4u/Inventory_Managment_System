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

function showProfile() {
  console.log("View Profile clicked");
  // Implement profile view functionality
}

function editProfilePicture() {
  console.log("Change Picture clicked");
  // Implement profile picture upload functionality
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = function (e) {
    const file = e.target.files[0];
    // Handle file upload
    console.log("File selected:", file.name);
  };
  input.click();
}

function changePassword() {
  console.log("Change Password clicked");
  // Implement password change functionality
  const newPassword = prompt("Enter new password:");
  if (newPassword) {
    console.log("Password changed");
  }
}

function accountSettings() {
  console.log("Account Settings clicked");
  // Implement account settings functionality
}

function helpSupport() {
  console.log("Help & Support clicked");
  // Implement help support functionality
  alert("Help & Support: Contact support@example.com");
}

function logout() {
  console.log("Logout clicked");
  // Clear user data and redirect to login
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
