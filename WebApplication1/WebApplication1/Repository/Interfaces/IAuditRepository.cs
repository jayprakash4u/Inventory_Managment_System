using WebApplication1.DTOs;
using WebApplication1.Model;

namespace WebApplication1.Repository
{
    public interface IAuditRepository
    {
        Task AddAuditLogAsync(AuditLog auditLog);
        Task<(IEnumerable<AuditLog>, int)> GetAuditLogsAsync(AuditLogFilterRequest filter);
        Task<AuditStatisticsDto> GetAuditStatisticsAsync();
    }
}