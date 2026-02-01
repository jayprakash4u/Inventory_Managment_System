using WebApplication1.DTOs;

namespace WebApplication1.Repository
{
    public interface IInsightsRepository
    {
        Task<InsightsResponse> GetInsightsAsync();
    }
}