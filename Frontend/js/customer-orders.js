// Customer orders page JavaScript

// Base URL of your backend API
const API_BASE = "https://localhost:44383/api";

/* ===============================
    AUTHENTICATION CHECK
 =============================== */
if (!apiClient.isAuthenticated()) {
  window.location.href = "login.html";
}

// Function to determine severity based on action type
function getSeverityForAction(action) {
  switch (action.toUpperCase()) {
    case "DELETE":
      return "high";
    case "CREATE":
    case "UPDATE":
    case "VIEW":
    default:
      return "low"; // Normal operations are low severity
  }
}

// Function to log audit events
async function logAuditEvent(action, module, entity, details, severity = null) {
  try {
    // Use provided severity or determine based on action
    const finalSeverity = severity || getSeverityForAction(action);

    const auditData = {
      user: localStorage.getItem("username") || "admin", // Get username from localStorage
      action: action,
      module: module,
      entity: entity,
      details: details,
      ipAddress: "", // Can be left empty or get from API
      severity: finalSeverity,
    };

    console.log("🔍 AUDIT LOG: Attempting to log audit event:", auditData);

    try {
      await apiClient.post("/audit", auditData);
      console.log("✅ AUDIT LOG: Successfully logged audit event");
    } catch (error) {
      console.error("❌ AUDIT LOG: Failed to log audit event:", error.message);
    }
  } catch (error) {
    console.error("❌ AUDIT LOG: Exception while logging audit event:", error);
  }
}

// DataTable instance
let ordersTable;

// Current filters
let currentFilters = {
  status: "",
  customer: "",
  dateRange: "",
};

// Sample data for charts
const salesOrdersStatusData = {
  statuses: ["Delivered", "Shipped", "Pending", "Confirmed"],
  counts: [65, 8, 4, 2],
};

const salesRevenueData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  revenues: [12000, 15000, 18000, 14000, 20000, 22000],
};

// Initialize DataTable
async function initializeOrdersTable() {
  ordersTable = $("#customer-orders-table").DataTable({
    serverSide: true,
    ajax: async function (data, callback, settings) {
      try {
        // Build query parameters
        const params = new URLSearchParams({
          draw: data.draw,
          start: data.start,
          length: data.length,
          ...currentFilters,
        });

        // Add sorting if present
        if (data.order && data.order.length > 0) {
          const order = data.order[0];
          params.append("orderColumn", data.columns[order.column].data);
          params.append("orderDir", order.dir);
        }

        // Add search if present
        if (data.search && data.search.value) {
          params.append("search", data.search.value);
        }

        const url = `/customer-orders?${params.toString()}`;
        const response = await apiClient.get(url);
        const result = await response.json();

        callback({
          draw: result.draw,
          recordsTotal: result.recordsTotal,
          recordsFiltered: result.recordsFiltered,
          data: result.data,
        });
      } catch (error) {
        console.error("DataTable ajax error:", error);
        showToast("Failed to load customer orders: " + error.message, "error");
        callback({
          draw: data.draw,
          recordsTotal: 0,
          recordsFiltered: 0,
          data: [],
        });
      }
    },
    columns: [
      {
        data: "orderId",
        render: (data, type, row, meta) => {
          if (type === "display") {
            return meta.row + meta.settings._iDisplayStart + 1;
          }
          return data;
        },
      },
      { data: "customerName" },
      {
        data: "orderDate",
        render: (data) => new Date(data).toLocaleDateString(),
      },
      { data: "items" },
      {
        data: "totalValue",
        render: (data) => `$${data.toFixed(2)}`,
      },
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
    order: [[2, "desc"]], // Default sort by date DESC
    language: {
      search: "",
      searchPlaceholder: "Search orders...",
      lengthMenu: "Show _MENU_",
      info: "_START_ - _END_ of _TOTAL_ orders",
      emptyTable: "No orders available",
    },

    // Custom DOM layout for better space utilization
    dom: '<"table-controls-wrapper"<"table-info"i><"table-search"f>>rt<"table-footer"<"table-length"l><"table-pagination"p>>',
  });

  // Handle filter changes
  $("#status-filter, #customer-filter, #date-filter").on("change", function () {
    currentFilters.status = $("#status-filter").val();
    currentFilters.customer = $("#customer-filter").val();
    currentFilters.dateRange = $("#date-filter").val();
    ordersTable.ajax.reload();
  });

  // Handle apply filters button
  $("#apply-filters").on("click", function () {
    currentFilters.status = $("#status-filter").val();
    currentFilters.customer = $("#customer-filter").val();
    currentFilters.dateRange = $("#date-filter").val();
    ordersTable.ajax.reload();
  });

  // Handle clear filters button
  $("#clear-filters").on("click", function () {
    $("#status-filter, #customer-filter, #date-filter").val("");
    currentFilters = { status: "", customer: "", dateRange: "" };
    ordersTable.ajax.reload();
  });

  // Update summary and charts on table draw
  ordersTable.on("draw", async function () {
    await loadChartsData();
  });

  // Event delegation for edit, delete, and view
  $("#customer-orders-table").on("click", ".edit-btn", function () {
    const orderId = $(this).data("id");
    editOrder(orderId);
  });

  $("#customer-orders-table").on("click", ".delete-btn", function () {
    const orderId = $(this).data("id");
    deleteOrder(orderId);
  });

  $("#customer-orders-table").on("click", ".view-btn", function () {
    const orderId = $(this).data("id");
    viewOrder(orderId);
  });
}

// Render sales orders by status chart
function renderSalesOrdersStatusChart(statusData) {
  const statuses = Object.keys(statusData);
  const counts = Object.values(statusData);

  const config = {
    series: counts,
    chart: {
      type: "pie",
      height: 350,
      toolbar: { show: false },
    },
    labels: statuses.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    colors: ["#246dec", "#cc3c43", "#367952", "#f5b747"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: "bottom" },
        },
      },
    ],
  };
  const chart = new ApexCharts(
    document.querySelector("#sales-orders-status-chart"),
    config,
  );
  chart.render();
}

// Render monthly sales revenue chart
function renderSalesRevenueChart() {
  const config = {
    series: [
      {
        name: "Sales Revenue",
        data: salesRevenueData.revenues,
      },
    ],
    chart: {
      height: 350,
      type: "bar",
      toolbar: { show: false },
    },
    colors: ["#246dec"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "40%",
        horizontal: false,
      },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: salesRevenueData.months },
    yaxis: { title: { text: "Revenue ($)" } },
  };
  const chart = new ApexCharts(
    document.querySelector("#sales-revenue-chart"),
    config,
  );
  chart.render();
}

// Load and render charts
async function loadChartsData() {
  try {
    // Load orders summary
    const summaryResponse = await apiClient.get("/customer-orders/summary");
    const summary = await summaryResponse.json();
    updateSummaryCards(summary);

    // Load orders by status for chart
    const statusResponse = await apiClient.get("/customer-orders/chart/status");
    const statusData = await statusResponse.json();
    renderSalesOrdersStatusChart(statusData);

    // For now, keep sample data for sales revenue chart
    // In a real implementation, you'd create an API endpoint for this
    renderSalesRevenueChart();
  } catch (error) {
    console.error("Error loading charts data:", error);
    showToast("Failed to load chart data: " + error.message, "error");
  }
}

// Update summary cards
function updateSummaryCards(summary) {
  $("#total-orders").text(summary.totalOrders || 0);
  $("#pending-orders").text(summary.pending || 0);
  $("#delivered-orders").text(summary.delivered || 0);
  $("#total-revenue").text(`$${summary.totalRevenue?.toFixed(2) || "0.00"}`);
}

// Edit order function
async function editOrder(orderId) {
  try {
    const response = await apiClient.get(`/customer-orders/${orderId}`);
    const order = await response.json();

    // Populate modal with order data
    document.getElementById("order-id").value = order.orderId;
    document.getElementById("customer-name").value = order.customerName;
    document.getElementById("order-date").value = order.orderDate.split("T")[0];
    document.getElementById("order-items").value = order.items;
    document.getElementById("order-value").value = order.totalValue;
    document.getElementById("order-status").value = order.status;

    // Set edit mode
    document.getElementById("add-order-modal").dataset.editId = orderId;
    document.getElementById("order-modal-title").textContent =
      "Edit Customer Order";
    document.getElementById("submit-order-btn").textContent = "Update Order";

    // Show modal
    document.getElementById("add-order-modal").classList.add("show");
    clearOrderFormErrors();
  } catch (error) {
    console.error("Error loading order:", error);
    showToast("Failed to load order details: " + error.message, "error");
  }
}

// Delete order function
async function deleteOrder(orderId) {
  if (confirm("Are you sure you want to delete this order?")) {
    try {
      await apiClient.delete(`/customer-orders/${orderId}`);

      // Refresh table and charts
      ordersTable.ajax.reload();
      loadChartsData();
      showToast("Customer order deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast("Failed to delete order: " + error.message, "error");
    }
  }
}

// View order function
async function viewOrder(orderId) {
  try {
    const response = await apiClient.get(`/customer-orders/${orderId}`);
    const order = await response.json();

    // Populate modal with order data
    document.getElementById("view-order-id").textContent = order.id;
    document.getElementById("view-order-orderid").textContent = order.orderId;
    document.getElementById("view-order-customer").textContent =
      order.customerName;
    document.getElementById("view-order-date").textContent = new Date(
      order.orderDate,
    ).toLocaleDateString();
    document.getElementById("view-order-items").textContent = order.items;
    document.getElementById("view-order-value").textContent =
      `$${order.totalValue.toFixed(2)}`;

    // Status badge
    const statusClasses = {
      pending: "status-badge status-pending",
      approved: "status-badge status-approved",
      shipped: "status-badge status-shipped",
      delivered: "status-badge status-delivered",
    };
    document.getElementById("view-order-status").innerHTML =
      `<span class="${statusClasses[order.status] || "status-badge"}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>`;

    document.getElementById("view-order-created").textContent = order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : "N/A";
    document.getElementById("view-order-updated").textContent = order.updatedAt
      ? new Date(order.updatedAt).toLocaleString()
      : "N/A";

    // Show modal
    document.getElementById("view-order-modal").classList.add("show");
  } catch (error) {
    console.error("Error loading order:", error);
    showToast("Failed to load order details: " + error.message, "error");
  }
}

// Initialize modal functionality
function initializeOrderModal() {
  const addOrderBtn = document.getElementById("add-order-btn");
  const modal = document.getElementById("add-order-modal");
  const closeModal = document.getElementById("close-order-modal");
  const addOrderForm = document.getElementById("add-order-form");
  const submitOrderBtn = document.getElementById("submit-order-btn");
  const customerSelect = document.getElementById("customer-name");
  const customCustomerInput = document.getElementById("custom-customer");

  // Handle customer select change
  if (customerSelect) {
    customerSelect.addEventListener("change", function () {
      if (this.value === "Other") {
        customCustomerInput.style.display = "block";
        customCustomerInput.required = true;
      } else {
        customCustomerInput.style.display = "none";
        customCustomerInput.required = false;
        customCustomerInput.value = "";
      }
    });
  }

  // Open modal
  if (addOrderBtn) {
    addOrderBtn.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.add("show");
      addOrderForm.reset();
      customCustomerInput.style.display = "none";
      customCustomerInput.required = false;
      clearOrderFormErrors();

      // Reset to add mode
      delete modal.dataset.editId;
      document.getElementById("order-modal-title").textContent =
        "Add New Customer Order";
      document.getElementById("submit-order-btn").textContent = "Create Order";

      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      document.getElementById("order-date").value = today;
    });
  }

  // Close modal
  if (closeModal) {
    closeModal.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.remove("show");
    });
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  }

  // View modal close handler
  const viewOrderModal = document.getElementById("view-order-modal");
  const closeViewOrderModal = document.getElementById("close-view-order-modal");

  if (closeViewOrderModal && viewOrderModal) {
    closeViewOrderModal.addEventListener("click", function (event) {
      event.preventDefault();
      viewOrderModal.classList.remove("show");
    });
  }

  if (viewOrderModal) {
    window.addEventListener("click", function (event) {
      if (event.target === viewOrderModal) {
        viewOrderModal.classList.remove("show");
      }
    });
  }

  // Handle form submission
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      await submitOrderForm();
    });
  }

  // Handle form submission on Enter key
  if (addOrderForm) {
    addOrderForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      await submitOrderForm();
    });
  }
}

// Clear form error messages
function clearOrderFormErrors() {
  const errorElements = document.querySelectorAll(
    "#add-order-modal .error-message",
  );
  errorElements.forEach((element) => {
    element.textContent = "";
  });
}

// Validate order form
function validateOrderForm(formData) {
  const orderId = formData.get("orderId")?.trim();
  let customerName = formData.get("customerName")?.trim();
  const customCustomer = formData.get("customCustomer")?.trim();
  const orderDate = formData.get("orderDate");
  const items = formData.get("items")?.trim();
  const totalValue = parseFloat(formData.get("totalValue"));
  const status = formData.get("status")?.trim();

  if (!orderId) {
    document.getElementById("order-id-error").textContent =
      "Order ID is required.";
    return false;
  }

  if (!customerName) {
    document.getElementById("customer-name-error").textContent =
      "Customer name is required.";
    return false;
  }

  if (customerName === "Other") {
    if (!customCustomer) {
      document.getElementById("customer-name-error").textContent =
        "Custom customer name is required.";
      return false;
    }
    customerName = customCustomer;
  }

  if (!orderDate) {
    document.getElementById("order-date-error").textContent =
      "Order date is required.";
    return false;
  }

  if (!items) {
    document.getElementById("order-items-error").textContent =
      "Items description is required.";
    return false;
  }

  if (isNaN(totalValue) || totalValue <= 0) {
    document.getElementById("order-value-error").textContent =
      "Total value must be a positive number.";
    return false;
  }

  if (!status) {
    document.getElementById("order-status-error").textContent =
      "Status is required.";
    return false;
  }

  return true;
}

// Submit order form
async function submitOrderForm() {
  const form = document.getElementById("add-order-form");
  const formData = new FormData(form);
  const modal = document.getElementById("add-order-modal");
  const isEdit = modal.dataset.editId;

  // Handle custom customer
  const customerSelect = document.getElementById("customer-name");
  const customCustomerInput = document.getElementById("custom-customer");

  if (customerSelect.value === "Other") {
    formData.set("customerName", customCustomerInput.value);
  }

  if (!validateOrderForm(formData)) {
    return;
  }

  const orderData = {
    orderId: formData.get("orderId"),
    customerName: formData.get("customerName"),
    orderDate: formData.get("orderDate"),
    items: formData.get("items"),
    totalValue: parseFloat(formData.get("totalValue")),
    status: formData.get("status"),
  };

  try {
    let response;
    if (isEdit) {
      // Update existing order
      response = await fetch(`${API_BASE}/customer-orders/${isEdit}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(orderData),
      });
    } else {
      // Create new order
      response = await fetch(`${API_BASE}/customer-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(orderData),
      });
    }

    if (response.ok) {
      modal.classList.remove("show");

      // Refresh table and charts
      ordersTable.ajax.reload();
      loadChartsData();

      const message = isEdit
        ? "Customer order updated successfully!"
        : "Customer order created successfully!";
      showToast(message, "success");

      // Log audit event with appropriate severity
      const auditAction = isEdit ? "UPDATE" : "CREATE";
      await logAuditEvent(
        auditAction,
        "Customer Orders",
        "CustomerOrder",
        `${isEdit ? "Updated" : "Created"} customer order ${orderData.orderId}`,
      );
    } else {
      const error = await response.json();
      showToast(
        error.message || `Failed to ${isEdit ? "update" : "create"} order`,
        "error",
      );
    }
  } catch (error) {
    console.error(`Error ${isEdit ? "updating" : "creating"} order:`, error);
    showToast(
      `An error occurred while ${isEdit ? "updating" : "creating"} the order`,
      "error",
    );
  }
}

// Toast notification function
function showToast(message, type = "info") {
  // Create toast element if it doesn't exist
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

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

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  initializeOrdersTable();
  initializeOrderModal();
});
