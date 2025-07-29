using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BanhMi.Infrastructure.Persistence.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly AppDbContext _dbContext;

        public ConversationRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Conversation>> GetByUserIdAsync(int userId)
        {
            return await _dbContext.Participants
                .Where(p => p.UserId == userId)
                .Join(
                    _dbContext.Conversations,
                    p => p.ConversationId,
                    c => c.ConversationId,
                    (p, c) => c)
                .ToListAsync();
        }

        public async Task<List<Conversation>> GetConversationsByUserIdAsync(int userId)
        {
            return await _dbContext.Conversations
                .Include(c => c.Participants)
                .ThenInclude(p => p.User)
                .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                .Where(c => c.Participants.Any(p => p.UserId == userId))
                .OrderByDescending(c => c.Messages.Any() ? c.Messages.Max(m => m.CreatedAt) : c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Conversation?> GetDirectConversationBetween(int userId1, int userId2)
        {
            var conversationIds = await _dbContext.Participants
                .Where(p => p.UserId == userId1 || p.UserId == userId2)
                .GroupBy(p => p.ConversationId)
                .Where(g => g.Count() == 2) // Exactly two participants
                .Select(g => g.Key)
                .ToListAsync();

            return await _dbContext.Conversations
                .Where(c => conversationIds.Contains(c.ConversationId) && !c.IsGroup)
                .Include(c => c.Participants)
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(Conversation conversation)
        {
            _dbContext.Conversations.Add(conversation);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<Conversation?> GetByIdAsync(int conversationId)
        {
            return await _dbContext.Conversations
                .Include(c => c.Participants) // Bao gồm participants để kiểm tra quyền truy cập
                .FirstOrDefaultAsync(c => c.ConversationId == conversationId);
        }
    }
}