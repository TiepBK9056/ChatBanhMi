using Microsoft.EntityFrameworkCore;
using BanhMi.Domain.Entities;
using BanhMi.Application.Interfaces.Repositories;

namespace BanhMi.Infrastructure.Persistence.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly AppDbContext _dbContext;

        public MessageRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Message> AddAsync(Message message)
        {
            _dbContext.Messages.Add(message);
            await _dbContext.SaveChangesAsync();
            return message;
        }

        public async Task<Message> GetByIdAsync(int messageId)
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