using WebApplication1.Model;

namespace WebApplication1.Services
{
    public interface IRefreshTokenService
    {
        Task<RefreshToken> GetByTokenAsync(string token);
        Task StoreRefreshTokenAsync(string token, string userEmail, DateTime expiresAt);
        Task RevokeTokensForUserAsync(string userEmail);
        Task<bool> IsTokenValidAsync(string token);
    }
}