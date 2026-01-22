using WebApplication1.Model;

namespace WebApplication1.Repository
{
    public interface IUserRepository
    {
        Task<User> CreateASync(User user);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByIdAsync(int userId);
        Task<User?> UpdateAsync(User user);
        Task<User?> DeleteAsync(int id);
        Task<User?> ExistingAsync(int id);
    }
}
