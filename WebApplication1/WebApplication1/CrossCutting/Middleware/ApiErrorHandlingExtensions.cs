using Microsoft.AspNetCore.Builder;

namespace WebApplication1.CrossCutting.Middleware
{
    public static class ApiErrorHandlingExtensions
    {
        public static IApplicationBuilder UseApiErrorHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ApiErrorHandlingMiddleware>();
        }
    }
}