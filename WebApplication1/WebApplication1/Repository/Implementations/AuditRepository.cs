using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.DTOs;
using WebApplication1.Model;

namespace WebApplication1.Repository;

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
        _context.Database.SetCommandTimeout(120);

        var query = _context.AuditLogs.AsNoTracking().AsQueryable();

        ApplyFilters(query, filter);

        var totalCount = await query.CountAsync();

        query = ApplySorting(query, filter);

        var logs = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (logs, totalCount);
    }

    private static IQueryable<AuditLog> ApplyFilters(IQueryable<AuditLog> query, AuditLogFilterRequest filter)
    {
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

        return query;
    }

    private static IQueryable<AuditLog> ApplySorting(IQueryable<AuditLog> query, AuditLogFilterRequest filter)
    {
        var sortProperty = GetSortProperty(filter.SortBy);
        return filter.SortDirection.ToLower() == "desc"
            ? query.OrderByDescending(sortProperty)
            : query.OrderBy(sortProperty);
    }

    private static System.Linq.Expressions.Expression<Func<AuditLog, object>> GetSortProperty(string sortBy)
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

    public async Task<AuditStatisticsDto> GetAuditStatisticsAsync()
    {
        _context.Database.SetCommandTimeout(120);

        var today = DateTime.UtcNow.Date;

        return new AuditStatisticsDto
        {
            TotalLogs = await _context.AuditLogs.AsNoTracking().CountAsync(),
            TodayActivities = await _context.AuditLogs.AsNoTracking().CountAsync(a => a.Timestamp.Date == today),
            Warnings = await _context.AuditLogs.AsNoTracking().CountAsync(a => a.Severity == "medium"),
            Errors = await _context.AuditLogs.AsNoTracking().CountAsync(a => a.Severity == "high"),
            CriticalEvents = await _context.AuditLogs.AsNoTracking().CountAsync(a => a.Severity == "critical")
        };
    }
}
