using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace WebApplication1.CrossCutting.Middleware
{
    public class PerformanceLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<PerformanceLoggingMiddleware> _logger;

        public PerformanceLoggingMiddleware(RequestDelegate next, ILogger<PerformanceLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = context.Items["CorrelationId"]?.ToString() ?? "unknown";
            var stopwatch = Stopwatch.StartNew();

            // Track memory usage before request
            var memoryBefore = GC.GetTotalMemory(false);

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                var memoryAfter = GC.GetTotalMemory(false);
                var memoryUsed = memoryAfter - memoryBefore;

                var duration = stopwatch.ElapsedMilliseconds;
                var statusCode = context.Response.StatusCode;

                // Log performance metrics
                _logger.LogInformation("[{CorrelationId}] Performance: {Method} {Path} - {StatusCode} in {Duration}ms, Memory: {MemoryUsed} bytes",
                    correlationId,
                    context.Request.Method,
                    context.Request.Path,
                    statusCode,
                    duration,
                    memoryUsed);

                // Alert on slow requests (>5 seconds)
                if (duration > 5000)
                {
                    _logger.LogWarning("[{CorrelationId}] SLOW REQUEST ALERT: {Method} {Path} took {Duration}ms",
                        correlationId, context.Request.Method, context.Request.Path, duration);
                }

                // Alert on high memory usage (>10MB)
                if (memoryUsed > 10 * 1024 * 1024)
                {
                    _logger.LogWarning("[{CorrelationId}] HIGH MEMORY USAGE: {Method} {Path} used {MemoryUsed} bytes",
                        correlationId, context.Request.Method, context.Request.Path, memoryUsed);
                }

                // Collect GC statistics
                var gcStats = new
                {
                    Gen0Collections = GC.CollectionCount(0),
                    Gen1Collections = GC.CollectionCount(1),
                    Gen2Collections = GC.CollectionCount(2),
                    TotalMemory = GC.GetTotalMemory(false)
                };

                _logger.LogDebug("[{CorrelationId}] GC Stats: {@GCStats}", correlationId, gcStats);
            }
        }
    }
}