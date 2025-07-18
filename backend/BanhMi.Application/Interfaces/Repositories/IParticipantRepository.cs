
namespace BanhMi.Application.Interfaces.Repositories
{
    public interface IParticipantRepository
    {
        Task<List<int>> GetParticipantIdsByConversationIdAsync(int conversationId);
    }
}