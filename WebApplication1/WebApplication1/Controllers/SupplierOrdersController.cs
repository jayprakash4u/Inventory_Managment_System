using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.DTOs;
using WebApplication1.Model;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/supplier-orders")]
    public class SupplierOrdersController : ControllerBase
    {
        private readonly ISupplierOrderService _service;
        public SupplierOrdersController(ISupplierOrderService service)
        {
            _service = service;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllSupplierOrders([FromQuery] string? status = null, [FromQuery] string? supplier = null, [FromQuery] string? dateRange = null)
        {
            var orders = await _service.GetAllSupplierOrdersAsync(status, supplier, dateRange);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSupplierOrder(int id)
        {
            var order = await _service.GetSupplierOrderByIdAsync(id);
            return Ok(order);
        }


        [HttpPost]
        public async Task<IActionResult> CreateSupplierOrder([FromBody] CreateSupplierOrderRequest request)
        {
            var order = new SupplierOrder
            {
                OrderId = request.OrderId,
                SupplierName = request.SupplierName,
                OrderDate = request.OrderDate,
                Items = request.Items,
                TotalValue = request.TotalValue,
                Status = request.Status
            };
            await _service.AddSupplierOrderAsync(order);
            return Ok(order);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplierOrder(int id, [FromBody] UpdateSupplierOrderRequest request)
        {
            var order = await _service.GetSupplierOrderByIdAsync(id);

            if (request.OrderId != null) order.OrderId = request.OrderId;
            if (request.SupplierName != null) order.SupplierName = request.SupplierName;
            if (request.OrderDate.HasValue) order.OrderDate = request.OrderDate.Value;
            if (request.Items != null) order.Items = request.Items;
            if (request.TotalValue.HasValue) order.TotalValue = request.TotalValue.Value;
            if (request.Status != null) order.Status = request.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _service.UpdateSupplierOrderAsync(order);
            return Ok(order);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplierOrder(int id)
        {
            await _service.GetSupplierOrderByIdAsync(id); // Will throw if not found

            await _service.DeleteSupplierOrderAsync(id);
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

