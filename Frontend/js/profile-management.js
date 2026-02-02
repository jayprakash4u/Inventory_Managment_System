function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
}
function closeAllModals() {
  document
    .querySelectorAll(".modal.show")
    .forEach((modal) => modal.classList.remove("show"));
  document.body.style.overflow = "auto";
}

function initializeModalHandlers() {
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      closeModal(this.getAttribute("data-modal"));
    });
  });
  document.querySelectorAll("[data-modal]").forEach((btn) => {
    if (btn.tagName === "BUTTON" && btn.textContent.trim() !== "") {
      btn.addEventListener("click", function () {
        closeModal(this.getAttribute("data-modal"));
      });
    }
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) closeAllModals();
    });
  });
}

async function showProfile() {
  console.log("Loading profile...");
  try {
    openModal("viewProfileModal");
    const profileData = await apiClient.getUserProfile();
    if (profileData && profileData.data) {
      const user = profileData.data;
      const profilePic =
        user.profilePictureUrl ||
        `https://ui-avatars.com/api/?name=${user.fullName?.charAt(0) || "U"}&background=246dec&color=fff&size=120`;
      document.getElementById("profileModalPicture").src = profilePic;
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
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    showMessage(
      "viewProfileModal",
      "Error loading profile. Please try again.",
      "error",
    );
  }
}

async function showEditProfileModal() {
  try {
    closeModal("viewProfileModal");
    const profileData = await apiClient.getUserProfile();
    if (profileData && profileData.data) {
      const user = profileData.data;
      document.getElementById("editFullName").value = user.fullName || "";
      document.getElementById("editPhone").value = user.phoneNumber || "";
      document.getElementById("editDateOfBirth").value = user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "";
      openModal("editProfileModal");
    }
  } catch (error) {
    console.error("Error loading profile for edit:", error);
    ToastNotification?.error("Error loading profile. Please try again.") ||
      alert("Error loading profile. Please try again.");
  }
}

async function saveProfileChanges() {
  try {
    const fullName = document.getElementById("editFullName").value.trim();
    const phoneNumber = document.getElementById("editPhone").value.trim();
    const dateOfBirth = document.getElementById("editDateOfBirth").value;
    if (!fullName) {
      showMessage("editProfileModal", "Full name is required", "error");
      return;
    }

    document.getElementById("saveProfileBtn").style.display = "none";
    document.getElementById("saveProfileLoader").style.display = "inline-flex";

    const response = await apiClient.updateUserProfile({
      fullName: fullName || null,
      phoneNumber: phoneNumber || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
    });
    if (response && response.data) {
      showMessage(
        "editProfileModal",
        "Profile updated successfully!",
        "success",
      );
      const currentUser = apiClient.getStoredUser();
      localStorage.setItem(
        "user",
        JSON.stringify({ ...currentUser, fullName: response.data.fullName }),
      );
      if (response.data.fullName)
        document.getElementById("menuUserName").textContent =
          response.data.fullName;
      setTimeout(() => {
        closeModal("editProfileModal");
        showProfile();
      }, 1500);
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    showMessage(
      "editProfileModal",
      error.message || "Error updating profile. Please try again.",
      "error",
    );
  } finally {
    document.getElementById("saveProfileBtn").style.display = "inline";
    document.getElementById("saveProfileLoader").style.display = "none";
  }
}

function editProfilePicture() {
  closeAllModals();
  openModal("changePictureModal");
  resetPictureModal();
}
function resetPictureModal() {
  document.getElementById("pictureFileInput").value = "";
  document.getElementById("picturePreview").style.display = "none";
  document.getElementById("noPreviewMessage").style.display = "block";
  document.getElementById("changePictureMessage").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const pictureFileInput = document.getElementById("pictureFileInput");
  if (pictureFileInput) {
    pictureFileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          showMessage(
            "changePictureModal",
            "Please select a valid image file",
            "error",
          );
          this.value = "";
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          showMessage(
            "changePictureModal",
            "Image size must be less than 5MB",
            "error",
          );
          this.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
          document.getElementById("picturePreview").src = event.target.result;
          document.getElementById("picturePreview").style.display = "block";
          document.getElementById("noPreviewMessage").style.display = "none";
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

async function uploadProfilePicture() {
  try {
    const fileInput = document.getElementById("pictureFileInput");
    const file = fileInput.files[0];
    if (!file) {
      showMessage(
        "changePictureModal",
        "Please select an image first",
        "error",
      );
      return;
    }
    document.getElementById("uploadPictureBtn").style.display = "none";
    document.getElementById("uploadPictureLoader").style.display =
      "inline-flex";
    const reader = new FileReader();
    reader.onload = async function (event) {
      try {
        const base64Image = event.target.result;
        const response = await apiClient.updateProfilePicture(base64Image);
        if (response && response.data) {
          showMessage(
            "changePictureModal",
            "Profile picture updated successfully!",
            "success",
          );
          document.getElementById("profilePic").src = base64Image;
          document.getElementById("menuProfilePic").src = base64Image;
          setTimeout(() => {
            closeModal("changePictureModal");
            showProfile();
          }, 1500);
        }
      } catch (error) {
        console.error("Error uploading picture:", error);
        showMessage(
          "changePictureModal",
          "Error uploading picture. Please try again.",
          "error",
        );
      } finally {
        document.getElementById("uploadPictureBtn").style.display = "inline";
        document.getElementById("uploadPictureLoader").style.display = "none";
      }
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Error processing image:", error);
    showMessage(
      "changePictureModal",
      "Error processing image. Please try again.",
      "error",
    );
  }
}

function changePassword() {
  closeAllModals();
  resetPasswordModal();
  openModal("changePasswordModal");
}
function resetPasswordModal() {
  document.getElementById("changePasswordForm").reset();
  document.getElementById("changePasswordMessage").style.display = "none";
  document.getElementById("passwordStrengthIndicator").style.display = "none";
}
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
}
function checkPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  return strength;
}

document.addEventListener("DOMContentLoaded", function () {
  const newPasswordInput = document.getElementById("newPassword");
  if (newPasswordInput) {
    newPasswordInput.addEventListener("input", function () {
      const strength = checkPasswordStrength(this.value);
      const indicator = document.getElementById("passwordStrengthIndicator");
      if (this.value.length === 0) {
        indicator.style.display = "none";
      } else {
        indicator.style.display = "block";
        indicator.innerHTML = "";
        const colors = ["#ff4757", "#ffa502", "#ffdd59", "#39cccc", "#2ed573"];
        const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
        const bar = document.createElement("div");
        bar.style.height = "8px";
        bar.style.borderRadius = "4px";
        bar.style.backgroundColor = colors[Math.min(strength, 4)];
        bar.style.width = (strength / 5) * 100 + "%";
        bar.style.transition = "all 0.3s";
        indicator.appendChild(bar);
        indicator.innerHTML += `<small style="color: ${colors[Math.min(strength, 4)]}; font-weight: 600;">${labels[Math.min(strength, 4)]}</small>`;
      }
    });
  }
});

async function updatePassword() {
  try {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (!oldPassword || !newPassword || !confirmPassword) {
      showMessage("changePasswordModal", "All fields are required", "error");
      return;
    }
    if (newPassword.length < 6) {
      showMessage(
        "changePasswordModal",
        "New password must be at least 6 characters",
        "error",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage("changePasswordModal", "Passwords do not match", "error");
      return;
    }
    document.getElementById("updatePasswordBtn").style.display = "none";
    document.getElementById("updatePasswordLoader").style.display =
      "inline-flex";
    const response = await apiClient.changePassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    if (response) {
      showMessage(
        "changePasswordModal",
        "Password changed successfully!",
        "success",
      );
      setTimeout(() => closeModal("changePasswordModal"), 1500);
    }
  } catch (error) {
    console.error("Error updating password:", error);
    showMessage(
      "changePasswordModal",
      error.message || "Error changing password. Please try again.",
      "error",
    );
  } finally {
    document.getElementById("updatePasswordBtn").style.display = "inline";
    document.getElementById("updatePasswordLoader").style.display = "none";
  }
}
