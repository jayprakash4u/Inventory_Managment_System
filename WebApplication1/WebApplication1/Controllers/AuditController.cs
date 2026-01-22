using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/audit")]
   
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogFilterRequest filter)
        {
            try
            {
                var (logs, totalCount, totalPages) = await _auditService.GetAuditLogsAsync(filter);
                return Ok(new
                {
                    data = logs,
                    totalCount = totalCount,
                    page = filter.Page,
                    totalPages = totalPages,
                    pageSize = filter.PageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve audit logs", details = ex.Message });
            }
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetAuditStatistics()
        {
            try
            {
                var statistics = await _auditService.GetAuditStatisticsAsync();
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve audit statistics", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> LogAuditEvent([FromBody] CreateAuditLogRequest request)
        {
            Console.WriteLine($"🔍 AUDIT API: Received audit log request - User: {request.User}, Action: {request.Action}, Module: {request.Module}");

            try
            {
                await _auditService.LogAuditEventAsync(request);
                Console.WriteLine("✅ AUDIT API: Audit event logged successfully");
                return Ok(new { message = "Audit event logged successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ AUDIT API: Failed to log audit event - {ex.Message}");
                return StatusCode(500, new { error = "Failed to log audit event", details = ex.Message });
            }
        }

        [HttpGet("logs/{id}")]
        public async Task<IActionResult> GetAuditLogById(int id)
        {
            try
            {
                var (logs, _, _) = await _auditService.GetAuditLogsAsync(new AuditLogFilterRequest { Page = 1, PageSize = 1 });
                var log = logs.FirstOrDefault(l => l.Id == id);

                if (log == null)
                {
                    return NotFound(new { error = "Audit log not found" });
                }

                return Ok(log);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve audit log", details = ex.Message });
            }
        }
    }
}