const apiUrl = "https://localhost:44383/api/products";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

/* ===============================
   COMMON FETCH HEADERS
=============================== */
const authHeaders = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + token,
};

/* ===============================
   DOCUMENT READY
=============================== */
$(document).ready(function () {
  loadProducts();

  $("#addBtn").on("click", addProduct);

  // Event delegation for dynamic elements
  $("#productTable").on("click", ".edit-btn", function () {
    updateProduct($(this).data("id"));
  });

  $("#productTable").on("click", ".delete-btn", function () {
    deleteProduct($(this).data("id"));
  });
});

/* ===============================
   LOAD PRODUCTS
=============================== */
async function loadProducts() {
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const products = await response.json();
    const tbody = $("#tbody");
    tbody.empty();

    products.forEach((product) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = product.id;
      tr.appendChild(tdId);

      const tdName = document.createElement("td");
      const inputName = document.createElement("input");
      inputName.className = "edit-name";
      inputName.setAttribute("data-id", product.id);
      inputName.value = product.name;
      tdName.appendChild(inputName);
      tr.appendChild(tdName);

      const tdPrice = document.createElement("td");
      const inputPrice = document.createElement("input");
      inputPrice.type = "number";
      inputPrice.className = "edit-price";
      inputPrice.setAttribute("data-id", product.id);
      inputPrice.value = product.price;
      tdPrice.appendChild(inputPrice);
      tr.appendChild(tdPrice);

      const tdActions = document.createElement("td");
      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.setAttribute("data-id", product.id);
      editBtn.textContent = "Edit";
      tdActions.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.setAttribute("data-id", product.id);
      deleteBtn.textContent = "Delete";
      tdActions.appendChild(deleteBtn);

      tr.appendChild(tdActions);

      tbody.append(tr);
    });
  } catch (error) {
    alert("Load failed: " + error.message);
  }
}

/* ===============================
   ADD PRODUCT
=============================== */
async function addProduct() {
  const name = $("#add-name").val().trim();
  const price = parseFloat($("#add-price").val());

  if (!name) {
    alert("Product name is required");
    return;
  }

  if (isNaN(price) || price <= 0) {
    alert("Valid price is required");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ name, price }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    $("#add-name").val("");
    $("#add-price").val("");
    loadProducts();
  } catch (error) {
    alert("Add failed: " + error.message);
  }
}

/* ===============================
   UPDATE PRODUCT
=============================== */
async function updateProduct(id) {
  const name = $(`.edit-name[data-id="${id}"]`).val().trim();
  const price = parseFloat($(`.edit-price[data-id="${id}"]`).val());

  if (!name) {
    alert("Product name is required");
    return;
  }

  if (isNaN(price) || price <= 0) {
    alert("Valid price is required");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ id, name, price }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    loadProducts();
  } catch (error) {
    alert("Update failed: " + error.message);
  }
}

/* ===============================
   DELETE PRODUCT
=============================== */
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    loadProducts();
  } catch (error) {
    alert("Delete failed: " + error.message);
  }
}
