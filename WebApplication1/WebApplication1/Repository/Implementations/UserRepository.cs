using System.Net.WebSockets;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Repository
{
    public class UserRepository:IUserRepository
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<UserRepository> _logger;

        public UserRepository(AppDbContext dbContext, ILogger<UserRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<User> CreateASync(User user)
        {
            _logger.LogInformation("Creating user in database: {Email}", user.Email);
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("User created successfully with ID: {UserId}", user.Id);
            return user;
        }

        public async Task<User?> DeleteAsync(int id)
        {
            _logger.LogInformation("Deleting user from database with ID: {UserId}", id);
            var existingUser = await _dbContext.Users.FindAsync(id);
            if (existingUser == null)
            {
                _logger.LogWarning("User not found for deletion with ID: {UserId}", id);
                return null;
            }

            _dbContext.Users.Remove(existingUser);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("User deleted successfully: {Email}", existingUser.Email);
            return existingUser;
        }

        public async Task<User?> ExistingAsync(int id)
        {
            _logger.LogDebug("Checking user existence in database with ID: {UserId}", id);
            var user = await _dbContext.Users.FindAsync(id);
            _logger.LogDebug("User existence check result: {Exists}", user != null);
            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            _logger.LogDebug("Querying user by email: {Email}", email);
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            _logger.LogDebug("User query result: {Found}", user != null);
            return user;
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            _logger.LogDebug("Querying user by ID: {UserId}", userId);
            var user = await _dbContext.Users.FindAsync(userId);
            _logger.LogDebug("User query result: {Found}", user != null);
            return user;
        }

        public async Task<User?> UpdateAsync(User user)
        {
            _logger.LogInformation("Updating user in database: {Email}", user.Email);
            var existingUser = await _dbContext.Users.FindAsync(user.Id);
            if (existingUser == null)
            {
                _logger.LogWarning("User not found for update: {Email}", user.Email);
                return null;
            }

            existingUser.FullName = user.FullName;
            existingUser.Email = user.Email;

            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("User updated successfully: {Email}", existingUser.Email);
            return existingUser;
        }
    }
}
