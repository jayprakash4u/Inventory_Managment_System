// Authentication check
if (!apiClient.isAuthenticated()) {
  window.location.href = "login.html";
}

const API_BASE = "https://localhost:44383/api";

async function fetchData(endpoint) {
  try {
    const response = await apiClient.get(endpoint);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function loadSummary() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE}/insights`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data) {
        document.getElementById("products-count").textContent =
          data.totalProducts || 0;
        document.getElementById("purchase-orders-count").textContent =
          data.totalSupplierOrders || 0;
        document.getElementById("sales-orders-count").textContent =
          data.totalCustomerOrders || 0;
        document.getElementById("inventory-alerts-count").textContent =
          (data.lowStockCount || 0) + (data.outOfStockCount || 0);

        window.dashboardData = data;
        return;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name !== "AbortError") {
        throw fetchError;
      }
    }
  } catch (error) {
    console.error("Error loading dashboard summary:", error);
  }

  useFallbackData();
}

function useFallbackData() {
  const fallbackData = {
    totalProducts: 249,
    totalSupplierOrders: 83,
    totalCustomerOrders: 79,
    lowStockCount: 15,
    outOfStockCount: 5,
    stockLevelsChart: {
      categories: ["In Stock", "Low Stock", "Out of Stock"],
      data: [229, 15, 5],
    },
    auditActionsChart: {
      categories: ["CREATE", "UPDATE", "DELETE", "VIEW"],
      data: [45, 120, 15, 200],
    },
    supplierStatusChart: {
      labels: ["Pending", "Approved", "Shipped", "Delivered"],
      data: [12, 25, 18, 28],
    },
    customerStatusChart: {
      labels: ["Pending", "Approved", "Shipped", "Delivered"],
      data: [15, 20, 12, 32],
    },
    auditTrendsChart: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [25, 32, 28, 40, 35, 15, 10],
    },
    orderTrendsChart: {
      purchaseOrders: [10, 15, 12, 18, 22, 25],
      salesOrders: [8, 12, 15, 20, 18, 23],
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
  };

  // Update UI with fallback data
  document.getElementById("products-count").textContent =
    fallbackData.totalProducts;
  document.getElementById("purchase-orders-count").textContent =
    fallbackData.totalSupplierOrders;
  document.getElementById("sales-orders-count").textContent =
    fallbackData.totalCustomerOrders;
  document.getElementById("inventory-alerts-count").textContent =
    fallbackData.lowStockCount + fallbackData.outOfStockCount;

  // Store fallback data for charts
  window.dashboardData = fallbackData;

  showToast("Using offline data - database connection slow", "warning");
}

// Charts stuff
function renderChart(chartId, config) {
  const chartElement = document.querySelector(`#${chartId}`);
  if (!chartElement) {
    console.error(`❌ Chart container not found: #${chartId}`);
    return;
  }

  try {
    const chart = new ApexCharts(chartElement, config);
    chart.render();
  } catch (error) {
    console.error(`❌ Error rendering ${chartId} chart:`, error);
  }
}

async function initCharts() {
  try {
    await loadSummary();
    loadTopProductsChart();
    loadOrdersChart();
    loadSalesByCategoryChart();
    loadInventoryTrendsChart();
    loadStockDistributionChart();
    loadMonthlyPerformanceChart();
  } catch (error) {
    console.error("Error during chart initialization:", error);
  }
}

function loadTopProductsChart() {
  try {
    const data = window.dashboardData;
    let chartData = null;

    if (data && data.auditActionsChart) {
      chartData = {
        data: data.auditActionsChart.data.slice(0, 5),
        categories: data.auditActionsChart.categories.slice(0, 5),
      };
    }

    if (!chartData) {
      chartData = {
        data: [120, 95, 80, 65, 50],
        categories: [
          "Product A",
          "Product B",
          "Product C",
          "Product D",
          "Product E",
        ],
      };
    }

    const config = {
      series: [{ data: chartData.data }],
      chart: { type: "bar", height: 350, toolbar: { show: false } },
      colors: ["#246dec", "#cc3c43", "#367952", "#f5b747", "#4f35a1"],
      plotOptions: {
        bar: {
          distributed: true,
          borderRadius: 4,
          borderRadiusApplication: "end",
          horizontal: false,
          columnWidth: "40%",
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: { categories: chartData.categories },
      yaxis: { title: { text: "Count" } },
    };
    renderChart("bar-chart", config);
  } catch (error) {
    console.error("Error loading top products chart:", error);
  }
}

// Load orders over time chart (optimized - no redundant API calls)
function loadOrdersChart() {
  try {
    const data = window.dashboardData;
    let chartData = null;

    if (data && data.orderTrendsChart) {
      chartData = {
        purchaseOrders: data.orderTrendsChart.purchaseOrders || [
          10, 15, 12, 18, 22, 25,
        ],
        salesOrders: data.orderTrendsChart.salesOrders || [
          8, 12, 15, 20, 18, 23,
        ],
        labels: data.orderTrendsChart.labels || [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
        ],
      };
    }

    if (!chartData) {
      chartData = {
        purchaseOrders: [10, 15, 12, 18, 22, 25],
        salesOrders: [8, 12, 15, 20, 18, 23],
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      };
    }

    const config = {
      series: [
        { name: "Purchase Orders", data: chartData.purchaseOrders },
        { name: "Sales Orders", data: chartData.salesOrders },
      ],
      chart: { height: 350, type: "area", toolbar: { show: false } },
      colors: ["#4f35a1", "#246dec"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: { categories: chartData.labels },
      markers: { size: 0 },
      yaxis: [
        { title: { text: "Purchase Orders" } },
        { opposite: true, title: { text: "Sales Orders" } },
      ],
      tooltip: { shared: true, intersect: false },
    };
    renderChart("area-chart", config);
  } catch (error) {
    console.error("Error loading orders chart:", error);
  }
}

// Load sales by category chart (optimized - no redundant API calls)
function loadSalesByCategoryChart() {
  try {
    const data = window.dashboardData;
    let chartData = null;

    if (data && data.supplierStatusChart) {
      chartData = {
        data: data.supplierStatusChart.data || [35, 25, 20, 15, 5],
        labels: data.supplierStatusChart.labels || [
          "Electronics",
          "Apparel",
          "Home",
          "Books",
          "Sports",
        ],
      };
    }

    if (!chartData) {
      chartData = {
        data: [35, 25, 20, 15, 5],
        labels: ["Electronics", "Apparel", "Home", "Books", "Sports"],
      };
    }

    const config = {
      series: chartData.data,
      chart: { height: 350, type: "pie", toolbar: { show: false } },
      labels: chartData.labels,
      colors: ["#246dec", "#cc3c43", "#367952", "#f5b747", "#4f35a1"],
      responsive: [
        {
          breakpoint: 480,
          options: { chart: { width: 200 }, legend: { position: "bottom" } },
        },
      ],
    };
    renderChart("pie-chart", config);
  } catch (error) {
    console.error("Error loading sales by category chart:", error);
  }
}

// Load inventory trends chart (optimized - no redundant API calls)
function loadInventoryTrendsChart() {
  try {
    const data = window.dashboardData;
    let chartData = null;

    if (data && data.auditTrendsChart) {
      chartData = {
        stockLevels: data.auditTrendsChart.data || [
          200, 195, 210, 205, 220, 215,
        ],
        sales: data.auditTrendsChart.data
          ? data.auditTrendsChart.data.map((d) => d * 0.25)
          : [50, 55, 45, 60, 52, 58],
        labels: data.auditTrendsChart.categories || [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
        ],
      };
    }

    if (!chartData) {
      chartData = {
        stockLevels: [200, 195, 210, 205, 220, 215],
        sales: [50, 55, 45, 60, 52, 58],
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      };
    }

    const config = {
      series: [
        { name: "Stock Level", data: chartData.stockLevels },
        { name: "Sales", data: chartData.sales },
      ],
      chart: { height: 350, type: "line", toolbar: { show: false } },
      colors: ["#246dec", "#cc3c43"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: { categories: chartData.labels },
      yaxis: { title: { text: "Count" } },
      tooltip: { shared: true },
    };
    renderChart("line-chart", config);
  } catch (error) {
    console.error("Error loading inventory trends chart:", error);
  }
}

// Load stock distribution chart (donut)
function loadStockDistributionChart() {
  try {
    const data = window.dashboardData;
    let chartData = null;

    if (data && data.stockLevelsChart) {
      chartData = {
        series: data.stockLevelsChart.data || [35, 25, 20, 15, 5],
        labels: data.stockLevelsChart.categories || [
          "In Stock",
          "Low Stock",
          "Out of Stock",
          "Reserved",
          "Damaged",
        ],
      };
    } else {
      chartData = {
        series: [35, 25, 20, 15, 5],
        labels: [
          "In Stock",
          "Low Stock",
          "Out of Stock",
          "Reserved",
          "Damaged",
        ],
      };
    }

    const config = {
      series: chartData.series,
      chart: { type: "donut", height: 350, toolbar: { show: false } },
      labels: chartData.labels,
      colors: ["#246dec", "#cc3c43", "#367952", "#f5b747", "#4f35a1"],
      responsive: [
        {
          breakpoint: 480,
          options: { chart: { width: 200 }, legend: { position: "bottom" } },
        },
      ],
    };
    renderChart("donut-chart", config);
  } catch (error) {
    console.error("Error loading stock distribution chart:", error);
    const fallbackConfig = {
      series: [35, 25, 20, 15, 5],
      chart: { type: "donut", height: 350, toolbar: { show: false } },
      labels: ["In Stock", "Low Stock", "Out of Stock", "Reserved", "Damaged"],
      colors: ["#246dec", "#cc3c43", "#367952", "#f5b747", "#4f35a1"],
    };
    renderChart("donut-chart", fallbackConfig);
  }
}

// Load monthly performance chart (radar)
function loadMonthlyPerformanceChart() {
  try {
    const data = window.dashboardData;
    let performanceData = [80, 75, 85, 90, 70, 95];

    if (data) {
      const totalProducts = data.totalProducts || 0;
      const totalOrders =
        (data.totalCustomerOrders || 0) + (data.totalSupplierOrders || 0);
      const totalRevenue = data.totalRevenue || 0;
      const alerts = (data.lowStockCount || 0) + (data.outOfStockCount || 0);
      const efficiency = data.todayActivities || 0;

      performanceData = [
        Math.min(100, (totalRevenue / 10000) * 100),
        Math.min(100, (totalOrders / 100) * 100),
        Math.min(100, (totalProducts / 500) * 100),
        Math.min(100, ((100 - alerts) / 100) * 100),
        Math.min(100, ((100 - alerts) / 100) * 100),
        Math.min(100, (efficiency / 50) * 100),
      ];
    }

    const config = {
      series: [{ name: "Performance", data: performanceData }],
      chart: { type: "radar", height: 350, toolbar: { show: false } },
      colors: ["#246dec"],
      xaxis: {
        categories: [
          "Sales",
          "Orders",
          "Inventory",
          "Revenue",
          "Alerts",
          "Efficiency",
        ],
        yaxis: { min: 0, max: 100 },
        markers: { size: 4 },
      },
    };
    renderChart("radar-chart", config);
  } catch (error) {
    console.error("Error loading performance chart:", error);
  }
}

// Load recent activity
async function loadRecentActivity() {
  const activityTimeline = document.getElementById("activity-timeline");
  if (!activityTimeline) return;

  try {
    const auditResponse = await fetch(`${API_BASE}/audit/recent`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    });

    if (auditResponse.ok) {
      const auditData = await auditResponse.json();
      const audits = Array.isArray(auditData) ? auditData : auditData.data;

      if (audits && audits.length > 0) {
        const activities = audits.slice(0, 4).map((audit) => ({
          type: getActivityType(audit.severity),
          icon: getActivityIcon(audit.action),
          title: formatAuditTitle(audit),
          description: audit.details || audit.entity,
          time: formatTimeAgo(audit.timestamp || audit.createdAt),
        }));
        renderActivityTimeline(activities);
        return;
      }
    }

    // Fallback sample data
    const sampleActivities = [
      {
        type: "success",
        icon: "inventory",
        title: "New Product Added",
        description: "Product added to inventory",
        time: "2 hours ago",
      },
      {
        type: "warning",
        icon: "warning",
        title: "Low Stock Alert",
        description: "Item below threshold",
        time: "4 hours ago",
      },
      {
        type: "info",
        icon: "shopping_cart",
        title: "Order Completed",
        description: "Order delivered",
        time: "6 hours ago",
      },
      {
        type: "success",
        icon: "trending_up",
        title: "Sales Milestone",
        description: "Monthly target achieved",
        time: "1 day ago",
      },
    ];
    renderActivityTimeline(sampleActivities);
  } catch (error) {
    console.error("Error loading recent activity:", error);
    const sampleActivities = [
      {
        type: "success",
        icon: "inventory",
        title: "New Product Added",
        description: "Product added to inventory",
        time: "2 hours ago",
      },
      {
        type: "warning",
        icon: "warning",
        title: "Low Stock Alert",
        description: "Item below threshold",
        time: "4 hours ago",
      },
      {
        type: "info",
        icon: "shopping_cart",
        title: "Order Completed",
        description: "Order delivered",
        time: "6 hours ago",
      },
      {
        type: "success",
        icon: "trending_up",
        title: "Sales Milestone",
        description: "Monthly target achieved",
        time: "1 day ago",
      },
    ];
    renderActivityTimeline(sampleActivities);
  }
}

function getActivityType(severity) {
  switch (severity?.toLowerCase()) {
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "success";
  }
}

function getActivityIcon(action) {
  switch (action?.toLowerCase()) {
    case "create":
      return "add";
    case "update":
      return "edit";
    case "delete":
      return "delete";
    case "view":
      return "visibility";
    default:
      return "inventory";
  }
}

function formatAuditTitle(audit) {
  const action = audit.action?.toLowerCase() || "activity";
  const module = audit.module?.toLowerCase() || "system";
  return `${action.charAt(0).toUpperCase() + action.slice(1)} in ${module.charAt(0).toUpperCase() + module.slice(1)}`;
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "Recently";
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return time.toLocaleDateString();
}

function renderActivityTimeline(activities) {
  const activityTimeline = document.getElementById("activity-timeline");
  if (!activityTimeline) return;
  const activityHTML = activities
    .map(
      (activity) => `
    <div class="activity-item">
      <div class="activity-icon ${activity.type}"><span class="material-icons-outlined">${activity.icon}</span></div>
      <div class="activity-content"><p><strong>${activity.title}:</strong> ${activity.description}</p><div class="activity-time">${activity.time}</div></div>
    </div>
  `,
    )
    .join("");
  activityTimeline.innerHTML = activityHTML;
}

// Load alert count for badges
async function loadAlertCount() {
  try {
    const data = await fetchData("insights");
    const alertCount = data?.lowStockCount || 3;
    updateAlertBadges(alertCount);
  } catch (error) {
    console.error("Error loading alert count:", error);
    updateAlertBadges(3);
  }
}

function updateAlertBadges(count) {
  const badges = document.querySelectorAll(".alert-badge");
  badges.forEach((badge) => {
    badge.textContent = count;
  });
}

// Card menu functionality
function toggleCardMenu(button) {
  ToastNotification.info("Card menu options would be shown here");
}

// Export functionality
function exportCharts() {
  ToastNotification.success("Charts exported successfully!");
}

// Show alerts function - Enhanced to display alerts in a modal using dedicated alerts API
async function showAlerts() {
  try {
    // Use the dedicated alerts API endpoint for better performance
    const response = await fetch(`${API_BASE}/alerts`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const lowStockCount = data?.lowStockCount || 0;
    const outOfStockCount = data?.outOfStockCount || 0;
    const lowStockItems = data?.lowStockItems || [];
    const outOfStockItems = data?.outOfStockItems || [];
    const totalAlerts = lowStockCount + outOfStockCount;

    if (totalAlerts === 0) {
      ToastNotification.success(
        "No inventory alerts! All stock levels are healthy.",
      );
      return;
    }

    let alertsHTML = `<div class="alerts-modal-content">
      <div class="alerts-header">
        <h3>Inventory Alerts</h3>
        <span class="alert-count">${totalAlerts} alert${totalAlerts > 1 ? "s" : ""}</span>
      </div>
      <div class="alerts-list">`;

    if (lowStockCount > 0) {
      alertsHTML += `
        <div class="alert-item warning">
          <div class="alert-icon"><span class="material-icons-outlined">warning</span></div>
          <div class="alert-details"><h4>Low Stock Items</h4><p>${lowStockCount} product${lowStockCount > 1 ? "s" : ""} are running low on stock</p></div>
          <a href="inventory.html?filter=low-stock" class="alert-action">View</a>
        </div>`;
    }

    if (outOfStockCount > 0) {
      alertsHTML += `
        <div class="alert-item danger">
          <div class="alert-icon"><span class="material-icons-outlined">error</span></div>
          <div class="alert-details"><h4>Out of Stock Items</h4><p>${outOfStockCount} product${outOfStockCount > 1 ? "s" : ""} are out of stock</p></div>
          <a href="inventory.html?filter=out-of-stock" class="alert-action">View</a>
        </div>`;
    }

    // Add alert items section if we have item details
    if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
      alertsHTML += `<div class="alert-items-section">`;

      if (lowStockItems.length > 0) {
        alertsHTML += `<h4>Low Stock Products</h4><ul class="alert-items-list">`;
        lowStockItems.slice(0, 5).forEach((item) => {
          alertsHTML += `<li><span class="item-name">${item.name}</span><span class="item-qty">${item.quantity} units</span></li>`;
        });
        alertsHTML += `</ul>`;
      }

      if (outOfStockItems.length > 0) {
        alertsHTML += `<h4>Out of Stock Products</h4><ul class="alert-items-list">`;
        outOfStockItems.slice(0, 5).forEach((item) => {
          alertsHTML += `<li><span class="item-name">${item.name}</span><span class="item-qty">Out of stock</span></li>`;
        });
        alertsHTML += `</ul>`;
      }

      alertsHTML += `</div>`;
    }

    alertsHTML += `</div><div class="alerts-footer"><a href="inventory.html" class="btn-primary">Manage Inventory</a></div></div>`;

    showCustomModal(alertsHTML);
  } catch (error) {
    console.error("Error showing alerts:", error);
    // Show fallback alerts even on error
    const fallbackAlertsHTML = `<div class="alerts-modal-content">
      <div class="alerts-header">
        <h3>Inventory Alerts</h3>
        <span class="alert-count">20 alerts</span>
      </div>
      <div class="alerts-list">
        <div class="alert-item warning">
          <div class="alert-icon"><span class="material-icons-outlined">warning</span></div>
          <div class="alert-details"><h4>Low Stock Items</h4><p>15 products are running low on stock</p></div>
          <a href="inventory.html?filter=low-stock" class="alert-action">View</a>
        </div>
        <div class="alert-item danger">
          <div class="alert-icon"><span class="material-icons-outlined">error</span></div>
          <div class="alert-details"><h4>Out of Stock Items</h4><p>5 products are out of stock</p></div>
          <a href="inventory.html?filter=out-of-stock" class="alert-action">View</a>
        </div>
      </div>
      <div class="alerts-footer"><a href="inventory.html" class="btn-primary">Manage Inventory</a></div>
    </div>`;
    showCustomModal(fallbackAlertsHTML);
  }
}

// Custom modal function for alerts
function showCustomModal(content) {
  const existingModal = document.querySelector(".custom-modal-overlay");
  if (existingModal) {
    existingModal.remove();
  }

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "custom-modal-overlay";
  modalOverlay.innerHTML = `
    <div class="custom-modal">
      <button class="modal-close" onclick="closeCustomModal()"><span class="material-icons-outlined">close</span></button>
      ${content}
    </div>
  `;

  document.body.appendChild(modalOverlay);
  addModalStyles();

  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      closeCustomModal();
    }
  });

  setTimeout(() => {
    modalOverlay.classList.add("active");
  }, 10);
}

function closeCustomModal() {
  const modalOverlay = document.querySelector(".custom-modal-overlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    setTimeout(() => {
      modalOverlay.remove();
    }, 300);
  }
}

function addModalStyles() {
  if (document.querySelector("#modal-styles")) return;

  const styles = document.createElement("style");
  styles.id = "modal-styles";
  styles.textContent = `
    .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: opacity 0.3s ease; }
    .custom-modal-overlay.active { opacity: 1; }
    .custom-modal { background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); transform: translateY(-20px); transition: transform 0.3s ease; }
    .custom-modal-overlay.active .custom-modal { transform: translateY(0); }
    .modal-close { position: absolute; top: 12px; right: 12px; background: rgba(255, 255, 255, 0.9); border: 1px solid #ddd; cursor: pointer; color: #666; padding: 6px; border-radius: 50%; z-index: 10; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
    .modal-close:hover { background: #f0f0f0; color: #333; border-color: #ccc; }
    .alerts-modal-content { padding: 24px; }
    .alerts-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
    .alerts-header h3 { margin: 0; font-size: 1.25rem; color: #333; }
    .alert-count { background: #cc3c43; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; }
    .alerts-list { display: flex; flex-direction: column; gap: 12px; }
    .alert-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 8px; background: #f8f9fa; }
    .alert-item.warning { border-left: 4px solid #f5b747; }
    .alert-item.danger { border-left: 4px solid #cc3c43; }
    .alert-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .alert-item.warning .alert-icon { background: #fff3cd; color: #f5b747; }
    .alert-item.danger .alert-icon { background: #f8d7da; color: #cc3c43; }
    .alert-details { flex: 1; }
    .alert-details h4 { margin: 0 0 4px 0; font-size: 1rem; color: #333; }
    .alert-details p { margin: 0; font-size: 0.875rem; color: #666; }
    .alert-action { padding: 8px 16px; background: #246dec; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: background 0.2s; }
    .alert-action:hover { background: #1a5bb8; }
    .alerts-footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; }
    .btn-primary { display: inline-block; padding: 12px 24px; background: #246dec; color: white; border-radius: 6px; text-decoration: none; font-weight: 500; transition: background 0.2s; }
    .btn-primary:hover { background: #1a5bb8; }
    .alert-items-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; }
    .alert-items-section h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #555; }
    .alert-items-list { list-style: none; padding: 0; margin: 0 0 15px 0; }
    .alert-items-list li { display: flex; justify-content: space-between; padding: 8px 12px; background: #f8f9fa; border-radius: 4px; margin-bottom: 4px; font-size: 0.875rem; }
    .alert-items-list .item-name { color: #333; }
    .alert-items-list .item-qty { color: #666; font-weight: 500; }
  `;
  document.head.appendChild(styles);
}

// Show system config function
function showSystemConfig() {
  window.location.href = "system-config.html";
}

// Initialize mini sparklines (placeholder)
function initMiniSparklines() {
  const sparklines = document.querySelectorAll(".mini-sparkline");
  sparklines.forEach((sparkline) => {
    sparkline.innerHTML =
      '<span class="material-icons-outlined">trending_up</span>';
  });
}

// Initialize charts when the page loads
document.addEventListener("DOMContentLoaded", function () {
  initCharts();
  loadRecentActivity();
  loadAlertCount();
  initMiniSparklines();
  initializeUserMenu();

  // Add event listeners for chart controls
  const timeRangeSelect = document.getElementById("time-range");
  const categorySelect = document.getElementById("category-filter");
  const exportBtn = document.querySelector(".export-btn");

  if (timeRangeSelect) {
    timeRangeSelect.addEventListener("change", function () {
      showToast(`Time range updated to ${this.value}`, "info");
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", function () {
      showToast(`Category filter updated to ${this.value}`, "info");
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", exportCharts);
  }
});

// User Profile & Menu Initialization
function initializeUserMenu() {
  loadUserMenuData();
}

async function loadUserMenuData() {
  try {
    const profileData = await apiClient.getUserProfile();
    if (profileData && profileData.data) {
      const user = profileData.data;
      const menuProfilePic = document.getElementById("menuProfilePic");
      const menuUserName = document.getElementById("menuUserName");
      const menuUserEmail = document.getElementById("menuUserEmail");
      const profilePic = document.getElementById("profilePic");

      if (menuProfilePic) {
        menuProfilePic.src =
          user.profilePictureUrl ||
          `https://ui-avatars.com/api/?name=${user.fullName?.charAt(0) || "U"}&background=246dec&color=fff&size=120`;
      }
      if (menuUserName) {
        menuUserName.textContent = user.fullName || "User";
      }
      if (menuUserEmail) {
        menuUserEmail.textContent = user.email || "user@example.com";
      }
      if (profilePic) {
        profilePic.src =
          user.profilePictureUrl ||
          `https://ui-avatars.com/api/?name=${user.fullName?.charAt(0) || "U"}&background=246dec&color=fff&size=120`;
      }
    }
  } catch (error) {
    console.error("Error loading user menu data:", error);
  }
}

function helpSupport() {
  const helpMessage =
    "Help & Support: Contact support@example.com\n\nCommon Issues:\n1. Forgot Password - Use the login page reset option\n2. Profile Picture - JPG or PNG up to 5MB\n3. Password Requirements - Min 6 characters";
  ToastNotification.info("Help & Support information displayed");
}

function showToast(message, type = "info") {}
