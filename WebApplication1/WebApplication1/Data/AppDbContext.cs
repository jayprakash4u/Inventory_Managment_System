using Microsoft.EntityFrameworkCore;
using WebApplication1.Model;

namespace WebApplication1.Data
{
    public class AppDbContext:DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            // Set a longer command timeout for database operations (60 seconds)
            Database.SetCommandTimeout(60000);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure RefreshToken -> User relationship
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany() // User can have many refresh tokens
                .HasForeignKey(rt => rt.UserEmail)
                .HasPrincipalKey(u => u.Email);

            // Add index on User.Email for faster lookups during login
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<User> Users => Set<User>();
        public DbSet<SupplierOrder> SupplierOrders => Set<SupplierOrder>();
        public DbSet<CustomerOrder> CustomerOrders => Set<CustomerOrder>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    }
}
