using WebApplication1.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddLogging()
       .AddControllers()
       .AddCors()
       .AddAutoMapper()
       .AddApiVersioning()
       .AddRateLimiting()
       .AddHealthChecks()
       .AddResponseCompression()
       .AddValidation()
       .AddDatabase()
       .AddApplicationServices()
       .AddJwtAuthentication();

var app = builder.Build();

await app.EnsureDatabaseCreated();
app.ConfigureMiddleware().Run();
