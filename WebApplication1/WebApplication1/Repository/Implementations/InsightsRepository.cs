using WebApplication1.Data;
using WebApplication1.DTOs;

namespace WebApplication1.Repository
{
    public class InsightsRepository : IInsightsRepository
    {
        private readonly AppDbContext _context;

        public InsightsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<InsightsResponse> GetInsightsAsync()
        {
            var today = DateTime.UtcNow.Date;

            // Inventory metrics
            var totalProducts = _context.Products.Count();
            var lowStockCount = _context.Products.Count(p => p.Quantity > 0 && p.Quantity <= 10);
            var outOfStockCount = _context.Products.Count(p => p.Quantity == 0);
            var totalInventoryValue = _context.Products.Sum(p => p.Quantity * p.Price);

            // Customer orders metrics
            var totalCustomerOrders = _context.CustomerOrders.Count();
            var pendingCustomerOrders = _context.CustomerOrders.Count(o => o.Status == "pending");
            var deliveredCustomerOrders = _context.CustomerOrders.Count(o => o.Status == "delivered");
            var totalRevenue = _context.CustomerOrders.Where(o => o.Status == "delivered").Sum(o => o.TotalValue);

            // Supplier orders metrics
            var totalSupplierOrders = _context.SupplierOrders.Count();
            var pendingSupplierOrders = _context.SupplierOrders.Count(o => o.Status == "pending");
            var deliveredSupplierOrders = _context.SupplierOrders.Count(o => o.Status == "delivered");
            var totalPurchases = _context.SupplierOrders.Where(o => o.Status == "delivered").Sum(o => o.TotalValue);

            // Audit metrics
            var totalAuditLogs = _context.AuditLogs.Count();
            var todayActivities = _context.AuditLogs.Count(a => a.Timestamp.Date == today);
            var warnings = _context.AuditLogs.Count(a => a.Severity == "medium");
            var errors = _context.AuditLogs.Count(a => a.Severity == "high");
            var criticalEvents = _context.AuditLogs.Count(a => a.Severity == "critical");

            // Chart data
            var stockLevelsChart = new ChartData
            {
                Categories = new List<string> { "In Stock", "Low Stock", "Out of Stock" },
                Data = new List<int>
                {
                    _context.Products.Count(p => p.Quantity > 10),
                    lowStockCount,
                    outOfStockCount
                },
                Colors = new List<string> { "#4CAF50", "#FF9800", "#F44336" }
            };

            var auditActionsChart = new ChartData
            {
                Categories = new List<string> { "CREATE", "UPDATE", "DELETE", "VIEW" },
                Data = new List<int>
                {
                    _context.AuditLogs.Count(a => a.Action == "CREATE"),
                    _context.AuditLogs.Count(a => a.Action == "UPDATE"),
                    _context.AuditLogs.Count(a => a.Action == "DELETE"),
                    _context.AuditLogs.Count(a => a.Action == "VIEW")
                },
                Colors = new List<string> { "#2196F3", "#4CAF50", "#F44336", "#9C27B0" }
            };

            var supplierStatusChart = new ChartData
            {
                Labels = new List<string> { "Pending", "Approved", "Shipped", "Delivered" },
                Data = new List<int>
                {
                    _context.SupplierOrders.Count(o => o.Status == "pending"),
                    _context.SupplierOrders.Count(o => o.Status == "approved"),
                    _context.SupplierOrders.Count(o => o.Status == "shipped"),
                    _context.SupplierOrders.Count(o => o.Status == "delivered")
                },
                Colors = new List<string> { "#FF9800", "#2196F3", "#9C27B0", "#4CAF50" }
            };

            var customerStatusChart = new ChartData
            {
                Labels = new List<string> { "Pending", "Approved", "Shipped", "Delivered" },
                Data = new List<int>
                {
                    _context.CustomerOrders.Count(o => o.Status == "pending"),
                    _context.CustomerOrders.Count(o => o.Status == "approved"),
                    _context.CustomerOrders.Count(o => o.Status == "shipped"),
                    _context.CustomerOrders.Count(o => o.Status == "delivered")
                },
                Colors = new List<string> { "#FF9800", "#2196F3", "#9C27B0", "#4CAF50" }
            };

            // Revenue vs Purchases (monthly for last 6 months)
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            var revenueVsPurchasesChart = new ChartData
            {
                Categories = new List<string>(),
                Data = new List<int>() // Will be filled with revenue and purchases data
            };

            // Order trends (monthly orders)
            var orderTrendsChart = new ChartData
            {
                Categories = new List<string>(),
                Data = new List<int>()
            };

            // Audit trends (daily for last 7 days)
            var auditTrendsChart = new ChartData
            {
                Categories = new List<string>(),
                Data = new List<int>()
            };

            // Populate monthly data
            for (int i = 5; i >= 0; i--)
            {
                var month = DateTime.UtcNow.AddMonths(-i);
                var monthStart = new DateTime(month.Year, month.Month, 1);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                revenueVsPurchasesChart.Categories.Add(month.ToString("MMM yyyy"));
                var revenue = _context.CustomerOrders.Where(o => o.CreatedAt >= monthStart && o.CreatedAt <= monthEnd && o.Status == "delivered").Sum(o => (int)o.TotalValue);
                var purchases = _context.SupplierOrders.Where(o => o.CreatedAt >= monthStart && o.CreatedAt <= monthEnd && o.Status == "delivered").Sum(o => (int)o.TotalValue);
                revenueVsPurchasesChart.Data.Add(revenue);
                revenueVsPurchasesChart.Data.Add(purchases); // Note: This will have 12 values, 2 per month
            }

            // For simplicity, use single series for trends
            orderTrendsChart.Categories = revenueVsPurchasesChart.Categories;
            orderTrendsChart.Data = revenueVsPurchasesChart.Categories.Select((_, i) =>
            {
                var month = DateTime.UtcNow.AddMonths(- (5 - i));
                var monthStart = new DateTime(month.Year, month.Month, 1);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);
                return _context.CustomerOrders.Count(o => o.CreatedAt >= monthStart && o.CreatedAt <= monthEnd);
            }).ToList();

            // Audit trends for last 7 days
            for (int i = 6; i >= 0; i--)
            {
                var day = DateTime.UtcNow.AddDays(-i).Date;
                auditTrendsChart.Categories.Add(day.ToString("MMM dd"));
                auditTrendsChart.Data.Add(_context.AuditLogs.Count(a => a.Timestamp.Date == day));
            }

            return new InsightsResponse
            {
                TotalProducts = totalProducts,
                LowStockCount = lowStockCount,
                OutOfStockCount = outOfStockCount,
                TotalInventoryValue = totalInventoryValue,
                TotalCustomerOrders = totalCustomerOrders,
                PendingCustomerOrders = pendingCustomerOrders,
                DeliveredCustomerOrders = deliveredCustomerOrders,
                TotalRevenue = totalRevenue,
                TotalSupplierOrders = totalSupplierOrders,
                PendingSupplierOrders = pendingSupplierOrders,
                DeliveredSupplierOrders = deliveredSupplierOrders,
                TotalPurchases = totalPurchases,
                TotalAuditLogs = totalAuditLogs,
                TodayActivities = todayActivities,
                Warnings = warnings,
                Errors = errors,
                CriticalEvents = criticalEvents,
                StockLevelsChart = stockLevelsChart,
                AuditActionsChart = auditActionsChart,
                SupplierStatusChart = supplierStatusChart,
                CustomerStatusChart = customerStatusChart,
                RevenueVsPurchasesChart = revenueVsPurchasesChart,
                OrderTrendsChart = orderTrendsChart,
                AuditTrendsChart = auditTrendsChart
            };
        }
    }
}