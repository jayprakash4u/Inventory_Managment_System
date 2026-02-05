using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace WebApplication1.CrossCutting.Middleware
{
    /// <summary>
    /// Middleware to generate and track correlation ID for each request.
    /// Useful for debugging, logging, and tracing requests across services.
    /// </summary>
    public class CorrelationIdMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CorrelationIdMiddleware> _logger;

        public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Try to get correlation ID from header, otherwise generate new one
            var correlationId = GetCorrelationId(context);

            // Store in HttpContext for access throughout the request
            context.Items["CorrelationId"] = correlationId;

            // Add to response headers so client can reference it
            context.Response.Headers["X-Correlation-ID"] = correlationId;

            // Log request start
            _logger.LogInformation(
                "[{CorrelationId}] Request started: {Method} {Path}",
                correlationId,
                context.Request.Method,
                context.Request.Path);

            // Start activity for distributed tracing
            var activity = new Activity("Request");
            activity.SetTag("correlation.id", correlationId);
            activity.Start();

            try
            {
                await _next(context);
            }
            finally
            {
                // Log request completion
                _logger.LogInformation(
                    "[{CorrelationId}] Request completed: {Method} {Path} - Status {StatusCode}",
                    correlationId,
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode);

                activity?.Stop();
            }
        }

        private static string GetCorrelationId(HttpContext context)
        {
            // Check if client sent correlation ID in header
            if (context.Request.Headers.TryGetValue("X-Correlation-ID", out var headerCorrelationId))
            {
                return headerCorrelationId.ToString();
            }

            // Check if already set in HttpContext (e.g., by load balancer)
            if (context.Items.TryGetValue("CorrelationId", out var existingCorrelationId))
            {
                return existingCorrelationId?.ToString() ?? GenerateNewCorrelationId();
            }

            // Generate new correlation ID
            return GenerateNewCorrelationId();
        }

        private static string GenerateNewCorrelationId()
        {
            return Guid.NewGuid().ToString("N")[..16]; // Shortened GUID for readability
        }
    }

    /// <summary>
    /// Extension methods for easy registration of CorrelationIdMiddleware
    /// </summary>
    public static class CorrelationIdMiddlewareExtensions
    {
        /// <summary>
        /// Adds correlation ID middleware to the application pipeline.
        /// Should be called early in the pipeline (before other middleware).
        /// </summary>
        public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CorrelationIdMiddleware>();
        }

        /// <summary>
        /// Gets the current correlation ID from HttpContext.
        /// Returns null if not available.
        /// </summary>
        public static string? GetCorrelationId(this HttpContext context)
        {
            return context.Items["CorrelationId"]?.ToString();
        }
    }
}
