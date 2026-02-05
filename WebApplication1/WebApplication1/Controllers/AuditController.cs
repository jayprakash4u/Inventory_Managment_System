using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.DTOs;
using WebApplication1.Services;
using AutoMapper;

namespace WebApplication1.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/audit")]

    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;
        private readonly ILogger<AuditController> _logger;
        private readonly IMapper _mapper;

        public AuditController(IAuditService auditService, ILogger<AuditController> logger, IMapper mapper)
        {
            _auditService = auditService;
            _logger = logger;
            _mapper = mapper;
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogFilterRequest filter)
        {
            _logger.LogInformation("Retrieving audit logs with filter: Page={Page}, PageSize={PageSize}, User={User}, Action={Action}, Module={Module}",
                filter.Page, filter.PageSize, filter.User, filter.Action, filter.Module);

            var (logs, totalCount, totalPages) = await _auditService.GetAuditLogsAsync(filter);
            var logDtos = _mapper.Map<IEnumerable<AuditLogDto>>(logs);

            _logger.LogInformation("Retrieved {Count} audit logs (Total: {TotalCount}, Pages: {TotalPages})",
                logDtos.Count(), totalCount, totalPages);

            return Ok(new
            {
                data = logDtos,
                totalCount = totalCount,
                page = filter.Page,
                totalPages = totalPages,
                pageSize = filter.PageSize
            });
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int limit = 10)
        {
            _logger.LogInformation("Retrieving {Limit} most recent audit logs", limit);

            var filter = new AuditLogFilterRequest { Page = 1, PageSize = limit };
            var (logs, totalCount, _) = await _auditService.GetAuditLogsAsync(filter);
            var logDtos = _mapper.Map<IEnumerable<AuditLogDto>>(logs);

            _logger.LogInformation("Retrieved {Count} recent audit logs", logDtos.Count());

            return Ok(new
            {
                data = logDtos,
                count = logDtos.Count(),
                totalCount = totalCount
            });
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetAuditStatistics()
        {
            _logger.LogInformation("Retrieving audit statistics");

            var statistics = await _auditService.GetAuditStatisticsAsync();

            _logger.LogInformation("Retrieved audit statistics: {@Statistics}", statistics);

            return Ok(statistics);
        }

        [HttpPost]
        public async Task<IActionResult> LogAuditEvent([FromBody] CreateAuditLogRequest request)
        {
            _logger.LogInformation("Logging audit event: User={User}, Action={Action}, Module={Module}, Details={Details}",
                request.User, request.Action, request.Module, request.Details);

            await _auditService.LogAuditEventAsync(request);

            _logger.LogInformation("Audit event logged successfully for user: {User}", request.User);

            return Ok(new { message = "Audit event logged successfully" });
        }

        [HttpGet("logs/{id}")]
        public async Task<IActionResult> GetAuditLogById(int id)
        {
            _logger.LogInformation("Retrieving audit log by ID: {LogId}", id);

            var (logs, _, _) = await _auditService.GetAuditLogsAsync(new AuditLogFilterRequest { Page = 1, PageSize = 1 });
            var log = logs.FirstOrDefault(l => l.Id == id);

            if (log == null)
            {
                _logger.LogWarning("Audit log not found: {LogId}", id);
                throw new NotFoundException("AuditLog", id);
            }

            _logger.LogInformation("Retrieved audit log: {LogId}", id);
            return Ok(log);
        }
    }
}