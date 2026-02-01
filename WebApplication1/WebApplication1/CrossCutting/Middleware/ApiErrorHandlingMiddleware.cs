using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.Presentation.DTOs.Responses;

namespace WebApplication1.CrossCutting.Middleware
{
    public class ApiErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ApiErrorHandlingMiddleware> _logger;

        public ApiErrorHandlingMiddleware(RequestDelegate next, ILogger<ApiErrorHandlingMiddleware> logger)
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
            catch (Exception exception)
            {
                await HandleExceptionAsync(context, exception);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var correlationId = context.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();
            context.Items["CorrelationId"] = correlationId;

            ProblemDetails problemDetails;

            switch (exception)
            {
                case ValidationException validationException:
                    problemDetails = HandleValidationException(validationException, context);
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    break;

                case NotFoundException notFoundException:
                    problemDetails = HandleNotFoundException(notFoundException, context);
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    break;

                case BusinessException businessException:
                    problemDetails = HandleBusinessException(businessException, context);
                    context.Response.StatusCode = businessException.HttpStatusCode;
                    break;

                case UnauthorizedAccessException unauthorizedException:
                    problemDetails = HandleUnauthorizedException(unauthorizedException, context);
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    break;

                case ArgumentException argumentException:
                    problemDetails = HandleArgumentException(argumentException, context);
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    break;

                case KeyNotFoundException keyNotFoundException:
                    problemDetails = HandleKeyNotFoundException(keyNotFoundException, context);
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    break;

                case InvalidOperationException invalidOperationException:
                    problemDetails = HandleInvalidOperationException(invalidOperationException, context);
                    context.Response.StatusCode = StatusCodes.Status409Conflict;
                    break;

                default:
                    problemDetails = HandleUnexpectedException(exception, context);
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    break;
            }

            // Add correlation ID to response headers
            context.Response.Headers.Add("X-Correlation-ID", correlationId);

            // Set content type
            context.Response.ContentType = "application/problem+json";

            // Add common extensions
            problemDetails.Extensions ??= new Dictionary<string, object?>();
            problemDetails.Extensions["correlationId"] = correlationId;
            problemDetails.Extensions["timestamp"] = DateTime.UtcNow;
            problemDetails.Extensions["requestId"] = context.TraceIdentifier;

            // Only include stack trace in development
            if (context.RequestServices.GetService(typeof(Microsoft.Extensions.Hosting.IHostEnvironment)) is Microsoft.Extensions.Hosting.IHostEnvironment env &&
                env.IsDevelopment())
            {
                problemDetails.Extensions["stackTrace"] = exception.StackTrace;
                problemDetails.Extensions["source"] = exception.Source;
            }

            var result = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            await context.Response.WriteAsync(result);
        }

        private ValidationProblemDetails HandleValidationException(ValidationException exception, HttpContext context)
        {
            _logger.LogWarning(exception, "Validation failed for request: {Path}", context.Request.Path);

            var errors = exception.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            return new ValidationProblemDetails
            {
                Detail = "One or more validation errors occurred.",
                Instance = context.Request.Path,
                Errors = errors
            };
        }

        private BusinessErrorDetails HandleBusinessException(BusinessException exception, HttpContext context)
        {
            _logger.LogWarning(exception, "Business rule violation: {Message}", exception.Message);

            return new BusinessErrorDetails
            {
                Detail = exception.Message,
                Instance = context.Request.Path,
                ErrorCode = exception.ErrorCode,
                Context = new
                {
                    userId = context.User?.Identity?.Name,
                    timestamp = DateTime.UtcNow
                }
            };
        }

        private NotFoundErrorDetails HandleNotFoundException(NotFoundException exception, HttpContext context)
        {
            _logger.LogInformation("Resource not found: {Message}", exception.Message);

            return new NotFoundErrorDetails
            {
                Detail = exception.Message,
                Instance = context.Request.Path,
                ResourceType = "Unknown", // Could be enhanced to extract from exception
                ResourceId = "Unknown"    // Could be enhanced to extract from exception
            };
        }

        private AuthenticationErrorDetails HandleUnauthorizedException(UnauthorizedAccessException exception, HttpContext context)
        {
            _logger.LogWarning(exception, "Unauthorized access attempt: {Message}", exception.Message);

            return new AuthenticationErrorDetails
            {
                Detail = "Authentication is required to access this resource.",
                Instance = context.Request.Path,
                Scheme = "Bearer",
                Realm = "api.productmanagement.com"
            };
        }

        private ProblemDetails HandleArgumentException(ArgumentException exception, HttpContext context)
        {
            _logger.LogWarning(exception, "Invalid argument: {Message}", exception.Message);

            return new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = "Bad Request",
                Status = 400,
                Detail = exception.Message,
                Instance = context.Request.Path
            };
        }

        private NotFoundErrorDetails HandleKeyNotFoundException(KeyNotFoundException exception, HttpContext context)
        {
            _logger.LogInformation("Key not found: {Message}", exception.Message);

            return new NotFoundErrorDetails
            {
                Detail = "The requested resource was not found.",
                Instance = context.Request.Path,
                ResourceType = "Resource",
                ResourceId = "Unknown"
            };
        }

        private ConflictErrorDetails HandleInvalidOperationException(InvalidOperationException exception, HttpContext context)
        {
            _logger.LogWarning(exception, "Invalid operation: {Message}", exception.Message);

            return new ConflictErrorDetails
            {
                Detail = exception.Message,
                Instance = context.Request.Path,
                ConflictType = "InvalidOperation"
            };
        }


        private ProblemDetails HandleUnexpectedException(Exception exception, HttpContext context)
        {
            _logger.LogError(exception, "Unexpected error occurred: {Message}", exception.Message);

            return new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                Title = "Internal Server Error",
                Status = 500,
                Detail = "An unexpected error occurred. Please try again later.",
                Instance = context.Request.Path
            };
        }
    }
}