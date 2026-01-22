// Insights hub page JavaScript

// Base URL of your backend API
const API_BASE = "https://localhost:44383/api";

const token = localStorage.getItem("token");

if (!token) {
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
    const response = await fetch(`${API_BASE}/insights`, {
      headers: { Authorization: "Bearer " + token },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Display metrics
    document.getElementById("inventory-total-products").textContent =
      data.totalProducts || 0;
    document.getElementById("inventory-low-stock").textContent =
      data.lowStockCount || 0;
    document.getElementById("customer-total-orders").textContent =
      data.totalOrders || 0;
    document.getElementById("audit-total-logs").textContent =
      data.auditLogsCount || 0;

    // Render charts with server-processed data
    renderStockLevelsChart(data.stockLevelsChart);
    renderAuditActionsChart(data.auditActionsChart);
    renderSupplierStatusChart(data.supplierStatusChart);
    renderCustomerStatusChart(data.customerStatusChart);
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

  const chart = new ApexCharts(
    document.querySelector("#stock-levels-chart"),
    options,
  );
  chart.render();
}

// Render audit actions chart
function renderAuditActionsChart(chartData) {
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

  const chart = new ApexCharts(
    document.querySelector("#audit-actions-chart"),
    options,
  );
  chart.render();
}

// Render supplier status chart
function renderSupplierStatusChart(chartData) {
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

  const chart = new ApexCharts(
    document.querySelector("#supplier-status-chart"),
    options,
  );
  chart.render();
}

// Render customer status chart
function renderCustomerStatusChart(chartData) {
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

  const chart = new ApexCharts(
    document.querySelector("#customer-status-chart"),
    options,
  );
  chart.render();
}

// Toast notification
function showToast(message, type = "info") {
  console.log(`${type}: ${message}`);
}
