namespace WebApplication1.DTOs.Requests
{
    /// <summary>
    /// System business settings request DTO
    /// Handles all business-relevant configuration settings
    /// </summary>
    public class SystemSettingsRequest
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
        public int AuditRetention { get; set; } = 90; // days
        public int RecordsPerPage { get; set; } = 25;
    }
}
