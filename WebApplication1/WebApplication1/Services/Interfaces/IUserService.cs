using WebApplication1.Model;

namespace WebApplication1.Services
{
    public interface IUserService
    {
        Task<User> CreateUserAsync(User user);
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> UpdateUserAsync(User user);
        Task<User?> DeleteUserAsync(int id);
        Task<User?> ExistingUserAsync(int id);
        Task<User?> ValidateUserAsync(string email, string password);
    }
}
