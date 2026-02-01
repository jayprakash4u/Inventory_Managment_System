using System.IdentityModel.Tokens.Jwt;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using WebApplication1.DTOs;

namespace WebApplication1.Services
{
    public class JwtHelper
    {
        private readonly IConfiguration _config;


        //step 1:Constructor reads appsettings.json
        public JwtHelper(IConfiguration config)
        {
            _config = config;
        }


        //step 2: Create tokens for a given username
        public TokenResponse CreateTokens(string fullName, string email)
        {

            // Create claims (info inside token)
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, fullName),
                new Claim(ClaimTypes.Email, email),

            };



            // Read secret key from configuration
            var secretKey = _config["JwtKey"];
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JwtKey is not configured in appsettings.json");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));


            // Create signing credentials(sign the token)
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);


            // Create the access token (short-lived)
            var accessToken = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15), // 15 minutes
                signingCredentials: creds
                );

            // Create the refresh token (long-lived)
            var refreshToken = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7), // 7 days
                signingCredentials: creds
                );


            // Convert tokens to string
            var accessTokenString = new JwtSecurityTokenHandler().WriteToken(accessToken);
            var refreshTokenString = new JwtSecurityTokenHandler().WriteToken(refreshToken);


            // Return tokens and expirations
            return new TokenResponse
            {
                AccessToken = accessTokenString,
                AccessTokenExpiration = accessToken.ValidTo,
                RefreshToken = refreshTokenString,
                RefreshTokenExpiration = refreshToken.ValidTo
            };
        }
    }
}
