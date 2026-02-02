namespace WebApplication1.CrossCutting.Exceptions;

/// <summary>
/// Exception thrown for unauthorized access
/// </summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }

    public UnauthorizedException(string message, Exception innerException) 
        : base(message, innerException) { }
}

/// <summary>
/// Exception thrown for forbidden operations
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }

    public ForbiddenException(string message, Exception innerException) 
        : base(message, innerException) { }
}
