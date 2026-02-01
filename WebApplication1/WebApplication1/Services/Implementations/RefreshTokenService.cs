using WebApplication1.Model;
using WebApplication1.Repository;

namespace WebApplication1.Services
{
    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IRefreshTokenRepository _repository;

        public RefreshTokenService(IRefreshTokenRepository repository)
        {
            _repository = repository;
        }

        public async Task<RefreshToken> GetByTokenAsync(string token)
        {
            return await _repository.GetByTokenAsync(token);
        }

        public async Task StoreRefreshTokenAsync(string token, string userEmail, DateTime expiresAt)
        {
            var refreshToken = new RefreshToken
            {
                Token = token,
                UserEmail = userEmail,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            await _repository.AddAsync(refreshToken);
        }

        public async Task RevokeTokensForUserAsync(string userEmail)
        {
            await _repository.RevokeTokensForUserAsync(userEmail);
        }

        public async Task<bool> IsTokenValidAsync(string token)
        {
            return await _repository.IsTokenValidAsync(token);
        }
    }
}