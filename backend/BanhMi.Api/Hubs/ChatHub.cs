using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;
using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;

namespace BanhMi.Api.Hubs
{

  public class ChatHub : Hub
  {
      private readonly IMessageRepository _messageRepository;
      private readonly IParticipantRepository _participantRepository;
      private readonly IConnectionMultiplexer _redis;

      public ChatHub(
          IMessageRepository messageRepository,
          IParticipantRepository participantRepository,
          IConnectionMultiplexer redis)
      {
          _messageRepository = messageRepository;
          _participantRepository = participantRepository;
          _redis = redis;
      }

      public override async Task OnConnectedAsync()
      {
          var userId = Context.UserIdentifier;
          var db = _redis.GetDatabase();
          await db.StringSetAsync($"user:{userId}", Context.ConnectionId);
          await Clients.All.SendAsync("UserStatus", userId, "online");
          await base.OnConnectedAsync();
      }

      public async Task JoinConversation(string conversationId)
      {
          await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
      }

      public async Task SendMessage(string conversationId, string content)
      {
          var userId = Context.UserIdentifier;
          var message = new Message
          {
              ConversationId = int.Parse(conversationId),
              SenderId = int.Parse(userId),
              Content = content,
              CreatedAt = DateTime.UtcNow,
              IsRead = false
          };
          await _messageRepository.AddAsync(message);

          await Clients.Group(conversationId).SendAsync("ReceiveMessage", message.MessageId, userId, content, message.CreatedAt);

          var participantIds = await _participantRepository.GetParticipantIdsByConversationIdAsync(int.Parse(conversationId));
          foreach (var receiverId in participantIds.Where(id => id != int.Parse(userId)))
          {
              var status = new MessageStatus
              {
                  MessageId = message.MessageId,
                  ReceiverId = receiverId,
                  Status = "sent",
                  UpdatedAt = DateTime.UtcNow
              };
              await _messageRepository.AddStatusAsync(status);
          }
      }

      public async Task ReadMessage(string messageId)
      {
          var userId = Context.UserIdentifier;
          var messageStatuses = await _messageRepository.GetStatusesByMessageIdAsync(int.Parse(messageId));
          var messageStatus = messageStatuses.FirstOrDefault(ms => ms.ReceiverId == int.Parse(userId));
          if (messageStatus != null)
          {
              messageStatus.Status = "read";
              messageStatus.UpdatedAt = DateTime.UtcNow;
              await _messageRepository.UpdateStatusAsync(messageStatus);

              var message = await _messageRepository.GetByIdAsync(int.Parse(messageId));
              message.IsRead = true;
              await _messageRepository.UpdateAsync(message);

              await Clients.Group(message.ConversationId.ToString()).SendAsync("MessageRead", messageId, userId);
          }
      }

      public override async Task OnDisconnectedAsync(Exception exception)
      {
          var userId = Context.UserIdentifier;
          var db = _redis.GetDatabase();
          await db.KeyDeleteAsync($"user:{userId}");
          await Clients.All.SendAsync("UserStatus", userId, "offline");
          await base.OnDisconnectedAsync(exception);
      }
  }
}