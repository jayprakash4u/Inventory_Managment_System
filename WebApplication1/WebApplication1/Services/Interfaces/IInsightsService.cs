using WebApplication1.DTOs;

namespace WebApplication1.Services
{
    public interface IInsightsService
    {
        Task<InsightsResponse> GetInsightsAsync();
    }
}