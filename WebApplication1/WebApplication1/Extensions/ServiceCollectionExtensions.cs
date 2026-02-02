using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using FluentValidation.AspNetCore;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.AspNetCore.ResponseCompression;
using WebApplication1.CrossCutting.Middleware;
using WebApplication1.CrossCutting.Filters;
using WebApplication1.CrossCutting.Mappings;
using WebApplication1.Data;
using WebApplication1.Repository;
using WebApplication1.Services;
using WebApplication1.Services.Interfaces;
using WebApplication1.Services.Implementations;

namespace WebApplication1.Extensions;

public static class ServiceCollectionExtensions
{
    public static WebApplicationBuilder AddLogging(this WebApplicationBuilder builder)
    {
        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();
        builder.Logging.AddDebug();
        builder.Logging.SetMinimumLevel(LogLevel.Information);
        return builder;
    }

    public static WebApplicationBuilder AddControllers(this WebApplicationBuilder builder)
    {
        builder.Services.AddControllers(options =>
        {
            options.Filters.Add<LoggingActionFilter>();
            options.Filters.Add<ModelValidationFilter>();
        })
        .AddJsonOptions(options =>
        {
            // Make JSON deserialization case-insensitive
            options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            // Keep camelCase naming for serialization (optional)
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        });
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new() { Title = "Product Management API", Version = "v1" });
        });
        return builder;
    }

    public static WebApplicationBuilder AddCors(this WebApplicationBuilder builder)
    {
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigins", policy =>
                policy.WithOrigins(
                    "http://localhost:3000", "http://localhost:5000", "http://localhost:5001",
                    "http://localhost:5501", "http://127.0.0.1:5501", "https://localhost:7071",
                    "https://localhost:44383", "http://localhost:44383"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithExposedHeaders("Authorization", "Content-Disposition"));
        });
        return builder;
    }

    public static WebApplicationBuilder AddAutoMapper(this WebApplicationBuilder builder)
    {
        builder.Services.AddAutoMapper(typeof(MappingProfile));
        return builder;
    }

    public static WebApplicationBuilder AddApiVersioning(this WebApplicationBuilder builder)
    {
        builder.Services.AddApiVersioning(options =>
        {
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
            options.ReportApiVersions = true;
            options.ApiVersionReader = ApiVersionReader.Combine(
                new UrlSegmentApiVersionReader(),
                new HeaderApiVersionReader("X-Api-Version"));
        });

        builder.Services.AddVersionedApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });
        return builder;
    }

    public static WebApplicationBuilder AddRateLimiting(this WebApplicationBuilder builder)
    {
        builder.Services.AddMemoryCache();
        builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
        builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
        builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
        builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
        builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
        return builder;
    }

    public static WebApplicationBuilder AddHealthChecks(this WebApplicationBuilder builder)
    {
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<AppDbContext>("database", tags: new[] { "db", "sqlserver" })
            .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Application is healthy"), tags: new[] { "self" });
        return builder;
    }

    public static WebApplicationBuilder AddResponseCompression(this WebApplicationBuilder builder)
    {
        builder.Services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<GzipCompressionProvider>();
            options.MimeTypes = new[]
            {
                "application/json", "application/javascript", "text/css",
                "text/html", "text/plain", "text/xml"
            };
        });

        builder.Services.Configure<GzipCompressionProviderOptions>(options =>
        {
            options.Level = System.IO.Compression.CompressionLevel.Optimal;
        });

        builder.Services.AddOutputCache(options =>
        {
            options.DefaultExpirationTimeSpan = TimeSpan.FromMinutes(5);
        });
        return builder;
    }

    public static WebApplicationBuilder AddValidation(this WebApplicationBuilder builder)
    {
        builder.Services.AddFluentValidationAutoValidation();
        builder.Services.AddValidatorsFromAssemblyContaining<Program>();
        return builder;
    }

    public static WebApplicationBuilder AddDatabase(this WebApplicationBuilder builder)
    {
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DotNetpractice")));
        return builder;
    }

    public static WebApplicationBuilder AddApplicationServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<JwtHelper>();
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<IProductRepository, ProductRepository>();
        builder.Services.AddScoped<IProductService, ProductService>();
        builder.Services.AddScoped<ISupplierOrderRepository, SupplierOrderRepository>();
        builder.Services.AddScoped<ISupplierOrderService, SupplierOrderService>();
        builder.Services.AddScoped<ICustomerOrderRepository, CustomerOrderRepository>();
        builder.Services.AddScoped<ICustomerOrderService, CustomerOrderService>();
        builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        builder.Services.AddScoped<IAuditRepository, AuditRepository>();
        builder.Services.AddScoped<IAuditService, AuditService>();
        builder.Services.AddScoped<IInsightsRepository, InsightsRepository>();
        builder.Services.AddScoped<IInsightsService, InsightsService>();
        builder.Services.AddScoped<ISystemConfigService, SystemConfigService>();
        return builder;
    }

    public static WebApplicationBuilder AddJwtAuthentication(this WebApplicationBuilder builder)
    {
        var secretKey = Environment.GetEnvironmentVariable("JwtKey")
            ?? builder.Configuration["JwtKey"]
            ?? throw new Exception("JWT Key not configured. Set the DOTNET_JwtKey environment variable.");

        var keyBytes = Encoding.UTF8.GetBytes(secretKey);

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    ClockSkew = TimeSpan.Zero
                };
            });

        builder.Services.AddAuthorization();
        return builder;
    }
}
