using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.DTOs;
using WebApplication1.Model;

namespace WebApplication1.Repository
{
    public class AuditRepository : IAuditRepository
    {
        private readonly AppDbContext _context;

        public AuditRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAuditLogAsync(AuditLog auditLog)
        {
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task<(IEnumerable<AuditLog>, int)> GetAuditLogsAsync(AuditLogFilterRequest filter)
        {
            var query = _context.AuditLogs.AsQueryable();

            // Apply filters
            if (filter.StartDate.HasValue)
                query = query.Where(a => a.Timestamp >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(a => a.Timestamp <= filter.EndDate.Value);

            if (!string.IsNullOrEmpty(filter.User))
                query = query.Where(a => a.User.Contains(filter.User));

            if (!string.IsNullOrEmpty(filter.Action))
                query = query.Where(a => a.Action == filter.Action);

            if (!string.IsNullOrEmpty(filter.Module))
                query = query.Where(a => a.Module == filter.Module);

            if (!string.IsNullOrEmpty(filter.Severity))
                query = query.Where(a => a.Severity == filter.Severity);

            // Get total count before pagination
            var totalCount = query.Count();

            // Apply sorting
            query = filter.SortDirection.ToLower() == "desc"
                ? query.OrderByDescending(GetSortProperty(filter.SortBy))
                : query.OrderBy(GetSortProperty(filter.SortBy));

            // Apply pagination
            var logs = query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToList();

            return (logs, totalCount);
        }

        public async Task<AuditStatisticsDto> GetAuditStatisticsAsync()
        {
            var today = DateTime.UtcNow.Date;

            var stats = new AuditStatisticsDto
            {
                TotalLogs = _context.AuditLogs.Count(),
                TodayActivities = _context.AuditLogs.Count(a => a.Timestamp.Date == today),
                Warnings = _context.AuditLogs.Count(a => a.Severity == "medium"),
                Errors = _context.AuditLogs.Count(a => a.Severity == "high"),
                CriticalEvents = _context.AuditLogs.Count(a => a.Severity == "critical")
            };

            return stats;
        }

        private System.Linq.Expressions.Expression<Func<AuditLog, object>> GetSortProperty(string sortBy)
        {
            return sortBy.ToLower() switch
            {
                "user" => a => a.User,
                "action" => a => a.Action,
                "module" => a => a.Module,
                "severity" => a => a.Severity,
                _ => a => a.Timestamp
            };
        }
    }
}