using AspNetCoreRateLimit;
using WebApplication1.CrossCutting.Middleware;
using WebApplication1.Data;

namespace WebApplication1.Extensions;

public static class ApplicationBuilderExtensions
{
    public static WebApplication ConfigureMiddleware(this WebApplication app)
    {
        app.UseCors("AllowSpecificOrigins");
        app.UseCorrelationId();  // ← Add early to track all requests
        app.UseResponseCompression();
        app.UseSecurityHeaders();
        app.UseHsts();
        app.UseHttpsRedirection();
        app.UseRequestResponseLogging();
        app.UsePerformanceLogging();
        app.UseIpRateLimiting();
        app.UseApiErrorHandling();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Product Management API v1");
                options.RoutePrefix = string.Empty;
            });
        }
        else
        {
            app.UseHsts();
        }

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapHealthChecks("/health");
        app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            Predicate = (check) => check.Tags.Contains("ready") || check.Tags.Contains("db") || check.Tags.Contains("self")
        });
        app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
        {
            Predicate = (check) => check.Tags.Contains("self")
        });

        app.UseOutputCache();
        app.MapControllers();

        return app;
    }

    public static async Task EnsureDatabaseCreated(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.EnsureCreatedAsync();
    }
}
