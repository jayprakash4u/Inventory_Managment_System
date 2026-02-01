using WebApplication1.DTOs.Requests;
using WebApplication1.DTOs.Responses;

namespace WebApplication1.Services.Interfaces
{
    /// <summary>
    /// Interface for system configuration services
    /// </summary>
    public interface ISystemConfigService
    {
        /// <summary>
        /// Get all system configurations
        /// </summary>
        Task<List<SystemConfigDto>> GetAllConfigsAsync();

        /// <summary>
        /// Get configuration by key
        /// </summary>
        Task<SystemConfigDto> GetConfigByKeyAsync(string key);

        /// <summary>
        /// Update configuration value
        /// </summary>
        Task<SystemConfigDto> UpdateConfigAsync(string key, UpdateSystemConfigRequest request);

        /// <summary>
        /// Bulk update multiple configurations
        /// </summary>
        Task<List<SystemConfigDto>> BulkUpdateConfigAsync(BulkUpdateSystemConfigRequest request);

        /// <summary>
        /// Reset configuration to default value
        /// </summary>
        Task<SystemConfigDto> ResetConfigAsync(string key);

        /// <summary>
        /// Reset all configurations to defaults
        /// </summary>
        Task<bool> ResetAllConfigsAsync();

        /// <summary>
        /// Get system health status
        /// </summary>
        Task<SystemHealthDto> GetSystemHealthAsync();

        /// <summary>
        /// Get system statistics
        /// </summary>
        Task<SystemStatisticsDto> GetSystemStatisticsAsync();

        /// <summary>
        /// Get activity logs
        /// </summary>
        Task<List<ActivityLogDto>> GetActivityLogsAsync(int page = 1, int pageSize = 50);

        /// <summary>
        /// Create system backup
        /// </summary>
        Task<SystemBackupDto> CreateBackupAsync(CreateSystemBackupRequest request);

        /// <summary>
        /// Get all backups
        /// </summary>
        Task<List<SystemBackupDto>> GetAllBackupsAsync();

        /// <summary>
        /// Restore from backup
        /// </summary>
        Task<bool> RestoreBackupAsync(int backupId);

        /// <summary>
        /// Delete backup
        /// </summary>
        Task<bool> DeleteBackupAsync(int backupId);

        /// <summary>
        /// Clear cache
        /// </summary>
        Task<bool> ClearCacheAsync();

        /// <summary>
        /// Get configuration by category
        /// </summary>
        Task<List<SystemConfigDto>> GetConfigsByCategoryAsync(string category);

        /// <summary>
        /// Get system business settings
        /// </summary>
        Task<SystemSettingsResponse> GetSystemSettingsAsync();

        /// <summary>
        /// Save or update system business settings
        /// </summary>
        Task<SystemSettingsResponse> SaveSystemSettingsAsync(SystemSettingsRequest request);
    }
}
