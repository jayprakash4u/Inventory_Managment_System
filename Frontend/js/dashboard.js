// API base URL
const API_BASE = "https://localhost:44383/api/dashboard"; // Adjust port as needed

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// Fetch data from API
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

// Load summary data
async function loadSummary() {
  const data = await fetchData("/summary");
  if (data) {
    document.getElementById("products-count").textContent = data.totalProducts;
    document.getElementById("purchase-orders-count").textContent =
      data.totalPurchaseOrders;
    document.getElementById("sales-orders-count").textContent =
      data.totalSalesOrders;
    document.getElementById("inventory-alerts-count").textContent =
      data.inventoryAlerts;
  } else {
    // Fallback sample data
    document.getElementById("products-count").textContent = "249";
    document.getElementById("purchase-orders-count").textContent = "83";
    document.getElementById("sales-orders-count").textContent = "79";
    document.getElementById("inventory-alerts-count").textContent = "58";
  }
}

// Load top products chart
async function loadTopProductsChart() {
  const data = await fetchData("/top-products");
  let chartData = data;
  if (!data) {
    // Fallback sample data
    chartData = {
      data: [120, 95, 80, 65, 50],
      categories: ["iPhone 13", "Galaxy S21", "MacBook Pro", "AirPods", "iPad"],
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
}

// Load orders over time chart
async function loadOrdersChart() {
  const data = await fetchData("/orders-over-time");
  let chartData = data;
  if (!data) {
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
}

// Load sales by category chart
async function loadSalesByCategoryChart() {
  const data = await fetchData("/sales-by-category");
  let chartData = data;
  if (!data) {
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
}

// Load inventory trends chart
async function loadInventoryTrendsChart() {
  const data = await fetchData("/inventory-trends");
  let chartData = data;
  if (!data) {
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
}

// Charts stuff
function renderChart(chartId, config) {
  const chartElement = document.querySelector(`#${chartId}`);
  if (!chartElement) return;

  try {
    const chart = new ApexCharts(chartElement, config);
    chart.render();
  } catch (error) {
    console.error(`Error rendering ${chartId} chart:`, error);
  }
}

async function initCharts() {
  await loadSummary();
  await loadTopProductsChart();
  await loadOrdersChart();
  await loadSalesByCategoryChart();
  await loadInventoryTrendsChart();
  loadStockDistributionChart();
  loadMonthlyPerformanceChart();
}

// Load stock distribution chart (donut)
function loadStockDistributionChart() {
  const config = {
    series: [35, 25, 20, 15, 5],
    chart: { type: "donut", height: 350, toolbar: { show: false } },
    labels: ["Electronics", "Apparel", "Home", "Books", "Sports"],
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
}

// Load monthly performance chart (radar)
function loadMonthlyPerformanceChart() {
  const config = {
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
  renderChart("radar-chart", config);
}

// Initialize charts when the page loads
document.addEventListener("DOMContentLoaded", function () {
  initCharts();

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
  const categorySelect = document.getElementById("category");
  const exportBtn = document.querySelector(".export-chart");

  if (timeRangeSelect) {
    timeRangeSelect.addEventListener("change", function () {
      // Simulate updating charts based on time range
      console.log("Time range changed to:", this.value);
      // In a real app, re-fetch data and update charts
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", function () {
      console.log("Category changed to:", this.value);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      alert("Charts exported successfully!");
    });
  }
});
