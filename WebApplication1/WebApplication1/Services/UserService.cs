using WebApplication1.Model;
using WebApplication1.Repository;

namespace WebApplication1.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task<User> CreateUserAsync(User user)
        {
            return await _userRepository.CreateASync(user);
        }

        public async Task<User?> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteAsync(id);
        }

        public async  Task<User?> ExistingUserAsync(int id)
        {
            return await _userRepository.ExistingAsync(id);

        }

        public async  Task<User?> GetUserByEmailAsync(string email)
        {
           return await _userRepository.GetUserByEmailAsync(email);
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetUserByIdAsync(id);
        }

        public async Task<User?> UpdateUserAsync(User user)
        {
            return await _userRepository.UpdateAsync(user);
        }

        public async  Task<User?> ValidateUserAsync(string email, string password)
        {
            var user =await _userRepository.GetUserByEmailAsync(email);
            if (user == null) return null;

            if(user.Password!=password)return null;
            return user;
        }
    }
}
