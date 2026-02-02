const PROFILE_MODAL_IDS = {
  VIEW_PROFILE: "viewProfileModal",
  EDIT_PROFILE: "editProfileModal",
  CHANGE_PICTURE: "changePictureModal",
  CHANGE_PASSWORD: "changePasswordModal",
};

function viewUserProfile() {
  showProfile();
}
function editUserProfile() {
  accountSettings();
}
function updateProfilePicture() {
  editProfilePicture();
}
function updateUserPassword() {
  changePassword();
}
function showModalById(modalId) {
  openModal(modalId);
}
function hideModalById(modalId) {
  closeModal(modalId);
}
function hideAllModals() {
  closeAllModals();
}
function getCurrentUser() {
  return apiClient.getStoredUser();
}
function getUserDisplayName() {
  const user = apiClient.getStoredUser();
  return user?.username || user?.displayName || "User";
}
function getUserEmail() {
  const user = apiClient.getStoredUser();
  return user?.email || "user@example.com";
}
function isUserLoggedIn() {
  const user = apiClient.getStoredUser();
  return !!user && !!user.email;
}
function signOutUser() {
  logout();
}
function clearUserSession() {
  apiClient.logout();
}

function debugProfileSystem() {
  console.log("=== Profile System Debug ===");
  console.log("User Profile Component:", typeof initializeUserProfile);
  console.log("Profile Management:", typeof showProfile);
  console.log("Global Init:", typeof openModal);
  console.log("Current User:", apiClient.getStoredUser());
  console.log(
    "Modal Container:",
    document.getElementById("profileModalsContainer"),
  );
  console.log(
    "View Profile Modal:",
    document.getElementById("viewProfileModal"),
  );
  console.log(
    "Edit Profile Modal:",
    document.getElementById("editProfileModal"),
  );
  console.log(
    "Change Picture Modal:",
    document.getElementById("changePictureModal"),
  );
  console.log(
    "Change Password Modal:",
    document.getElementById("changePasswordModal"),
  );
}

function reloadProfileSystem() {
  closeAllModals();
  if (typeof initializeUserProfileComponent === "function") {
    initializeUserProfileComponent();
  }
  console.log("Profile system reloaded");
}
