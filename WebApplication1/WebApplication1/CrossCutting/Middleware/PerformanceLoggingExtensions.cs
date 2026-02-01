using Microsoft.AspNetCore.Builder;

namespace WebApplication1.CrossCutting.Middleware
{
    public static class PerformanceLoggingExtensions
    {
        public static IApplicationBuilder UsePerformanceLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<PerformanceLoggingMiddleware>();
        }
    }
}