using WebApplication1.DTOs;

namespace WebApplication1.Services
{
    public interface IAuditService
    {
        Task LogAuditEventAsync(CreateAuditLogRequest request);
        Task<(IEnumerable<AuditLogDto>, int, int)> GetAuditLogsAsync(AuditLogFilterRequest filter);
        Task<AuditStatisticsDto> GetAuditStatisticsAsync();
    }
}