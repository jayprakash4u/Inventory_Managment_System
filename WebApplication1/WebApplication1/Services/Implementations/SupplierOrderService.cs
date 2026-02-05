using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.Model;
using WebApplication1.Repository;

namespace WebApplication1.Services;

public class SupplierOrderService : ISupplierOrderService
{
    private readonly ISupplierOrderRepository _repository;

    public SupplierOrderService(ISupplierOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<SupplierOrder>> GetAllSupplierOrdersAsync(string? status = null, string? supplier = null, string? dateRange = null)
    {
        return await _repository.GetAllSupplierOrdersAsync(status, supplier, dateRange);
    }

    public async Task AddSupplierOrderAsync(SupplierOrder order)
    {
        await _repository.AddSupplierOrderAsync(order);
    }

    public async Task<SupplierOrder?> GetSupplierOrderByIdAsync(int id)
    {
        var order = await _repository.GetSupplierOrderByIdAsync(id);
        if (order == null)
        {
            throw new NotFoundException("SupplierOrder", id);
        }
        return order;
    }

    public async Task UpdateSupplierOrderAsync(SupplierOrder order)
    {
        await _repository.UpdateSupplierOrderAsync(order);
    }

    public async Task DeleteSupplierOrderAsync(int id)
    {
        await _repository.DeleteSupplierOrderAsync(id);
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
