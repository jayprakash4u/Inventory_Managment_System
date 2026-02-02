const API_BASE = "https://localhost:44383/api";

const token = localStorage.getItem("accessToken");
if (!token) {
  window.location.href = "login.html";
}

function getSeverityForAction(action) {
  switch (action.toUpperCase()) {
    case "DELETE":
      return "high";
    case "CREATE":
    case "UPDATE":
    case "VIEW":
    default:
      return "low";
  }
}

async function logAuditEvent(action, module, entity, details, severity = null) {
  const finalSeverity = severity || getSeverityForAction(action);
  try {
    const auditData = {
      user: localStorage.getItem("username") || "admin",
      action,
      module,
      entity,
      details,
      ipAddress: "",
      severity: finalSeverity,
    };
    await fetch(`${API_BASE}/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(auditData),
    });
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
}

let ordersTable;
let currentFilters = { status: "", supplier: "", dateRange: "" };
const supplierChartInstances = {};

async function initializeOrdersTable() {
  console.log("Initializing supplier orders table...");
  ordersTable = $("#supplier-orders-table").DataTable({
    ajax: {
      url: `${API_BASE}/supplier-orders`,
      type: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      dataSrc: "",
      data: (d) => {
        if (currentFilters.status) d.status = currentFilters.status;
        if (currentFilters.supplier) d.supplier = currentFilters.supplier;
        if (currentFilters.dateRange) d.dateRange = currentFilters.dateRange;
      },
      complete: function (xhr, status) {
        console.log("DataTable AJAX complete. Status:", status);
        if (status === "error") {
          console.error("DataTable AJAX error:", xhr);
        }
      },
    },
    columns: [
      {
        data: "orderId",
        render: (data, type, row, meta) =>
          type === "display"
            ? meta.row + meta.settings._iDisplayStart + 1
            : data,
      },
      { data: "supplierName" },
      {
        data: "orderDate",
        render: (data) => new Date(data).toLocaleDateString(),
      },
      { data: "items" },
      { data: "totalValue", render: (data) => `$${data.toFixed(2)}` },
      {
        data: "status",
        render: (data) => {
          const statusClasses = {
            pending: "status-badge status-pending",
            approved: "status-badge status-approved",
            shipped: "status-badge status-shipped",
            delivered: "status-badge status-delivered",
          };
          return `<span class="${statusClasses[data] || "status-badge"}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`;
        },
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        className: "actions-column",
        render: (data, type, row) =>
          `<button class="action-btn-icon edit-btn" title="Edit" data-id="${row.id}"><span class="material-icons-outlined">edit</span></button><button class="action-btn-icon delete-btn" title="Delete" data-id="${row.id}"><span class="material-icons-outlined">delete</span></button><button class="action-btn-icon view-btn" title="View Details" data-id="${row.id}"><span class="material-icons-outlined">visibility</span></button>`,
      },
    ],
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50, 100],
    order: [[2, "desc"]],
    language: {
      search: "",
      searchPlaceholder: "Search orders...",
      lengthMenu: "Show _MENU_",
      info: "_START_ - _END_ of _TOTAL_ orders",
      emptyTable: "No orders available",
    },
    dom: '<"table-controls-wrapper"<"table-info"i><"table-search"f>>rt<"table-footer"<"table-length"l><"table-pagination"p>>',
  });

  $("#status-filter, #supplier-filter, #date-filter").on("change", function () {
    currentFilters.status = $("#status-filter").val();
    currentFilters.supplier = $("#supplier-filter").val();
    currentFilters.dateRange = $("#date-filter").val();
    ordersTable.ajax.reload();
  });
  $("#apply-filters").on("click", function () {
    currentFilters.status = $("#status-filter").val();
    currentFilters.supplier = $("#supplier-filter").val();
    currentFilters.dateRange = $("#date-filter").val();
    ordersTable.ajax.reload();
  });
  $("#clear-filters").on("click", function () {
    $("#status-filter, #supplier-filter, #date-filter").val("");
    currentFilters = { status: "", supplier: "", dateRange: "" };
    ordersTable.ajax.reload();
  });
  ordersTable.on("draw", async function () {
    await loadChartsData();
  });
  $("#supplier-orders-table").on("click", ".edit-btn", function () {
    editOrder($(this).data("id"));
  });
  $("#supplier-orders-table").on("click", ".delete-btn", function () {
    deleteOrder($(this).data("id"));
  });
  $("#supplier-orders-table").on("click", ".view-btn", function () {
    viewOrder($(this).data("id"));
  });
}

async function loadChartsData() {
  try {
    const summaryResponse = await fetch(`${API_BASE}/supplier-orders/summary`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      updateSummaryCards(summary);
    }
    const statusResponse = await fetch(
      `${API_BASE}/supplier-orders/chart/status`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      renderOrdersStatusChart(statusData);
    }
    renderPurchaseValueChart();
  } catch (error) {
    console.error("Error loading charts data:", error);
  }
}

function updateSummaryCards(summary) {
  $("#total-orders").text(summary.totalOrders || 0);
  $("#pending-orders").text(summary.pending || 0);
  $("#delivered-orders").text(summary.delivered || 0);
  $("#total-value").text(`$${summary.totalValue?.toFixed(2) || "0.00"}`);
}

function renderOrdersStatusChart(statusData) {
  const statuses = Object.keys(statusData);
  const counts = Object.values(statusData);
  const config = {
    series: counts,
    chart: { type: "pie", height: 350, toolbar: { show: false } },
    labels: statuses.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    colors: ["#246dec", "#cc3c43", "#367952", "#f5b747"],
    responsive: [
      {
        breakpoint: 480,
        options: { chart: { width: 200 }, legend: { position: "bottom" } },
      },
    ],
  };

  // Destroy existing chart
  if (supplierChartInstances["orders-status"]) {
    supplierChartInstances["orders-status"].destroy();
    delete supplierChartInstances["orders-status"];
  }

  const chart = new ApexCharts(
    document.querySelector("#orders-status-chart"),
    config,
  );
  chart.render();
  supplierChartInstances["orders-status"] = chart;
}

function renderPurchaseValueChart() {
  const config = {
    series: [
      {
        name: "Purchase Value",
        data: [15000, 18000, 22000, 19000, 25000, 28000],
      },
    ],
    chart: { height: 350, type: "bar", toolbar: { show: false } },
    colors: ["#246dec"],
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: "40%", horizontal: false },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
    yaxis: { title: { text: "Value ($)" } },
  };

  // Destroy existing chart
  if (supplierChartInstances["purchase-value"]) {
    supplierChartInstances["purchase-value"].destroy();
    delete supplierChartInstances["purchase-value"];
  }

  const chart = new ApexCharts(
    document.querySelector("#purchase-value-chart"),
    config,
  );
  chart.render();
  supplierChartInstances["purchase-value"] = chart;
}

async function editOrder(orderId) {
  try {
    const response = await fetch(`${API_BASE}/supplier-orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (response.ok) {
      const order = await response.json();
      document.getElementById("order-id").value = order.orderId;
      document.getElementById("supplier-name").value = order.supplierName;
      document.getElementById("order-date").value =
        order.orderDate.split("T")[0];
      document.getElementById("order-items").value = order.items;
      document.getElementById("order-value").value = order.totalValue;
      document.getElementById("order-status").value = order.status;
      const supplierSelect = document.getElementById("supplier-name");
      const customSupplierInput = document.getElementById("custom-supplier");
      const predefinedSuppliers = [
        "Apple Inc.",
        "Samsung",
        "Dell",
        "HP",
        "Lenovo",
      ];
      if (predefinedSuppliers.includes(order.supplierName)) {
        supplierSelect.value = order.supplierName;
        customSupplierInput.style.display = "none";
        customSupplierInput.required = false;
        customSupplierInput.value = "";
      } else {
        supplierSelect.value = "Other";
        customSupplierInput.style.display = "block";
        customSupplierInput.required = true;
        customSupplierInput.value = order.supplierName;
      }
      document.getElementById("add-order-modal").dataset.editId = orderId;
      document.getElementById("order-modal-title").textContent =
        "Edit Supplier Order";
      document.getElementById("submit-order-btn").textContent = "Update Order";
      document.getElementById("add-order-modal").classList.add("show");
      clearOrderFormErrors();
    } else {
      showToast("Failed to load order details", "error");
    }
  } catch (error) {
    console.error("Error loading order:", error);
    showToast("An error occurred while loading the order", "error");
  }
}

async function deleteOrder(orderId) {
  if (confirm("Are you sure you want to delete this order?")) {
    try {
      // Check if DataTable is initialized
      if (!ordersTable || typeof ordersTable.ajax.reload !== "function") {
        console.error("DataTable not initialized. Reloading page...");
        window.location.reload();
        return;
      }

      await apiClient.delete(`/supplier-orders/${orderId}`);
      ordersTable.ajax.reload();
      loadChartsData();
      logAuditEvent(
        "DELETE",
        "SupplierOrder",
        orderId,
        "Deleted supplier order",
      ).catch(console.error);
      showToast("Supplier order deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast("Failed to delete order: " + error.message, "error");
    }
  }
}

async function viewOrder(orderId) {
  try {
    const response = await fetch(`${API_BASE}/supplier-orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (response.ok) {
      const order = await response.json();
      document.getElementById("view-order-id").textContent = order.id;
      document.getElementById("view-order-orderid").textContent = order.orderId;
      document.getElementById("view-order-supplier").textContent =
        order.supplierName;
      document.getElementById("view-order-date").textContent = new Date(
        order.orderDate,
      ).toLocaleDateString();
      document.getElementById("view-order-items").textContent = order.items;
      document.getElementById("view-order-value").textContent =
        `$${order.totalValue.toFixed(2)}`;
      const statusClasses = {
        pending: "status-badge status-pending",
        approved: "status-badge status-approved",
        shipped: "status-badge status-shipped",
        delivered: "status-badge status-delivered",
      };
      document.getElementById("view-order-status").innerHTML =
        `<span class="${statusClasses[order.status] || "status-badge"}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>`;
      document.getElementById("view-order-created").textContent =
        order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A";
      document.getElementById("view-order-updated").textContent =
        order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "N/A";
      document.getElementById("view-order-modal").classList.add("show");
    } else {
      showToast("Failed to load order details", "error");
    }
  } catch (error) {
    console.error("Error loading order:", error);
    showToast("An error occurred while loading the order", "error");
  }
}

function initializeOrderModal() {
  const addOrderBtn = document.getElementById("add-order-btn");
  const modal = document.getElementById("add-order-modal");
  const closeModal = document.getElementById("close-order-modal");
  const addOrderForm = document.getElementById("add-order-form");
  const submitOrderBtn = document.getElementById("submit-order-btn");
  const supplierSelect = document.getElementById("supplier-name");
  const customSupplierInput = document.getElementById("custom-supplier");
  if (supplierSelect) {
    supplierSelect.addEventListener("change", function () {
      if (this.value === "Other") {
        customSupplierInput.style.display = "block";
        customSupplierInput.required = true;
      } else {
        customSupplierInput.style.display = "none";
        customSupplierInput.required = false;
        customSupplierInput.value = "";
      }
    });
  }
  if (addOrderBtn) {
    addOrderBtn.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.add("show");
      addOrderForm.reset();
      customSupplierInput.style.display = "none";
      customSupplierInput.required = false;
      clearOrderFormErrors();
      delete modal.dataset.editId;
      document.getElementById("order-modal-title").textContent =
        "Add New Supplier Order";
      document.getElementById("submit-order-btn").textContent = "Create Order";
      document.getElementById("order-date").value = new Date()
        .toISOString()
        .split("T")[0];
    });
  }
  if (closeModal) {
    closeModal.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.remove("show");
    });
  }
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.classList.remove("show");
    });
  }
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", function (e) {
      console.log("Submit button click event triggered");
      e.preventDefault();
      handleOrderFormSubmission();
    });
  }
  if (addOrderForm) {
    addOrderForm.addEventListener("submit", function (e) {
      console.log("Form submit event triggered");
      e.preventDefault();
      handleOrderFormSubmission();
    });
  }
  const viewModal = document.getElementById("view-order-modal");
  const closeViewModal = document.getElementById("close-view-modal");
  if (closeViewModal && viewModal) {
    closeViewModal.addEventListener("click", function (e) {
      e.preventDefault();
      viewModal.classList.remove("show");
    });
  }
  if (viewModal) {
    viewModal.addEventListener("click", function (e) {
      if (e.target === viewModal) viewModal.classList.remove("show");
    });
  }
}

function clearOrderFormErrors() {
  document
    .querySelectorAll(".error-message")
    .forEach((element) => (element.textContent = ""));
}

function showToast(message, type = "info") {
  console.log("showToast called:", message, type);
  console.log(
    "ToastNotification defined:",
    typeof ToastNotification !== "undefined",
  );

  // Try ToastNotification class first
  if (typeof ToastNotification !== "undefined") {
    console.log(
      "ToastNotification type check:",
      typeof ToastNotification[type],
      "show:",
      typeof ToastNotification.show,
    );
    try {
      if (typeof ToastNotification[type] === "function") {
        console.log("Calling ToastNotification." + type + "()");
        ToastNotification[type](message);
      } else if (typeof ToastNotification.show === "function") {
        console.log("Calling ToastNotification.show()");
        ToastNotification.show(message, type);
      } else {
        console.warn("ToastNotification methods not available");
      }
      return;
    } catch (error) {
      console.error("ToastNotification error:", error);
    }
  }

  // Fallback to simple toast element
  console.log("Checking for fallback toast element");
  const toast = document.getElementById("toast");
  if (toast) {
    console.log("Using fallback toast element");
    toast.textContent = message;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => toast.classList.remove("show"), 3000);
  } else {
    // Last resort: alert
    console.warn("Toast element not found, using alert:", message);
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

async function handleOrderFormSubmission() {
  console.log("handleOrderFormSubmission called - starting execution");
  try {
    // Check if DataTable is initialized
    if (!ordersTable || typeof ordersTable.ajax.reload !== "function") {
      console.error("DataTable not initialized. Reloading page...");
      window.location.reload();
      return;
    }

    const orderDateValue = document.getElementById("order-date").value;
    const formData = {
      orderId: document.getElementById("order-id")?.value || "",
      supplierName:
        document.getElementById("supplier-name").value === "Other"
          ? document.getElementById("custom-supplier").value
          : document.getElementById("supplier-name").value,
      orderDate: orderDateValue
        ? new Date(orderDateValue).toISOString()
        : new Date().toISOString(),
      items: document.getElementById("order-items").value,
      totalValue: parseFloat(document.getElementById("order-value").value),
      status: document.getElementById("order-status").value,
    };
    const editId = document.getElementById("add-order-modal").dataset.editId;
    console.log(
      "Form submission - Edit mode:",
      editId ? "Yes (ID: " + editId + ")" : "No (Create new)",
    );

    if (editId) {
      console.log("Calling PUT API...");
      await apiClient.put(`/supplier-orders/${editId}`, formData);
      console.log("Update successful!");
      showToast("Supplier order updated successfully!", "success");
      logAuditEvent(
        "UPDATE",
        "SupplierOrder",
        editId,
        `Updated supplier order for ${formData.supplierName}`,
      ).catch(console.error);
    } else {
      console.log("Calling POST API...");
      await apiClient.post("/supplier-orders", formData);
      console.log("Create successful!");
      showToast("Supplier order created successfully!", "success");
      logAuditEvent(
        "CREATE",
        "SupplierOrder",
        formData.orderId,
        `Created new supplier order for ${formData.supplierName}`,
      ).catch(console.error);
    }
    console.log("Reloading DataTable...");
    document.getElementById("add-order-modal").classList.remove("show");
    ordersTable.ajax.reload();
    console.log("Reloading charts...");
    loadChartsData();
    console.log("Form submission complete!");
  } catch (error) {
    console.error("Error submitting order:", error);
    showToast("Failed to save order: " + error.message, "error");
  }
}

$(document).ready(function () {
  initializeOrdersTable();
  initializeOrderModal();
});
