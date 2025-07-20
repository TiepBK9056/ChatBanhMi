using BanhMi.Domain.Entities;
using System.Threading.Tasks;

namespace BanhMi.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int userId);
        Task<List<User>> SearchByPhoneNumberAsync(string phoneNumber);
    }
}