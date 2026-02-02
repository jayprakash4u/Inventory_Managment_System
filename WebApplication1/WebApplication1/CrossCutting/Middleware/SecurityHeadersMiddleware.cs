using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace WebApplication1.CrossCutting.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

// This method runs on Every request
        public async Task InvokeAsync(HttpContext context)
        {
            // Security Headers
            context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Add("X-Frame-Options", "DENY");
            context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
            context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
            context.Response.Headers.Add("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
            context.Response.Headers.Add("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';");
            context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

            // Remove server header for security
            context.Response.Headers.Remove("Server");
            context.Response.Headers.Add("Server", "WebApplication");

            await _next(context);
        }
    }
}