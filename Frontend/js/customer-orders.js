const API_BASE = "https://localhost:44383/api";

if (!apiClient.isAuthenticated()) {
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
  try {
    const finalSeverity = severity || getSeverityForAction(action);
    const auditData = {
      user: localStorage.getItem("username") || "admin",
      action,
      module,
      entity,
      details,
      ipAddress: "",
      severity: finalSeverity,
    };
    await apiClient.post("/audit", auditData);
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
}

let ordersTable;
let currentFilters = { status: "", customer: "", dateRange: "" };
const salesOrdersStatusData = {
  statuses: ["Delivered", "Shipped", "Pending", "Confirmed"],
  counts: [65, 8, 4, 2],
};
const salesRevenueData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  revenues: [12000, 15000, 18000, 14000, 20000, 22000],
};

async function initializeOrdersTable() {
  console.log("Initializing customer orders table...");
  ordersTable = $("#customer-orders-table").DataTable({
    serverSide: true,
    ajax: async function (data, callback, settings) {
      try {
        const params = new URLSearchParams({
          draw: data.draw,
          start: data.start,
          length: data.length,
          ...currentFilters,
        });
        if (data.order?.length) {
          params.append("orderColumn", data.columns[data.order[0].column].data);
          params.append("orderDir", data.order[0].dir);
        }
        if (data.search?.value) params.append("search", data.search.value);
        const response = await apiClient.get(
          `/customer-orders?${params.toString()}`,
        );
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
        render: (data, type, row, meta) =>
          type === "display"
            ? meta.row + meta.settings._iDisplayStart + 1
            : data,
      },
      { data: "customerName" },
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

  $("#status-filter, #customer-filter, #date-filter").on("change", function () {
    currentFilters.status = $("#status-filter").val();
    currentFilters.customer = $("#customer-filter").val();
    currentFilters.dateRange = $("#date-filter").val();
    ordersTable.ajax.reload();
  });
  $("#apply-filters").on("click", function () {
    currentFilters.status = $("#status-filter").val();
    currentFilters.customer = $("#customer-filter").val();
    currentFilters.dateRange = $("#date-filter").val();
    ordersTable.ajax.reload();
  });
  $("#clear-filters").on("click", function () {
    $("#status-filter, #customer-filter, #date-filter").val("");
    currentFilters = { status: "", customer: "", dateRange: "" };
    ordersTable.ajax.reload();
  });
  ordersTable.on("draw", async function () {
    await loadChartsData();
  });
  $("#customer-orders-table").on("click", ".edit-btn", function () {
    editOrder($(this).data("id"));
  });
  $("#customer-orders-table").on("click", ".delete-btn", function () {
    deleteOrder($(this).data("id"));
  });
  $("#customer-orders-table").on("click", ".view-btn", function () {
    viewOrder($(this).data("id"));
  });
}

function renderSalesOrdersStatusChart(statusData) {
  const statuses = Object.keys(statusData);
  const counts = Object.values(statusData);
  new ApexCharts(document.querySelector("#sales-orders-status-chart"), {
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
  }).render();
}

function renderSalesRevenueChart() {
  new ApexCharts(document.querySelector("#sales-revenue-chart"), {
    series: [{ name: "Sales Revenue", data: salesRevenueData.revenues }],
    chart: { height: 350, type: "bar", toolbar: { show: false } },
    colors: ["#246dec"],
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: "40%", horizontal: false },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: salesRevenueData.months },
    yaxis: { title: { text: "Revenue ($)" } },
  }).render();
}

async function loadChartsData() {
  try {
    const summaryResponse = await apiClient.get("/customer-orders/summary");
    const summary = await summaryResponse.json();
    updateSummaryCards(summary);
    const statusResponse = await apiClient.get("/customer-orders/chart/status");
    const statusData = await statusResponse.json();
    renderSalesOrdersStatusChart(statusData);
    renderSalesRevenueChart();
  } catch (error) {
    console.error("Error loading charts data:", error);
    showToast("Failed to load chart data: " + error.message, "error");
  }
}

function updateSummaryCards(summary) {
  $("#total-orders").text(summary.totalOrders || 0);
  $("#pending-orders").text(summary.pending || 0);
  $("#delivered-orders").text(summary.delivered || 0);
  $("#total-revenue").text(`$${summary.totalRevenue?.toFixed(2) || "0.00"}`);
}

async function editOrder(orderId) {
  try {
    const response = await apiClient.get(`/customer-orders/${orderId}`);
    const order = await response.json();
    document.getElementById("order-id").value = order.orderId;
    document.getElementById("customer-name").value = order.customerName;
    document.getElementById("order-date").value = order.orderDate.split("T")[0];
    document.getElementById("order-items").value = order.items;
    document.getElementById("order-value").value = order.totalValue;
    document.getElementById("order-status").value = order.status;
    document.getElementById("add-order-modal").dataset.editId = orderId;
    document.getElementById("order-modal-title").textContent =
      "Edit Customer Order";
    document.getElementById("submit-order-btn").textContent = "Update Order";
    document.getElementById("add-order-modal").classList.add("show");
    clearOrderFormErrors();
  } catch (error) {
    console.error("Error loading order:", error);
    showToast("Failed to load order details: " + error.message, "error");
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

      await apiClient.delete(`/customer-orders/${orderId}`);
      ordersTable.ajax.reload();
      loadChartsData();
      showToast("Customer order deleted successfully!", "success");
      logAuditEvent(
        "DELETE",
        "CustomerOrder",
        orderId,
        "Deleted customer order",
      ).catch(console.error);
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast("Failed to delete order: " + error.message, "error");
    }
  }
}

async function viewOrder(orderId) {
  try {
    const response = await apiClient.get(`/customer-orders/${orderId}`);
    const order = await response.json();
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
    document.getElementById("view-order-modal").classList.add("show");
  } catch (error) {
    console.error("Error loading order:", error);
    showToast("Failed to load order details: " + error.message, "error");
  }
}

function initializeOrderModal() {
  const addOrderBtn = document.getElementById("add-order-btn");
  const modal = document.getElementById("add-order-modal");
  const closeModal = document.getElementById("close-order-modal");
  const addOrderForm = document.getElementById("add-order-form");
  const submitOrderBtn = document.getElementById("submit-order-btn");
  const customerSelect = document.getElementById("customer-name");
  const customCustomerInput = document.getElementById("custom-customer");
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
  if (addOrderBtn) {
    addOrderBtn.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.add("show");
      addOrderForm.reset();
      customCustomerInput.style.display = "none";
      customCustomerInput.required = false;
      clearOrderFormErrors();
      delete modal.dataset.editId;
      document.getElementById("order-modal-title").textContent =
        "Add New Customer Order";
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
      if (event.target === viewOrderModal)
        viewOrderModal.classList.remove("show");
    });
  }
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", async function (e) {
      console.log("Submit button click event triggered");
      e.preventDefault();
      await submitOrderForm();
    });
  }
  if (addOrderForm) {
    addOrderForm.addEventListener("submit", async function (e) {
      console.log("Form submit event triggered");
      e.preventDefault();
      await submitOrderForm();
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

async function submitOrderForm() {
  console.log("submitOrderForm called - starting execution");
  try {
    // Check if DataTable is initialized
    if (!ordersTable || typeof ordersTable.ajax.reload !== "function") {
      console.error("DataTable not initialized. Reloading page...");
      window.location.reload();
      return;
    }

    const orderDateValue = document.getElementById("order-date").value;
    const formData = {
      orderId: document.getElementById("order-id").value || "",
      customerName:
        document.getElementById("customer-name").value === "Other"
          ? document.getElementById("custom-customer").value
          : document.getElementById("customer-name").value,
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
      await apiClient.put(`/customer-orders/${editId}`, formData);
      console.log("Update successful!");
      showToast("Customer order updated successfully!", "success");
      logAuditEvent(
        "UPDATE",
        "CustomerOrder",
        editId,
        `Updated customer order for ${formData.customerName}`,
      ).catch(console.error);
    } else {
      console.log("Calling POST API...");
      await apiClient.post("/customer-orders", formData);
      console.log("Create successful!");
      showToast("Customer order created successfully!", "success");
      logAuditEvent(
        "CREATE",
        "CustomerOrder",
        formData.orderId,
        `Created new customer order for ${formData.customerName}`,
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
