namespace WebApplication1.DTOs
{
    public class CreateSupplierOrderRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string Items { get; set; } = string.Empty;
        public decimal TotalValue { get; set; }
        public string Status { get; set; } = "pending";
    }
}