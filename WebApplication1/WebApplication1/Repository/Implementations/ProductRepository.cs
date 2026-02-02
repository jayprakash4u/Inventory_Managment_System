using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Repository;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync(string? category = null, decimal? minPrice = null, decimal? maxPrice = null, string? status = null)
    {
        var query = _context.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.CategoryName == category);

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        if (!string.IsNullOrEmpty(status))
        {
            query = status switch
            {
                "In Stock" => query.Where(p => p.Quantity >= 5),
                "Low Stock" => query.Where(p => p.Quantity > 0 && p.Quantity < 5),
                "Out of Stock" => query.Where(p => p.Quantity == 0),
                _ => query
            };
        }

        return await query.OrderBy(p => p.Id).ToListAsync();
    }

    public async Task AddProductAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await _context.Products.FindAsync(id);
    }

    public async Task UpdateProductAsync(Product product)
    {
        _context.Products.Update(product);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product != null)
        {
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Dictionary<string, int>> GetProductsByCategoryAsync()
    {
        return await _context.Products
            .AsNoTracking()
            .GroupBy(p => p.CategoryName)
            .Select(g => new { Category = g.Key ?? "Uncategorized", Count = g.Count() })
            .ToDictionaryAsync(g => g.Category, g => g.Count);
    }

    public async Task<Dictionary<string, int>> GetStockLevelsAsync()
    {
        var inStock = await _context.Products.AsNoTracking().CountAsync(p => p.Quantity >= 5);
        var lowStock = await _context.Products.AsNoTracking().CountAsync(p => p.Quantity > 0 && p.Quantity < 5);
        var outOfStock = await _context.Products.AsNoTracking().CountAsync(p => p.Quantity == 0);

        return new Dictionary<string, int>
        {
            ["In Stock"] = inStock,
            ["Low Stock"] = lowStock,
            ["Out of Stock"] = outOfStock
        };
    }

    public async Task<object> GetSummaryAsync()
    {
        var summary = await _context.Products
            .AsNoTracking()
            .GroupBy(p => 1)
            .Select(g => new
            {
                TotalProducts = g.Count(),
                LowStock = g.Count(p => p.Quantity > 0 && p.Quantity < 5),
                OutOfStock = g.Count(p => p.Quantity == 0),
                TotalValue = g.Sum(p => p.Quantity * p.Price)
            })
            .FirstOrDefaultAsync();

        return summary ?? new { TotalProducts = 0, LowStock = 0, OutOfStock = 0, TotalValue = 0m };
    }
}
