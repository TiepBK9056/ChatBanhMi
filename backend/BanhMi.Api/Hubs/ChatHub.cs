using BanhMi.Application.Commands.Messages;
using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Interfaces.Repositories;
using Ecommerce.Application.Interfaces.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace BanhMi.Api.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IMediator _mediator;
        private readonly IConversationRepository _conversationRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(
            IMediator mediator,
            IConversationRepository conversationRepository,
            ICurrentUserService currentUserService,
            ILogger<ChatHub> logger)
        {
            _mediator = mediator;
            _conversationRepository = conversationRepository;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        
        public async Task JoinConversation(int conversationId)
        {
            var userId = _currentUserService.GetUserId();
            _logger.LogInformation("JoinConversation invoked. ConnectionId: {ConnectionId}, UserId: {UserId}, ConversationId: {ConversationId}", 
                Context.ConnectionId, userId, conversationId);

            if (!userId.HasValue)
            {
                _logger.LogWarning("JoinConversation failed: User not authenticated. ConnectionId: {ConnectionId}", Context.ConnectionId);
                throw new HubException("User is not authenticated.");
            }

            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null || !conversation.Participants.Any(p => p.UserId == userId.Value))
            {
                _logger.LogWarning("JoinConversation failed: User {UserId} is not a participant of conversation {ConversationId}", userId, conversationId);
                throw new HubException("User is not a participant of this conversation.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
            _logger.LogInformation("User {UserId} successfully joined conversation {ConversationId}", userId, conversationId);
        }

        
        public async Task LeaveConversation(int conversationId)
        {
            _logger.LogInformation("LeaveConversation invoked. ConnectionId: {ConnectionId}, ConversationId: {ConversationId}", 
                Context.ConnectionId, conversationId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());
            _logger.LogInformation("User left conversation {ConversationId}. ConnectionId: {ConnectionId}", conversationId, Context.ConnectionId);
        }

        
        public async Task SendMessage(int conversationId, string content)
        {
            var userId = _currentUserService.GetUserId();
            _logger.LogInformation("SendMessage invoked. ConnectionId: {ConnectionId}, UserId: {UserId}, ConversationId: {ConversationId}, Content: {Content}", 
                Context.ConnectionId, userId, conversationId, content);

            if (!userId.HasValue)
            {
                _logger.LogWarning("SendMessage failed: User not authenticated. ConnectionId: {ConnectionId}", Context.ConnectionId);
                throw new HubException("User is not authenticated.");
            }

            var command = new CreateMessageCommand
            {
                ConversationId = conversationId,
                Content = content,
                SenderId = userId.Value
            };
            var newMessage = await _mediator.Send(command);

            await Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", newMessage);
            _logger.LogInformation("Message sent in conversation {ConversationId} by user {UserId}", conversationId, userId);
        }

        
        public async Task MarkMessageAsRead(int conversationId, int messageId)
        {
            var userId = _currentUserService.GetUserId();
            _logger.LogInformation("MarkMessageAsRead invoked. ConnectionId: {ConnectionId}, UserId: {UserId}, ConversationId: {ConversationId}, MessageId: {MessageId}", 
                Context.ConnectionId, userId, conversationId, messageId);

            if (!userId.HasValue)
            {
                _logger.LogWarning("MarkMessageAsRead failed: User not authenticated. ConnectionId: {ConnectionId}", Context.ConnectionId);
                throw new HubException("User is not authenticated.");
            }

            var command = new MarkMessageAsReadCommand { MessageId = messageId };
            await _mediator.Send(command);

            await Clients.Group(conversationId.ToString()).SendAsync("MessageRead", messageId);
            _logger.LogInformation("Message {MessageId} marked as read in conversation {ConversationId} by user {UserId}", messageId, conversationId, userId);
        }

        
        public async Task Typing(int conversationId, bool isTyping)
        {
            var userId = _currentUserService.GetUserId();
            _logger.LogInformation("Typing invoked. ConnectionId: {ConnectionId}, UserId: {UserId}, ConversationId: {ConversationId}, IsTyping: {IsTyping}", 
                Context.ConnectionId, userId, conversationId, isTyping);

            if (!userId.HasValue)
            {
                _logger.LogWarning("Typing failed: User not authenticated. ConnectionId: {ConnectionId}", Context.ConnectionId);
                throw new HubException("User is not authenticated.");
            }

            await Clients.OthersInGroup(conversationId.ToString()).SendAsync("TypingIndicator", userId.Value, isTyping);
            _logger.LogInformation("User {UserId} typing status: {IsTyping} in conversation {ConversationId}", userId, isTyping, conversationId);
        }

        
        public override async Task OnConnectedAsync()
        {
            var token = Context.GetHttpContext()?.Request.Headers["Authorization"].ToString();
            var claims = Context.GetHttpContext()?.User?.Claims
                ?.Select(c => $"{c.Type}: {c.Value}") ?? new List<string>();
            _logger.LogInformation("Client connected. ConnectionId: {ConnectionId}, Token: {Token}, Claims: {Claims}", 
                Context.ConnectionId, token, string.Join(", ", claims));
            await base.OnConnectedAsync();
        }

        
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation("Client disconnected. ConnectionId: {ConnectionId}, Error: {Error}", 
                Context.ConnectionId, exception?.Message);
            await base.OnDisconnectedAsync(exception);
        }
    }
}