using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/insights")]
    public class InsightsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IAuditService _auditService;
        private readonly ISupplierOrderService _supplierOrderService;
        private readonly ICustomerOrderService _customerOrderService;

        public InsightsController(
            IProductService productService,
            IAuditService auditService,
            ISupplierOrderService supplierOrderService,
            ICustomerOrderService customerOrderService)
        {
            _productService = productService;
            _auditService = auditService;
            _supplierOrderService = supplierOrderService;
            _customerOrderService = customerOrderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetInsights()
        {
            try
            {
                // Get all products
                var products = await _productService.GetAllProductsAsync();
                var supplierOrders = await _supplierOrderService.GetAllSupplierOrdersAsync();
                var customerOrders = await _customerOrderService.GetAllCustomerOrdersAsync();

                // Get audit logs with larger page size
                var (auditLogs, _, _) = await _auditService.GetAuditLogsAsync(new DTOs.AuditLogFilterRequest
                {
                    Page = 1,
                    PageSize = 1000
                });

                // Process data server-side for charts
                var insights = new
                {
                    // Metrics
                    totalProducts = products.Count(),
                    lowStockCount = products.Count(p => p.Quantity < 10),
                    totalOrders = customerOrders.Count(),
                    auditLogsCount = auditLogs.Count(),

                    // Chart data - pre-processed on server
                    stockLevelsChart = new
                    {
                        categories = new[] { "Low Stock (<10)", "Medium (10-50)", "High (>50)" },
                        data = new[]
                        {
                            products.Count(p => p.Quantity < 10),
                            products.Count(p => p.Quantity >= 10 && p.Quantity <= 50),
                            products.Count(p => p.Quantity > 50)
                        },
                        colors = new[] { "#dc3545", "#ffc107", "#28a745" }
                    },

                    auditActionsChart = ProcessAuditActions(auditLogs),

                    supplierStatusChart = ProcessOrderStatus(supplierOrders, new[] { "#ffc107", "#28a745", "#dc3545" }),

                    customerStatusChart = ProcessOrderStatus(customerOrders, new[] { "#ffc107", "#246dec", "#28a745" })
                };

                return Ok(insights);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve insights data", details = ex.Message });
            }
        }

        private object ProcessAuditActions(IEnumerable<dynamic> auditLogs)
        {
            var actions = auditLogs
                .GroupBy(a => (string)a.Action)
                .ToDictionary(g => g.Key ?? "UNKNOWN", g => g.Count());

            return new
            {
                categories = actions.Keys.ToArray(),
                data = actions.Values.ToArray(),
                colors = new[] { "#246dec" }
            };
        }

        private object ProcessOrderStatus(IEnumerable<dynamic> orders, string[] colors)
        {
            var statuses = orders
                .GroupBy(o => (string)o.Status)
                .ToDictionary(g => g.Key ?? "Unknown", g => g.Count());

            return new
            {
                labels = statuses.Keys.ToArray(),
                data = statuses.Values.ToArray(),
                colors = colors.Take(statuses.Count).ToArray()
            };
        }
    }
}