using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;
        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync(string? category = null, decimal? minPrice = null, decimal? maxPrice = null, string? status = null)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.CategoryName == category);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

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
                .GroupBy(p => p.CategoryName)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Category, g => g.Count);
        }

        public async Task<Dictionary<string, int>> GetStockLevelsAsync()
        {
            var result = new Dictionary<string, int>
            {
                ["In Stock"] = 0,
                ["Low Stock"] = 0,
                ["Out of Stock"] = 0
            };

            var products = await _context.Products.ToListAsync();
            foreach (var product in products)
            {
                if (product.Quantity == 0)
                    result["Out of Stock"]++;
                else if (product.Quantity < 5)
                    result["Low Stock"]++;
                else
                    result["In Stock"]++;
            }

            return result;
        }

        public async Task<object> GetSummaryAsync()
        {
            var products = await _context.Products.ToListAsync();
            int totalProducts = products.Count;
            int lowStock = 0;
            int outOfStock = 0;
            decimal totalValue = 0;

            foreach (var product in products)
            {
                if (product.Quantity == 0)
                    outOfStock++;
                else if (product.Quantity < 5)
                    lowStock++;

                totalValue += product.Quantity * product.Price;
            }

            return new
            {
                TotalProducts = totalProducts,
                LowStock = lowStock,
                OutOfStock = outOfStock,
                TotalValue = totalValue
            };
        }
    }
}