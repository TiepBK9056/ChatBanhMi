using BanhMi.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BanhMi.Application.Interfaces.Repositories
{
    public interface IConversationRepository
    {
        Task<List<Conversation>> GetByUserIdAsync(int userId);
        Task<List<Conversation>> GetConversationsByUserIdAsync(int userId);
        Task<Conversation?> GetDirectConversationBetween(int userId1, int userId2);
        Task AddAsync(Conversation conversation);
        Task<Conversation?> GetByIdAsync(int conversationId);
    }
}