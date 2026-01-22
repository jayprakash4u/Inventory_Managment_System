using System.Net.WebSockets;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Model;

namespace WebApplication1.Repository
{
    public class UserRepository:IUserRepository
    {
        private readonly AppDbContext _dbContext;
        public UserRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<User> CreateASync(User user)
        {
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();
            return user;
        }

        public async Task<User?> DeleteAsync(int id)
        {
            var existingUser= await _dbContext.Users.FindAsync(id);
            if (existingUser == null) return null;

            _dbContext.Users.Remove(existingUser);
            await _dbContext.SaveChangesAsync();
            return existingUser;
        }

        public async Task<User?> ExistingAsync(int id)
        {
            var user= await _dbContext.Users.FindAsync(id);
            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
           var user=await  _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user;
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            var user =await _dbContext.Users.FindAsync(userId);
            return user;
        }

        public async Task<User?> UpdateAsync(User user)
        {
            var existingUser = await _dbContext.Users.FindAsync(user.Id);
            if (existingUser == null) return null;

            existingUser.FullName = user.FullName;
            existingUser.Email = user.Email;

           await _dbContext.SaveChangesAsync();

            return existingUser;
        }
    }
}
