namespace WebApplication1.DTOs
{
    public class UpdateProductRequest
    {
        public string? Name { get; set; }
        public string? Sku { get; set; }
        public string? CategoryName { get; set; }
        public int? Quantity { get; set; }
        public decimal? Price { get; set; }
        public string? Description { get; set; }
    }
}