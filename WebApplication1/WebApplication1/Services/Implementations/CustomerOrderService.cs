using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.Model;
using WebApplication1.Repository;

namespace WebApplication1.Services;

public class CustomerOrderService : ICustomerOrderService
{
    private readonly ICustomerOrderRepository _repository;

    public CustomerOrderService(ICustomerOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CustomerOrder>> GetAllCustomerOrdersAsync(string? status = null, string? customer = null, string? dateRange = null)
    {
        return await _repository.GetAllCustomerOrdersAsync(status, customer, dateRange);
    }

    public async Task AddCustomerOrderAsync(CustomerOrder order)
    {
        await _repository.AddCustomerOrderAsync(order);
    }

    public async Task<CustomerOrder?> GetCustomerOrderByIdAsync(int id)
    {
        var order = await _repository.GetCustomerOrderByIdAsync(id);
        if (order == null)
        {
            throw new NotFoundException("CustomerOrder", id);
        }
        return order;
    }

    public async Task UpdateCustomerOrderAsync(CustomerOrder order)
    {
        await _repository.UpdateCustomerOrderAsync(order);
    }

    public async Task DeleteCustomerOrderAsync(int id)
    {
        await _repository.DeleteCustomerOrderAsync(id);
    }

    public async Task<Dictionary<string, int>> GetOrdersByStatusAsync()
    {
        return await _repository.GetOrdersByStatusAsync();
    }

    public async Task<object> GetSummaryAsync()
    {
        return await _repository.GetSummaryAsync();
    }
}
