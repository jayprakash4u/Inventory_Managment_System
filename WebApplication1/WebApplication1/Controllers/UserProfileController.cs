using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs;
using WebApplication1.Model;
using WebApplication1.Services;
using AutoMapper;
using System.Security.Claims;

namespace WebApplication1.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/user-profile")]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserProfileController> _logger;
        private readonly IMapper _mapper;

        public UserProfileController(IUserService userService, ILogger<UserProfileController> logger, IMapper mapper)
        {
            _userService = userService;
            _logger = logger;
            _mapper = mapper;
        }

        /// <summary>
        /// Get current user's profile information
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                _logger.LogInformation("Getting profile for current user");

                // Extract user email from JWT claims
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    _logger.LogWarning("User email not found in claims");
                    return Unauthorized("User information not found in token");
                }

                var user = await _userService.GetUserByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogWarning("User not found: {Email}", userEmail);
                    return NotFound("User not found");
                }

                var profileResponse = _mapper.Map<UserProfileResponse>(user);
                _logger.LogInformation("Profile retrieved successfully for user: {Email}", userEmail);

                return Ok(profileResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile");
                return StatusCode(500, "An error occurred while retrieving the profile");
            }
        }

        /// <summary>
        /// Get user profile by ID
        /// </summary>
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserProfile(int userId)
        {
            try
            {
                _logger.LogInformation("Getting profile for user ID: {UserId}", userId);

                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User not found: {UserId}", userId);
                    return NotFound("User not found");
                }

                var profileResponse = _mapper.Map<UserProfileResponse>(user);
                return Ok(profileResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile for ID: {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving the profile");
            }
        }

        /// <summary>
        /// Update user profile information
        /// </summary>
        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequest request)
        {
            try
            {
                _logger.LogInformation("Updating profile for current user");

                // Validate request
                if (request == null)
                {
                    return BadRequest("Invalid request");
                }

                // Extract user email from JWT claims
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    _logger.LogWarning("User email not found in claims");
                    return Unauthorized("User information not found in token");
                }

                var user = await _userService.GetUserByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogWarning("User not found: {Email}", userEmail);
                    return NotFound("User not found");
                }

                var updatedUser = await _userService.UpdateUserProfileAsync(
                    user.Id,
                    request.FullName,
                    request.PhoneNumber,
                    request.DateOfBirth
                );

                if (updatedUser == null)
                {
                    return BadRequest("Failed to update profile");
                }

                var profileResponse = _mapper.Map<UserProfileResponse>(updatedUser);
                _logger.LogInformation("Profile updated successfully for user: {Email}", userEmail);

                return Ok(new { message = "Profile updated successfully", data = profileResponse });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
                return StatusCode(500, "An error occurred while updating the profile");
            }
        }

        /// <summary>
        /// Update user profile picture
        /// </summary>
        [HttpPut("profile-picture")]
        public async Task<IActionResult> UpdateProfilePicture([FromBody] UploadProfilePictureRequest request)
        {
            try
            {
                _logger.LogInformation("Updating profile picture for current user");

                if (request == null || string.IsNullOrEmpty(request.PictureUrl))
                {
                    return BadRequest("Picture URL is required");
                }

                // Extract user email from JWT claims
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    _logger.LogWarning("User email not found in claims");
                    return Unauthorized("User information not found in token");
                }

                var user = await _userService.GetUserByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogWarning("User not found: {Email}", userEmail);
                    return NotFound("User not found");
                }

                var updatedUser = await _userService.UpdateProfilePictureAsync(user.Id, request.PictureUrl);
                if (updatedUser == null)
                {
                    return BadRequest("Failed to update profile picture");
                }

                var profileResponse = _mapper.Map<UserProfileResponse>(updatedUser);
                _logger.LogInformation("Profile picture updated successfully for user: {Email}", userEmail);

                return Ok(new { message = "Profile picture updated successfully", data = profileResponse });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile picture");
                return StatusCode(500, "An error occurred while updating the profile picture");
            }
        }

        /// <summary>
        /// Change user password
        /// </summary>
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                _logger.LogInformation("Changing password for current user");

                // Validate request
                if (request == null)
                {
                    return BadRequest("Invalid request");
                }

                if (string.IsNullOrEmpty(request.OldPassword) || string.IsNullOrEmpty(request.NewPassword))
                {
                    return BadRequest("Old password and new password are required");
                }

                if (request.NewPassword != request.ConfirmPassword)
                {
                    return BadRequest("New password and confirm password do not match");
                }

                if (request.NewPassword.Length < 6)
                {
                    return BadRequest("New password must be at least 6 characters long");
                }

                // Extract user email from JWT claims
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    _logger.LogWarning("User email not found in claims");
                    return Unauthorized("User information not found in token");
                }

                var user = await _userService.GetUserByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogWarning("User not found: {Email}", userEmail);
                    return NotFound("User not found");
                }

                var success = await _userService.ChangePasswordAsync(user.Id, request.OldPassword, request.NewPassword);
                if (!success)
                {
                    _logger.LogWarning("Password change failed for user: {Email}", userEmail);
                    return BadRequest("Failed to change password. Please check your old password");
                }

                _logger.LogInformation("Password changed successfully for user: {Email}", userEmail);
                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, "An error occurred while changing the password");
            }
        }
    }
}
