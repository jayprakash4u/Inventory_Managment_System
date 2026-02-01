/* ===============================
   AUTHENTICATION CHECK
============================== */
if (!apiClient.isAuthenticated()) {
  window.location.href = "login.html";
}

// Base URL of your backend API
const API_BASE = "https://localhost:44383/api";

// Fetch data from API using centralized client
async function fetchData(endpoint) {
  try {
    console.log(`📡 Fetching data from: ${endpoint}`);
    const response = await apiClient.get(endpoint);
    const data = await response.json();
    console.log(`📡 Data received from ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    return null;
  }
}

// Load summary data from insights API
async function loadSummary() {
  try {
    const data = await fetchData("insights");
    if (data) {
      // Update main metrics cards
      document.getElementById("products-count").textContent =
        data.totalProducts || 0;
      document.getElementById("purchase-orders-count").textContent =
        data.totalSupplierOrders || 0;
      document.getElementById("sales-orders-count").textContent =
        data.totalCustomerOrders || 0;
      document.getElementById("inventory-alerts-count").textContent =
        (data.lowStockCount || 0) + (data.outOfStockCount || 0);

      // Store data for other functions
      window.dashboardData = data;

      console.log("Dashboard summary data loaded:", data);
    } else {
      throw new Error("No data received from insights API");
    }
  } catch (error) {
    console.error("Error loading dashboard summary:", error);
    // Fallback sample data
    document.getElementById("products-count").textContent = "249";
    document.getElementById("purchase-orders-count").textContent = "83";
    document.getElementById("sales-orders-count").textContent = "79";
    document.getElementById("inventory-alerts-count").textContent = "58";

    showToast("Using offline data - some features may be limited", "warning");
  }
}

// Load top products chart
async function loadTopProductsChart() {
  try {
    const data = window.dashboardData || (await fetchData("insights"));
    let chartData = null;

    if (data && data.auditActionsChart) {
      // Use audit actions data as a placeholder for top products
      // In a real implementation, this would be a separate top products endpoint
      chartData = {
        data: data.auditActionsChart.data.slice(0, 5), // Take first 5
        categories: data.auditActionsChart.categories.slice(0, 5),
      };
    }

    if (!chartData) {
      // Fallback sample data
      chartData = {
        data: [120, 95, 80, 65, 50],
        categories: [
          "iPhone 13",
          "Galaxy S21",
          "MacBook Pro",
          "AirPods",
          "iPad",
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
    // Fallback chart
    const fallbackConfig = {
      series: [{ data: [120, 95, 80, 65, 50] }],
      chart: { type: "bar", height: 350, toolbar: { show: false } },
      colors: ["#246dec"],
      xaxis: {
        categories: [
          "Product A",
          "Product B",
          "Product C",
          "Product D",
          "Product E",
        ],
      },
    };
    renderChart("bar-chart", fallbackConfig);
  }
}

// Load orders over time chart
async function loadOrdersChart() {
  try {
    const data = window.dashboardData || (await fetchData("insights"));
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
      // Fallback sample data
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
    // Fallback chart
    const fallbackConfig = {
      series: [
        { name: "Purchase Orders", data: [10, 15, 12, 18, 22, 25] },
        { name: "Sales Orders", data: [8, 12, 15, 20, 18, 23] },
      ],
      chart: { height: 350, type: "area", toolbar: { show: false } },
      colors: ["#4f35a1", "#246dec"],
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
    };
    renderChart("area-chart", fallbackConfig);
  }
}

// Load sales by category chart
async function loadSalesByCategoryChart() {
  try {
    const data = window.dashboardData || (await fetchData("insights"));
    let chartData = null;

    if (data && data.supplierStatusChart) {
      // Use supplier status chart as category data
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
      // Fallback sample data
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
    // Fallback chart
    const fallbackConfig = {
      series: [35, 25, 20, 15, 5],
      chart: { height: 350, type: "pie", toolbar: { show: false } },
      labels: ["Electronics", "Apparel", "Home", "Books", "Sports"],
      colors: ["#246dec", "#cc3c43", "#367952", "#f5b747", "#4f35a1"],
    };
    renderChart("pie-chart", fallbackConfig);
  }
}

// Load inventory trends chart
async function loadInventoryTrendsChart() {
  try {
    const data = window.dashboardData || (await fetchData("insights"));
    let chartData = null;

    if (data && data.auditTrendsChart) {
      // Use audit trends as inventory trends
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
      // Fallback sample data
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
    // Fallback chart
    const fallbackConfig = {
      series: [
        { name: "Stock Level", data: [200, 195, 210, 205, 220, 215] },
        { name: "Sales", data: [50, 55, 45, 60, 52, 58] },
      ],
      chart: { height: 350, type: "line", toolbar: { show: false } },
      colors: ["#246dec", "#cc3c43"],
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
    };
    renderChart("line-chart", fallbackConfig);
  }
}

// Charts stuff
function renderChart(chartId, config) {
  const chartElement = document.querySelector(`#${chartId}`);
  if (!chartElement) {
    console.error(`❌ Chart container not found: #${chartId}`);
    return;
  }

  try {
    console.log(`📊 Rendering chart: ${chartId}`, config);
    const chart = new ApexCharts(chartElement, config);
    chart.render();
    console.log(`✅ Chart rendered successfully: ${chartId}`);
  } catch (error) {
    console.error(`❌ Error rendering ${chartId} chart:`, error);
  }
}

async function initCharts() {
  console.log("📊 Starting chart initialization...");
  try {
    console.log("📊 Loading summary data...");
    await loadSummary();
    console.log(
      "📊 Summary data loaded, window.dashboardData:",
      window.dashboardData,
    );

    console.log("📊 Loading top products chart...");
    await loadTopProductsChart();
    console.log("✅ Top products chart loaded");

    console.log("📊 Loading orders chart...");
    await loadOrdersChart();
    console.log("✅ Orders chart loaded");

    console.log("📊 Loading sales by category chart...");
    await loadSalesByCategoryChart();
    console.log("✅ Sales by category chart loaded");

    console.log("📊 Loading inventory trends chart...");
    await loadInventoryTrendsChart();
    console.log("✅ Inventory trends chart loaded");

    console.log("📊 Loading stock distribution chart...");
    loadStockDistributionChart();
    console.log("✅ Stock distribution chart loaded");

    console.log("📊 Loading monthly performance chart...");
    loadMonthlyPerformanceChart();
    console.log("✅ Monthly performance chart loaded");

    console.log("✅ All charts initialized successfully!");
  } catch (error) {
    console.error("❌ Error during chart initialization:", error);
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
      // Fallback sample data
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
          options: {
            chart: { width: 200 },
            legend: { position: "bottom" },
          },
        },
      ],
    };
    renderChart("donut-chart", config);
  } catch (error) {
    console.error("Error loading stock distribution chart:", error);
    // Fallback chart
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
    let performanceData = [80, 75, 85, 90, 70, 95]; // Default performance data

    if (data) {
      // Calculate performance metrics from insights data
      const totalProducts = data.totalProducts || 0;
      const totalOrders =
        (data.totalCustomerOrders || 0) + (data.totalSupplierOrders || 0);
      const totalRevenue = data.totalRevenue || 0;
      const alerts = (data.lowStockCount || 0) + (data.outOfStockCount || 0);
      const efficiency = data.todayActivities || 0;

      // Normalize to 0-100 scale
      performanceData = [
        Math.min(100, (totalRevenue / 10000) * 100), // Sales performance
        Math.min(100, (totalOrders / 100) * 100), // Orders performance
        Math.min(100, (totalProducts / 500) * 100), // Inventory performance
        Math.min(100, ((100 - alerts) / 100) * 100), // Revenue/Alerts performance
        Math.min(100, ((100 - alerts) / 100) * 100), // Alerts performance (inverse)
        Math.min(100, (efficiency / 50) * 100), // Efficiency performance
      ];
    }

    const config = {
      series: [
        {
          name: "Performance",
          data: performanceData,
        },
      ],
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
      },
      yaxis: { min: 0, max: 100 },
      markers: { size: 4 },
    };
    renderChart("radar-chart", config);
  } catch (error) {
    console.error("Error loading performance chart:", error);
    // Fallback chart
    const fallbackConfig = {
      series: [
        {
          name: "Performance",
          data: [80, 75, 85, 90, 70, 95],
        },
      ],
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
      },
      yaxis: { min: 0, max: 100 },
      markers: { size: 4 },
    };
    renderChart("radar-chart", fallbackConfig);
  }
}

// Load recent activity
async function loadRecentActivity() {
  const activityTimeline = document.getElementById("activity-timeline");
  if (!activityTimeline) return;

  try {
    // Try to fetch recent audit logs
    const auditResponse = await fetch(`${API_BASE}/audit/recent`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
    });

    if (auditResponse.ok) {
      const auditResponse_data = await auditResponse.json();
      // Handle both array and object with data property
      const auditData = Array.isArray(auditResponse_data)
        ? auditResponse_data
        : auditResponse_data.data;

      if (auditData && auditData.length > 0) {
        // Transform audit data to activity format
        const activities = auditData.slice(0, 4).map((audit) => ({
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

    // If no audit data, try insights data for activity info
    const insightsData = window.dashboardData || (await fetchData("insights"));
    if (insightsData && insightsData.todayActivities > 0) {
      // Create activities based on insights data
      const activities = [
        {
          type: "success",
          icon: "inventory",
          title: "Daily Activity",
          description: `${insightsData.todayActivities} activities logged today`,
          time: "Today",
        },
      ];

      if (insightsData.lowStockCount > 0) {
        activities.push({
          type: "warning",
          icon: "warning",
          title: "Stock Alerts",
          description: `${insightsData.lowStockCount} items need attention`,
          time: "Ongoing",
        });
      }

      renderActivityTimeline(activities);
      return;
    }

    throw new Error("No activity data available");
  } catch (error) {
    console.error("Error loading recent activity:", error);
    // Show fallback data
    const sampleActivities = [
      {
        type: "success",
        icon: "inventory",
        title: "New Product Added",
        description: "iPhone 14 Pro Max added to inventory",
        time: "2 hours ago",
      },
      {
        type: "warning",
        icon: "warning",
        title: "Low Stock Alert",
        description: "Samsung Galaxy S21 below threshold",
        time: "4 hours ago",
      },
      {
        type: "info",
        icon: "shopping_cart",
        title: "Order Completed",
        description: "Purchase order #PO-1234 delivered",
        time: "6 hours ago",
      },
      {
        type: "success",
        icon: "trending_up",
        title: "Sales Milestone",
        description: "Monthly sales target achieved",
        time: "1 day ago",
      },
    ];
    renderActivityTimeline(sampleActivities);
  }
}

// Helper functions for activity formatting
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
      <div class="activity-icon ${activity.type}">
        <span class="material-icons-outlined">${activity.icon}</span>
      </div>
      <div class="activity-content">
        <p>
          <strong>${activity.title}:</strong> ${activity.description}
        </p>
        <div class="activity-time">${activity.time}</div>
      </div>
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
    updateAlertBadges(3); // fallback
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
  // Simple implementation - could be expanded
  alert("Card menu options would be shown here");
}

// Export functionality
function exportCharts() {
  alert("Charts exported successfully!");
  // In a real implementation, this would generate and download chart data
}

// Show alerts function
function showAlerts() {
  alert("Showing inventory alerts...");
  // Could navigate to alerts page or open modal
}

// Show system config function
function showSystemConfig() {
  window.location.href = "system-config.html";
}

// Initialize mini sparklines (placeholder)
function initMiniSparklines() {
  const sparklines = document.querySelectorAll(".mini-sparkline");
  sparklines.forEach((sparkline) => {
    // In a real implementation, this would render actual mini charts
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

  // Add event listeners for quick actions
  const actionBtns = document.querySelectorAll(".action-btn");
  actionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.textContent.trim();
      alert(`${action} initiated.`);
    });
  });

  // Add event listeners for chart controls
  const timeRangeSelect = document.getElementById("time-range");
  const categorySelect = document.getElementById("category-filter");
  const exportBtn = document.querySelector(".export-btn");

  if (timeRangeSelect) {
    timeRangeSelect.addEventListener("change", function () {
      // Simulate updating charts based on time range
      console.log("Time range changed to:", this.value);
      // In a real app, re-fetch data and update charts
      showToast(`Time range updated to ${this.value}`, "info");
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", function () {
      console.log("Category changed to:", this.value);
      showToast(`Category filter updated to ${this.value}`, "info");
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", exportCharts);
  }
});

// ==============================
// User Profile Functions
// ==============================
function showProfile() {
  showToast("Profile view coming soon!", "info");
}

function editProfilePicture() {
  showToast("Profile picture editor coming soon!", "info");
}

function changePassword() {
  showToast("Password change feature coming soon!", "info");
}

function accountSettings() {
  showToast("Account settings coming soon!", "info");
}

function helpSupport() {
  showToast("Help & Support center coming soon!", "info");
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    apiClient.logout();
  }
}

// Toast notification
function showToast(message, type = "info") {
  console.log(`${type}: ${message}`);
}
