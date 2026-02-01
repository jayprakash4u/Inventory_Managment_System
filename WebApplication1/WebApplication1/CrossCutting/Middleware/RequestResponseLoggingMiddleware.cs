using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace WebApplication1.CrossCutting.Middleware
{
    public class RequestResponseLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestResponseLoggingMiddleware> _logger;

        public RequestResponseLoggingMiddleware(RequestDelegate next, ILogger<RequestResponseLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = Guid.NewGuid().ToString();
            context.Items["CorrelationId"] = correlationId;

            var startTime = DateTime.UtcNow;

            // Log incoming request
            _logger.LogInformation("[{CorrelationId}] Request: {Method} {Path} {QueryString} from {RemoteIp}",
                correlationId,
                context.Request.Method,
                context.Request.Path,
                context.Request.QueryString,
                context.Connection.RemoteIpAddress);

            // Log request headers (sensitive headers excluded)
            LogRequestHeaders(context, correlationId);

            // Capture response
            var originalBodyStream = context.Response.Body;
            using var responseBodyStream = new MemoryStream();
            context.Response.Body = responseBodyStream;

            try
            {
                await _next(context);

                var duration = DateTime.UtcNow - startTime;

                // Log response
                _logger.LogInformation("[{CorrelationId}] Response: {StatusCode} in {Duration}ms",
                    correlationId,
                    context.Response.StatusCode,
                    duration.TotalMilliseconds);

                // Log response body for errors
                if (context.Response.StatusCode >= 400)
                {
                    await LogResponseBodyAsync(context, correlationId);
                }
            }
            catch (Exception ex)
            {
                var duration = DateTime.UtcNow - startTime;
                _logger.LogError(ex, "[{CorrelationId}] Request failed after {Duration}ms: {Message}",
                    correlationId, duration.TotalMilliseconds, ex.Message);
                throw;
            }
            finally
            {
                // Copy response back to original stream
                responseBodyStream.Seek(0, SeekOrigin.Begin);
                await responseBodyStream.CopyToAsync(originalBodyStream);
                context.Response.Body = originalBodyStream;
            }
        }

        private void LogRequestHeaders(HttpContext context, string correlationId)
        {
            var headers = new Dictionary<string, string>();
            foreach (var header in context.Request.Headers)
            {
                // Exclude sensitive headers
                if (!IsSensitiveHeader(header.Key))
                {
                    headers[header.Key] = header.Value.ToString();
                }
            }

            if (headers.Any())
            {
                _logger.LogDebug("[{CorrelationId}] Request headers: {@Headers}", correlationId, headers);
            }
        }

        private async Task LogResponseBodyAsync(HttpContext context, string correlationId)
        {
            try
            {
                context.Response.Body.Seek(0, SeekOrigin.Begin);
                using var reader = new StreamReader(context.Response.Body, Encoding.UTF8, leaveOpen: true);
                var responseBody = await reader.ReadToEndAsync();
                context.Response.Body.Seek(0, SeekOrigin.Begin);

                // Truncate large responses
                if (responseBody.Length > 1000)
                {
                    responseBody = responseBody.Substring(0, 1000) + "...[truncated]";
                }

                _logger.LogWarning("[{CorrelationId}] Error response body: {Body}", correlationId, responseBody);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[{CorrelationId}] Failed to log response body", correlationId);
            }
        }

        private static bool IsSensitiveHeader(string headerName)
        {
            var sensitiveHeaders = new[] { "authorization", "cookie", "x-api-key", "x-auth-token" };
            return sensitiveHeaders.Contains(headerName.ToLower());
        }
    }
}