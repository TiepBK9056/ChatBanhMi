using Microsoft.EntityFrameworkCore;
  using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Repositories
  {
    public class ParticipantRepository : IParticipantRepository
    {
        private readonly AppDbContext _dbContext;

        public ParticipantRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task AddAsync(Participant participant)
        {
            await _dbContext.Participants.AddAsync(participant);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<bool> IsParticipantAsync(int conversationId, int userId)
        {
            return await _dbContext.Participants
                .AnyAsync(p => p.ConversationId == conversationId && p.UserId == userId);
        }

        public async Task<string> GetParticipantNameAsync(int conversationId, int currentUserId)
        {
            var participant = await _dbContext.Participants
                .Include(p => p.User)
                .Where(p => p.ConversationId == conversationId && p.UserId != currentUserId)
                .FirstOrDefaultAsync();
            return participant != null ? $"{participant.User.FirstName} {participant.User.LastName}" : "Unknown";
        }

        public async Task<List<int>> GetParticipantIdsByConversationIdAsync(int conversationId)
        {
            return await _dbContext.Participants
                .Where(p => p.ConversationId == conversationId)
                .Select(p => p.UserId)
                .ToListAsync();
        }
          
        public async Task<bool> IsUserInConversationAsync(int userId, int conversationId)
        {
            return await _dbContext.Participants
                .AnyAsync(p => p.UserId == userId && p.ConversationId == conversationId);
        }
      }
  }