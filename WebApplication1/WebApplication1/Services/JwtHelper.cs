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


        //step 2: Create token for a given username
        public TokenResponse CreateToken(string fullName, string email)
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


            // Create the Jwt token
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: creds
                );


            // Convert token to string
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);


            // Return token and expiration
            return new TokenResponse
            {
                Token = tokenString,
                Expiration = token.ValidTo
            };
        }
    }
}
