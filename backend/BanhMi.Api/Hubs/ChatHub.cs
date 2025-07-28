using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;


namespace BanhMi.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IParticipantRepository _participantRepository;
        private readonly IConversationRepository _conversationRepository;
        private readonly IConnectionMultiplexer _redis;

        public ChatHub(
            IMessageRepository messageRepository,
            IParticipantRepository participantRepository,
            IConversationRepository conversationRepository,
            IConnectionMultiplexer redis)
        {
            _messageRepository = messageRepository;
            _participantRepository = participantRepository;
            _conversationRepository = conversationRepository;
            _redis = redis;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var parsedUserId))
            {
                throw new HubException("Invalid user ID in token");
            }

            var db = _redis.GetDatabase();
            await db.StringSetAsync($"user:{userId}", Context.ConnectionId);
            await Clients.All.SendAsync("UserStatus", userId, "online");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                var db = _redis.GetDatabase();
                await db.KeyDeleteAsync($"user:{userId}");
                await Clients.All.SendAsync("UserStatus", userId, "offline");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinConversation(string conversationId)
        {
            try
            {
                if (!int.TryParse(conversationId, out var convId))
                {
                    throw new HubException("Invalid conversation ID");
                }

                var userId = Context.UserIdentifier;
                if (!int.TryParse(userId, out var parsedUserId))
                {
                    throw new HubException("Invalid user ID");
                }

                var isParticipant = await _participantRepository.IsParticipantAsync(convId, parsedUserId);
                if (!isParticipant)
                {
                    throw new HubException("User is not a participant in this conversation");
                }

                await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
                await Clients.Caller.SendAsync("JoinedConversation", conversationId);
            }
            catch (Exception ex)
            {
                throw new HubException($"Failed to join conversation: {ex.Message}");
            }
        }

        public async Task LeaveConversation(string conversationId)
        {
            try
            {
                if (!int.TryParse(conversationId, out var convId))
                {
                    throw new HubException("Invalid conversation ID");
                }

                await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
                await Clients.Caller.SendAsync("LeftConversation", conversationId);
            }
            catch (Exception ex)
            {
                throw new HubException($"Failed to leave conversation: {ex.Message}");
            }
        }

        public async Task SendMessage(string conversationId, string content)
        {
            try
            {
                if (!int.TryParse(conversationId, out var convId) || !int.TryParse(Context.UserIdentifier, out var userId))
                {
                    throw new HubException("Invalid conversation ID or user ID");
                }

                var isParticipant = await _participantRepository.IsParticipantAsync(convId, userId);
                if (!isParticipant)
                {
                    throw new HubException("User is not a participant in this conversation");
                }

                if (string.IsNullOrWhiteSpace(content))
                {
                    throw new HubException("Message content cannot be empty");
                }

                var message = new Message
                {
                    ConversationId = convId,
                    SenderId = userId,
                    Content = content,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                await _messageRepository.AddAsync(message);

                // Gửi tin nhắn tới nhóm
                await Clients.Group(conversationId).SendAsync("ReceiveMessage", new
                {
                    messageId = message.MessageId,
                    conversationId = message.ConversationId,
                    senderId = message.SenderId,
                    content = message.Content,
                    createdAt = message.CreatedAt.ToString("o"),
                    isRead = message.IsRead
                });

                // Tạo MessageStatus cho các người nhận
                var participantIds = await _participantRepository.GetParticipantIdsByConversationIdAsync(convId);
                var statuses = participantIds
                    .Where(id => id != userId)
                    .Select(receiverId => new MessageStatus
                    {
                        MessageId = message.MessageId,
                        ReceiverId = receiverId,
                        Status = "sent",
                        UpdatedAt = DateTime.UtcNow
                    })
                    .ToList();

                if (statuses.Any())
                {
                    await _messageRepository.AddStatusesAsync(statuses);
                }
            }
            catch (Exception ex)
            {
                throw new HubException($"Failed to send message: {ex.Message}");
            }
        }

        public async Task ReadMessage(string messageId)
        {
            try
            {
                if (!int.TryParse(messageId, out var msgId) || !int.TryParse(Context.UserIdentifier, out var userId))
                {
                    throw new HubException("Invalid message ID or user ID");
                }

                var messageStatuses = await _messageRepository.GetStatusesByMessageIdAsync(msgId);
                var messageStatus = messageStatuses.FirstOrDefault(ms => ms.ReceiverId == userId);
                if (messageStatus == null)
                {
                    throw new HubException("Message status not found for this user");
                }

                messageStatus.Status = "read";
                messageStatus.UpdatedAt = DateTime.UtcNow;
                await _messageRepository.UpdateStatusAsync(messageStatus);

                var message = await _messageRepository.GetByIdAsync(msgId);
                if (message != null)
                {
                    message.IsRead = messageStatuses.All(ms => ms.Status == "read" || ms.ReceiverId == userId);
                    await _messageRepository.UpdateAsync(message);

                    await Clients.Group(message.ConversationId.ToString()).SendAsync("MessageRead", new
                    {
                        messageId = message.MessageId,
                        userId,
                        conversationId = message.ConversationId
                    });
                }
            }
            catch (Exception ex)
            {
                throw new HubException($"Failed to read message: {ex.Message}");
            }
        }

        public async Task Typing(string conversationId)
        {
            try
            {
                if (!int.TryParse(conversationId, out var convId) || !int.TryParse(Context.UserIdentifier, out var userId))
                {
                    throw new HubException("Invalid conversation ID or user ID");
                }

                var isParticipant = await _participantRepository.IsParticipantAsync(convId, userId);
                if (!isParticipant)
                {
                    throw new HubException("User is not a participant in this conversation");
                }

                await Clients.GroupExcept(conversationId, Context.ConnectionId).SendAsync("ReceiveTyping", userId);
            }
            catch (Exception ex)
            {
                throw new HubException($"Failed to send typing notification: {ex.Message}");
            }
        }

        public async Task CreateConversation(int conversationId, string name, bool isGroup, string createdAt, string avatarUrl)
        {
            try
            {
                var userId = Context.UserIdentifier;
                if (!int.TryParse(userId, out var parsedUserId))
                {
                    throw new HubException("Invalid user ID");
                }

                var isParticipant = await _participantRepository.IsParticipantAsync(conversationId, parsedUserId);
                if (!isParticipant)
                {
                    throw new HubException("User is not a participant in this conversation");
                }

                var conversation = await _conversationRepository.GetByUserIdAsync(conversationId);
                if (conversation == null)
                {
                    throw new HubException("Conversation not found");
                }

                var participantIds = await _participantRepository.GetParticipantIdsByConversationIdAsync(conversationId);
                await Clients.Users(participantIds.Select(id => id.ToString()).ToList()).SendAsync("ReceiveConversationUpdate", new
                {
                    conversationId,
                    name = isGroup ? name : (await _participantRepository.GetParticipantNameAsync(conversationId, parsedUserId)),
                    isGroup,
                    preview = "",
                    time = createdAt,
                    unreadCount = 0,
                    avatarUrl = avatarUrl ?? "https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg"
                });
            }
            catch (Exception ex)
            {
                throw new HubException($"Failed to create conversation: {ex.Message}");
            }
        }
    }
}
