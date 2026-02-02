using WebApplication1.DTOs;
using WebApplication1.Repository;

namespace WebApplication1.Services;

public class InsightsService : IInsightsService
{
    private readonly IInsightsRepository _insightsRepository;

    public InsightsService(IInsightsRepository insightsRepository)
    {
        _insightsRepository = insightsRepository;
    }

    public async Task<InsightsResponse> GetInsightsAsync()
    {
        return await _insightsRepository.GetInsightsAsync();
    }
}
