using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/insights")]
    public class InsightsController : ControllerBase
    {
        private readonly IInsightsService _insightsService;
        private readonly ILogger<InsightsController> _logger;

        public InsightsController(IInsightsService insightsService, ILogger<InsightsController> logger)
        {
            _insightsService = insightsService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetInsights()
        {
            _logger.LogInformation("Retrieving insights data");

            var insights = await _insightsService.GetInsightsAsync();

            _logger.LogInformation("Retrieved insights data successfully");

            return Ok(insights);
        }
    }
}