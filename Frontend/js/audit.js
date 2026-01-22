// ===============================
// Audit Trail page JavaScript
// ===============================

// Base URL of your backend API
// All audit-related requests will use this
const API_BASE = "https://localhost:44383/api";

// Token is already declared in script.js

// DataTable instance
let auditTable;

// Current filters
let currentFilters = {
  startDate: "",
  endDate: "",
  user: "",
  action: "",
  module: "",
  severity: "",
};

//---------- Validation function for filters------->

//---------Toast notification function------>
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type}`;

  // Show toast
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
//---------------toast end -------->

//-----Clear form error messages--->
function clearFormErrors() {
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.textContent = "";
  });
}

//------- Display validation errors from backend---->
function displayValidationErrors(errors) {
  clearFormErrors();

  if (errors && typeof errors === "object") {
    Object.keys(errors).forEach((field) => {
      const errorMessages = errors[field];

      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        // Map backend field names to form field IDs
        const fieldMapping = {
          StartDate: "start-date",
          EndDate: "end-date",
          User: "user-filter",
          Action: "action-filter",
          Module: "module-filter",
          Severity: "severity-filter",
        };

        const formFieldId = fieldMapping[field] || field.toLowerCase();
        const errorElement = document.getElementById(`${formFieldId}-error`);
        if (errorElement) {
          errorElement.textContent = errorMessages[0]; // Show first error message
        }
      }
    });
  }
}
//---------------------------End----------------------------->

// ===============================
// Initialize page (runs automatically)
// ===============================
(async function init() {
  // Initialize DataTable
  auditTable = $("#audit-table").DataTable({
    ajax: {
      url: API_BASE + "/audit/logs",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      data: function (d) {
        // Add custom filters to the request
        d.startDate = currentFilters.startDate;
        d.endDate = currentFilters.endDate;
        d.user = currentFilters.user;
        d.action = currentFilters.action;
        d.module = currentFilters.module;
        d.severity = currentFilters.severity;
        d.page = Math.floor(d.start / d.length) + 1 || 1; // Ensure it's at least 1
        d.pageSize = d.length || 25; // Default page size
      },
      dataSrc: function (json) {
        // Update statistics
        if (json) {
          updateStatistics(json);
        }
        return json?.data || [];
      },
      error: function (xhr, error, thrown) {
        console.error("DataTable error:", error);
        showToast("Failed to load audit logs", "error");
      },
    },

    /* ===============================
         DEFAULT DATATABLE FEATURES
     =============================== */
    paging: true, // Pagination
    searching: true, // Global search
    ordering: true, // Column sorting
    info: true, // Info text
    processing: true, // Processing indicator
    responsive: true, // Responsive table

    pageLength: 25, // Default rows per page
    lengthMenu: [10, 25, 50, 100],

    order: [[0, "desc"]], // Default sort by timestamp DESC

    // Custom DOM layout for better space utilization
    dom: '<"table-controls-wrapper"<"table-info"i><"table-search"f>>rt<"table-footer"<"table-length"l><"table-pagination"p>>',

    language: {
      search: "",
      searchPlaceholder: "Search audit logs...",
      lengthMenu: "Show _MENU_",
      info: "_START_ - _END_ of _TOTAL_ audit entries",
      emptyTable: "No audit logs found",
      processing: "Loading audit logs...",
    },

    columns: [
      {
        data: "timestamp",
        render: function (data, type, row) {
          if (type === "display") {
            return new Date(data).toLocaleString();
          }
          return data;
        },
      },
      { data: "user" },
      {
        data: "action",
        render: function (data, type, row) {
          if (type === "display") {
            const badgeClass = `action-badge ${data}`;
            return `<span class="${badgeClass}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`;
          }
          return data;
        },
      },
      {
        data: "module",
        render: function (data, type, row) {
          if (type === "display") {
            return (
              data.charAt(0).toUpperCase() + data.slice(1).replace("-", " ")
            );
          }
          return data;
        },
      },
      { data: "entity" },
      { data: "details" },
      { data: "ipAddress" },
      {
        data: "severity",
        render: function (data, type, row) {
          if (type === "display") {
            return `<span class="severity-badge severity-${data}">${data}</span>`;
          }
          return data;
        },
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        className: "actions-column",
        render: function (data, type, row) {
          return `<button class="action-btn-icon view-btn" title="View Details" data-id="${row.id}"><span class="material-icons-outlined">visibility</span></button>`;
        },
      },
    ],
  });

  // Get references to UI elements
  const exportBtn = document.getElementById("export-audit-btn");
  const applyFiltersBtn = document.getElementById("apply-filters");
  const clearFiltersBtn = document.getElementById("clear-filters");

  // Event listeners
  if (exportBtn) {
    exportBtn.addEventListener("click", exportAuditLogs);
  }

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters);
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearFilters);
  }

  // View audit details modal
  $("#audit-table").on("click", ".view-btn", function () {
    const auditId = $(this).data("id");
    viewAuditDetails(auditId);
  });

  // Modal close handlers
  const auditModal = document.getElementById("audit-details-modal");
  const closeAuditModal = document.getElementById("close-audit-modal");

  if (closeAuditModal && auditModal) {
    closeAuditModal.addEventListener("click", function (event) {
      event.preventDefault();
      auditModal.classList.remove("show");
    });
  }

  if (auditModal) {
    window.addEventListener("click", function (event) {
      if (event.target === auditModal) {
        auditModal.classList.remove("show");
      }
    });
  }

  // Load initial statistics
  loadAuditStatistics();
})();

// ===============================
// Load audit statistics
// ===============================
async function loadAuditStatistics() {
  try {
    const response = await fetch(`${API_BASE}/audit/statistics`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (response.ok) {
      const stats = await response.json();
      updateStatistics(stats);
    } else {
      console.error("Failed to load audit statistics");
    }
  } catch (error) {
    console.error("Error loading audit statistics:", error);
  }
}

// ===============================
// Update statistics display
// ===============================
function updateStatistics(data) {
  if (!data) return;

  // Update cards
  document.getElementById("total-audits").textContent = data.totalLogs || 0;
  document.getElementById("today-activities").textContent =
    data.todayActivities || 0;
  document.getElementById("warnings-count").textContent = data.warnings || 0;
  document.getElementById("errors-count").textContent =
    (data.errors || 0) + (data.criticalEvents || 0);
}

// ===============================
// Apply filters
// ===============================
function applyFilters() {
  // Get filter values
  currentFilters.startDate = document.getElementById("start-date").value;
  currentFilters.endDate = document.getElementById("end-date").value;
  currentFilters.user = document.getElementById("user-filter").value.trim();
  currentFilters.action = document.getElementById("action-filter").value;
  currentFilters.module = document.getElementById("module-filter").value;
  currentFilters.severity = document.getElementById("severity-filter").value;

  // Reload DataTable with filters
  auditTable.ajax.reload();
}

// ===============================
// Clear filters
// ===============================
function clearFilters() {
  // Reset form fields
  document.getElementById("start-date").value = "";
  document.getElementById("end-date").value = "";
  document.getElementById("user-filter").value = "";
  document.getElementById("action-filter").value = "";
  document.getElementById("module-filter").value = "";
  document.getElementById("severity-filter").value = "";

  // Reset filter object
  currentFilters = {
    startDate: "",
    endDate: "",
    user: "",
    action: "",
    module: "",
    severity: "",
  };

  // Reload DataTable
  auditTable.ajax.reload();
}

// ===============================
// View audit details
// ===============================
async function viewAuditDetails(auditId) {
  try {
    const response = await fetch(`${API_BASE}/audit/logs/${auditId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (response.ok) {
      const audit = await response.json();

      // Populate modal with audit data
      const detailsContent = document.getElementById("audit-details-content");
      detailsContent.innerHTML = `
        <div class="detail-row">
          <label>ID</label>
          <span>${audit.id}</span>
        </div>
        <div class="detail-row">
          <label>Timestamp</label>
          <span>${new Date(audit.timestamp).toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <label>User</label>
          <span>${audit.user}</span>
        </div>
        <div class="detail-row">
          <label>Action</label>
          <span><span class="action-badge ${audit.action}">${audit.action.charAt(0).toUpperCase() + audit.action.slice(1)}</span></span>
        </div>
        <div class="detail-row">
          <label>Module</label>
          <span>${audit.module.charAt(0).toUpperCase() + audit.module.slice(1).replace("-", " ")}</span>
        </div>
        <div class="detail-row">
          <label>Entity</label>
          <span>${audit.entity || "N/A"}</span>
        </div>
        <div class="detail-row">
          <label>Details</label>
          <span>${audit.details || "N/A"}</span>
        </div>
        <div class="detail-row">
          <label>IP Address</label>
          <span>${audit.ipAddress || "N/A"}</span>
        </div>
        <div class="detail-row">
          <label>Severity</label>
          <span><span class="severity-badge severity-${audit.severity}">${audit.severity}</span></span>
        </div>
        <div class="detail-row">
          <label>Created At</label>
          <span>${new Date(audit.createdAt || audit.timestamp).toLocaleString()}</span>
        </div>
      `;

      // Show modal
      document.getElementById("audit-details-modal").classList.add("show");
    } else {
      showToast("Failed to load audit details", "error");
    }
  } catch (error) {
    console.error("Error loading audit details:", error);
    showToast("An error occurred while loading audit details", "error");
  }
}

// ===============================
// Export audit logs
// ===============================
async function exportAuditLogs() {
  try {
    // Build query parameters for export
    const params = new URLSearchParams({
      page: 1,
      pageSize: 10000, // Large number to get all filtered results
      sortBy: "Timestamp",
      sortDirection: "desc",
    });

    if (currentFilters.startDate)
      params.append("startDate", currentFilters.startDate);
    if (currentFilters.endDate)
      params.append("endDate", currentFilters.endDate);
    if (currentFilters.user) params.append("user", currentFilters.user);
    if (currentFilters.action) params.append("action", currentFilters.action);
    if (currentFilters.module) params.append("module", currentFilters.module);
    if (currentFilters.severity)
      params.append("severity", currentFilters.severity);

    const response = await fetch(`${API_BASE}/audit/logs?${params}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (response.ok) {
      const data = await response.json();
      const logs = data.data || [];

      if (logs.length === 0) {
        showToast("No audit logs to export", "info");
        return;
      }

      // Convert to CSV
      const headers = [
        "Timestamp",
        "User",
        "Action",
        "Module",
        "Entity",
        "Details",
        "IP Address",
        "Severity",
      ];
      const csvContent = [
        headers.join(","),
        ...logs.map((log) =>
          [
            `"${new Date(log.timestamp).toLocaleString()}"`,
            `"${log.user}"`,
            `"${log.action}"`,
            `"${log.module.charAt(0).toUpperCase() + log.module.slice(1).replace("-", " ")}"`,
            `"${log.entity || ""}"`,
            `"${log.details || ""}"`,
            `"${log.ipAddress || ""}"`,
            `"${log.severity}"`,
          ].join(","),
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Audit logs exported successfully", "success");
    } else {
      showToast("Failed to export audit logs", "error");
    }
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    showToast("An error occurred while exporting audit logs", "error");
  }
}
