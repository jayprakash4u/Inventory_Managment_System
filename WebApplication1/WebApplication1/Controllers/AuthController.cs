using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs;
using WebApplication1.Model;
using WebApplication1.Services;
using WebApplication1.Repository;
using AutoMapper;

namespace WebApplication1.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly JwtHelper _jwtHelper;
        private readonly IUserService _userService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IMapper _mapper;

        public AuthController(JwtHelper jwtHelper, IUserService userService, IRefreshTokenService refreshTokenService, ILogger<AuthController> logger, IMapper mapper)
        {
            _jwtHelper = jwtHelper;
            _userService = userService;
            _refreshTokenService = refreshTokenService;
            _logger = logger;
            _mapper = mapper;
        }


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            _logger.LogInformation("Registration endpoint called for email: {Email}", request.Email);

            var existingUser = await _userService.GetUserByEmailAsync(request.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: User already exists with email {Email}", request.Email);
                return BadRequest("User already exists");
            }

            var user = _mapper.Map<User>(request);
            var createdUser = await _userService.CreateUserAsync(user);

            _logger.LogInformation("User registered successfully: {Email}", request.Email);
            return Ok(createdUser);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult>Login(LoginRequest request)
        {
            _logger.LogInformation("Login attemp for email:{Email}", request.Email);

            var user = await _userService.ValidateUserAsync(request.Email, request.Password);
            if (user == null)
            {
                _logger.LogWarning("Login failed for email:{Email}", request.Email);
                return Unauthorized("Invalid credentials");
            }


            var tokens = _jwtHelper.CreateTokens(user.FullName, user.Email);

            // Store refresh token
            await _refreshTokenService.StoreRefreshTokenAsync(tokens.RefreshToken, user.Email, tokens.RefreshTokenExpiration);

            _logger.LogInformation("User logged in Successfully:{Email}", request.Email);
            return Ok(tokens);
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            _logger.LogInformation("Refresh token request received");

            // Validate refresh token
            var storedToken = await _refreshTokenService.GetByTokenAsync(request.RefreshToken);
            if (storedToken == null)
            {
                _logger.LogWarning("Invalid refresh token provided");
                return Unauthorized("Invalid refresh token");
            }

            // Get user
            var user = await _userService.GetUserByEmailAsync(storedToken.UserEmail);
            if (user == null)
            {
                _logger.LogWarning("User not found for refresh token");
                return Unauthorized("User not found");
            }

            // Revoke old refresh token
            await _refreshTokenService.RevokeTokensForUserAsync(user.Email);

            // Generate new tokens
            var newTokens = _jwtHelper.CreateTokens(user.FullName, user.Email);

            // Store new refresh token
            await _refreshTokenService.StoreRefreshTokenAsync(newTokens.RefreshToken, user.Email, newTokens.RefreshTokenExpiration);

            _logger.LogInformation("Tokens refreshed for user: {Email}", user.Email);
            return Ok(newTokens);
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(userEmail))
                {
                    _logger.LogWarning("Logout failed: User email not found in token");
                    return BadRequest("User not found in token");
                }

                
                await _refreshTokenService.RevokeTokensForUserAsync(userEmail);

                _logger.LogInformation("User logged out successfully: {Email}", userEmail);
                return Ok(new { message = "Logout successful" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during logout: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error during logout");
            }
        }
    }


}
