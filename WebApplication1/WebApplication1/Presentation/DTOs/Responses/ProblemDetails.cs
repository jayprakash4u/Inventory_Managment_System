using System.Text.Json.Serialization;

namespace WebApplication1.Presentation.DTOs.Responses
{
    /// <summary>
    /// RFC 7807 Problem Details for HTTP APIs
    /// </summary>
    public class ProblemDetails
    {
        /// <summary>
        /// A URI reference that identifies the problem type
        /// </summary>
        [JsonPropertyName("type")]
        public string? Type { get; set; }

        /// <summary>
        /// A short, human-readable summary of the problem type
        /// </summary>
        [JsonPropertyName("title")]
        public string? Title { get; set; }

        /// <summary>
        /// The HTTP status code
        /// </summary>
        [JsonPropertyName("status")]
        public int? Status { get; set; }

        /// <summary>
        /// A human-readable explanation specific to this occurrence of the problem
        /// </summary>
        [JsonPropertyName("detail")]
        public string? Detail { get; set; }

        /// <summary>
        /// A URI reference that identifies the specific occurrence of the problem
        /// </summary>
        [JsonPropertyName("instance")]
        public string? Instance { get; set; }

        /// <summary>
        /// Additional details about the error
        /// </summary>
        [JsonPropertyName("extensions")]
        public Dictionary<string, object?>? Extensions { get; set; }
    }

    /// <summary>
    /// Validation Problem Details for input validation errors
    /// </summary>
    public class ValidationProblemDetails : ProblemDetails
    {
        public ValidationProblemDetails()
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
            Title = "One or more validation errors occurred.";
            Status = 400;
        }

        /// <summary>
        /// Object containing validation errors
        /// </summary>
        [JsonPropertyName("errors")]
        public Dictionary<string, string[]>? Errors { get; set; }
    }

    /// <summary>
    /// Business rule violation error details
    /// </summary>
    public class BusinessErrorDetails : ProblemDetails
    {
        public BusinessErrorDetails()
        {
            Type = "https://api.productmanagement.com/errors/business-rule-violation";
            Title = "Business rule violation";
            Status = 400;
        }

        /// <summary>
        /// Business error code
        /// </summary>
        [JsonPropertyName("errorCode")]
        public string? ErrorCode { get; set; }

        /// <summary>
        /// Additional business context
        /// </summary>
        [JsonPropertyName("context")]
        public object? Context { get; set; }
    }

    /// <summary>
    /// Authentication error details
    /// </summary>
    public class AuthenticationErrorDetails : ProblemDetails
    {
        public AuthenticationErrorDetails()
        {
            Type = "https://tools.ietf.org/html/rfc7235#section-3.1";
            Title = "Authentication required";
            Status = 401;
        }

        /// <summary>
        /// Authentication scheme
        /// </summary>
        [JsonPropertyName("scheme")]
        public string? Scheme { get; set; }

        /// <summary>
        /// Realm for authentication
        /// </summary>
        [JsonPropertyName("realm")]
        public string? Realm { get; set; }
    }

    /// <summary>
    /// Authorization error details
    /// </summary>
    public class AuthorizationErrorDetails : ProblemDetails
    {
        public AuthorizationErrorDetails()
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3";
            Title = "Forbidden";
            Status = 403;
        }

        /// <summary>
        /// Required permissions or roles
        /// </summary>
        [JsonPropertyName("requiredPermissions")]
        public string[]? RequiredPermissions { get; set; }

        /// <summary>
        /// User permissions
        /// </summary>
        [JsonPropertyName("userPermissions")]
        public string[]? UserPermissions { get; set; }
    }

    /// <summary>
    /// Not found error details
    /// </summary>
    public class NotFoundErrorDetails : ProblemDetails
    {
        public NotFoundErrorDetails()
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4";
            Title = "Resource not found";
            Status = 404;
        }

        /// <summary>
        /// Type of resource that was not found
        /// </summary>
        [JsonPropertyName("resourceType")]
        public string? ResourceType { get; set; }

        /// <summary>
        /// Identifier of the resource
        /// </summary>
        [JsonPropertyName("resourceId")]
        public object? ResourceId { get; set; }
    }

    /// <summary>
    /// Conflict error details
    /// </summary>
    public class ConflictErrorDetails : ProblemDetails
    {
        public ConflictErrorDetails()
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8";
            Title = "Conflict";
            Status = 409;
        }

        /// <summary>
        /// Type of conflict
        /// </summary>
        [JsonPropertyName("conflictType")]
        public string? ConflictType { get; set; }

        /// <summary>
        /// Existing resource information
        /// </summary>
        [JsonPropertyName("existingResource")]
        public object? ExistingResource { get; set; }
    }

    /// <summary>
    /// Rate limit exceeded error details
    /// </summary>
    public class RateLimitErrorDetails : ProblemDetails
    {
        public RateLimitErrorDetails()
        {
            Type = "https://tools.ietf.org/html/rfc6585#section-4";
            Title = "Too Many Requests";
            Status = 429;
        }

        /// <summary>
        /// Number of requests allowed per period
        /// </summary>
        [JsonPropertyName("limit")]
        public int? Limit { get; set; }

        /// <summary>
        /// Remaining requests in current period
        /// </summary>
        [JsonPropertyName("remaining")]
        public int? Remaining { get; set; }

        /// <summary>
        /// Time when the limit resets
        /// </summary>
        [JsonPropertyName("reset")]
        public DateTime? Reset { get; set; }

        /// <summary>
        /// Retry after seconds
        /// </summary>
        [JsonPropertyName("retryAfter")]
        public int? RetryAfter { get; set; }
    }
}