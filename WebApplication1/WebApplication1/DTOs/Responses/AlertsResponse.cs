namespace WebApplication1.DTOs
{
    public class AlertsResponse
    {
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public int TotalAlerts => LowStockCount + OutOfStockCount;
        public List<AlertItem> LowStockItems { get; set; } = new List<AlertItem>();
        public List<AlertItem> OutOfStockItems { get; set; } = new List<AlertItem>();
    }

    public class AlertItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? SKU { get; set; }
        public int Quantity { get; set; }
        public string? Category { get; set; }
        public DateTime? LastUpdated { get; set; }
    }
}
