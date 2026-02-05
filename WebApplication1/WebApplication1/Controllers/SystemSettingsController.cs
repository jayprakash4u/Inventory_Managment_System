using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.DTOs.Requests;
using WebApplication1.DTOs.Responses;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers
{
    /// <summary>
    /// System Settings API Controller
    /// Handles business-relevant system configuration settings
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/system-settings")]
    public class SystemSettingsController : ControllerBase
    {
        private readonly ISystemConfigService _systemConfigService;
        private readonly ILogger<SystemSettingsController> _logger;

        public SystemSettingsController(ISystemConfigService systemConfigService, ILogger<SystemSettingsController> logger)
        {
            _systemConfigService = systemConfigService;
            _logger = logger;
        }

        /// <summary>
        /// Get all system business settings
        /// </summary>
        /// <returns>SystemSettingsResponse object containing all settings</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SystemSettingsResponse>> GetSettings()
        {
            try
            {
                _logger.LogInformation("🔍 Fetching system settings from backend");
                var settings = await _systemConfigService.GetSystemSettingsAsync();
                
                _logger.LogInformation($"✅ System settings retrieved successfully: Company={settings.CompanyName}, Currency={settings.Currency}");
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error retrieving system settings: {ex.Message}");
                throw new BusinessException($"Error retrieving system settings: {ex.Message}");
            }
        }

        /// <summary>
        /// Save or update system business settings
        /// </summary>
        /// <param name="request">System settings request containing all configurable settings</param>
        /// <returns>Updated SystemSettingsResponse</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SystemSettingsResponse>> SaveSettings([FromBody] SystemSettingsRequest request)
        {
            try
            {
                if (request == null)
                {
                    _logger.LogWarning("❌ Settings request is null");
                    throw new BusinessException("Settings request cannot be null", "VALIDATION_ERROR", 400);
                }

                _logger.LogInformation($"💾 Saving system settings: Company={request.CompanyName}");

                // Validation
                if (string.IsNullOrWhiteSpace(request.CompanyName))
                {
                    _logger.LogWarning("❌ Validation failed: Company name is empty");
                    throw new BusinessException("Company name is required", "VALIDATION_ERROR", 400);
                }

                if (request.TaxRate < 0 || request.TaxRate > 100)
                {
                    _logger.LogWarning($"❌ Validation failed: Tax rate {request.TaxRate} out of range");
                    throw new BusinessException("Tax rate must be between 0 and 100", "VALIDATION_ERROR", 400);
                }

                if (request.LowStockThreshold < 1)
                {
                    _logger.LogWarning($"❌ Validation failed: Low stock threshold {request.LowStockThreshold} must be >= 1");
                    throw new BusinessException("Low stock threshold must be at least 1", "VALIDATION_ERROR", 400);
                }

                if (request.AuditRetention < 1 || request.AuditRetention > 365)
                {
                    _logger.LogWarning($"❌ Validation failed: Audit retention {request.AuditRetention} out of range");
                    throw new BusinessException("Audit retention must be between 1 and 365 days", "VALIDATION_ERROR", 400);
                }

                if (request.RecordsPerPage < 5 || request.RecordsPerPage > 500)
                {
                    _logger.LogWarning($"❌ Validation failed: Records per page {request.RecordsPerPage} out of range");
                    throw new BusinessException("Records per page must be between 5 and 500", "VALIDATION_ERROR", 400);
                }

                // Save settings
                var settings = await _systemConfigService.SaveSystemSettingsAsync(request);

                _logger.LogInformation($"✅ System settings saved successfully");
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error saving system settings: {ex.Message}");
                throw;
            }
        }
    }
}
