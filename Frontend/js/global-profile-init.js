/**
 * Global Profile Initialization
 * Ensures user profile features are properly initialized across all pages
 * This file should be loaded on every page after jQuery
 */

(function () {
  // Track if initialization has been done
  let profileInitialized = false;
  let initAttempts = 0;
  const MAX_ATTEMPTS = 5;

  /**
   * Initialize all profile-related features
   */
  function initializeGlobalProfile() {
    // Ensure profile modals container exists
    if (!document.getElementById("profileModalsContainer")) {
      const container = document.createElement("div");
      container.id = "profileModalsContainer";
      document.body.appendChild(container);
    }

    // Load profile modals if not already loaded
    loadProfileModals();
  }

  /**
   * Load profile modals HTML
   */
  function loadProfileModals() {
    const container = document.getElementById("profileModalsContainer");

    // Check if modals are already loaded
    if (document.getElementById("viewProfileModal")) {
      initializeModalHandlers();
      return;
    }

    fetch("profile-modals.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        container.innerHTML = html;
        initializeModalHandlers();
        // Re-initialize profile component to set up menu listeners
        if (typeof initializeUserProfileComponent === "function") {
          initializeUserProfileComponent();
        }
      })

      .catch((error) => {
        console.error("[Profile Init] Error loading profile modals:", error);
        if (initAttempts < MAX_ATTEMPTS) {
          initAttempts++;
          setTimeout(loadProfileModals, 1000);
        }
      });
  }

  /**
   * Initialize modal close buttons and backdrop click handlers
   */
  function initializeModalHandlers() {
    // Close button handlers
    document.querySelectorAll(".close, [data-modal]").forEach((btn) => {
      if (btn.classList.contains("close") || btn.getAttribute("data-modal")) {
        // Remove existing listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", function (e) {
          e.preventDefault();
          const modalId =
            this.getAttribute("data-modal") || this.closest(".modal")?.id;
          if (modalId) {
            closeModal(modalId);
          }
        });
      }
    });

    // Backdrop click handler
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", function (e) {
        if (e.target === this) {
          closeAllModals();
        }
      });
    });
  }

  /**
   * Close modal by ID
   */
  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "auto";
    }
  };

  /**
   * Open modal by ID
   */
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  };

  /**
   * Close all modals
   */
  window.closeAllModals = function () {
    document.querySelectorAll(".modal.show").forEach((modal) => {
      modal.classList.remove("show");
    });
    document.body.style.overflow = "auto";
  };

  /**
   * Reinitialize profile system (for debugging)
   */
  window.reinitializeProfileSystem = function () {
    initAttempts = 0;
    initializeGlobalProfile();
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initializeGlobalProfile();
    });
  } else {
    initializeGlobalProfile();
  }

  // Re-initialize after page fully loads
  window.addEventListener("load", function () {
    setTimeout(initializeGlobalProfile, 100);
  });

  // Re-initialize with delay for dynamic content
  setTimeout(function () {
    if (!document.getElementById("viewProfileModal")) {
      initializeGlobalProfile();
    }
  }, 2000);
})();
