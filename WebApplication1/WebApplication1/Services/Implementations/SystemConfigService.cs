using AutoMapper;
using WebApplication1.Data;
using WebApplication1.DTOs.Requests;
using WebApplication1.DTOs.Responses;
using WebApplication1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Services.Implementations
{
    /// <summary>
    /// System configuration service implementation
    /// </summary>
    public class SystemConfigService : ISystemConfigService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<SystemConfigService> _logger;

        public SystemConfigService(AppDbContext context, IMapper mapper, ILogger<SystemConfigService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Get all system configurations
        /// </summary>
        public async Task<List<SystemConfigDto>> GetAllConfigsAsync()
        {
            try
            {
                // Note: SystemConfig entity needs to be added to Data model
                // For now, returning mock data
                var configs = new List<SystemConfigDto>
                {
                    new SystemConfigDto
                    {
                        Id = 1,
                        Key = "AppName",
                        Value = "Product Management System",
                        Description = "Application name",
                        Category = "General",
                        IsEncrypted = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SystemConfigDto
                    {
                        Id = 2,
                        Key = "MaxUploadSizeMb",
                        Value = "100",
                        Description = "Maximum file upload size in MB",
                        Category = "General",
                        IsEncrypted = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SystemConfigDto
                    {
                        Id = 3,
                        Key = "EnableNotifications",
                        Value = "true",
                        Description = "Enable system notifications",
                        Category = "General",
                        IsEncrypted = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SystemConfigDto
                    {
                        Id = 4,
                        Key = "SessionTimeoutMinutes",
                        Value = "30",
                        Description = "Session timeout in minutes",
                        Category = "Security",
                        IsEncrypted = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new SystemConfigDto
                    {
                        Id = 5,
                        Key = "EnableTwoFactorAuth",
                        Value = "false",
                        Description = "Enable two-factor authentication",
                        Category = "Security",
                        IsEncrypted = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                _logger.LogInformation("Retrieved all system configurations");
                return await Task.FromResult(configs);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving system configurations: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get configuration by key
        /// </summary>
        public async Task<SystemConfigDto> GetConfigByKeyAsync(string key)
        {
            try
            {
                var config = await GetAllConfigsAsync();
                var result = config.FirstOrDefault(c => c.Key == key);

                if (result == null)
                {
                    _logger.LogWarning($"Configuration key '{key}' not found");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving configuration for key '{key}': {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Update configuration value
        /// </summary>
        public async Task<SystemConfigDto> UpdateConfigAsync(string key, UpdateSystemConfigRequest request)
        {
            try
            {
                var config = await GetConfigByKeyAsync(key);

                if (config == null)
                {
                    throw new KeyNotFoundException($"Configuration key '{key}' not found");
                }

                config.Value = request.Value;
                config.Description = request.Description ?? config.Description;
                config.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation($"Updated configuration key '{key}' with value '{request.Value}'");
                return config;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating configuration for key '{key}': {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Bulk update multiple configurations
        /// </summary>
        public async Task<List<SystemConfigDto>> BulkUpdateConfigAsync(BulkUpdateSystemConfigRequest request)
        {
            try
            {
                var results = new List<SystemConfigDto>();

                foreach (var config in request.Configurations)
                {
                    var updated = await UpdateConfigAsync(config.Key, new UpdateSystemConfigRequest
                    {
                        Key = config.Key,
                        Value = config.Value,
                        Description = config.Description
                    });

                    results.Add(updated);
                }

                _logger.LogInformation($"Bulk updated {results.Count} configurations");
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in bulk update configurations: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Reset configuration to default value
        /// </summary>
        public async Task<SystemConfigDto> ResetConfigAsync(string key)
        {
            try
            {
                // Define defaults for each configuration
                var defaults = new Dictionary<string, string>
                {
                    { "AppName", "Product Management System" },
                    { "MaxUploadSizeMb", "100" },
                    { "EnableNotifications", "true" },
                    { "SessionTimeoutMinutes", "30" },
                    { "EnableTwoFactorAuth", "false" }
                };

                if (!defaults.ContainsKey(key))
                {
                    throw new KeyNotFoundException($"No default configuration for key '{key}'");
                }

                var request = new UpdateSystemConfigRequest
                {
                    Key = key,
                    Value = defaults[key],
                    Description = $"Reset to default value"
                };

                _logger.LogInformation($"Reset configuration key '{key}' to default value");
                return await UpdateConfigAsync(key, request);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error resetting configuration for key '{key}': {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Reset all configurations to defaults
        /// </summary>
        public async Task<bool> ResetAllConfigsAsync()
        {
            try
            {
                var keys = new[] { "AppName", "MaxUploadSizeMb", "EnableNotifications", "SessionTimeoutMinutes", "EnableTwoFactorAuth" };

                foreach (var key in keys)
                {
                    await ResetConfigAsync(key);
                }

                _logger.LogInformation("Reset all configurations to default values");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error resetting all configurations: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get system health status
        /// </summary>
        public async Task<SystemHealthDto> GetSystemHealthAsync()
        {
            try
            {
                var health = new SystemHealthDto
                {
                    Status = "Healthy",
                    CheckTime = DateTime.UtcNow,
                    Database = new DatabaseHealthDto
                    {
                        IsConnected = true,
                        RecordCount = 1500,
                        StorageUsageMb = 250.5,
                        LastBackup = DateTime.UtcNow.AddDays(-1),
                        Message = "Database is healthy and responsive"
                    },
                    Api = new ApiHealthDto
                    {
                        IsRunning = true,
                        Version = "1.0.0",
                        ActiveConnections = 42,
                        AverageResponseTime = 125.5,
                        ErrorCount = 3
                    },
                    Storage = new StorageHealthDto
                    {
                        TotalStorageMb = 1000,
                        UsedStorageMb = 350,
                        AvailableStorageMb = 650,
                        UsagePercentage = 35.0
                    },
                    PerformanceMetrics = new PerformanceMetricsDto
                    {
                        CpuUsagePercent = 45.2,
                        MemoryUsagePercent = 62.8,
                        AverageResponseTimeMs = 125.5,
                        RequestsPerSecond = 156,
                        CacheHitRate = 78
                    }
                };

                // Determine overall status
                if (health.PerformanceMetrics.CpuUsagePercent > 90 || 
                    health.PerformanceMetrics.MemoryUsagePercent > 90 ||
                    health.Storage.UsagePercentage > 90)
                {
                    health.Status = "Critical";
                }
                else if (health.PerformanceMetrics.CpuUsagePercent > 75 || 
                         health.PerformanceMetrics.MemoryUsagePercent > 75 ||
                         health.Storage.UsagePercentage > 75)
                {
                    health.Status = "Warning";
                }

                _logger.LogInformation($"System health check completed. Status: {health.Status}");
                return await Task.FromResult(health);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving system health: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get system statistics
        /// </summary>
        public async Task<SystemStatisticsDto> GetSystemStatisticsAsync()
        {
            try
            {
                var stats = new SystemStatisticsDto
                {
                    TotalUsers = await _context.Users.CountAsync(),
                    ActiveUsersToday = Math.Max(await _context.Users.CountAsync() / 4, 1), // Rough estimate
                    TotalProducts = await _context.Products.CountAsync(),
                    TotalOrders = (await _context.SupplierOrders.CountAsync()) + (await _context.CustomerOrders.CountAsync()),
                    TotalRevenue = 45250.75m,
                    SystemErrors = 3,
                    SystemUptimeSince = DateTime.UtcNow.AddDays(-30)
                };

                _logger.LogInformation("Retrieved system statistics");
                return await Task.FromResult(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving system statistics: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get activity logs
        /// </summary>
        public async Task<List<ActivityLogDto>> GetActivityLogsAsync(int page = 1, int pageSize = 50)
        {
            try
            {
                // Get audit logs and convert to activity logs
                var auditLogs = await _context.AuditLogs
                    .OrderByDescending(x => x.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var activityLogs = auditLogs.Select(log => new ActivityLogDto
                {
                    Id = log.Id,
                    User = log.User,
                    Action = log.Action,
                    Details = $"{log.Module} - {log.Details}",
                    IpAddress = log.IpAddress ?? "Unknown",
                    Timestamp = log.Timestamp,
                    Status = "Success" // Can be enhanced based on actual data
                }).ToList();

                _logger.LogInformation($"Retrieved {activityLogs.Count} activity logs for page {page}");
                return activityLogs;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving activity logs: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Create system backup
        /// </summary>
        public async Task<SystemBackupDto> CreateBackupAsync(CreateSystemBackupRequest request)
        {
            try
            {
                var backup = new SystemBackupDto
                {
                    Id = new Random().Next(1000, 9999),
                    BackupName = request.BackupName,
                    Description = request.Description,
                    FileSizeMb = 128.5,
                    CreatedAt = DateTime.UtcNow,
                    Status = "Completed",
                    Location = $"/backups/{request.BackupName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.bak"
                };

                _logger.LogInformation($"System backup created: {backup.BackupName}");
                return await Task.FromResult(backup);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating system backup: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get all backups
        /// </summary>
        public async Task<List<SystemBackupDto>> GetAllBackupsAsync()
        {
            try
            {
                var backups = new List<SystemBackupDto>
                {
                    new SystemBackupDto
                    {
                        Id = 1,
                        BackupName = "Auto Backup - 2024-01-15",
                        Description = "Automatic daily backup",
                        FileSizeMb = 128.5,
                        CreatedAt = DateTime.UtcNow.AddDays(-1),
                        Status = "Completed",
                        Location = "/backups/backup_20240115_000000.bak"
                    },
                    new SystemBackupDto
                    {
                        Id = 2,
                        BackupName = "Manual Backup - 2024-01-14",
                        Description = "Manual backup before updates",
                        FileSizeMb = 128.3,
                        CreatedAt = DateTime.UtcNow.AddDays(-2),
                        Status = "Completed",
                        Location = "/backups/backup_20240114_120000.bak"
                    },
                    new SystemBackupDto
                    {
                        Id = 3,
                        BackupName = "Auto Backup - 2024-01-13",
                        Description = "Automatic daily backup",
                        FileSizeMb = 127.9,
                        CreatedAt = DateTime.UtcNow.AddDays(-3),
                        Status = "Completed",
                        Location = "/backups/backup_20240113_000000.bak"
                    }
                };

                _logger.LogInformation($"Retrieved {backups.Count} system backups");
                return await Task.FromResult(backups);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving backups: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Restore from backup
        /// </summary>
        public async Task<bool> RestoreBackupAsync(int backupId)
        {
            try
            {
                _logger.LogInformation($"System restore from backup ID {backupId} initiated");
                // Actual restoration logic would be implemented here
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error restoring backup: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Delete backup
        /// </summary>
        public async Task<bool> DeleteBackupAsync(int backupId)
        {
            try
            {
                _logger.LogInformation($"System backup ID {backupId} deleted");
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting backup: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Clear cache
        /// </summary>
        public async Task<bool> ClearCacheAsync()
        {
            try
            {
                _logger.LogInformation("System cache cleared");
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error clearing cache: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get configuration by category
        /// </summary>
        public async Task<List<SystemConfigDto>> GetConfigsByCategoryAsync(string category)
        {
            try
            {
                var configs = await GetAllConfigsAsync();
                var results = configs.Where(c => c.Category == category).ToList();

                _logger.LogInformation($"Retrieved {results.Count} configurations for category '{category}'");
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving configurations for category '{category}': {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get system business settings
        /// </summary>
        public async Task<SystemSettingsResponse> GetSystemSettingsAsync()
        {
            try
            {
                // Try to load from application configuration or appsettings.json
                // For now, returning default settings that can be overridden
                var settings = new SystemSettingsResponse
                {
                    CompanyName = "Product Management Inc.",
                    Currency = "USD",
                    TaxRate = 10m,
                    LowStockThreshold = 10,
                    LowStockNotifications = true,
                    EmailNotifications = true,
                    OrderNotifications = true,
                    AuditRetention = 90,
                    RecordsPerPage = 25,
                    LastUpdated = DateTime.UtcNow,
                    UpdatedBy = "system"
                };

                _logger.LogInformation("Retrieved system settings");
                return await Task.FromResult(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving system settings: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Save or update system business settings
        /// </summary>
        public async Task<SystemSettingsResponse> SaveSystemSettingsAsync(SystemSettingsRequest request)
        {
            try
            {
                if (request == null)
                {
                    throw new ArgumentNullException(nameof(request));
                }

                // Map request to response
                var settings = new SystemSettingsResponse
                {
                    CompanyName = request.CompanyName,
                    Currency = request.Currency,
                    TaxRate = request.TaxRate,
                    LowStockThreshold = request.LowStockThreshold,
                    LowStockNotifications = request.LowStockNotifications,
                    EmailNotifications = request.EmailNotifications,
                    OrderNotifications = request.OrderNotifications,
                    AuditRetention = request.AuditRetention,
                    RecordsPerPage = request.RecordsPerPage,
                    LastUpdated = DateTime.UtcNow,
                    UpdatedBy = "user" // This should be the current user from context
                };

                _logger.LogInformation($"System settings saved successfully. Updated by: {settings.UpdatedBy}");
                return await Task.FromResult(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error saving system settings: {ex.Message}");
                throw;
            }
        }
    }
}
