const API_BASE = "https://localhost:44383/api";

let auditTable;
let currentFilters = {
  startDate: "",
  endDate: "",
  user: "",
  action: "",
  module: "",
  severity: "",
};

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function clearFormErrors() {
  document
    .querySelectorAll(".error-message")
    .forEach((element) => (element.textContent = ""));
}

function displayValidationErrors(errors) {
  clearFormErrors();
  if (errors && typeof errors === "object") {
    const fieldMapping = {
      StartDate: "start-date",
      EndDate: "end-date",
      User: "user-filter",
      Action: "action-filter",
      Module: "module-filter",
      Severity: "severity-filter",
    };
    Object.keys(errors).forEach((field) => {
      const errorMessages = errors[field];
      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        const formFieldId = fieldMapping[field] || field.toLowerCase();
        const errorElement = document.getElementById(`${formFieldId}-error`);
        if (errorElement) errorElement.textContent = errorMessages[0];
      }
    });
  }
}

async function initializeAuditTable() {
  console.log("[AUDIT] Starting audit table initialization...");

  // Log current state
  console.log("[AUDIT] jQuery available:", typeof $ !== "undefined");
  console.log(
    "[AUDIT] jQuery.fn available:",
    typeof $ !== "undefined" && typeof $.fn !== "undefined",
  );
  console.log(
    "[AUDIT] DataTable available:",
    typeof $ !== "undefined" && typeof $.fn.DataTable !== "undefined",
  );

  // Check if jQuery and DataTables are loaded
  if (typeof $ === "undefined") {
    console.error("[AUDIT] jQuery is NOT loaded!");
    setTimeout(initializeAuditTable, 100);
    return;
  }
  if (typeof $.fn === "undefined") {
    console.error("[AUDIT] jQuery.fn is NOT available!");
    setTimeout(initializeAuditTable, 100);
    return;
  }
  if (typeof $.fn.DataTable === "undefined") {
    console.error("[AUDIT] DataTable is NOT loaded!");
    setTimeout(initializeAuditTable, 100);
    return;
  }

  console.log("[AUDIT] jQuery and DataTables loaded successfully");

  // Check if the table element exists
  const tableElement = $("#audit-table");
  console.log("[AUDIT] Table element found:", tableElement.length > 0);

  if (tableElement.length === 0) {
    console.error(
      "[AUDIT] Audit table element not found! Retrying in 100ms...",
    );
    setTimeout(initializeAuditTable, 100);
    return;
  }

  console.log("[AUDIT] Initializing DataTable...");

  // Check authentication
  const token = localStorage.getItem("accessToken");
  console.log("[AUDIT] Access token available:", !!token);

  if (!apiClient.isAuthenticated()) {
    console.log("[AUDIT] Not authenticated, redirecting to login...");
    window.location.href = "login.html";
    return;
  }

  console.log("[AUDIT] Making API call to:", API_BASE + "/audit/logs");

  auditTable = tableElement.DataTable({
    ajax: {
      url: API_BASE + "/audit/logs",
      headers: {
        Authorization: "Bearer " + token,
      },
      data: function (d) {
        console.log("[AUDIT] DataTables sending data:", d);
        if (currentFilters.startDate) d.startDate = currentFilters.startDate;
        if (currentFilters.endDate) d.endDate = currentFilters.endDate;
        if (currentFilters.user) d.user = currentFilters.user;
        if (currentFilters.action) d.action = currentFilters.action;
        if (currentFilters.module) d.module = currentFilters.module;
        if (currentFilters.severity) d.severity = currentFilters.severity;
        d.page = Math.floor(d.start / d.length) + 1 || 1;
        d.pageSize = d.length || 25;
      },
      dataSrc: function (json) {
        console.log(
          "[AUDIT] DataTables received response:",
          JSON.stringify(json, null, 2),
        );
        if (json) updateStatistics(json);
        const data = json?.data || [];
        console.log("[AUDIT] Data extracted:", data.length, "rows");
        console.log("[AUDIT] First row:", data[0]);

        // Check if table rows are being created
        setTimeout(() => {
          const rowCount = $("#audit-table tbody tr").length;
          console.log("[AUDIT] Table rows in DOM:", rowCount);
          const tableContainer = $(".data-table-container");
          console.log(
            "[AUDIT] Table container visible:",
            tableContainer.length > 0,
          );
          if (tableContainer.length > 0) {
            console.log(
              "[AUDIT] Table container HTML:",
              tableContainer.html().substring(0, 500),
            );
          }
        }, 1000);

        return data;
      },
      error: function (xhr, error, thrown) {
        console.error("[AUDIT] DataTable AJAX error:", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          error: error,
          thrown: thrown,
        });
        showToast("Failed to load audit logs: " + error, "error");
      },
      complete: function (xhr, status) {
        console.log(
          "[AUDIT] DataTable AJAX complete. Status:",
          status,
          "Response:",
          xhr.responseText,
        );
      },
    },
    paging: true,
    searching: true,
    ordering: true,
    info: true,
    processing: true,
    responsive: true,
    pageLength: 25,
    lengthMenu: [10, 25, 50, 100],
    order: [[0, "desc"]],
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
        render: (data, type, row) =>
          type === "display" ? new Date(data).toLocaleString() : data,
      },
      { data: "user" },
      {
        data: "action",
        render: (data, type, row) =>
          type === "display"
            ? `<span class="action-badge ${data}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`
            : data,
      },
      {
        data: "module",
        render: (data, type, row) =>
          type === "display"
            ? data.charAt(0).toUpperCase() + data.slice(1).replace("-", " ")
            : data,
      },
      { data: "entity" },
      { data: "details" },
      { data: "ipAddress" },
      {
        data: "severity",
        render: (data, type, row) =>
          type === "display"
            ? `<span class="severity-badge severity-${data}">${data}</span>`
            : data,
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        className: "actions-column",
        render: (data, type, row) =>
          `<button class="action-btn-icon view-btn" title="View Details" data-id="${row.id}"><span class="material-icons-outlined">visibility</span></button>`,
      },
    ],
  });

  console.log("Audit table initialized successfully");

  // Set up event listeners
  const exportBtn = document.getElementById("export-audit-btn");
  const applyFiltersBtn = document.getElementById("apply-filters");
  const clearFiltersBtn = document.getElementById("clear-filters");
  if (exportBtn) exportBtn.addEventListener("click", exportAuditLogs);
  if (applyFiltersBtn) applyFiltersBtn.addEventListener("click", applyFilters);
  if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", clearFilters);
  $("#audit-table").on("click", ".view-btn", function () {
    viewAuditDetails($(this).data("id"));
  });

  // Set up modal event listeners
  const auditModal = document.getElementById("audit-details-modal");
  const closeAuditModal = document.getElementById("close-audit-modal");
  if (closeAuditModal && auditModal)
    closeAuditModal.addEventListener("click", (e) => {
      e.preventDefault();
      auditModal.classList.remove("show");
    });
  if (auditModal)
    window.addEventListener("click", (e) => {
      if (e.target === auditModal) auditModal.classList.remove("show");
    });

  // Load statistics
  loadAuditStatistics();

  // Auto-refresh every 10 seconds
  setInterval(() => {
    console.log("[AUDIT] Auto-refreshing audit table...");
    if (auditTable) {
      auditTable.ajax.reload(null, false); // false = don't reset pagination
    }
    loadAuditStatistics();
  }, 10000);

  console.log(
    "[AUDIT] Audit table initialized with auto-refresh (every 10 seconds)",
  );
}

async function loadAuditStatistics() {
  try {
    const response = await fetch(`${API_BASE}/audit/statistics`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    });
    if (response.ok) {
      const stats = await response.json();
      updateStatistics(stats);
    }
  } catch (error) {
    console.error("Error loading audit statistics:", error);
  }
}

function updateStatistics(data) {
  if (!data) return;
  document.getElementById("total-audits").textContent = data.totalLogs || 0;
  document.getElementById("today-activities").textContent =
    data.todayActivities || 0;
  document.getElementById("warnings-count").textContent = data.warnings || 0;
  document.getElementById("errors-count").textContent =
    (data.errors || 0) + (data.criticalEvents || 0);
}

function applyFilters() {
  currentFilters = {
    startDate: document.getElementById("start-date").value,
    endDate: document.getElementById("end-date").value,
    user: document.getElementById("user-filter").value.trim(),
    action: document.getElementById("action-filter").value,
    module: document.getElementById("module-filter").value,
    severity: document.getElementById("severity-filter").value,
  };
  auditTable.ajax.reload();
}

function clearFilters() {
  document.getElementById("start-date").value = "";
  document.getElementById("end-date").value = "";
  document.getElementById("user-filter").value = "";
  document.getElementById("action-filter").value = "";
  document.getElementById("module-filter").value = "";
  document.getElementById("severity-filter").value = "";
  currentFilters = {
    startDate: "",
    endDate: "",
    user: "",
    action: "",
    module: "",
    severity: "",
  };
  auditTable.ajax.reload();
}

async function viewAuditDetails(auditId) {
  try {
    const response = await fetch(`${API_BASE}/audit/logs/${auditId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    });
    if (response.ok) {
      const audit = await response.json();
      document.getElementById("audit-details-content").innerHTML = `
        <div class="detail-row"><label>ID</label><span>${audit.id}</span></div>
        <div class="detail-row"><label>Timestamp</label><span>${new Date(audit.timestamp).toLocaleString()}</span></div>
        <div class="detail-row"><label>User</label><span>${audit.user}</span></div>
        <div class="detail-row"><label>Action</label><span><span class="action-badge ${audit.action}">${audit.action.charAt(0).toUpperCase() + audit.action.slice(1)}</span></span></div>
        <div class="detail-row"><label>Module</label><span>${audit.module.charAt(0).toUpperCase() + audit.module.slice(1).replace("-", " ")}</span></div>
        <div class="detail-row"><label>Entity</label><span>${audit.entity || "N/A"}</span></div>
        <div class="detail-row"><label>Details</label><span>${audit.details || "N/A"}</span></div>
        <div class="detail-row"><label>IP Address</label><span>${audit.ipAddress || "N/A"}</span></div>
        <div class="detail-row"><label>Severity</label><span><span class="severity-badge severity-${audit.severity}">${audit.severity}</span></span></div>
        <div class="detail-row"><label>Created At</label><span>${new Date(audit.createdAt || audit.timestamp).toLocaleString()}</span></div>`;
      document.getElementById("audit-details-modal").classList.add("show");
    } else {
      showToast("Failed to load audit details", "error");
    }
  } catch (error) {
    console.error("Error loading audit details:", error);
    showToast("An error occurred while loading audit details", "error");
  }
}

async function exportAuditLogs() {
  try {
    const params = new URLSearchParams({
      page: 1,
      pageSize: 10000,
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
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    });
    if (response.ok) {
      const data = await response.json();
      const logs = data.data || [];
      if (logs.length === 0) {
        showToast("No audit logs to export", "info");
        return;
      }
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
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.setAttribute("href", URL.createObjectURL(blob));
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

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeAuditTable();
});
