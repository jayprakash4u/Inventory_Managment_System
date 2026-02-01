using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.Presentation.DTOs.Responses;

namespace WebApplication1.CrossCutting.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var errorResponse = new ErrorResponse("An unexpected error occurred.");
            var statusCode = StatusCodes.Status500InternalServerError;

            switch (exception)
            {
                case NotFoundException notFoundEx:
                    statusCode = notFoundEx.HttpStatusCode;
                    errorResponse = new ErrorResponse(notFoundEx.Message, notFoundEx.ErrorCode);
                    _logger.LogInformation("Resource not found: {Message}", notFoundEx.Message);
                    break;

                case BusinessException businessEx:
                    statusCode = businessEx.HttpStatusCode;
                    errorResponse = new ErrorResponse(businessEx.Message, businessEx.ErrorCode);
                    _logger.LogWarning("Business exception: {Message}, Code: {ErrorCode}", businessEx.Message, businessEx.ErrorCode);
                    break;

                case UnauthorizedAccessException unauthorizedEx:
                    statusCode = StatusCodes.Status401Unauthorized;
                    errorResponse = new ErrorResponse("Unauthorized access.", "UNAUTHORIZED");
                    _logger.LogWarning("Unauthorized access attempt: {Message}", unauthorizedEx.Message);
                    break;

                case ArgumentException argEx:
                    statusCode = StatusCodes.Status400BadRequest;
                    errorResponse = new ErrorResponse("Invalid request parameters.", "INVALID_PARAMETERS", argEx.Message);
                    _logger.LogWarning("Invalid parameters: {Message}", argEx.Message);
                    break;

                case KeyNotFoundException keyEx:
                    statusCode = StatusCodes.Status404NotFound;
                    errorResponse = new ErrorResponse("Requested resource not found.", "RESOURCE_NOT_FOUND");
                    _logger.LogInformation("Resource not found: {Message}", keyEx.Message);
                    break;

                default:
                    // Log unexpected exceptions with full details
                    _logger.LogError(exception, "Unexpected error occurred: {Message}", exception.Message);
                    errorResponse.Details = "Please contact support if this issue persists.";
                    break;
            }

            errorResponse.Path = context.Request.Path;
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            await context.Response.WriteAsJsonAsync(errorResponse);
        }
    }
}