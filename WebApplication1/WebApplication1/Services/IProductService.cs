using WebApplication1.Model;

namespace WebApplication1.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllProductsAsync(string? category = null, decimal? minPrice = null, decimal? maxPrice = null, string? status = null);
        Task AddProductAsync(Product product);
        Task<Product?> GetProductByIdAsync(int id);
        Task UpdateProductAsync(Product product);
        Task DeleteProductAsync(int id);
        Task<Dictionary<string, int>> GetProductsByCategoryAsync();
        Task<Dictionary<string, int>> GetStockLevelsAsync();
        Task<object> GetSummaryAsync();
    }
}