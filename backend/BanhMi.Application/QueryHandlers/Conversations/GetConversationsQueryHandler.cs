using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Application.Queries.Conversations;
using Ecommerce.Application.Interfaces.Services;
using MediatR;


namespace BanhMi.Application.QueryHandlers.Conversations
{
    public class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, List<ConversationDto>>
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly IParticipantRepository _participantRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetConversationsQueryHandler(
            IConversationRepository conversationRepository,
            IParticipantRepository participantRepository,
            IMessageRepository messageRepository,
            IUserRepository userRepository,
            ICurrentUserService currentUserService)
        {
            _conversationRepository = conversationRepository;
            _participantRepository = participantRepository;
            _messageRepository = messageRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<List<ConversationDto>> Handle(GetConversationsQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId() ?? throw new UnauthorizedAccessException("User not authenticated");
            var conversations = await _conversationRepository.GetByUserIdAsync(userId);
            var result = new List<ConversationDto>();

            foreach (var conv in conversations)
            {
                var lastMessage = await _messageRepository.GetLastMessageByConversationIdAsync(conv.ConversationId);
                var unreadCount = await _messageRepository.GetUnreadCountAsync(conv.ConversationId, userId);

                string name;
                string? avatarUrl = null;
                if (conv.IsGroup)
                {
                    name = conv.ConversationName ?? "Nhóm không tên";
                }
                else
                {
                    var otherUserId = (await _participantRepository.GetParticipantIdsByConversationIdAsync(conv.ConversationId))
                        .FirstOrDefault(id => id != userId);
                    var otherUser = otherUserId != 0 ? await _userRepository.GetByIdAsync(otherUserId) : null;
                    name = otherUser != null ? $"{otherUser.FirstName} {otherUser.LastName}".Trim() : "Không xác định";
                    avatarUrl = otherUser?.AvatarUrl;
                }

                result.Add(new ConversationDto
                {
                    ConversationId = conv.ConversationId,
                    Name = name,
                    IsGroup = conv.IsGroup,
                    Preview = lastMessage?.Content ?? "Chưa có tin nhắn",
                    Time = lastMessage?.CreatedAt ?? conv.CreatedAt,
                    UnreadCount = unreadCount,
                    AvatarUrl = avatarUrl
                });
            }

            return result;
        }
    }
}