using BanhMi.Application.Commands.Conversations;
using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;
using Ecommerce.Application.Interfaces.Services;
using MediatR;

namespace BanhMi.Application.CommandHandler.Conversations
{
    public class CreateDirectConversationCommandHandler : IRequestHandler<CreateDirectConversationCommand, int>
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly IParticipantRepository _participantRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateDirectConversationCommandHandler(
            IConversationRepository conversationRepository,
            IParticipantRepository participantRepository,
            ICurrentUserService currentUserService)
        {
            _conversationRepository = conversationRepository;
            _participantRepository = participantRepository;
            _currentUserService = currentUserService;
        }

        public async Task<int> Handle(CreateDirectConversationCommand request, CancellationToken cancellationToken)
        {
            int? currentUserId = _currentUserService.GetUserId();
            if (!currentUserId.HasValue)
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            int targetUserId = request.TargetUserId;

            if (currentUserId == targetUserId)
            {
                throw new InvalidOperationException("Cannot create a conversation with yourself.");
            }

            // Check for existing direct conversation
            var existingConversation = await _conversationRepository.GetDirectConversationBetween(currentUserId.Value, targetUserId);
            if (existingConversation != null)
            {
                return existingConversation.ConversationId;
            }

            // Create new conversation
            var newConversation = new Conversation
            {
                ConversationName = string.Empty, // For direct chats, name can be empty; UI will derive from participant
                IsGroup = false,
                CreatedAt = DateTime.UtcNow,
                avartarUrl = string.Empty // Or derive from target user if needed
            };

            await _conversationRepository.AddAsync(newConversation);

            // Add participants
            await _participantRepository.AddAsync(new Participant
            {
                ConversationId = newConversation.ConversationId,
                UserId = currentUserId.Value,
                JoinedAt = DateTime.UtcNow
            });

            await _participantRepository.AddAsync(new Participant
            {
                ConversationId = newConversation.ConversationId,
                UserId = targetUserId,
                JoinedAt = DateTime.UtcNow
            });

            return newConversation.ConversationId;
        }
    }
}