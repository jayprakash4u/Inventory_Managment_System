namespace WebApplication1.CrossCutting.Exceptions
{
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
}