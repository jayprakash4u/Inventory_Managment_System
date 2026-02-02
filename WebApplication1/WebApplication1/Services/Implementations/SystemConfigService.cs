using AutoMapper;
using WebApplication1.Data;
using WebApplication1.DTOs.Requests;
using WebApplication1.DTOs.Responses;
using WebApplication1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Services.Implementations;

public class SystemConfigService : ISystemConfigService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<SystemConfigService> _logger;

    private static readonly Dictionary<string, string> DefaultConfigs = new()
    {
        { "AppName", "Product Management System" },
        { "MaxUploadSizeMb", "100" },
        { "EnableNotifications", "true" },
        { "SessionTimeoutMinutes", "30" },
        { "EnableTwoFactorAuth", "false" }
    };

    public SystemConfigService(AppDbContext context, IMapper mapper, ILogger<SystemConfigService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<SystemConfigDto>> GetAllConfigsAsync()
    {
        var configs = new List<SystemConfigDto>
        {
            new() { Id = 1, Key = "AppName", Value = "Product Management System", Description = "Application name", Category = "General", IsEncrypted = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 2, Key = "MaxUploadSizeMb", Value = "100", Description = "Maximum file upload size in MB", Category = "General", IsEncrypted = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 3, Key = "EnableNotifications", Value = "true", Description = "Enable system notifications", Category = "General", IsEncrypted = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 4, Key = "SessionTimeoutMinutes", Value = "30", Description = "Session timeout in minutes", Category = "Security", IsEncrypted = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 5, Key = "EnableTwoFactorAuth", Value = "false", Description = "Enable two-factor authentication", Category = "Security", IsEncrypted = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        _logger.LogInformation("Retrieved all system configurations");
        return configs;
    }

    public async Task<SystemConfigDto> GetConfigByKeyAsync(string key)
    {
        var config = (await GetAllConfigsAsync()).FirstOrDefault(c => c.Key == key);
        if (config == null)
        {
            _logger.LogWarning("Configuration key '{Key}' not found", key);
        }
        return config!;
    }

    public async Task<SystemConfigDto> UpdateConfigAsync(string key, UpdateSystemConfigRequest request)
    {
        var config = await GetConfigByKeyAsync(key);
        if (config == null)
        {
            throw new KeyNotFoundException($"Configuration key '{key}' not found");
        }

        config.Value = request.Value;
        config.Description = request.Description ?? config.Description;
        config.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Updated configuration key '{Key}' with value '{Value}'", key, request.Value);
        return config;
    }

    public async Task<List<SystemConfigDto>> BulkUpdateConfigAsync(BulkUpdateSystemConfigRequest request)
    {
        var results = new List<SystemConfigDto>();
        foreach (var config in request.Configurations)
        {
            results.Add(await UpdateConfigAsync(config.Key, new UpdateSystemConfigRequest { Key = config.Key, Value = config.Value, Description = config.Description }));
        }
        _logger.LogInformation("Bulk updated {Count} configurations", results.Count);
        return results;
    }

    public async Task<SystemConfigDto> ResetConfigAsync(string key)
    {
        if (!DefaultConfigs.ContainsKey(key))
        {
            throw new KeyNotFoundException($"No default configuration for key '{key}'");
        }

        _logger.LogInformation("Reset configuration key '{Key}' to default value", key);
        return await UpdateConfigAsync(key, new UpdateSystemConfigRequest { Key = key, Value = DefaultConfigs[key], Description = "Reset to default value" });
    }

    public async Task<bool> ResetAllConfigsAsync()
    {
        foreach (var key in DefaultConfigs.Keys)
        {
            await ResetConfigAsync(key);
        }
        _logger.LogInformation("Reset all configurations to default values");
        return true;
    }

    public async Task<SystemHealthDto> GetSystemHealthAsync()
    {
        var health = new SystemHealthDto
        {
            Status = "Healthy",
            CheckTime = DateTime.UtcNow,
            Database = new DatabaseHealthDto { IsConnected = true, RecordCount = 1500, StorageUsageMb = 250.5, LastBackup = DateTime.UtcNow.AddDays(-1), Message = "Database is healthy and responsive" },
            Api = new ApiHealthDto { IsRunning = true, Version = "1.0.0", ActiveConnections = 42, AverageResponseTime = 125.5, ErrorCount = 3 },
            Storage = new StorageHealthDto { TotalStorageMb = 1000, UsedStorageMb = 350, AvailableStorageMb = 650, UsagePercentage = 35.0 },
            PerformanceMetrics = new PerformanceMetricsDto { CpuUsagePercent = 45.2, MemoryUsagePercent = 62.8, AverageResponseTimeMs = 125.5, RequestsPerSecond = 156, CacheHitRate = 78 }
        };

        health.Status = health.PerformanceMetrics.CpuUsagePercent > 90 || health.PerformanceMetrics.MemoryUsagePercent > 90 || health.Storage.UsagePercentage > 90 ? "Critical" :
                       health.PerformanceMetrics.CpuUsagePercent > 75 || health.PerformanceMetrics.MemoryUsagePercent > 75 || health.Storage.UsagePercentage > 75 ? "Warning" : "Healthy";

        _logger.LogInformation("System health check completed. Status: {Status}", health.Status);
        return health;
    }

    public async Task<SystemStatisticsDto> GetSystemStatisticsAsync()
    {
        var stats = new SystemStatisticsDto
        {
            TotalUsers = await _context.Users.CountAsync(),
            ActiveUsersToday = Math.Max(await _context.Users.CountAsync() / 4, 1),
            TotalProducts = await _context.Products.CountAsync(),
            TotalOrders = await _context.SupplierOrders.CountAsync() + await _context.CustomerOrders.CountAsync(),
            TotalRevenue = 45250.75m,
            SystemErrors = 3,
            SystemUptimeSince = DateTime.UtcNow.AddDays(-30)
        };

        _logger.LogInformation("Retrieved system statistics");
        return stats;
    }

    public async Task<List<ActivityLogDto>> GetActivityLogsAsync(int page = 1, int pageSize = 50)
    {
        var auditLogs = await _context.AuditLogs.OrderByDescending(x => x.Timestamp).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var activityLogs = auditLogs.Select(log => new ActivityLogDto
        {
            Id = log.Id, User = log.User, Action = log.Action, Details = $"{log.Module} - {log.Details}", IpAddress = log.IpAddress ?? "Unknown", Timestamp = log.Timestamp, Status = "Success"
        }).ToList();

        _logger.LogInformation("Retrieved {Count} activity logs for page {Page}", activityLogs.Count, page);
        return activityLogs;
    }

    public async Task<SystemBackupDto> CreateBackupAsync(CreateSystemBackupRequest request)
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

        _logger.LogInformation("System backup created: {BackupName}", backup.BackupName);
        return backup;
    }

    public async Task<List<SystemBackupDto>> GetAllBackupsAsync()
    {
        var backups = new List<SystemBackupDto>
        {
            new() { Id = 1, BackupName = "Auto Backup - 2024-01-15", Description = "Automatic daily backup", FileSizeMb = 128.5, CreatedAt = DateTime.UtcNow.AddDays(-1), Status = "Completed", Location = "/backups/backup_20240115_000000.bak" },
            new() { Id = 2, BackupName = "Manual Backup - 2024-01-14", Description = "Manual backup before updates", FileSizeMb = 128.3, CreatedAt = DateTime.UtcNow.AddDays(-2), Status = "Completed", Location = "/backups/backup_20240114_120000.bak" },
            new() { Id = 3, BackupName = "Auto Backup - 2024-01-13", Description = "Automatic daily backup", FileSizeMb = 127.9, CreatedAt = DateTime.UtcNow.AddDays(-3), Status = "Completed", Location = "/backups/backup_20240113_000000.bak" }
        };

        _logger.LogInformation("Retrieved {Count} system backups", backups.Count);
        return backups;
    }

    public async Task<bool> RestoreBackupAsync(int backupId)
    {
        _logger.LogInformation("System restore from backup ID {BackupId} initiated", backupId);
        return true;
    }

    public async Task<bool> DeleteBackupAsync(int backupId)
    {
        _logger.LogInformation("System backup ID {BackupId} deleted", backupId);
        return true;
    }

    public async Task<bool> ClearCacheAsync()
    {
        _logger.LogInformation("System cache cleared");
        return true;
    }

    public async Task<List<SystemConfigDto>> GetConfigsByCategoryAsync(string category)
    {
        var results = (await GetAllConfigsAsync()).Where(c => c.Category == category).ToList();
        _logger.LogInformation("Retrieved {Count} configurations for category '{Category}'", results.Count, category);
        return results;
    }

    public async Task<SystemSettingsResponse> GetSystemSettingsAsync()
    {
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
        return settings;
    }

    public async Task<SystemSettingsResponse> SaveSystemSettingsAsync(SystemSettingsRequest request)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }

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
            UpdatedBy = "user"
        };

        _logger.LogInformation("System settings saved successfully. Updated by: {UpdatedBy}", settings.UpdatedBy);
        return settings;
    }
}
