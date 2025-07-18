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
    }
}