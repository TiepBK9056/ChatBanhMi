using MediatR;
using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Application.Queries.Messages;


namespace BanhMi.Application.QueryHandlers.Messages
{
    public class GetMessagesByConversationQueryHandler : IRequestHandler<GetMessagesByConversationQuery, List<MessageDto>>
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IParticipantRepository _participantRepository;

        public GetMessagesByConversationQueryHandler(
            IMessageRepository messageRepository,
            IParticipantRepository participantRepository)
        {
            _messageRepository = messageRepository;
            _participantRepository = participantRepository;
        }

        public async Task<List<MessageDto>> Handle(GetMessagesByConversationQuery request, CancellationToken cancellationToken)
        {
            var isParticipant = await _participantRepository.IsUserInConversationAsync(request.UserId, request.ConversationId);
            if (!isParticipant)
            {
                throw new UnauthorizedAccessException("You are not a participant in this conversation.");
            }

            var messages = await _messageRepository.GetByConversationIdAsync(request.ConversationId);
            var result = messages.Select(m => new MessageDto
            {
                MessageId = m.MessageId,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                IsRead = m.IsRead
            }).ToList();

            return result;
        }
    }
}