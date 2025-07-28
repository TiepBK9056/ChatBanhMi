
using BanhMi.Domain.Entities;

namespace BanhMi.Application.Interfaces.Repositories
{
    public interface IParticipantRepository
    {
        Task AddAsync(Participant participant);
        Task<List<int>> GetParticipantIdsByConversationIdAsync(int conversationId);
        Task<bool> IsUserInConversationAsync(int userId, int conversationId);
        Task<bool> IsParticipantAsync(int conversationId, int userId);
        Task<string> GetParticipantNameAsync(int conversationId, int currentUserId);
    }
}