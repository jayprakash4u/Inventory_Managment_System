using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Repository;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _context;

    public RefreshTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken> GetByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow);
    }

    public async Task AddAsync(RefreshToken refreshToken)
    {
        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync();
    }

    public async Task RevokeTokensForUserAsync(string userEmail)
    {
        var tokens = _context.RefreshTokens.Where(rt => rt.UserEmail == userEmail && !rt.IsRevoked);
        foreach (var token in tokens)
        {
            token.IsRevoked = true;
        }
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsTokenValidAsync(string token)
    {
        var refreshToken = await GetByTokenAsync(token);
        return refreshToken != null;
    }
}
