using WebApplication1.Model;

namespace WebApplication1.Services
{
    public interface ICustomerOrderService
    {
        Task<IEnumerable<CustomerOrder>> GetAllCustomerOrdersAsync(string? status = null, string? customer = null, string? dateRange = null);
        Task AddCustomerOrderAsync(CustomerOrder order);
        Task<CustomerOrder?> GetCustomerOrderByIdAsync(int id);
        Task UpdateCustomerOrderAsync(CustomerOrder order);
        Task DeleteCustomerOrderAsync(int id);
        Task<Dictionary<string, int>> GetOrdersByStatusAsync();
        Task<object> GetSummaryAsync();
    }
}