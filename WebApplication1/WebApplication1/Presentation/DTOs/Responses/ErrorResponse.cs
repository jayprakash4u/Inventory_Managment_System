namespace WebApplication1.Presentation.DTOs.Responses
{
    public class ErrorResponse
    {
        public string Message { get; set; }
        public string ErrorCode { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }
        public string Path { get; set; }
        public Dictionary<string, string[]> ValidationErrors { get; set; }

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