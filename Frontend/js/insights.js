if (!apiClient.isAuthenticated()) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  loadInsights();
});

async function loadInsights() {
  try {
    const response = await apiClient.get("/insights");
    const data = await response.json();
    document.getElementById("inventory-total-products").textContent =
      data.totalProducts || 0;
    document.getElementById("inventory-low-stock").textContent =
      data.lowStockCount || 0;
    document.getElementById("inventory-out-of-stock").textContent =
      data.outOfStockCount || 0;
    document.getElementById("inventory-total-value").textContent =
      `$${data.totalInventoryValue?.toLocaleString() || 0}`;
    document.getElementById("customer-total-orders").textContent =
      data.totalCustomerOrders || 0;
    document.getElementById("customer-total-revenue").textContent =
      `$${data.totalRevenue?.toLocaleString() || 0}`;
    document.getElementById("supplier-total-orders").textContent =
      data.totalSupplierOrders || 0;
    document.getElementById("supplier-total-purchases").textContent =
      `$${data.totalPurchases?.toLocaleString() || 0}`;
    document.getElementById("audit-total-logs").textContent =
      data.totalAuditLogs || 0;
    document.getElementById("audit-today-activities").textContent =
      data.todayActivities || 0;
    document.getElementById("audit-warnings").textContent = data.warnings || 0;
    document.getElementById("audit-critical-events").textContent =
      data.criticalEvents || 0;
    renderStockLevelsChart(data.stockLevelsChart);
    renderRevenuePurchasesChart(data.revenueVsPurchasesChart);
    renderAuditActionsChart(data.auditActionsChart);
    renderAuditTrendsChart(data.auditTrendsChart);
    renderSupplierStatusChart(data.supplierStatusChart);
    renderCustomerStatusChart(data.customerStatusChart);
    renderOrderTrendsChart(data.orderTrendsChart);
    renderInventoryCategoryChart(data.stockLevelsChart);
  } catch (error) {
    console.error("Error loading insights:", error);
    showToast(
      "Failed to load insights data from server. Please try again later.",
      "error",
    );
  }
}

function renderStockLevelsChart(chartData) {
  const container = document.querySelector("#stock-levels-chart");
  if (!chartData?.data?.length || chartData.data.every((d) => d === 0)) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }
  new ApexCharts(container, {
    series: chartData.data,
    chart: { type: "donut", height: 300, toolbar: { show: false } },
    labels: chartData.categories,
    colors: chartData.colors,
    legend: { position: "bottom" },
    plotOptions: { pie: { donut: { size: "70%" } } },
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(0) + "%" },
  }).render();
}

function renderAuditActionsChart(chartData) {
  const container = document.querySelector("#audit-actions-chart");
  if (!chartData?.data?.length || chartData.data.every((d) => d === 0)) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }
  new ApexCharts(container, {
    series: [{ data: chartData.data }],
    chart: { type: "bar", height: 300, toolbar: { show: false } },
    colors: chartData.colors,
    plotOptions: {
      bar: { horizontal: true, columnWidth: "60%", borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories, title: { text: "Count" } },
    yaxis: { title: { text: "Action Type" } },
  }).render();
}

function renderSupplierStatusChart(chartData) {
  const container = document.querySelector("#supplier-status-chart");
  if (!chartData?.data?.length || chartData.data.every((d) => d === 0)) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }
  new ApexCharts(container, {
    series: chartData.data,
    chart: { type: "pie", height: 300, toolbar: { show: false } },
    labels: chartData.labels,
    colors: chartData.colors,
    legend: { position: "bottom" },
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + "%" },
  }).render();
}

function renderCustomerStatusChart(chartData) {
  const container = document.querySelector("#customer-status-chart");
  if (!chartData?.data?.length || chartData.data.every((d) => d === 0)) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }
  new ApexCharts(container, {
    series: chartData.data,
    chart: { type: "pie", height: 300, toolbar: { show: false } },
    labels: chartData.labels,
    colors: chartData.colors,
    legend: { position: "bottom" },
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + "%" },
  }).render();
}

function renderRevenuePurchasesChart(chartData) {
  const container = document.querySelector("#revenue-purchases-chart");
  if (!chartData?.data?.length) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }
  new ApexCharts(container, {
    series: [
      { name: "Revenue", data: chartData.data.filter((_, i) => i % 2 === 0) },
      { name: "Purchases", data: chartData.data.filter((_, i) => i % 2 === 1) },
    ],
    chart: { type: "bar", height: 300, toolbar: { show: false } },
    colors: ["#4CAF50", "#F44336"],
    plotOptions: { bar: { horizontal: false, columnWidth: "60%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories, title: { text: "Month" } },
    yaxis: { title: { text: "Amount ($)" } },
    legend: { position: "top" },
  }).render();
}

function renderAuditTrendsChart(chartData) {
  const container = document.querySelector("#audit-trends-chart");
  if (!chartData?.data?.length || chartData.data.every((d) => d === 0)) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }
  new ApexCharts(container, {
    series: [{ name: "Audit Activities", data: chartData.data }],
    chart: { type: "line", height: 300, toolbar: { show: false } },
    colors: ["#2196F3"],
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories, title: { text: "Date" } },
    yaxis: { title: { text: "Activities" } },
    stroke: { curve: "smooth" },
  }).render();
}

function renderOrderTrendsChart(chartData) {
  const container = document.querySelector("#order-trends-chart");
  if (!chartData?.data?.length || chartData.data.every((d) => d === 0)) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }
  new ApexCharts(container, {
    series: [{ name: "Orders", data: chartData.data }],
    chart: { type: "area", height: 300, toolbar: { show: false } },
    colors: ["#FF9800"],
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories, title: { text: "Month" } },
    yaxis: { title: { text: "Number of Orders" } },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
  }).render();
}

function renderInventoryCategoryChart(chartData) {
  const container = document.querySelector("#inventory-category-chart");
  if (!chartData?.data?.length || chartData.data.every((d) => d === 0)) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }
  new ApexCharts(container, {
    series: chartData.data,
    chart: { type: "donut", height: 300, toolbar: { show: false } },
    labels: chartData.categories,
    colors: chartData.colors,
    legend: { position: "bottom" },
    plotOptions: { pie: { donut: { size: "70%" } } },
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(0) + "%" },
  }).render();
}

function showToast(message, type = "info") {
  console.log(`${type}: ${message}`);
}
