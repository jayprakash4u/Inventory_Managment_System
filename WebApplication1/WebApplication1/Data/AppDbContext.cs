using Microsoft.EntityFrameworkCore;
using WebApplication1.Model;

namespace WebApplication1.Data
{
    public class AppDbContext:DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<User> Users => Set<User>();
        public DbSet<SupplierOrder> SupplierOrders => Set<SupplierOrder>();
        public DbSet<CustomerOrder> CustomerOrders => Set<CustomerOrder>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    }
}
