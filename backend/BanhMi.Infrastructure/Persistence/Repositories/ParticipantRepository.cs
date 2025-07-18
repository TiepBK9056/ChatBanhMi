using Microsoft.EntityFrameworkCore;
  using BanhMi.Application.Interfaces.Repositories;

  namespace BanhMi.Infrastructure.Persistence.Repositories
  {
      public class ParticipantRepository : IParticipantRepository
      {
          private readonly AppDbContext _dbContext;

          public ParticipantRepository(AppDbContext dbContext)
          {
              _dbContext = dbContext;
          }

          public async Task<List<int>> GetParticipantIdsByConversationIdAsync(int conversationId)
          {
              return await _dbContext.Participants
                  .Where(p => p.ConversationId == conversationId)
                  .Select(p => p.UserId)
                  .ToListAsync();
          }
      }
  }