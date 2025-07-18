// BanhMi.Infrastructure/Persistence/Repositories/MessageRepository.cs
using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace BanhMi.Infrastructure.Persistence.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly AppDbContext _dbContext;

        public MessageRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Message?> GetLastMessageByConversationIdAsync(int conversationId)
        {
            return await _dbContext.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetUnreadCountAsync(int conversationId, int userId)
        {
            return await _dbContext.MessageStatuses
                .Join(
                    _dbContext.Messages,
                    ms => ms.MessageId,
                    m => m.MessageId,
                    (ms, m) => new { MessageStatus = ms, Message = m }
                )
                .Where(joined => joined.Message.ConversationId == conversationId 
                             && joined.MessageStatus.ReceiverId == userId 
                             && joined.MessageStatus.Status != "read")
                .CountAsync();
        }

        public async Task<Message> AddAsync(Message message)
        {
            _dbContext.Messages.Add(message);
            await _dbContext.SaveChangesAsync();
            return message;
        }

        public async Task<Message?> GetByIdAsync(int messageId)
        {
            return await _dbContext.Messages.FindAsync(messageId);
        }

        public async Task UpdateAsync(Message message)
        {
            _dbContext.Messages.Update(message);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<List<MessageStatus>> GetStatusesByMessageIdAsync(int messageId)
        {
            return await _dbContext.MessageStatuses
                .Where(ms => ms.MessageId == messageId)
                .ToListAsync();
        }

        public async Task AddStatusAsync(MessageStatus status)
        {
            _dbContext.MessageStatuses.Add(status);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateStatusAsync(MessageStatus status)
        {
            _dbContext.MessageStatuses.Update(status);
            await _dbContext.SaveChangesAsync();
        }
    }
}