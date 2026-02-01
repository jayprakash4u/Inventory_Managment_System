namespace WebApplication1.DTOs.Responses
{
    /// <summary>
    /// System business settings response DTO
    /// </summary>
    public class SystemSettingsResponse
    {
        /// <summary>
        /// Business Settings
        /// </summary>
        public string CompanyName { get; set; } = string.Empty;
        public string Currency { get; set; } = "USD";
        public decimal TaxRate { get; set; } = 10m;
        public int LowStockThreshold { get; set; } = 10;

        /// <summary>
        /// Notification Settings
        /// </summary>
        public bool LowStockNotifications { get; set; } = true;
        public bool EmailNotifications { get; set; } = true;
        public bool OrderNotifications { get; set; } = true;

        /// <summary>
        /// Data Management Settings
        /// </summary>
        public int AuditRetention { get; set; } = 90;
        public int RecordsPerPage { get; set; } = 25;

        /// <summary>
        /// Metadata
        /// </summary>
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = "system";
    }
}
