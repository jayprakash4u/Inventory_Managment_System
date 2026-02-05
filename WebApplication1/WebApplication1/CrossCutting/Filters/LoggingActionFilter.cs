using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace WebApplication1.CrossCutting.Filters
{
    public class LoggingActionFilter : IActionFilter, IResultFilter
    {
        private readonly ILogger<LoggingActionFilter> _logger;
        private DateTime _actionStartTime;

        public LoggingActionFilter(ILogger<LoggingActionFilter> logger)
        {
            _logger = logger;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            _actionStartTime = DateTime.UtcNow;

            var correlationId = context.HttpContext.Items["CorrelationId"]?.ToString() ?? "unknown";

            //Gets the current user's ID from the JWT token or HttpContext
            var userId = GetCurrentUserId(context);

            var controller = context.Controller.GetType().Name;
            var action = context.ActionDescriptor.DisplayName;

            _logger.LogInformation("[{CorrelationId}] Action executing: {Controller}.{Action} by user {UserId}",
                correlationId, controller, action, userId ?? "anonymous");


            // Log action parameters (excluding sensitive data)
            var parameters = new Dictionary<string, object>();
            foreach (var parameter in context.ActionArguments)
            {
                if (!IsSensitiveParameter(parameter.Key))
                {
                    parameters[parameter.Key] = parameter.Value ?? "null";
                }
                else
                {
                    parameters[parameter.Key] = "[REDACTED]";
                }
            }

            if (parameters.Any())
            {
                _logger.LogDebug("[{CorrelationId}] Action parameters: {@Parameters}", correlationId, parameters);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            var correlationId = context.HttpContext.Items["CorrelationId"]?.ToString() ?? "unknown";
            var controller = context.Controller.GetType().Name;
            var action = context.ActionDescriptor.DisplayName;

            if (context.Exception != null)
            {
                _logger.LogError(context.Exception, "[{CorrelationId}] Action {Controller}.{Action} failed: {Message}",
                    correlationId, controller, action, context.Exception.Message);
            }
            else
            {
                var duration = DateTime.UtcNow - _actionStartTime;
                _logger.LogInformation("[{CorrelationId}] Action {Controller}.{Action} completed in {Duration}ms",
                    correlationId, controller, action, duration.TotalMilliseconds);
            }
        }

        public void OnResultExecuting(ResultExecutingContext context)
        {
            // Log before result execution if needed
        }

        public void OnResultExecuted(ResultExecutedContext context)
        {
            var correlationId = context.HttpContext.Items["CorrelationId"]?.ToString() ?? "unknown";

            if (context.Exception != null)
            {
                _logger.LogError(context.Exception, "[{CorrelationId}] Result execution failed: {Message}",
                    correlationId, context.Exception.Message);
            }
        }

        private string? GetCurrentUserId(ActionExecutingContext context)
        {
            return context.HttpContext.User?.Identity?.Name ??
                   context.HttpContext.User?.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        }

        private static bool IsSensitiveParameter(string parameterName)
        {
            var sensitiveParams = new[] { "password", "token", "secret", "key", "apikey" };
            return sensitiveParams.Contains(parameterName.ToLower());
        }
    }
}