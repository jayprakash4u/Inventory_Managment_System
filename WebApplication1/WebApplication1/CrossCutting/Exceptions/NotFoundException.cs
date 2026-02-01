namespace WebApplication1.CrossCutting.Exceptions
{
    public class NotFoundException : BusinessException
    {
        public NotFoundException(string resourceName, object resourceId)
            : base($"{resourceName} with ID '{resourceId}' was not found.", "RESOURCE_NOT_FOUND", 404)
        {
        }

        public NotFoundException(string message)
            : base(message, "RESOURCE_NOT_FOUND", 404)
        {
        }
    }
}