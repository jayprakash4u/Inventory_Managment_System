const API_BASE = "https://localhost:44383/api";

if (!apiClient.isAuthenticated()) {
  window.location.href = "login.html";
}

let editingProductId = null;
let currentFilters = { category: "", minPrice: "", maxPrice: "", status: "" };
let table;

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
    const auditData = {
      user: localStorage.getItem("username") || "admin",
      action,
      module,
      entity,
      details,
      ipAddress: "",
      severity: severity || getSeverityForAction(action),
    };
    const response = await apiClient.post("/audit", auditData);
    if (!response.ok) {
      console.error(
        "AUDIT LOG: Failed to log audit event - Status:",
        response.status,
      );
    } else {
      console.log("AUDIT LOG: Event logged successfully:", auditData);
    }
  } catch (error) {
    console.error("AUDIT LOG: Exception while logging audit event:", error);
  }
}

function validateProductForm(formData) {
  const name = formData.get("productName")?.trim();
  const sku = formData.get("sku")?.trim();
  let category = formData.get("category")?.trim();
  const customCategory = formData.get("customCategory")?.trim();
  const quantity = parseInt(formData.get("quantity"));
  const price = parseFloat(formData.get("price"));

  if (!name) {
    ToastNotification?.error("Product name is required.") ||
      alert("Product name is required.");
    return false;
  }
  if (!sku) {
    ToastNotification?.error("SKU is required.") || alert("SKU is required.");
    return false;
  }
  if (!category) {
    ToastNotification?.error("Category is required.") ||
      alert("Category is required.");
    return false;
  }
  if (category === "Other" && !customCategory) {
    ToastNotification?.error(
      "Custom category is required when 'Other' is selected.",
    ) || alert("Custom category is required when 'Other' is selected.");
    return false;
  }
  if (category === "Other") category = customCategory;
  if (isNaN(quantity) || quantity < 0) {
    ToastNotification?.error("Quantity must be a non-negative number.") ||
      alert("Quantity must be a non-negative number.");
    return false;
  }
  if (isNaN(price) || price <= 0) {
    ToastNotification?.error("Price must be a positive number.") ||
      alert("Price must be a positive number.");
    return false;
  }
  return true;
}

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
      ProductName: "product-name",
      Name: "product-name",
      Sku: "product-sku",
      CategoryName: "product-category",
      Category: "product-category",
      Quantity: "product-quantity",
      Price: "product-price",
      Description: "product-description",
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

(async function init() {
  table = $("#products-table").DataTable({
    ajax: {
      url: API_BASE + "/products",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
      data: (d) => {
        d.category = currentFilters.category;
        d.minPrice = currentFilters.minPrice;
        d.maxPrice = currentFilters.maxPrice;
        d.status = currentFilters.status;
      },
      dataSrc: "",
    },
    paging: true,
    searching: true,
    ordering: true,
    info: true,
    processing: true,
    responsive: true,
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50, 100],
    order: [[1, "desc"]],
    dom: '<"table-controls-wrapper"<"table-info"i><"table-search"f>>rt<"table-footer"<"table-length"l><"table-pagination"p>>',
    language: {
      search: "",
      searchPlaceholder: "Search products...",
      lengthMenu: "Show _MENU_",
      info: "_START_ - _END_ of _TOTAL_ products",
      emptyTable: "No products available",
    },
    columns: [
      {
        data: "id",
        render: (data, type, row, meta) =>
          type === "display"
            ? meta.row + meta.settings._iDisplayStart + 1
            : data,
      },
      { data: "name" },
      { data: "categoryName" },
      { data: "quantity" },
      { data: "price", render: (data) => `$${data.toFixed(2)}` },
      {
        data: "quantity",
        render: (data) => {
          const q = parseInt(data);
          const s =
            q === 0
              ? ["out-of-stock", "Out of Stock"]
              : q < 5
                ? ["low-stock", "Low Stock"]
                : ["in-stock", "In Stock"];
          return `<span class="status-badge ${s[0]}">${s[1]}</span>`;
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
  });

  const addProductBtn = document.getElementById("add-product-btn");
  const modal = document.getElementById("add-product-modal");
  const closeModal = document.getElementById("close-modal");
  const addProductForm = document.getElementById("add-product-form");
  const categorySelect = document.getElementById("product-category");
  const customCategoryInput = document.getElementById("custom-category");

  if (categorySelect) {
    categorySelect.addEventListener("change", function () {
      if (this.value === "Other") {
        customCategoryInput.style.display = "block";
        customCategoryInput.required = true;
      } else {
        customCategoryInput.style.display = "none";
        customCategoryInput.required = false;
        customCategoryInput.value = "";
      }
    });
  }

  if (addProductBtn) {
    addProductBtn.addEventListener("click", function () {
      editingProductId = null;
      document.getElementById("modal-title").textContent = "Add New Product";
      document.getElementById("submit-btn").textContent = "Add Product";
      addProductForm.reset();
      customCategoryInput.style.display = "none";
      customCategoryInput.required = false;
      clearFormErrors();
      modal.classList.add("show");
    });
  }

  // Submit button click handler
  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();
      handleFormSubmission();
    });
  }

  // Filter event listeners
  $("#apply-filters").on("click", function () {
    currentFilters.category = $("#filter-category").val();
    currentFilters.minPrice = $("#filter-min-price").val();
    currentFilters.maxPrice = $("#filter-max-price").val();
    currentFilters.status = $("#filter-status").val();
    table.ajax.reload();
    loadCategoryChart();
    loadStockLevelsChart();
  });

  $("#clear-filters").on("click", function () {
    $("#filter-category").val("");
    $("#filter-min-price").val("");
    $("#filter-max-price").val("");
    $("#filter-status").val("");
    currentFilters = { category: "", minPrice: "", maxPrice: "", status: "" };
    table.ajax.reload();
    loadCategoryChart();
    loadStockLevelsChart();
  });

  $("#products-table").on("click", ".edit-btn", function () {
    editProduct($(this).data("id"));
  });
  $("#products-table").on("click", ".delete-btn", function () {
    deleteProduct($(this).data("id"));
  });
  $("#products-table").on("click", ".view-btn", function () {
    viewProduct($(this).data("id"));
  });

  const viewModal = document.getElementById("view-product-modal");
  const closeViewModal = document.getElementById("close-view-modal");
  if (closeViewModal && viewModal)
    closeViewModal.addEventListener("click", (e) => {
      e.preventDefault();
      viewModal.classList.remove("show");
    });
  if (viewModal)
    window.addEventListener("click", (e) => {
      if (e.target === viewModal) viewModal.classList.remove("show");
    });

  async function viewProduct(productId) {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      });
      if (response.ok) {
        const product = await response.json();
        document.getElementById("view-product-id").textContent = product.id;
        document.getElementById("view-product-name").textContent = product.name;
        document.getElementById("view-product-sku").textContent = product.sku;
        document.getElementById("view-product-category").textContent =
          product.categoryName;
        document.getElementById("view-product-quantity").textContent =
          product.quantity;
        document.getElementById("view-product-price").textContent =
          `$${product.price.toFixed(2)}`;
        const q = parseInt(product.quantity);
        const s =
          q === 0
            ? ["out-of-stock", "Out of Stock"]
            : q < 5
              ? ["low-stock", "Low Stock"]
              : ["in-stock", "In Stock"];
        document.getElementById("view-product-status").innerHTML =
          `<span class="status-badge ${s[0]}">${s[1]}</span>`;
        document.getElementById("view-product-description").textContent =
          product.description || "No description";
        document.getElementById("view-product-created").textContent =
          product.createdAt
            ? new Date(product.createdAt).toLocaleString()
            : "N/A";
        document.getElementById("view-product-updated").textContent =
          product.updatedAt
            ? new Date(product.updatedAt).toLocaleString()
            : "N/A";
        viewModal.classList.add("show");
      } else {
        showToast("Failed to load product details", "error");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      showToast("An error occurred while loading the product", "error");
    }
  }

  if (closeModal && modal)
    closeModal.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("show");
    });
  if (modal)
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

  async function handleFormSubmission() {
    clearFormErrors();
    const formData = new FormData(addProductForm);
    if (!validateProductForm(formData)) return;
    let category = formData.get("category");
    if (category === "Other") category = formData.get("customCategory");
    const productData = {
      name: formData.get("productName"),
      sku: formData.get("sku"),
      categoryName: category,
      quantity: parseInt(formData.get("quantity")),
      price: parseFloat(formData.get("price")),
      description: formData.get("description") || "",
    };

    try {
      const url = editingProductId
        ? `${API_BASE}/products/${editingProductId}`
        : `${API_BASE}/products`;
      const method = editingProductId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        if (response.status === 400) {
          try {
            const errorData = await response.json();
            if (errorData.errors) displayValidationErrors(errorData.errors);
          } catch {
            showToast("An error occurred", "error");
          }
        } else {
          showToast("Failed to save product", "error");
        }
        return;
      }

      const savedProduct = await response.json();
      await logAuditEvent(
        editingProductId ? "UPDATE" : "CREATE",
        "Inventory",
        "Product",
        `Product ${savedProduct.name} ${editingProductId ? "updated" : "created"} successfully`,
      );
      modal.classList.remove("show");

      // Check if DataTable is initialized
      if (!table || typeof table.ajax.reload !== "function") {
        console.error("DataTable not initialized. Reloading page...");
        window.location.reload();
        return;
      }

      console.log("Reloading DataTable...");
      table.ajax.reload();
      console.log("DataTable reloaded!");

      // Reload charts
      if (typeof reloadCharts === "function") {
        await reloadCharts();
      }

      showToast(
        `Product ${editingProductId ? "updated" : "added"} successfully`,
        "success",
      );
      editingProductId = null;
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("An error occurred while saving the product", "error");
    }
  }

  async function editProduct(productId) {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      });
      if (response.ok) {
        const product = await response.json();
        editingProductId = productId;
        document.getElementById("modal-title").textContent = "Edit Product";
        document.getElementById("submit-btn").textContent = "Update Product";
        document.getElementById("product-name").value = product.name;
        document.getElementById("product-sku").value = product.sku;
        document.getElementById("product-category").value =
          product.categoryName || "";
        document.getElementById("custom-category").value =
          product.categoryName || "";
        document.getElementById("product-quantity").value = product.quantity;
        document.getElementById("product-price").value = product.price;
        document.getElementById("product-description").value =
          product.description || "";
        customCategoryInput.style.display = product.categoryName
          ? "none"
          : "block";
        customCategoryInput.required = product.categoryName ? false : true;
        clearFormErrors();
        modal.classList.add("show");
      } else {
        showToast("Failed to load product details", "error");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      showToast("An error occurred while loading the product", "error");
    }
  }

  async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      });
      if (response.ok) {
        await logAuditEvent(
          "DELETE",
          "Inventory",
          "Product",
          `Product with ID ${productId} deleted successfully`,
        );

        // Check if DataTable is initialized
        if (!table || typeof table.ajax.reload !== "function") {
          console.error("DataTable not initialized. Reloading page...");
          window.location.reload();
          return;
        }

        console.log("Reloading DataTable after delete...");
        table.ajax.reload();
        console.log("DataTable reloaded!");

        // Reload charts
        if (typeof reloadCharts === "function") {
          await reloadCharts();
        }

        showToast("Product deleted successfully", "success");
      } else {
        showToast("Failed to delete product", "error");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("An error occurred while deleting the product", "error");
    }
  }

  window.handleFormSubmission = handleFormSubmission;

  // Initialize charts after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initCharts());
  } else {
    initCharts();
  }
})();

// Charts initialization
async function initCharts() {
  // Wait for DOM to be fully ready
  await new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve();
    } else {
      window.addEventListener("load", resolve);
    }
  });

  // Additional delay to ensure ApexCharts and DOM are ready
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    await reloadCharts();
  } catch (error) {
    console.error("Error during chart initialization:", error);
  }
}

// Reload all charts
async function reloadCharts() {
  console.log("Reloading charts...");

  // Destroy existing charts
  Object.keys(chartInstances).forEach((chartId) => {
    if (chartInstances[chartId]) {
      try {
        chartInstances[chartId].destroy();
      } catch (error) {
        console.warn(`Error destroying chart ${chartId}:`, error);
      }
      delete chartInstances[chartId];
    }
  });

  // Load fresh chart data
  await loadCategoryChart();
  await loadStockLevelsChart();
  console.log("Charts reloaded!");
}

// Make reloadCharts available globally
window.reloadCharts = reloadCharts;

const chartInstances = {};

function renderChart(chartId, config) {
  const chartElement = document.querySelector(`#${chartId}`);
  if (!chartElement) {
    console.error(`Chart container not found: #${chartId}`);
    // Try to find the element again after a short delay
    setTimeout(() => {
      const retryElement = document.querySelector(`#${chartId}`);
      if (retryElement) {
        console.log(`Found chart container on retry: #${chartId}`);
        renderChartNow(chartId, config);
      } else {
        console.error(
          `Chart container still not found after retry: #${chartId}`,
        );
      }
    }, 500);
    return;
  }

  renderChartNow(chartId, config);
}

function renderChartNow(chartId, config) {
  const chartElement = document.querySelector(`#${chartId}`);
  if (!chartElement) return;

  // Destroy existing chart if it exists
  if (chartInstances[chartId]) {
    try {
      chartInstances[chartId].destroy();
    } catch (error) {
      console.warn(`Error destroying chart ${chartId}:`, error);
    }
    delete chartInstances[chartId];
  }

  // Set explicit dimensions for the chart container
  chartElement.style.width = "100%";
  chartElement.style.minHeight = "350px";

  try {
    console.log(`Rendering chart: ${chartId}`, config);
    const chart = new ApexCharts(chartElement, config);
    chart.render();
    chartInstances[chartId] = chart;
    console.log(`Chart rendered successfully: ${chartId}`);
    return chart;
  } catch (error) {
    console.error(`Error rendering ${chartId} chart:`, error);
    return null;
  }
}

function loadCategoryChart() {
  const url = `${API_BASE}/products/chart/category`;
  console.log("Loading category chart from:", url);

  fetch(url, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
  })
    .then((response) => {
      console.log("Category chart response status:", response.status);
      if (!response.ok) throw new Error("Failed to fetch category chart data");
      return response.json();
    })
    .then((data) => {
      console.log("Category chart data received:", data);
      // data is a Dictionary<string, int> like {"Electronics": 45, "Clothing": 30}
      const categories = Object.keys(data);
      const chartData = Object.values(data);
      console.log("Categories:", categories, "ChartData:", chartData);

      if (categories.length === 0) {
        console.warn("No category data available");
        return;
      }

      const config = {
        series: [{ data: chartData }],
        chart: {
          type: "bar",
          height: 350,
          toolbar: { show: false },
        },
        colors: [
          "#246dec",
          "#cc3c43",
          "#367952",
          "#f5b747",
          "#4f35a1",
          "#e91e63",
          "#00bcd4",
        ],
        plotOptions: {
          bar: {
            borderRadius: 4,
            borderRadiusApplication: "end",
            horizontal: false,
            columnWidth: "50%",
          },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: { categories: categories },
        yaxis: { title: { text: "Total Quantity" } },
      };

      renderChart("inventory-category-chart", config);
    })
    .catch((error) => {
      console.error("Error loading category chart:", error);
      // Use fallback data
      const config = {
        series: [{ data: [45, 30, 25, 20, 15] }],
        chart: {
          type: "bar",
          height: 350,
          toolbar: { show: false },
        },
        colors: ["#246dec", "#cc3c43", "#367952", "#f5b747", "#4f35a1"],
        plotOptions: {
          bar: {
            borderRadius: 4,
            borderRadiusApplication: "end",
            horizontal: false,
            columnWidth: "50%",
          },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: {
          categories: [
            "Electronics",
            "Clothing",
            "Books",
            "Home & Garden",
            "Sports",
          ],
        },
        yaxis: { title: { text: "Total Quantity" } },
      };
      renderChart("inventory-category-chart", config);
    });
}

function loadStockLevelsChart() {
  const url = `${API_BASE}/products/chart/stock-levels`;
  console.log("Loading stock levels chart from:", url);

  fetch(url, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
  })
    .then((response) => {
      console.log("Stock levels chart response status:", response.status);
      if (!response.ok)
        throw new Error("Failed to fetch stock levels chart data");
      return response.json();
    })
    .then((data) => {
      console.log("Stock levels chart data received:", data);
      // data is a Dictionary<string, int> like {"In Stock": 229, "Low Stock": 15, "Out of Stock": 5}
      const labels = ["In Stock", "Low Stock", "Out of Stock"];
      const chartData = labels.map((label) => data[label] || 0);
      console.log("Stock levels:", labels, "Data:", chartData);

      const config = {
        series: chartData,
        chart: {
          height: 350,
          type: "donut",
          toolbar: { show: false },
        },
        labels: labels,
        colors: ["#367952", "#f5b747", "#cc3c43"],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: { width: 200 },
              legend: { position: "bottom" },
            },
          },
        ],
        legend: {
          position: "bottom",
        },
      };

      renderChart("stock-levels-chart", config);
    })
    .catch((error) => {
      console.error("Error loading stock levels chart:", error);
      // Use fallback data
      const config = {
        series: [229, 15, 5],
        chart: {
          height: 350,
          type: "donut",
          toolbar: { show: false },
        },
        labels: ["In Stock", "Low Stock", "Out of Stock"],
        colors: ["#367952", "#f5b747", "#cc3c43"],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: { width: 200 },
              legend: { position: "bottom" },
            },
          },
        ],
        legend: {
          position: "bottom",
        },
      };
      renderChart("stock-levels-chart", config);
    });
}
