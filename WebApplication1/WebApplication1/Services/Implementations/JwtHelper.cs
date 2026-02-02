using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using WebApplication1.DTOs;

namespace WebApplication1.Services;

public class JwtHelper(IConfiguration config)
{
    public TokenResponse CreateTokens(string fullName, string email)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, fullName),
            new Claim(ClaimTypes.Email, email),
        };

        var secretKey = config["JwtKey"];
        if (string.IsNullOrEmpty(secretKey))
        {
            throw new InvalidOperationException("JwtKey is not configured in appsettings.json");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var accessToken = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );

        var refreshToken = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new TokenResponse
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(accessToken),
            AccessTokenExpiration = accessToken.ValidTo,
            RefreshToken = new JwtSecurityTokenHandler().WriteToken(refreshToken),
            RefreshTokenExpiration = refreshToken.ValidTo
        };
    }
}
