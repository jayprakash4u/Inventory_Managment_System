using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.DTOs;
using WebApplication1.Model;
using WebApplication1.Services;
using AutoMapper;

namespace WebApplication1.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/customer-orders")]
    public class CustomerOrdersController : ControllerBase
    {
        private readonly ICustomerOrderService _service;
        private readonly ILogger<CustomerOrdersController> _logger;
        private readonly IMapper _mapper;

        public CustomerOrdersController(ICustomerOrderService service, ILogger<CustomerOrdersController> logger, IMapper mapper)
        {
            _service = service;
            _logger = logger;
            _mapper = mapper;
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
            _logger.LogInformation("Retrieving customer orders with filters: Status={Status}, Customer={Customer}, DateRange={DateRange}, Page={Page}, PageSize={PageSize}",
                status, customer, dateRange, (start / length) + 1, length);

            var allOrders = await _service.GetAllCustomerOrdersAsync(status, customer, dateRange);
            var totalRecords = allOrders.Count();
            var data = allOrders.Skip(start).Take(length).ToList();

            _logger.LogInformation("Retrieved {Count} customer orders (Total: {TotalRecords})", data.Count, totalRecords);

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
            _logger.LogInformation("Retrieving customer order by ID: {OrderId}", id);

            var order = await _service.GetCustomerOrderByIdAsync(id);
            _logger.LogInformation("Retrieved customer order: {OrderId}", id);
            return Ok(order);
        }


        [HttpPost]
        public async Task<IActionResult> CreateCustomerOrder([FromBody] CreateCustomerOrderRequest request)
        {
            _logger.LogInformation("Creating customer order: OrderId={OrderId}, Customer={CustomerName}, TotalValue={TotalValue}",
                request.OrderId, request.CustomerName, request.TotalValue);

            var order = _mapper.Map<CustomerOrder>(request);
            await _service.AddCustomerOrderAsync(order);

            _logger.LogInformation("Customer order created successfully: {OrderId}", order.Id);

            return Ok(order);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomerOrder(int id, [FromBody] UpdateCustomerOrderRequest request)
        {
            _logger.LogInformation("Updating customer order: {OrderId}", id);

            var order = await _service.GetCustomerOrderByIdAsync(id);
            _mapper.Map(request, order);
            order.UpdatedAt = DateTime.UtcNow;

            await _service.UpdateCustomerOrderAsync(order);

            _logger.LogInformation("Customer order updated successfully: {OrderId}", id);

            return Ok(order);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomerOrder(int id)
        {
            _logger.LogInformation("Deleting customer order: {OrderId}", id);

            await _service.GetCustomerOrderByIdAsync(id); // Will throw if not found

            await _service.DeleteCustomerOrderAsync(id);

            _logger.LogInformation("Customer order deleted successfully: {OrderId}", id);

            return NoContent();
        }


        [HttpGet("chart/status")]
        public async Task<IActionResult> GetOrdersByStatus()
        {
            _logger.LogInformation("Retrieving orders by status chart data");

            var data = await _service.GetOrdersByStatusAsync();

            _logger.LogInformation("Retrieved orders by status data with {Count} entries", data.Count());

            return Ok(data);
        }


        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            _logger.LogInformation("Retrieving customer orders summary");

            var data = await _service.GetSummaryAsync();

            _logger.LogInformation("Retrieved customer orders summary: {@Summary}", data);

            return Ok(data);
        }
    }
}