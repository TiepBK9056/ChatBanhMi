using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BanhMi.Infrastructure.Persistence.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _dbContext;

        public UserRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            return await _dbContext.Users.FindAsync(userId);
        }
        public async Task<List<User>> SearchByPhoneNumberAsync(string phoneNumber)
        {
            return await _dbContext.Users
                .Where(u => u.PhoneNumber.Contains(phoneNumber))
                .ToListAsync();
        }
    }
}