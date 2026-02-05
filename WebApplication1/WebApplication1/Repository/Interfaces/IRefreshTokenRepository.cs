using WebApplication1.Model;

namespace WebApplication1.Repository
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task AddAsync(RefreshToken refreshToken);
        Task UpdateAsync(RefreshToken refreshToken);
        Task RevokeTokensForUserAsync(string userEmail);
        Task<bool> IsTokenValidAsync(string token);
    }
}