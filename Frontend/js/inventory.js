// ===============================
// Inventory page JavaScript
// ===============================

// Base URL of your backend API
// All product-related requests will use this
const API_BASE = "https://localhost:44383/api";

const token = localStorage.getItem("token");

// Function to determine severity based on action type
function getSeverityForAction(action) {
  switch (action.toUpperCase()) {
    case "DELETE":
      return "high"; // Deletions are high severity
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

    const response = await fetch(`${API_BASE}/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(auditData),
    });

    console.log(
      "🔍 AUDIT LOG: API Response:",
      response.status,
      response.statusText,
    );

    if (response.ok) {
      console.log("✅ AUDIT LOG: Successfully logged audit event");
    } else {
      console.error(
        "❌ AUDIT LOG: Failed to log audit event - Status:",
        response.status,
      );
      const errorText = await response.text();
      console.error("❌ AUDIT LOG: Error details:", errorText);
    }
  } catch (error) {
    console.error("❌ AUDIT LOG: Exception while logging audit event:", error);
  }
}

if (!token) {
  window.location.href = "login.html";
}

// Track if we are editing a product
let editingProductId = null;

// Current filters
let currentFilters = {
  category: "",
  minPrice: "",
  maxPrice: "",
  status: "",
};

// DataTable instance
let table;

// Charts instances
let categoryChart;
let stockChart;

//---------- Validation function for add/edit product form------->
function validateProductForm(formData) {
  const name = formData.get("productName")?.trim();
  const sku = formData.get("sku")?.trim();
  let category = formData.get("category")?.trim();
  const customCategory = formData.get("customCategory")?.trim();
  const quantity = parseInt(formData.get("quantity"));
  const price = parseFloat(formData.get("price"));

  if (!name) {
    alert("Product name is required.");
    return false;
  }
  if (!sku) {
    alert("SKU is required.");
    return false;
  }
  if (!category) {
    alert("Category is required.");
    return false;
  }
  if (category === "Other") {
    if (!customCategory) {
      alert("Custom category is required when 'Other' is selected.");
      return false;
    }
    category = customCategory;
  }
  if (isNaN(quantity) || quantity < 0) {
    alert("Quantity must be a non-negative number.");
    return false;
  }
  if (isNaN(price) || price <= 0) {
    alert("Price must be a positive number.");
    return false;
  }
  return true;
}
// <--------------validation end--------->

// ---------Toast notification function------>
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
          ProductName: "product-name",
          Name: "product-name",
          Sku: "product-sku",
          CategoryName: "product-category",
          Category: "product-category",
          Quantity: "product-quantity",
          Price: "product-price",
          Description: "product-description",
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
  table = $("#products-table").DataTable({
    ajax: {
      url: API_BASE + "/products",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      dataSrc: "",
    },

    /* ===============================
         DEFAULT DATATABLE FEATURES
     ================================ */
    paging: true, // Pagination
    searching: true, // Global search
    ordering: true, // Column sorting
    info: true, // Info text
    processing: true, // Processing indicator
    responsive: true, // Responsive table

    pageLength: 10, // Default rows per page
    lengthMenu: [5, 10, 25, 50, 100],

    order: [[1, "desc"]], // Default sort by ID DESC

    // Custom DOM layout for better space utilization
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
        render: (data, type, row, meta) => {
          if (type === "display") {
            return meta.row + meta.settings._iDisplayStart + 1;
          }
          return data;
        },
      },
      { data: "name" },
      { data: "categoryName" },
      { data: "quantity" },
      {
        data: "price",
        render: (data) => `$${data.toFixed(2)}`,
      },
      {
        data: "quantity",
        render: (data, type, row) => {
          const quantity = parseInt(data);
          let statusClass = "out-of-stock";
          let statusText = "Out of Stock";
          if (quantity > 0 && quantity < 5) {
            statusClass = "low-stock";
            statusText = "Low Stock";
          } else if (quantity >= 5) {
            statusClass = "in-stock";
            statusText = "In Stock";
          }
          return `<span class="status-badge ${statusClass}">${statusText}</span>`;
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

  // Get references to UI elements
  const addProductBtn = document.getElementById("add-product-btn");
  const modal = document.getElementById("add-product-modal");
  const closeModal = document.getElementById("close-modal");
  const addProductForm = document.getElementById("add-product-form");
  const categorySelect = document.getElementById("product-category");
  const customCategoryInput = document.getElementById("custom-category");

  // Handle category select change
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

  // ===============================
  // Open "Add Product" modal
  // ===============================
  if (addProductBtn) {
    addProductBtn.addEventListener("click", function () {
      editingProductId = null;
      document.getElementById("modal-title").textContent = "Add New Product";
      document.getElementById("submit-btn").textContent = "Add Product";
      addProductForm.reset(); // Clear old values
      customCategoryInput.style.display = "none";
      customCategoryInput.required = false;
      clearFormErrors(); // Clear any previous errors
      modal.classList.add("show"); // Show modal
    });
  }

  // Event delegation for edit, delete, and view
  $("#products-table").on("click", ".edit-btn", function () {
    const productId = $(this).data("id");
    editProduct(productId);
  });

  $("#products-table").on("click", ".delete-btn", function () {
    const productId = $(this).data("id");
    deleteProduct(productId);
  });

  $("#products-table").on("click", ".view-btn", function () {
    const productId = $(this).data("id");
    viewProduct(productId);
  });

  // View modal close handler
  const viewModal = document.getElementById("view-product-modal");
  const closeViewModal = document.getElementById("close-view-modal");

  if (closeViewModal && viewModal) {
    closeViewModal.addEventListener("click", function (event) {
      event.preventDefault();
      viewModal.classList.remove("show");
    });
  }

  if (viewModal) {
    window.addEventListener("click", function (event) {
      if (event.target === viewModal) {
        viewModal.classList.remove("show");
      }
    });
  }

  // View product function
  async function viewProduct(productId) {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (response.ok) {
        const product = await response.json();

        // Populate modal with product data
        document.getElementById("view-product-id").textContent = product.id;
        document.getElementById("view-product-name").textContent = product.name;
        document.getElementById("view-product-sku").textContent = product.sku;
        document.getElementById("view-product-category").textContent =
          product.categoryName;
        document.getElementById("view-product-quantity").textContent =
          product.quantity;
        document.getElementById("view-product-price").textContent =
          `$${product.price.toFixed(2)}`;

        // Status badge
        const quantity = parseInt(product.quantity);
        let statusClass = "out-of-stock";
        let statusText = "Out of Stock";
        if (quantity > 0 && quantity < 5) {
          statusClass = "low-stock";
          statusText = "Low Stock";
        } else if (quantity >= 5) {
          statusClass = "in-stock";
          statusText = "In Stock";
        }
        document.getElementById("view-product-status").innerHTML =
          `<span class="status-badge ${statusClass}">${statusText}</span>`;

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

        // Show modal
        viewModal.classList.add("show");
      } else {
        showToast("Failed to load product details", "error");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      showToast("An error occurred while loading the product", "error");
    }
  }

  // ===============================
  // Close modal using close (X) button
  // ===============================
  if (closeModal && modal) {
    closeModal.addEventListener("click", function (event) {
      event.preventDefault();
      modal.classList.remove("show");
    });
  }

  // ===============================
  // Close modal when clicking outside it
  // ===============================
  if (modal) {
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.classList.remove("show");
      }
    });
  }

  // ===============================
  // Handle form submission
  // ===============================
  async function handleFormSubmission() {
    // Clear previous error messages
    clearFormErrors();

    // Read form values
    const formData = new FormData(addProductForm);

    // Validate form
    if (!validateProductForm(formData)) {
      return; // Stop if validation fails
    }

    // Create product object to send to API
    let category = formData.get("category");
    if (category === "Other") {
      category = formData.get("customCategory");
    }
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

      // Send request to save/update product
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(productData),
      });

      // Handle API errors
      if (!response.ok) {
        if (response.status === 400) {
          // Try to parse validation errors
          try {
            const errorData = await response.json();
            if (errorData.errors) {
              displayValidationErrors(errorData.errors);
              return; // Don't show alert, errors are displayed in form
            }
          } catch (parseError) {
            // If parsing fails, fall back to text
          }
        }

        const errorText = await response.text();
        throw new Error(
          `Failed to ${
            editingProductId ? "update" : "save"
          } product: ${errorText}`,
        );
      }

      // Reload table after saving
      table.ajax.reload(null, false);

      // Log audit event with appropriate severity
      const auditAction = editingProductId ? "UPDATE" : "CREATE";
      const auditDetails = editingProductId
        ? `Updated product: ${productData.name}`
        : `Added new product: ${productData.name}`;
      await logAuditEvent(
        auditAction,
        "Inventory",
        `Product ${editingProductId || "new"}`,
        auditDetails,
      );

      // Show success toast
      const action = editingProductId ? "updated" : "added";
      showToast(`Product ${action} successfully!`, "success");

      // Close modal and reset form
      modal.classList.remove("show");
      addProductForm.reset();
      editingProductId = null;
    } catch (error) {
      console.error(
        `Error ${editingProductId ? "updating" : "saving"} product:`,
        error,
      );
      alert(error.message);
    }
  }

  //-------- Update summary cards from server----------->
  async function updateSummaryCards() {
    try {
      const response = await fetch(`${API_BASE}/products/summary`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.ok) {
        const data = await response.json();
        document.getElementById("total-products").textContent =
          data.totalProducts;
        document.getElementById("low-stock").textContent = data.lowStock;
        document.getElementById("out-of-stock").textContent = data.outOfStock;
        document.getElementById("total-value").textContent =
          `$${data.totalValue.toFixed(2)}`;
      } else {
        console.error("Failed to fetch summary data");
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }
  //--------------End summary Card--------->

  // ---------Update charts------------>
  async function updateCharts() {
    try {
      // Category chart
      const categoryResponse = await fetch(
        `${API_BASE}/products/chart/category`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        const categoryLabels = Object.keys(categoryData);
        const categoryValues = Object.values(categoryData);

        if (categoryChart) {
          categoryChart.destroy();
        }
        categoryChart = new ApexCharts(
          document.querySelector("#inventory-category-chart"),
          {
            series: categoryValues,
            chart: { type: "pie", height: 300 },
            labels: categoryLabels,
            title: { text: "Products by Category" },
          },
        );
        categoryChart.render();
      }

      // Stock levels chart
      const stockResponse = await fetch(
        `${API_BASE}/products/chart/stock-levels`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();

        if (stockChart) {
          stockChart.destroy();
        }
        stockChart = new ApexCharts(
          document.querySelector("#stock-levels-chart"),
          {
            series: [
              {
                name: "Products",
                data: [
                  stockData["In Stock"],
                  stockData["Low Stock"],
                  stockData["Out of Stock"],
                ],
              },
            ],
            chart: { type: "bar", height: 300 },
            xaxis: { categories: ["In Stock", "Low Stock", "Out of Stock"] },
            title: { text: "Stock Levels" },
          },
        );
        stockChart.render();
      }
    } catch (error) {
      console.error("Error updating charts:", error);
    }
  }
  //---------------End Charts-------------->

  // ===============================
  // Handle Add Product form submission
  // ===============================
  if (addProductForm) {
    // Handle form submission via submit button click (since it's now a link)
    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", async function (event) {
        event.preventDefault();
        await handleFormSubmission();
      });
    }

    // Also handle form submit event for Enter key
    addProductForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      await handleFormSubmission();
    });
  }

  // Initialize summary cards and charts after data loads
  table.on("draw", async function () {
    await updateSummaryCards();
    await updateCharts();
  });

  // Initial load
  await updateSummaryCards();
  await updateCharts();

  //-------------FILTERS------------------>

  // Filter event listeners
  document
    .getElementById("apply-filters")
    .addEventListener("click", applyFilters);
  document
    .getElementById("clear-filters")
    .addEventListener("click", clearFilters);
})();

// ===============================
// Filter functions
// ===============================
async function applyFilters() {
  currentFilters.category = document.getElementById("filter-category").value;
  currentFilters.minPrice = document.getElementById("filter-min-price").value;
  currentFilters.maxPrice = document.getElementById("filter-max-price").value;
  currentFilters.status = document.getElementById("filter-status").value;

  // Build URL with filters
  let url = API_BASE + "/products";
  const params = [];
  if (currentFilters.category)
    params.push(`category=${encodeURIComponent(currentFilters.category)}`);
  if (currentFilters.minPrice)
    params.push(`minPrice=${currentFilters.minPrice}`);
  if (currentFilters.maxPrice)
    params.push(`maxPrice=${currentFilters.maxPrice}`);
  if (currentFilters.status)
    params.push(`status=${encodeURIComponent(currentFilters.status)}`);
  if (params.length > 0) url += "?" + params.join("&");

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (response.ok) {
      const data = await response.json();
      table.clear();
      table.rows.add(data);
      table.draw();
    } else {
      console.error("Failed to fetch filtered data");
    }
  } catch (error) {
    console.error("Error fetching filtered data:", error);
  }
}

async function clearFilters() {
  document.getElementById("filter-category").value = "";
  document.getElementById("filter-min-price").value = "";
  document.getElementById("filter-max-price").value = "";
  document.getElementById("filter-status").value = "";

  currentFilters = {
    category: "",
    minPrice: "",
    maxPrice: "",
    status: "",
  };

  // Reload with no filters
  const url = API_BASE + "/products";
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (response.ok) {
      const data = await response.json();
      table.clear();
      table.rows.add(data);
      table.draw();
    } else {
      console.error("Failed to fetch data");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//-------------------END FILTERS------------->

// ===============================
// Edit product
// ===============================
async function editProduct(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (!response.ok) throw new Error("Failed to load product");
    const product = await response.json();

    editingProductId = id;
    document.getElementById("modal-title").textContent = "Edit Product";
    document.getElementById("submit-btn").textContent = "Update Product";
    clearFormErrors(); // Clear any previous errors

    // Fill form
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-sku").value = product.sku;
    const categorySelect = document.getElementById("product-category");
    const customCategoryInput = document.getElementById("custom-category");
    const predefinedCategories = [
      "Electronics",
      "Clothing",
      "Books",
      "Home & Garden",
      "Sports",
    ];
    if (predefinedCategories.includes(product.categoryName)) {
      categorySelect.value = product.categoryName;
      customCategoryInput.style.display = "none";
      customCategoryInput.required = false;
      customCategoryInput.value = "";
    } else {
      categorySelect.value = "Other";
      customCategoryInput.style.display = "block";
      customCategoryInput.required = true;
      customCategoryInput.value = product.categoryName;
    }
    document.getElementById("product-quantity").value = product.quantity;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-description").value = product.description;

    document.getElementById("add-product-modal").classList.add("show");
  } catch (error) {
    console.error("Error loading product for edit:", error);
    alert("Failed to load product for editing.");
  }
}

// ===============================
// Delete product
// ===============================
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete product: ${errorText}`);
    }

    // Log audit event
    await logAuditEvent(
      "delete",
      "inventory",
      `Product ${id}`,
      `Deleted product with ID ${id}`,
    );

    table.ajax.reload(null, false); // Reload table
    showToast("Product deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting product:", error);
    alert(error.message);
  }
}
