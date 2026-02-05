namespace WebApplication1.Presentation.DTOs.Responses
{
    public class ErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public string ErrorCode { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Path { get; set; } = string.Empty;
        public Dictionary<string, string[]> ValidationErrors { get; set; } = new();

        public ErrorResponse(string message, string errorCode = null, string details = null)
        {
            Message = message;
            ErrorCode = errorCode ?? "INTERNAL_ERROR";
            Details = details;
            Timestamp = DateTime.UtcNow;
            ValidationErrors = new Dictionary<string, string[]>();
        }
    }
}