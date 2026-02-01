/* ===============================
   AUTHENTICATION CHECK
============================== */
if (!apiClient.isAuthenticated()) {
  window.location.href = "login.html";
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  loadInsights();
});

// Load insights data
async function loadInsights() {
  try {
    // Fetch pre-processed data from server
    const response = await apiClient.get("/insights");
    const data = await response.json();

    console.log("Insights data received:", data);

    // Display metrics
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

    // Render charts with server-processed data
    renderStockLevelsChart(data.stockLevelsChart);
    renderRevenuePurchasesChart(data.revenueVsPurchasesChart);
    renderAuditActionsChart(data.auditActionsChart);
    renderAuditTrendsChart(data.auditTrendsChart);
    renderSupplierStatusChart(data.supplierStatusChart);
    renderCustomerStatusChart(data.customerStatusChart);
    renderOrderTrendsChart(data.orderTrendsChart);
    renderInventoryCategoryChart(data.stockLevelsChart); // Reuse for now
  } catch (error) {
    console.error("Error loading insights:", error);
    showToast(
      "Failed to load insights data from server. Please try again later.",
      "error",
    );
  }
}

// Render stock levels chart
function renderStockLevelsChart(chartData) {
  const container = document.querySelector("#stock-levels-chart");
  if (
    !chartData.data ||
    chartData.data.length === 0 ||
    chartData.data.every((d) => d === 0)
  ) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }

  const options = {
    series: chartData.data,
    chart: {
      type: "donut",
      height: 300,
      toolbar: { show: false },
    },
    labels: chartData.categories,
    colors: chartData.colors,
    legend: {
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(0) + "%";
      },
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

// Render audit actions chart
function renderAuditActionsChart(chartData) {
  const container = document.querySelector("#audit-actions-chart");
  if (
    !chartData.data ||
    chartData.data.length === 0 ||
    chartData.data.every((d) => d === 0)
  ) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }

  const options = {
    series: [
      {
        data: chartData.data,
      },
    ],
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
    },
    colors: chartData.colors,
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "60%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: "Count",
      },
    },
    yaxis: {
      title: {
        text: "Action Type",
      },
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

// Render supplier status chart
function renderSupplierStatusChart(chartData) {
  const container = document.querySelector("#supplier-status-chart");
  if (
    !chartData.data ||
    chartData.data.length === 0 ||
    chartData.data.every((d) => d === 0)
  ) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }

  const options = {
    series: chartData.data,
    chart: {
      type: "pie",
      height: 300,
      toolbar: { show: false },
    },
    labels: chartData.labels,
    colors: chartData.colors,
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + "%";
      },
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

// Render customer status chart
function renderCustomerStatusChart(chartData) {
  const container = document.querySelector("#customer-status-chart");
  if (
    !chartData.data ||
    chartData.data.length === 0 ||
    chartData.data.every((d) => d === 0)
  ) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }

  const options = {
    series: chartData.data,
    chart: {
      type: "pie",
      height: 300,
      toolbar: { show: false },
    },
    labels: chartData.labels,
    colors: chartData.colors,
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + "%";
      },
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

// Render revenue vs purchases chart
function renderRevenuePurchasesChart(chartData) {
  const container = document.querySelector("#revenue-purchases-chart");
  if (!chartData.data || chartData.data.length === 0) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }

  const revenues = chartData.data.filter((_, i) => i % 2 === 0);
  const purchases = chartData.data.filter((_, i) => i % 2 === 1);

  const options = {
    series: [
      {
        name: "Revenue",
        data: revenues,
      },
      {
        name: "Purchases",
        data: purchases,
      },
    ],
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
    },
    colors: ["#4CAF50", "#F44336"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: "Month",
      },
    },
    yaxis: {
      title: {
        text: "Amount ($)",
      },
    },
    legend: {
      position: "top",
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

// Render audit trends chart
function renderAuditTrendsChart(chartData) {
  const container = document.querySelector("#audit-trends-chart");
  if (
    !chartData.data ||
    chartData.data.length === 0 ||
    chartData.data.every((d) => d === 0)
  ) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }

  const options = {
    series: [
      {
        name: "Audit Activities",
        data: chartData.data,
      },
    ],
    chart: {
      type: "line",
      height: 300,
      toolbar: { show: false },
    },
    colors: ["#2196F3"],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: "Date",
      },
    },
    yaxis: {
      title: {
        text: "Activities",
      },
    },
    stroke: {
      curve: "smooth",
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

// Render order trends chart
function renderOrderTrendsChart(chartData) {
  const container = document.querySelector("#order-trends-chart");
  if (
    !chartData.data ||
    chartData.data.length === 0 ||
    chartData.data.every((d) => d === 0)
  ) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }

  const options = {
    series: [
      {
        name: "Orders",
        data: chartData.data,
      },
    ],
    chart: {
      type: "area",
      height: 300,
      toolbar: { show: false },
    },
    colors: ["#FF9800"],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: "Month",
      },
    },
    yaxis: {
      title: {
        text: "Number of Orders",
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

// Render inventory category chart (placeholder)
function renderInventoryCategoryChart(chartData) {
  const container = document.querySelector("#inventory-category-chart");
  if (
    !chartData.data ||
    chartData.data.length === 0 ||
    chartData.data.every((d) => d === 0)
  ) {
    container.innerHTML =
      "<p style='text-align: center; color: #666; padding: 50px;'>No data available</p>";
    return;
  }

  // For now, reuse stock levels as category chart
  const options = {
    series: chartData.data,
    chart: {
      type: "donut",
      height: 300,
      toolbar: { show: false },
    },
    labels: chartData.categories,
    colors: chartData.colors,
    legend: {
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(0) + "%";
      },
    },
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

// Toast notification
function showToast(message, type = "info") {
  console.log(`${type}: ${message}`);
}
