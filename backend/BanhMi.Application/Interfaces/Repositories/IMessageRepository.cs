using BanhMi.Domain.Entities;

namespace BanhMi.Application.Interfaces.Repositories
{
    public interface IMessageRepository
    {
        Task<Message> AddAsync(Message message);
        Task<Message> GetByIdAsync(int messageId);
        Task UpdateAsync(Message message);
        Task<List<MessageStatus>> GetStatusesByMessageIdAsync(int messageId);
        Task AddStatusAsync(MessageStatus status);
        Task UpdateStatusAsync(MessageStatus status);
        Task<Message?> GetLastMessageByConversationIdAsync(int conversationId);
        Task<int> GetUnreadCountAsync(int conversationId, int userId);
        Task<List<Message>> GetByConversationIdAsync(int conversationId);
        Task AddStatusesAsync(List<MessageStatus> statuses);
    }
}