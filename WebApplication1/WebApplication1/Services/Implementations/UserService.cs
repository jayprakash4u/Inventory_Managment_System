using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.Model;
using WebApplication1.Repository;

namespace WebApplication1.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserService> _logger;

        public UserService(IUserRepository userRepository, ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }
        public async Task<User> CreateUserAsync(User user)
        {
            _logger.LogInformation("Creating new user with email: {Email}", user.Email);
            var createdUser = await _userRepository.CreateASync(user);
            _logger.LogInformation("User created successfully with ID: {UserId}", createdUser.Id);
            return createdUser;
        }

        public async Task<User?> DeleteUserAsync(int id)
        {
            _logger.LogInformation("Deleting user with ID: {UserId}", id);
            var deletedUser = await _userRepository.DeleteAsync(id);
            if (deletedUser != null)
            {
                _logger.LogInformation("User deleted successfully: {Email}", deletedUser.Email);
            }
            else
            {
                _logger.LogWarning("User not found for deletion with ID: {UserId}", id);
            }
            return deletedUser;
        }

        public async Task<User?> ExistingUserAsync(int id)
        {
            _logger.LogDebug("Checking if user exists with ID: {UserId}", id);
            var user = await _userRepository.ExistingAsync(id);
            _logger.LogDebug("User existence check result: {Exists}", user != null);
            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            _logger.LogDebug("Retrieving user by email: {Email}", email);
            var user = await _userRepository.GetUserByEmailAsync(email);
            _logger.LogDebug("User retrieval result: {Found}", user != null);
            return user;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            _logger.LogDebug("Retrieving user by ID: {UserId}", id);
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                throw new NotFoundException("User", id);
            }
            _logger.LogDebug("User retrieval result: {Found}", user != null);
            return user;
        }

        public async Task<User?> UpdateUserAsync(User user)
        {
            _logger.LogInformation("Updating user: {Email}", user.Email);
            var updatedUser = await _userRepository.UpdateAsync(user);
            if (updatedUser != null)
            {
                _logger.LogInformation("User updated successfully: {Email}", updatedUser.Email);
            }
            else
            {
                _logger.LogWarning("User update failed - user not found: {Email}", user.Email);
            }
            return updatedUser;
        }

        public async Task<User?> ValidateUserAsync(string email, string password)
        {
            _logger.LogInformation("Validating user credentials for: {Email}", email);

            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("User validation failed - user not found: {Email}", email);
                return null;
            }

            if (!PasswordHasher.VerifyPassword(password, user.Password))
            {
                _logger.LogWarning("User validation failed - invalid password for: {Email}", email);
                return null;
            }

            _logger.LogInformation("User validation successful: {Email}", email);
            return user;
        }

        public async Task<User?> UpdateUserProfileAsync(int userId, string fullName, string phoneNumber, DateTime? dateOfBirth)
        {
            _logger.LogInformation("Updating user profile for user ID: {UserId}", userId);

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found for profile update: {UserId}", userId);
                return null;
            }

            if (!string.IsNullOrEmpty(fullName))
                user.FullName = fullName;
            if (!string.IsNullOrEmpty(phoneNumber))
                user.PhoneNumber = phoneNumber;
            if (dateOfBirth.HasValue)
                user.DateOfBirth = dateOfBirth;

            user.UpdatedAt = DateTime.UtcNow;

            var updatedUser = await _userRepository.UpdateAsync(user);
            _logger.LogInformation("User profile updated successfully: {UserId}", userId);
            return updatedUser;
        }

        public async Task<User?> UpdateProfilePictureAsync(int userId, string pictureUrl)
        {
            _logger.LogInformation("Updating profile picture for user ID: {UserId}", userId);

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found for picture update: {UserId}", userId);
                return null;
            }

            user.ProfilePictureUrl = pictureUrl;
            user.UpdatedAt = DateTime.UtcNow;

            var updatedUser = await _userRepository.UpdateAsync(user);
            _logger.LogInformation("Profile picture updated successfully: {UserId}", userId);
            return updatedUser;
        }

        public async Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword)
        {
            _logger.LogInformation("Changing password for user ID: {UserId}", userId);

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found for password change: {UserId}", userId);
                return false;
            }

            // Verify old password
            if (!PasswordHasher.VerifyPassword(oldPassword, user.Password))
            {
                _logger.LogWarning("Password change failed - invalid old password for user: {UserId}", userId);
                return false;
            }

            // Hash new password and update
            user.Password = PasswordHasher.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            var updatedUser = await _userRepository.UpdateAsync(user);
            _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
            return updatedUser != null;
        }
    }
}
