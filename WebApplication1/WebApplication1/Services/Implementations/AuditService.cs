using WebApplication1.DTOs;
using WebApplication1.Model;
using WebApplication1.Repository;

namespace WebApplication1.Services
{
    public class AuditService : IAuditService
    {
        private readonly IAuditRepository _repository;

        public AuditService(IAuditRepository repository)
        {
            _repository = repository;
        }

        public async Task LogAuditEventAsync(CreateAuditLogRequest request)
        {
            var auditLog = new AuditLog
            {
                Timestamp = DateTime.UtcNow,
                User = request.User,
                Action = request.Action,
                Module = request.Module,
                Entity = request.Entity,
                Details = request.Details,
                IpAddress = request.IpAddress,
                Severity = request.Severity,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAuditLogAsync(auditLog);
        }

        public async Task<(IEnumerable<AuditLogDto>, int, int)> GetAuditLogsAsync(AuditLogFilterRequest filter)
        {
            var (logs, totalCount) = await _repository.GetAuditLogsAsync(filter);
            var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

            var logDtos = logs.Select(log => new AuditLogDto
            {
                Id = log.Id,
                Timestamp = log.Timestamp,
                User = log.User,
                Action = log.Action,
                Module = log.Module,
                Entity = log.Entity,
                Details = log.Details,
                IpAddress = log.IpAddress,
                Severity = log.Severity,
                CreatedAt = log.CreatedAt
            });

            return (logDtos, totalCount, totalPages);
        }

        public async Task<AuditStatisticsDto> GetAuditStatisticsAsync()
        {
            return await _repository.GetAuditStatisticsAsync();
        }
    }
}