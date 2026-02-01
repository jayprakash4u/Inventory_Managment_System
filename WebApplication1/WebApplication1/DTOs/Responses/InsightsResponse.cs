namespace WebApplication1.DTOs
{
    public class InsightsResponse
    {
        // Inventory metrics
        public int TotalProducts { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public decimal TotalInventoryValue { get; set; }

        // Customer orders metrics
        public int TotalCustomerOrders { get; set; }
        public int PendingCustomerOrders { get; set; }
        public int DeliveredCustomerOrders { get; set; }
        public decimal TotalRevenue { get; set; }

        // Supplier orders metrics
        public int TotalSupplierOrders { get; set; }
        public int PendingSupplierOrders { get; set; }
        public int DeliveredSupplierOrders { get; set; }
        public decimal TotalPurchases { get; set; }

        // Audit metrics
        public int TotalAuditLogs { get; set; }
        public int TodayActivities { get; set; }
        public int Warnings { get; set; }
        public int Errors { get; set; }
        public int CriticalEvents { get; set; }

        // Chart data
        public ChartData StockLevelsChart { get; set; }
        public ChartData AuditActionsChart { get; set; }
        public ChartData SupplierStatusChart { get; set; }
        public ChartData CustomerStatusChart { get; set; }
        public ChartData RevenueVsPurchasesChart { get; set; }
        public ChartData OrderTrendsChart { get; set; }
        public ChartData AuditTrendsChart { get; set; }
    }

    public class ChartData
    {
        public List<int> Data { get; set; }
        public List<string> Categories { get; set; }
        public List<string> Labels { get; set; }
        public List<string> Colors { get; set; }
    }
}