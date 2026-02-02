using WebApplication1.CrossCutting.Exceptions;
using WebApplication1.Model;
using WebApplication1.Repository;

namespace WebApplication1.Services;

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
        return await _userRepository.ExistingAsync(id);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _userRepository.GetUserByEmailAsync(email);
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        var user = await _userRepository.GetUserByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException("User", id);
        }
        return user;
    }

    public async Task<User?> UpdateUserAsync(User user)
    {
        _logger.LogInformation("Updating user: {Email}", user.Email);
        var updatedUser = await _userRepository.UpdateAsync(user);
        if (updatedUser == null)
        {
            _logger.LogWarning("User update failed - user not found: {Email}", user.Email);
        }
        else
        {
            _logger.LogInformation("User updated successfully: {Email}", updatedUser.Email);
        }
        return updatedUser;
    }

    public async Task<User?> ValidateUserAsync(string email, string password)
    {
        var user = await _userRepository.GetUserByEmailAsync(email);
        if (user == null || !PasswordHasher.VerifyPassword(password, user.Password))
        {
            return null;
        }
        return user;
    }

    public async Task<User?> UpdateUserProfileAsync(int userId, string fullName, string phoneNumber, DateTime? dateOfBirth)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        if (!string.IsNullOrEmpty(fullName)) user.FullName = fullName;
        if (!string.IsNullOrEmpty(phoneNumber)) user.PhoneNumber = phoneNumber;
        if (dateOfBirth.HasValue) user.DateOfBirth = dateOfBirth.Value;

        user.UpdatedAt = DateTime.UtcNow;
        return await _userRepository.UpdateAsync(user);
    }

    public async Task<User?> UpdateProfilePictureAsync(int userId, string pictureUrl)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        user.ProfilePictureUrl = pictureUrl;
        user.UpdatedAt = DateTime.UtcNow;
        return await _userRepository.UpdateAsync(user);
    }

    public async Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null || !PasswordHasher.VerifyPassword(oldPassword, user.Password))
        {
            return false;
        }

        user.Password = PasswordHasher.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        return await _userRepository.UpdateAsync(user) != null;
    }
}
