using BanhMi.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BanhMi.Application.Interfaces.Repositories
{
    public interface IConversationRepository
    {
        Task<List<Conversation>> GetByUserIdAsync(int userId);
        Task<List<Conversation>> GetConversationsByUserIdAsync(int userId);
    }
}