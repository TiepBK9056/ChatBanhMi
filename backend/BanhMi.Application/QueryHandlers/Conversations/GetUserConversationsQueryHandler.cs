using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Application.Queries;
using MediatR;


namespace BanhMi.Application.QueryHandlers.Conversations
{
    public class GetUserConversationsQueryHandler : IRequestHandler<GetUserConversationsQuery, List<ConversationDto>>
    {
        private readonly IConversationRepository _conversationRepository;

        public GetUserConversationsQueryHandler(IConversationRepository conversationRepository)
        {
            _conversationRepository = conversationRepository;
        }

        public async Task<List<ConversationDto>> Handle(GetUserConversationsQuery request, CancellationToken cancellationToken)
        {
            var conversations = await _conversationRepository.GetConversationsByUserIdAsync(request.UserId);

            return conversations.Select(c => new ConversationDto
            {
                ConversationId = c.ConversationId,
                Name = c.IsGroup ? c.ConversationName :
                       c.Participants.FirstOrDefault(p => p.UserId != request.UserId)?.User.FirstName + " " +
                       c.Participants.FirstOrDefault(p => p.UserId != request.UserId)?.User.LastName ?? "Unknown",
                IsGroup = c.IsGroup,
                Preview = c.Messages.Any() ? c.Messages.OrderByDescending(m => m.CreatedAt).First().Content : string.Empty,
                Time = c.Messages.Any() ? c.Messages.OrderByDescending(m => m.CreatedAt).First().CreatedAt : c.CreatedAt,
                UnreadCount = c.Messages.Count(m => !m.IsRead && m.SenderId != request.UserId),
                AvatarUrl = c.IsGroup ? c.avartarUrl :
                            c.Participants.FirstOrDefault(p => p.UserId != request.UserId)?.User.AvatarUrl
            }).ToList();
        }
    }
}