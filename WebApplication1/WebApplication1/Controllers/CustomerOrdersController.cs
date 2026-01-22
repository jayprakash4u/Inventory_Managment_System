using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs;
using WebApplication1.Model;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/customer-orders")]
    public class CustomerOrdersController : ControllerBase
    {
        private readonly ICustomerOrderService _service;
        public CustomerOrdersController(ICustomerOrderService service)
        {
            _service = service;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllCustomerOrders(
            [FromQuery] string? status = null,
            [FromQuery] string? customer = null,
            [FromQuery] string? dateRange = null,
            [FromQuery] int draw = 1,
            [FromQuery] int start = 0,
            [FromQuery] int length = 10)
        {
            var allOrders = await _service.GetAllCustomerOrdersAsync(status, customer, dateRange);
            var totalRecords = allOrders.Count();
            var data = allOrders.Skip(start).Take(length).ToList();

            return Ok(new
            {
                draw,
                recordsTotal = totalRecords,
                recordsFiltered = totalRecords,
                data
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomerOrder(int id)
        {
            var order = await _service.GetCustomerOrderByIdAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }


        [HttpPost]
        public async Task<IActionResult> CreateCustomerOrder([FromBody] CreateCustomerOrderRequest request)
        {
            var order = new CustomerOrder
            {
                OrderId = request.OrderId,
                CustomerName = request.CustomerName,
                OrderDate = request.OrderDate,
                Items = request.Items,
                TotalValue = request.TotalValue,
                Status = request.Status
            };
            await _service.AddCustomerOrderAsync(order);
            return Ok(order);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomerOrder(int id, [FromBody] UpdateCustomerOrderRequest request)
        {
            var order = await _service.GetCustomerOrderByIdAsync(id);
            if (order == null) return NotFound();

            if (request.OrderId != null) order.OrderId = request.OrderId;
            if (request.CustomerName != null) order.CustomerName = request.CustomerName;
            if (request.OrderDate.HasValue) order.OrderDate = request.OrderDate.Value;
            if (request.Items != null) order.Items = request.Items;
            if (request.TotalValue.HasValue) order.TotalValue = request.TotalValue.Value;
            if (request.Status != null) order.Status = request.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _service.UpdateCustomerOrderAsync(order);
            return Ok(order);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomerOrder(int id)
        {
            var order = await _service.GetCustomerOrderByIdAsync(id);
            if (order == null) return NotFound();

            await _service.DeleteCustomerOrderAsync(id);
            return NoContent();
        }


        [HttpGet("chart/status")]
        public async Task<IActionResult> GetOrdersByStatus()
        {
            var data = await _service.GetOrdersByStatusAsync();
            return Ok(data);
        }


        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var data = await _service.GetSummaryAsync();
            return Ok(data);
        }
    }
}