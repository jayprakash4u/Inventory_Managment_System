namespace WebApplication1.DTOs.Responses
{
    /// <summary>
    /// System configuration response DTO
    /// </summary>
    public class SystemConfigDto
    {
        public int Id { get; set; }
        public string? Key { get; set; }
        public string? Value { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; } // General, Security, Database, Email, etc.
        public bool IsEncrypted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// System health status response DTO
    /// </summary>
    public class SystemHealthDto
    {
        public string? Status { get; set; } // Healthy, Warning, Critical
        public DateTime CheckTime { get; set; }
        public DatabaseHealthDto? Database { get; set; }
        public ApiHealthDto? Api { get; set; }
        public StorageHealthDto? Storage { get; set; }
        public PerformanceMetricsDto? PerformanceMetrics { get; set; }
    }

    /// <summary>
    /// Database health status
    /// </summary>
    public class DatabaseHealthDto
    {
        public bool IsConnected { get; set; }
        public long RecordCount { get; set; }
        public double StorageUsageMb { get; set; }
        public DateTime LastBackup { get; set; }
        public string? Message { get; set; }
    }

    /// <summary>
    /// API health status
    /// </summary>
    public class ApiHealthDto
    {
        public bool IsRunning { get; set; }
        public string? Version { get; set; }
        public int ActiveConnections { get; set; }
        public double AverageResponseTime { get; set; }
        public int ErrorCount { get; set; }
    }

    /// <summary>
    /// Storage health status
    /// </summary>
    public class StorageHealthDto
    {
        public double TotalStorageMb { get; set; }
        public double UsedStorageMb { get; set; }
        public double AvailableStorageMb { get; set; }
        public double UsagePercentage { get; set; }
    }

    /// <summary>
    /// Performance metrics
    /// </summary>
    public class PerformanceMetricsDto
    {
        public double CpuUsagePercent { get; set; }
        public double MemoryUsagePercent { get; set; }
        public double AverageResponseTimeMs { get; set; }
        public int RequestsPerSecond { get; set; }
        public int CacheHitRate { get; set; }
    }

    /// <summary>
    /// System backup response DTO
    /// </summary>
    public class SystemBackupDto
    {
        public int Id { get; set; }
        public string? BackupName { get; set; }
        public string? Description { get; set; }
        public double FileSizeMb { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Status { get; set; } // Completed, In Progress, Failed
        public string? Location { get; set; }
    }

    /// <summary>
    /// System statistics response DTO
    /// </summary>
    public class SystemStatisticsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsersToday { get; set; }
        public int TotalProducts { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int SystemErrors { get; set; }
        public DateTime SystemUptimeSince { get; set; }
    }

    /// <summary>
    /// Activity log response DTO
    /// </summary>
    public class ActivityLogDto
    {
        public int Id { get; set; }
        public string? User { get; set; }
        public string? Action { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Status { get; set; } // Success, Failed
    }
}
