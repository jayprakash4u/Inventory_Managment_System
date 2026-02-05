using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.Model;
using WebApplication1.Repository;

namespace WebApplication1.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync(string? category = null, decimal? minPrice = null, decimal? maxPrice = null, string? status = null)
    {
        return await _repository.GetAllProductsAsync(category, minPrice, maxPrice, status);
    }

    public async Task AddProductAsync(Product product)
    {
        await _repository.AddProductAsync(product);
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        var product = await _repository.GetProductByIdAsync(id);
        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }
        return product;
    }

    public async Task UpdateProductAsync(Product product)
    {
        await _repository.UpdateProductAsync(product);
    }

    public async Task DeleteProductAsync(int id)
    {
        await _repository.DeleteProductAsync(id);
    }

    public async Task<Dictionary<string, int>> GetProductsByCategoryAsync()
    {
        return await _repository.GetProductsByCategoryAsync();
    }

    public async Task<Dictionary<string, int>> GetStockLevelsAsync()
    {
        return await _repository.GetStockLevelsAsync();
    }

    public async Task<object> GetSummaryAsync()
    {
        return await _repository.GetSummaryAsync();
    }
}
