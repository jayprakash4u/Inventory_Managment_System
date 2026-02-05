using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.DTOs.Requests;
using WebApplication1.DTOs.Responses;
using WebApplication1.Services.Interfaces;

namespace WebApplication1.Controllers
{
    /// <summary>
    /// System configuration management controller
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SystemConfigController : ControllerBase
    {
        private readonly ISystemConfigService _systemConfigService;
        private readonly ILogger<SystemConfigController> _logger;

        public SystemConfigController(ISystemConfigService systemConfigService, ILogger<SystemConfigController> logger)
        {
            _systemConfigService = systemConfigService;
            _logger = logger;
        }

        /// <summary>
        /// Get all system configurations
        /// </summary>
        /// <returns>List of all system configurations</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<SystemConfigDto>>> GetAllConfigs()
        {
            try
            {
                var configs = await _systemConfigService.GetAllConfigsAsync();
                return Ok(configs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting all configurations: {ex.Message}");
                throw new BusinessException($"Error retrieving configurations: {ex.Message}");
            }
        }

        /// <summary>
        /// Get configuration by key
        /// </summary>
        /// <param name="key">Configuration key</param>
        /// <returns>System configuration</returns>
        [HttpGet("{key}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<SystemConfigDto>> GetConfigByKey(string key)
        {
            try
            {
                var config = await _systemConfigService.GetConfigByKeyAsync(key);
                if (config == null)
                {
                    throw new NotFoundException($"Configuration '{key}' not found");
                }

                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting configuration for key '{key}': {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get configurations by category
        /// </summary>
        /// <param name="category">Configuration category</param>
        /// <returns>List of configurations in category</returns>
        [HttpGet("category/{category}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<SystemConfigDto>>> GetConfigsByCategory(string category)
        {
            try
            {
                var configs = await _systemConfigService.GetConfigsByCategoryAsync(category);
                return Ok(configs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting configurations for category '{category}': {ex.Message}");
                throw new BusinessException($"Error retrieving configurations: {ex.Message}");
            }
        }

        /// <summary>
        /// Update a configuration
        /// </summary>
        /// <param name="key">Configuration key</param>
        /// <param name="request">Update request</param>
        /// <returns>Updated configuration</returns>
        [HttpPut("{key}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<SystemConfigDto>> UpdateConfig(string key, [FromBody] UpdateSystemConfigRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(key) || request == null)
                {
                    throw new BusinessException("Invalid request parameters", "VALIDATION_ERROR", 400);
                }

                var updated = await _systemConfigService.UpdateConfigAsync(key, request);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                throw new NotFoundException(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating configuration for key '{key}': {ex.Message}");
                throw new BusinessException($"Error updating configuration: {ex.Message}");
            }
        }

        /// <summary>
        /// Bulk update multiple configurations
        /// </summary>
        /// <param name="request">Bulk update request</param>
        /// <returns>List of updated configurations</returns>
        [HttpPut("bulk/update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<List<SystemConfigDto>>> BulkUpdateConfigs([FromBody] BulkUpdateSystemConfigRequest request)
        {
            try
            {
                if (request?.Configurations == null || !request.Configurations.Any())
                {
                    throw new BusinessException("Configurations list cannot be empty", "VALIDATION_ERROR", 400);
                }

                var updated = await _systemConfigService.BulkUpdateConfigAsync(request);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in bulk update: {ex.Message}");
                throw new BusinessException($"Error updating configurations: {ex.Message}");
            }
        }

        /// <summary>
        /// Reset configuration to default
        /// </summary>
        /// <param name="key">Configuration key</param>
        /// <returns>Reset configuration</returns>
        [HttpPost("reset/{key}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<SystemConfigDto>> ResetConfig(string key)
        {
            try
            {
                var reset = await _systemConfigService.ResetConfigAsync(key);
                return Ok(reset);
            }
            catch (KeyNotFoundException ex)
            {
                throw new NotFoundException(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error resetting configuration for key '{key}': {ex.Message}");
                throw new BusinessException($"Error resetting configuration: {ex.Message}");
            }
        }

        /// <summary>
        /// Reset all configurations to defaults
        /// </summary>
        /// <returns>Success status</returns>
        [HttpPost("reset-all")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<bool>> ResetAllConfigs()
        {
            try
            {
                var result = await _systemConfigService.ResetAllConfigsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error resetting all configurations: {ex.Message}");
                throw new BusinessException($"Error resetting configurations: {ex.Message}");
            }
        }

        /// <summary>
        /// Get system health status
        /// </summary>
        /// <returns>System health information</returns>
        [HttpGet("health/status")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<SystemHealthDto>> GetSystemHealth()
        {
            try
            {
                var health = await _systemConfigService.GetSystemHealthAsync();
                return Ok(health);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting system health: {ex.Message}");
                throw new BusinessException($"Error retrieving system health: {ex.Message}");
            }
        }

        /// <summary>
        /// Get system statistics
        /// </summary>
        /// <returns>System statistics</returns>
        [HttpGet("statistics")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<SystemStatisticsDto>> GetSystemStatistics()
        {
            try
            {
                var stats = await _systemConfigService.GetSystemStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting system statistics: {ex.Message}");
                throw new BusinessException($"Error retrieving system statistics: {ex.Message}");
            }
        }

        /// <summary>
        /// Get activity logs
        /// </summary>
        /// <param name="page">Page number (default 1)</param>
        /// <param name="pageSize">Page size (default 50)</param>
        /// <returns>List of activity logs</returns>
        [HttpGet("activity-logs")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<ActivityLogDto>>> GetActivityLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 50;

                var logs = await _systemConfigService.GetActivityLogsAsync(page, pageSize);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting activity logs: {ex.Message}");
                throw new BusinessException($"Error retrieving activity logs: {ex.Message}");
            }
        }

        /// <summary>
        /// Create a system backup
        /// </summary>
        /// <param name="request">Backup request</param>
        /// <returns>Created backup information</returns>
        [HttpPost("backup/create")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<SystemBackupDto>> CreateBackup([FromBody] CreateSystemBackupRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.BackupName))
                {
                    throw new BusinessException("Backup name is required", "VALIDATION_ERROR", 400);
                }

                var backup = await _systemConfigService.CreateBackupAsync(request);
                return CreatedAtAction(nameof(GetAllBackups), new { id = backup.Id }, backup);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating backup: {ex.Message}");
                throw new BusinessException($"Error creating backup: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all system backups
        /// </summary>
        /// <returns>List of system backups</returns>
        [HttpGet("backup/list")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<SystemBackupDto>>> GetAllBackups()
        {
            try
            {
                var backups = await _systemConfigService.GetAllBackupsAsync();
                return Ok(backups);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting backups: {ex.Message}");
                throw new BusinessException($"Error retrieving backups: {ex.Message}");
            }
        }

        /// <summary>
        /// Restore from a backup
        /// </summary>
        /// <param name="backupId">Backup ID</param>
        /// <returns>Success status</returns>
        [HttpPost("backup/restore/{backupId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> RestoreBackup(int backupId)
        {
            try
            {
                if (backupId <= 0)
                {
                    throw new BusinessException("Invalid backup ID", "VALIDATION_ERROR", 400);
                }

                var result = await _systemConfigService.RestoreBackupAsync(backupId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error restoring backup {backupId}: {ex.Message}");
                throw new BusinessException($"Error restoring backup: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete a backup
        /// </summary>
        /// <param name="backupId">Backup ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("backup/{backupId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> DeleteBackup(int backupId)
        {
            try
            {
                if (backupId <= 0)
                {
                    throw new BusinessException("Invalid backup ID", "VALIDATION_ERROR", 400);
                }

                var result = await _systemConfigService.DeleteBackupAsync(backupId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting backup {backupId}: {ex.Message}");
                throw new BusinessException($"Error deleting backup: {ex.Message}");
            }
        }

        /// <summary>
        /// Clear system cache
        /// </summary>
        /// <returns>Success status</returns>
        [HttpPost("cache/clear")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<bool>> ClearCache()
        {
            try
            {
                var result = await _systemConfigService.ClearCacheAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error clearing cache: {ex.Message}");
                throw new BusinessException($"Error clearing cache: {ex.Message}");
            }
        }

        /// <summary>
        /// Get system business settings
        /// </summary>
        /// <returns>System settings object</returns>
        [HttpGet("settings")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<SystemSettingsResponse>> GetSystemSettings()
        {
            try
            {
                var settings = await _systemConfigService.GetSystemSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving system settings: {ex.Message}");
                throw new BusinessException($"Error retrieving system settings: {ex.Message}");
            }
        }

        /// <summary>
        /// Save or update system business settings
        /// </summary>
        /// <param name="request">System settings to save</param>
        /// <returns>Updated settings</returns>
        [HttpPost("settings")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<SystemSettingsResponse>> SaveSystemSettings([FromBody] SystemSettingsRequest request)
        {
            try
            {
                if (request == null)
                {
                    throw new BusinessException("Settings request cannot be null", "VALIDATION_ERROR", 400);
                }

                // Validation
                if (string.IsNullOrWhiteSpace(request.CompanyName))
                {
                    throw new BusinessException("Company name is required", "VALIDATION_ERROR", 400);
                }

                if (request.TaxRate < 0 || request.TaxRate > 100)
                {
                    throw new BusinessException("Tax rate must be between 0 and 100", "VALIDATION_ERROR", 400);
                }

                if (request.LowStockThreshold < 1)
                {
                    throw new BusinessException("Low stock threshold must be at least 1", "VALIDATION_ERROR", 400);
                }

                if (request.AuditRetention < 1 || request.AuditRetention > 365)
                {
                    throw new BusinessException("Audit retention must be between 1 and 365 days", "VALIDATION_ERROR", 400);
                }

                var settings = await _systemConfigService.SaveSystemSettingsAsync(request);
                _logger.LogInformation($"System settings updated successfully");
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error saving system settings: {ex.Message}");
                throw;
            }
        }
    }
}
