namespace WebApplication1.CrossCutting.Filters;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using WebApplication1.CrossCutting.Exceptions;
using FluentValidation;

/// <summary>
/// Global exception filter for handling all unhandled exceptions
/// </summary>
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        _logger.LogError(context.Exception, "Unhandled exception occurred: {ExceptionType}", 
            context.Exception.GetType().Name);

        var response = GetErrorResponse(context.Exception);
        var statusCode = GetStatusCode(context.Exception);

        context.Result = new ObjectResult(response)
        {
            StatusCode = statusCode
        };

        context.ExceptionHandled = true;
    }

    private object GetErrorResponse(Exception exception)
    {
        return exception switch
        {
            NotFoundException nfe => new
            {
                success = false,
                message = nfe.Message,
                statusCode = 404,
                errors = (object?)null
            },
            BusinessException be => new
            {
                success = false,
                message = be.Message,
                statusCode = be.HttpStatusCode,
                errorCode = be.ErrorCode,
                errors = (object?)null
            },
            ValidationException ve => new
            {
                success = false,
                message = "One or more validation errors occurred.",
                statusCode = 400,
                errors = ve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray())
            },
            UnauthorizedAccessException => new
            {
                success = false,
                message = "Unauthorized access",
                statusCode = 401,
                errors = (object?)null
            },
            _ => new
            {
                success = false,
                message = "An unexpected error occurred. Please try again later.",
                statusCode = 500,
                errors = (object?)null
            }
        };
    }

    private int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            BusinessException be => be.HttpStatusCode,
            ValidationException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };
    }
}
