using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.Data;
using WebApplication1.DTOs;

namespace WebApplication1.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/alerts")]
    public class AlertsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AlertsController> _logger;

        public AlertsController(AppDbContext context, ILogger<AlertsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAlerts()
        {
            try
            {
                _logger.LogInformation("Retrieving alerts data");

                // Set command timeout for this query
                _context.Database.SetCommandTimeout(30);

                // Get low stock items (quantity > 0 and <= 10)
                var lowStockItems = await _context.Products
                    .AsNoTracking()
                    .Where(p => p.Quantity > 0 && p.Quantity <= 10)
                    .OrderBy(p => p.Quantity)
                    .Take(20)
                    .Select(p => new AlertItem
                    {
                        Id = p.Id,
                        Name = p.Name,
                        SKU = p.Sku,
                        Quantity = p.Quantity,
                        Category = p.CategoryName,
                        LastUpdated = p.CreatedAt
                    })
                    .ToListAsync();

                // Get out of stock items (quantity == 0)
                var outOfStockItems = await _context.Products
                    .AsNoTracking()
                    .Where(p => p.Quantity == 0)
                    .OrderBy(p => p.Name)
                    .Take(20)
                    .Select(p => new AlertItem
                    {
                        Id = p.Id,
                        Name = p.Name,
                        SKU = p.Sku,
                        Quantity = p.Quantity,
                        Category = p.CategoryName,
                        LastUpdated = p.CreatedAt
                    })
                    .ToListAsync();

                var response = new AlertsResponse
                {
                    LowStockCount = lowStockItems.Count,
                    OutOfStockCount = outOfStockItems.Count,
                    LowStockItems = lowStockItems,
                    OutOfStockItems = outOfStockItems
                };

                _logger.LogInformation("Retrieved alerts: {LowStock} low stock, {OutOfStock} out of stock",
                    response.LowStockCount, response.OutOfStockCount);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alerts data");
                throw new BusinessException($"Error retrieving alerts data: {ex.Message}");
            }
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAlertCount()
        {
            try
            {
                _context.Database.SetCommandTimeout(10);

                var lowStockCount = await _context.Products
                    .AsNoTracking()
                    .CountAsync(p => p.Quantity > 0 && p.Quantity <= 10);

                var outOfStockCount = await _context.Products
                    .AsNoTracking()
                    .CountAsync(p => p.Quantity == 0);

                return Ok(new
                {
                    lowStockCount,
                    outOfStockCount,
                    totalAlerts = lowStockCount + outOfStockCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alert count");
                throw new BusinessException($"Error retrieving alert count: {ex.Message}");
            }
        }
    }
}
