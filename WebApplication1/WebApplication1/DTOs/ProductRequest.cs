namespace WebApplication1.DTOs
{
    public class ProductRequest
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
