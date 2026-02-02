if (!apiClient.isAuthenticated()) {
  window.location.href = "login.html";
}

$(document).ready(function () {
  loadProducts();
  $("#addBtn").on("click", addProduct);
  $("#productTable").on("click", ".edit-btn", function () {
    updateProduct($(this).data("id"));
  });
  $("#productTable").on("click", ".delete-btn", function () {
    deleteProduct($(this).data("id"));
  });
});

async function loadProducts() {
  try {
    const response = await apiClient.get("/products");
    const products = await response.json();
    const tbody = $("#tbody");
    tbody.empty();

    products.forEach((product) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${product.id}</td>
        <td><input class="edit-name" data-id="${product.id}" value="${product.name}"></td>
        <td><input type="number" class="edit-price" data-id="${product.id}" value="${product.price}"></td>
        <td>
          <button class="edit-btn" data-id="${product.id}">Edit</button>
          <button class="delete-btn" data-id="${product.id}">Delete</button>
        </td>
      `;
      tbody.append(tr);
    });
  } catch (error) {
    console.error("Load products error:", error);
    ToastNotification?.error("Load failed: " + error.message) ||
      alert("Load failed: " + error.message);
  }
}

async function addProduct() {
  const name = $("#add-name").val().trim();
  const price = parseFloat($("#add-price").val());

  if (!name) {
    ToastNotification?.error("Product name is required") ||
      alert("Product name is required");
    return;
  }
  if (isNaN(price) || price <= 0) {
    ToastNotification?.error("Valid price is required") ||
      alert("Valid price is required");
    return;
  }

  try {
    await apiClient.post("/products", { name, price });
    $("#add-name").val("");
    $("#add-price").val("");
    loadProducts();
  } catch (error) {
    console.error("Add product error:", error);
    ToastNotification?.error("Add failed: " + error.message) ||
      alert("Add failed: " + error.message);
  }
}

async function updateProduct(id) {
  const name = $(`.edit-name[data-id="${id}"]`).val().trim();
  const price = parseFloat($(`.edit-price[data-id="${id}"]`).val());

  if (!name) {
    ToastNotification?.error("Product name is required") ||
      alert("Product name is required");
    return;
  }
  if (isNaN(price) || price <= 0) {
    ToastNotification?.error("Valid price is required") ||
      alert("Valid price is required");
    return;
  }

  try {
    await apiClient.put(`/products/${id}`, { id, name, price });
    loadProducts();
  } catch (error) {
    console.error("Update product error:", error);
    alert("Update failed: " + error.message);
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    await apiClient.delete(`/products/${id}`);
    loadProducts();
  } catch (error) {
    console.error("Delete product error:", error);
    alert("Delete failed: " + error.message);
  }
}
