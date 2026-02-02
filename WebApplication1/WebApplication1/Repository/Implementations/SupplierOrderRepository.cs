using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Repository;

public class SupplierOrderRepository : ISupplierOrderRepository
{
    private readonly AppDbContext _context;

    public SupplierOrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SupplierOrder>> GetAllSupplierOrdersAsync(string? status = null, string? supplier = null, string? dateRange = null)
    {
        var query = _context.SupplierOrders.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(o => o.Status == status);

        if (!string.IsNullOrEmpty(supplier))
            query = query.Where(o => o.SupplierName.Contains(supplier));

        if (!string.IsNullOrEmpty(dateRange))
        {
            var now = DateTime.UtcNow;
            query = dateRange switch
            {
                "month" => query.Where(o => o.OrderDate >= now.AddMonths(-1)),
                "week" => query.Where(o => o.OrderDate >= now.AddDays(-7)),
                _ => query
            };
        }

        return await query.OrderByDescending(o => o.OrderDate).ToListAsync();
    }

    public async Task AddSupplierOrderAsync(SupplierOrder order)
    {
        _context.SupplierOrders.Add(order);
        await _context.SaveChangesAsync();
    }

    public async Task<SupplierOrder?> GetSupplierOrderByIdAsync(int id)
    {
        return await _context.SupplierOrders.FindAsync(id);
    }

    public async Task UpdateSupplierOrderAsync(SupplierOrder order)
    {
        _context.SupplierOrders.Update(order);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteSupplierOrderAsync(int id)
    {
        var order = await _context.SupplierOrders.FindAsync(id);
        if (order != null)
        {
            _context.SupplierOrders.Remove(order);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Dictionary<string, int>> GetOrdersByStatusAsync()
    {
        return await _context.SupplierOrders
            .AsNoTracking()
            .GroupBy(o => o.Status ?? "Unknown")
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Status, g => g.Count);
    }

    public async Task<object> GetSummaryAsync()
    {
        var summary = await _context.SupplierOrders
            .AsNoTracking()
            .GroupBy(o => 1)
            .Select(g => new
            {
                TotalOrders = g.Count(),
                Pending = g.Count(o => o.Status == "pending"),
                Delivered = g.Count(o => o.Status == "delivered"),
                TotalValue = g.Sum(o => o.TotalValue)
            })
            .FirstOrDefaultAsync();

        return summary ?? new { TotalOrders = 0, Pending = 0, Delivered = 0, TotalValue = 0m };
    }
}
