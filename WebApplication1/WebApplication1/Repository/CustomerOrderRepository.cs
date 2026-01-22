using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Repository
{
    public class CustomerOrderRepository : ICustomerOrderRepository
    {
        private readonly AppDbContext _context;
        public CustomerOrderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CustomerOrder>> GetAllCustomerOrdersAsync(string? status = null, string? customer = null, string? dateRange = null)
        {
            var query = _context.CustomerOrders.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            if (!string.IsNullOrEmpty(customer))
            {
                query = query.Where(o => o.CustomerName.Contains(customer));
            }

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

        public async Task AddCustomerOrderAsync(CustomerOrder order)
        {
            _context.CustomerOrders.Add(order);
            await _context.SaveChangesAsync();
        }

        public async Task<CustomerOrder?> GetCustomerOrderByIdAsync(int id)
        {
            return await _context.CustomerOrders.FindAsync(id);
        }

        public async Task UpdateCustomerOrderAsync(CustomerOrder order)
        {
            _context.CustomerOrders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCustomerOrderAsync(int id)
        {
            var order = await _context.CustomerOrders.FindAsync(id);
            if (order != null)
            {
                _context.CustomerOrders.Remove(order);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Dictionary<string, int>> GetOrdersByStatusAsync()
        {
            return await _context.CustomerOrders
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Status, g => g.Count);
        }

        public async Task<object> GetSummaryAsync()
        {
            var summary = await _context.CustomerOrders
                .GroupBy(o => 1)
                .Select(g => new
                {
                    TotalOrders = g.Count(),
                    Pending = g.Count(o => o.Status == "pending"),
                    Delivered = g.Count(o => o.Status == "delivered"),
                    TotalRevenue = g.Sum(o => o.TotalValue)
                })
                .FirstOrDefaultAsync();

            return summary ?? new
            {
                TotalOrders = 0,
                Pending = 0,
                Delivered = 0,
                TotalRevenue = 0M
            };
        }
    }
}