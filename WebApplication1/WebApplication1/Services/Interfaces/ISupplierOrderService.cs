using WebApplication1.Model;

namespace WebApplication1.Services
{
    public interface ISupplierOrderService
    {
        Task<IEnumerable<SupplierOrder>> GetAllSupplierOrdersAsync(string? status = null, string? supplier = null, string? dateRange = null);
        Task AddSupplierOrderAsync(SupplierOrder order);
        Task<SupplierOrder?> GetSupplierOrderByIdAsync(int id);
        Task UpdateSupplierOrderAsync(SupplierOrder order);
        Task DeleteSupplierOrderAsync(int id);
        Task<Dictionary<string, int>> GetOrdersByStatusAsync();
        Task<object> GetSummaryAsync();
    }
}