using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace WebApplication1.CrossCutting.Filters
{
    public class ModelValidationFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var errors = context.ModelState
                    .Where(ms => ms.Value?.Errors.Any() == true)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                var problemDetails = new WebApplication1.Presentation.DTOs.Responses.ValidationProblemDetails
                {
                    Detail = "One or more validation errors occurred.",
                    Instance = context.HttpContext.Request.Path,
                    Errors = errors
                };

                // Add correlation ID if available
                var correlationId = context.HttpContext.Items["CorrelationId"]?.ToString();
                if (!string.IsNullOrEmpty(correlationId))
                {
                    problemDetails.Extensions = new Dictionary<string, object?>
                    {
                        ["correlationId"] = correlationId,
                        ["timestamp"] = DateTime.UtcNow,
                        ["requestId"] = context.HttpContext.TraceIdentifier
                    };
                }

                context.Result = new BadRequestObjectResult(problemDetails)
                {
                    ContentTypes = { "application/problem+json" }
                };
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            // No action needed after execution
        }
    }
}