using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.CrossCutting.Exceptions;
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
                    throw new UnauthorizedException("User information not found in token");
                }

                var user = await _userService.GetUserByEmailAsync(userEmail);
                if (user == null)
                {
                    _logger.LogWarning("User not found: {Email}", userEmail);
                    throw new NotFoundException("User", userEmail);
                }

                var profileResponse = _mapper.Map<UserProfileResponse>(user);
                _logger.LogInformation("Profile retrieved successfully for user: {Email}", userEmail);

                return Ok(profileResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile");
                throw;
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
                var profileResponse = _mapper.Map<UserProfileResponse>(user);
                _logger.LogInformation("Profile retrieved successfully for user ID: {UserId}", userId);
                return Ok(profileResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile for ID: {UserId}", userId);
                throw;
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
                    throw new BusinessException("Invalid request", "VALIDATION_ERROR", 400);
                }

                // Extract user email from JWT claims
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    _logger.LogWarning("User email not found in claims");
                    throw new UnauthorizedException("User information not found in token");
                }

                var user = await _userService.GetUserByEmailAsync(userEmail);
                var updatedUser = await _userService.UpdateUserProfileAsync(
                    user.Id,
                    request.FullName,
                    request.PhoneNumber,
                    request.DateOfBirth
                );

                if (updatedUser == null)
                {
                    throw new BusinessException("Failed to update user profile");
                }

                var profileResponse = _mapper.Map<UserProfileResponse>(updatedUser);
                _logger.LogInformation("Profile updated successfully for user: {Email}", userEmail);

                return Ok(new { message = "Profile updated successfully", data = profileResponse });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
                throw new BusinessException($"Error updating user profile: {ex.Message}");
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
                    throw new BusinessException("Picture URL is required", "VALIDATION_ERROR", 400);
                }

                // Extract user email from JWT claims
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    _logger.LogWarning("User email not found in claims");
                    throw new UnauthorizedException("User information not found in token");
                }

                var user = await _userService.GetUserByEmailAsync(userEmail);
                var updatedUser = await _userService.UpdateProfilePictureAsync(user.Id, request.PictureUrl);
                if (updatedUser == null)
                {
                    throw new BusinessException("Failed to update profile picture");
                }

                var profileResponse = _mapper.Map<UserProfileResponse>(updatedUser);
                _logger.LogInformation("Profile picture updated successfully for user: {Email}", userEmail);

                return Ok(new { message = "Profile picture updated successfully", data = profileResponse });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile picture");
                throw;
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
                    throw new BusinessException("Invalid request", "VALIDATION_ERROR", 400);
                }

                if (string.IsNullOrEmpty(request.OldPassword) || string.IsNullOrEmpty(request.NewPassword))
                {
                    throw new BusinessException("Old password and new password are required", "VALIDATION_ERROR", 400);
                }

                if (request.NewPassword != request.ConfirmPassword)
                {
                    throw new BusinessException("New password and confirm password do not match", "VALIDATION_ERROR", 400);
                }

                if (request.NewPassword.Length < 6)
                {
                    throw new BusinessException("New password must be at least 6 characters long", "VALIDATION_ERROR", 400);
                }

                // Extract user email from JWT claims
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    _logger.LogWarning("User email not found in claims");
                    throw new UnauthorizedException("User information not found in token");
                }

                var user = await _userService.GetUserByEmailAsync(userEmail);
                var success = await _userService.ChangePasswordAsync(user.Id, request.OldPassword, request.NewPassword);
                if (!success)
                {
                    _logger.LogWarning("Password change failed for user: {Email}", userEmail);
                    throw new BusinessException("Failed to change password. Please check your old password");
                }

                _logger.LogInformation("Password changed successfully for user: {Email}", userEmail);
                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                throw;
            }
        }
    }
}
