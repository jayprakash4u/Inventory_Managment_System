// System config page JavaScript

// Handle save changes
document.addEventListener("DOMContentLoaded", function () {
  const saveBtn = document.querySelector(".btn-primary");
  const resetBtn = document.querySelector(".btn-secondary");

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      // Simulate saving
      alert("Settings saved successfully!");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to reset to default settings?")) {
        // Reset logic
        alert("Settings reset to default.");
      }
    });
  }

  // Handle quick actions
  const actionBtns = document.querySelectorAll(".action-btn");
  actionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.textContent.trim();
      alert(`${action} initiated.`);
    });
  });
});
