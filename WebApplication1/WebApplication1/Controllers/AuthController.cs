using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs;
using WebApplication1.Model;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly JwtHelper _jwtHelper;
        private readonly IUserService _userService;
        public AuthController(JwtHelper jwtHelper , IUserService userService,ILogger<AuthController> logger)
        {
            _jwtHelper = jwtHelper;
            _userService = userService;
            _logger = logger;
        }


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            _logger.LogInformation("Registration endPoint called for email:{Email}", request.Email);
            var existingUser = await _userService.GetUserByEmailAsync(request.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: User alredy exists with email{Email}", request.Email);
                return BadRequest("User alredy exists");
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = request.Password
            };

            var createUser = await _userService.CreateUserAsync(user);
            _logger.LogInformation("User registered successfully:{Email}", request.Email);
                return Ok(createUser);

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


            var token = _jwtHelper.CreateToken(user.Email, user.FullName);

            _logger.LogInformation("User logged in Successfully:{Email}", request.Email);
            return Ok(token);
        }
    }


}
