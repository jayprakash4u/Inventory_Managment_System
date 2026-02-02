using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.DTOs;

namespace WebApplication1.Repository;

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
        _context.Database.SetCommandTimeout(120);

        var (productMetrics, customerOrderMetrics, supplierOrderMetrics, auditMetrics) = await GetMetricsAsync(today);
        var (auditActionsData, supplierStatusData, customerStatusData) = await GetChartDataAsync();

        return BuildInsightsResponse(productMetrics, customerOrderMetrics, supplierOrderMetrics, auditMetrics,
            auditActionsData, supplierStatusData, customerStatusData);
    }

    private async Task<(dynamic Product, dynamic CustomerOrders, dynamic SupplierOrders, dynamic Audit)> GetMetricsAsync(DateTime today)
    {
        var productMetrics = await _context.Products
            .AsNoTracking()
            .GroupBy(p => 1)
            .Select(g => new
            {
                TotalProducts = g.Count(),
                InStock = g.Count(p => p.Quantity > 10),
                LowStock = g.Count(p => p.Quantity > 0 && p.Quantity <= 10),
                OutOfStock = g.Count(p => p.Quantity == 0),
                TotalValue = g.Sum(p => p.Quantity * p.Price)
            })
            .FirstOrDefaultAsync() ?? new { TotalProducts = 0, InStock = 0, LowStock = 0, OutOfStock = 0, TotalValue = 0m };

        var customerOrderMetrics = await _context.CustomerOrders
            .AsNoTracking()
            .GroupBy(p => 1)
            .Select(g => new
            {
                TotalOrders = g.Count(),
                Pending = g.Count(o => o.Status == "pending"),
                Delivered = g.Count(o => o.Status == "delivered"),
                Revenue = g.Where(o => o.Status == "delivered").Sum(o => o.TotalValue)
            })
            .FirstOrDefaultAsync() ?? new { TotalOrders = 0, Pending = 0, Delivered = 0, Revenue = 0m };

        var supplierOrderMetrics = await _context.SupplierOrders
            .AsNoTracking()
            .GroupBy(p => 1)
            .Select(g => new
            {
                TotalOrders = g.Count(),
                Pending = g.Count(o => o.Status == "pending"),
                Delivered = g.Count(o => o.Status == "delivered"),
                Purchases = g.Where(o => o.Status == "delivered").Sum(o => o.TotalValue)
            })
            .FirstOrDefaultAsync() ?? new { TotalOrders = 0, Pending = 0, Delivered = 0, Purchases = 0m };

        var auditMetrics = await _context.AuditLogs
            .AsNoTracking()
            .GroupBy(p => 1)
            .Select(g => new
            {
                TotalLogs = g.Count(),
                TodayCount = g.Count(a => a.Timestamp.Date == today),
                Warnings = g.Count(a => a.Severity == "medium"),
                Errors = g.Count(a => a.Severity == "high"),
                Critical = g.Count(a => a.Severity == "critical")
            })
            .FirstOrDefaultAsync() ?? new { TotalLogs = 0, TodayCount = 0, Warnings = 0, Errors = 0, Critical = 0 };

        return (productMetrics, customerOrderMetrics, supplierOrderMetrics, auditMetrics);
    }

    private async Task<(List<dynamic> AuditActions, List<dynamic> SupplierStatus, List<dynamic> CustomerStatus)> GetChartDataAsync()
    {
        var auditActionsData = await _context.AuditLogs
            .AsNoTracking()
            .GroupBy(a => a.Action)
            .Select(g => new { Action = g.Key, Count = g.Count() })
            .ToListAsync();

        var supplierStatusData = await _context.SupplierOrders
            .AsNoTracking()
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var customerStatusData = await _context.CustomerOrders
            .AsNoTracking()
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return (auditActionsData.Cast<dynamic>().ToList(), 
                supplierStatusData.Cast<dynamic>().ToList(), 
                customerStatusData.Cast<dynamic>().ToList());
    }

    private InsightsResponse BuildInsightsResponse(
        dynamic productMetrics,
        dynamic customerOrderMetrics,
        dynamic supplierOrderMetrics,
        dynamic auditMetrics,
        List<dynamic> auditActionsData,
        List<dynamic> supplierStatusData,
        List<dynamic> customerStatusData)
    {
        var stockLevelsChart = new ChartData
        {
            Categories = new List<string> { "In Stock", "Low Stock", "Out of Stock" },
            Data = new List<int>
            {
                (int)productMetrics.InStock,
                (int)productMetrics.LowStock,
                (int)productMetrics.OutOfStock
            },
            Colors = new List<string> { "#4CAF50", "#FF9800", "#F44336" }
        };

        var auditActionsChart = new ChartData
        {
            Categories = new List<string> { "CREATE", "UPDATE", "DELETE", "VIEW" },
            Data = new List<int>
            {
                auditActionsData.FirstOrDefault(a => a.Action == "CREATE")?.Count ?? 0,
                auditActionsData.FirstOrDefault(a => a.Action == "UPDATE")?.Count ?? 0,
                auditActionsData.FirstOrDefault(a => a.Action == "DELETE")?.Count ?? 0,
                auditActionsData.FirstOrDefault(a => a.Action == "VIEW")?.Count ?? 0
            },
            Colors = new List<string> { "#2196F3", "#4CAF50", "#F44336", "#9C27B0" }
        };

        var supplierStatusChart = new ChartData
        {
            Labels = new List<string> { "Pending", "Approved", "Shipped", "Delivered" },
            Data = new List<int>
            {
                supplierStatusData.FirstOrDefault(s => s.Status == "pending")?.Count ?? 0,
                supplierStatusData.FirstOrDefault(s => s.Status == "approved")?.Count ?? 0,
                supplierStatusData.FirstOrDefault(s => s.Status == "shipped")?.Count ?? 0,
                supplierStatusData.FirstOrDefault(s => s.Status == "delivered")?.Count ?? 0
            },
            Colors = new List<string> { "#FF9800", "#2196F3", "#9C27B0", "#4CAF50" }
        };

        var customerStatusChart = new ChartData
        {
            Labels = new List<string> { "Pending", "Approved", "Shipped", "Delivered" },
            Data = new List<int>
            {
                customerStatusData.FirstOrDefault(s => s.Status == "pending")?.Count ?? 0,
                customerStatusData.FirstOrDefault(s => s.Status == "approved")?.Count ?? 0,
                customerStatusData.FirstOrDefault(s => s.Status == "shipped")?.Count ?? 0,
                customerStatusData.FirstOrDefault(s => s.Status == "delivered")?.Count ?? 0
            },
            Colors = new List<string> { "#FF9800", "#2196F3", "#9C27B0", "#4CAF50" }
        };

        var revenueVsPurchasesChart = new ChartData
        {
            Categories = GenerateMonthlyCategories(6),
            Data = new List<int>()
        };

        var orderTrendsChart = new ChartData
        {
            Categories = revenueVsPurchasesChart.Categories,
            Data = GenerateDistributedData((int)customerOrderMetrics.TotalOrders, 6)
        };

        var auditTrendsChart = new ChartData
        {
            Categories = GenerateDailyCategories(7),
            Data = GenerateDistributedData((int)auditMetrics.TotalLogs, 7)
        };

        return new InsightsResponse
        {
            TotalProducts = (int)productMetrics.TotalProducts,
            LowStockCount = (int)productMetrics.LowStock,
            OutOfStockCount = (int)productMetrics.OutOfStock,
            TotalInventoryValue = (decimal)productMetrics.TotalValue,
            TotalCustomerOrders = (int)customerOrderMetrics.TotalOrders,
            PendingCustomerOrders = (int)customerOrderMetrics.Pending,
            DeliveredCustomerOrders = (int)customerOrderMetrics.Delivered,
            TotalRevenue = (decimal)customerOrderMetrics.Revenue,
            TotalSupplierOrders = (int)supplierOrderMetrics.TotalOrders,
            PendingSupplierOrders = (int)supplierOrderMetrics.Pending,
            DeliveredSupplierOrders = (int)supplierOrderMetrics.Delivered,
            TotalPurchases = (decimal)supplierOrderMetrics.Purchases,
            TotalAuditLogs = (int)auditMetrics.TotalLogs,
            TodayActivities = (int)auditMetrics.TodayCount,
            Warnings = (int)auditMetrics.Warnings,
            Errors = (int)auditMetrics.Errors,
            CriticalEvents = (int)auditMetrics.Critical,
            StockLevelsChart = stockLevelsChart,
            AuditActionsChart = auditActionsChart,
            SupplierStatusChart = supplierStatusChart,
            CustomerStatusChart = customerStatusChart,
            RevenueVsPurchasesChart = revenueVsPurchasesChart,
            OrderTrendsChart = orderTrendsChart,
            AuditTrendsChart = auditTrendsChart
        };
    }

    private static List<string> GenerateMonthlyCategories(int months)
    {
        return Enumerable.Range(0, months)
            .Select(i => DateTime.UtcNow.AddMonths(-(months - 1 - i)).ToString("MMM yyyy"))
            .ToList();
    }

    private static List<string> GenerateDailyCategories(int days)
    {
        return Enumerable.Range(0, days)
            .Select(i => DateTime.UtcNow.AddDays(-(days - 1 - i)).Date.ToString("MMM dd"))
            .ToList();
    }

    private static List<int> GenerateDistributedData(int total, int count)
    {
        var perItem = total > 0 ? Math.Max(1, total / count) : 0;
        return Enumerable.Repeat(perItem, count).ToList();
    }
}
