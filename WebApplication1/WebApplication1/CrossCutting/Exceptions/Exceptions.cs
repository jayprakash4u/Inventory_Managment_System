namespace WebApplication1.CrossCutting.Exceptions
{
    /// <summary>
    /// Base exception for all business rule violations
    /// </summary>
    public class BusinessException : Exception
    {
        public string ErrorCode { get; }
        public int HttpStatusCode { get; }

        public BusinessException(string message, string errorCode = "BUSINESS_ERROR", int httpStatusCode = 400)
            : base(message)
        {
            ErrorCode = errorCode;
            HttpStatusCode = httpStatusCode;
        }

        public BusinessException(string message, Exception innerException, string errorCode = "BUSINESS_ERROR", int httpStatusCode = 400)
            : base(message, innerException)
        {
            ErrorCode = errorCode;
            HttpStatusCode = httpStatusCode;
        }
    }

    /// <summary>
    /// Exception thrown when a requested resource is not found
    /// </summary>
    public class NotFoundException : BusinessException
    {
        public string? ResourceName { get; }
        public object? ResourceId { get; }

        public NotFoundException(string resourceName, object resourceId)
            : base($"{resourceName} with ID '{resourceId}' was not found.", "RESOURCE_NOT_FOUND", 404)
        {
            ResourceName = resourceName;
            ResourceId = resourceId;
        }

        public NotFoundException(string message)
            : base(message, "RESOURCE_NOT_FOUND", 404)
        {
        }
    }

    /// <summary>
    /// Exception thrown for unauthorized access attempts
    /// </summary>
    public class UnauthorizedException : BusinessException
    {
        public UnauthorizedException(string message)
            : base(message, "UNAUTHORIZED", 401)
        {
        }

        public UnauthorizedException(string message, Exception innerException)
            : base(message, innerException, "UNAUTHORIZED", 401)
        {
        }
    }

    /// <summary>
    /// Exception thrown when access to a resource is forbidden
    /// </summary>
    public class ForbiddenException : BusinessException
    {
        public ForbiddenException(string message)
            : base(message, "FORBIDDEN", 403)
        {
        }

        public ForbiddenException(string message, Exception innerException)
            : base(message, innerException, "FORBIDDEN", 403)
        {
        }
    }

    /// <summary>
    /// Exception thrown when a conflict occurs (e.g., duplicate resource)
    /// </summary>
    public class ConflictException : BusinessException
    {
        public ConflictException(string message)
            : base(message, "CONFLICT", 409)
        {
        }

        public ConflictException(string message, Exception innerException)
            : base(message, innerException, "CONFLICT", 409)
        {
        }
    }

    /// <summary>
    /// Exception thrown when a validation fails
    /// </summary>
    public class CustomValidationException : BusinessException
    {
        public IDictionary<string, string[]> Errors { get; }

        public CustomValidationException(string message, IDictionary<string, string[]> errors)
            : base(message, "VALIDATION_ERROR", 400)
        {
            Errors = errors;
        }

        public CustomValidationException(string message)
            : base(message, "VALIDATION_ERROR", 400)
        {
            Errors = new Dictionary<string, string[]>();
        }
    }
}
