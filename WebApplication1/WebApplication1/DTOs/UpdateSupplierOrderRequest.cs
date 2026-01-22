namespace WebApplication1.DTOs
{
    public class UpdateSupplierOrderRequest
    {
        public string? OrderId { get; set; }
        public string? SupplierName { get; set; }
        public DateTime? OrderDate { get; set; }
        public string? Items { get; set; }
        public decimal? TotalValue { get; set; }
        public string? Status { get; set; }
    }
}