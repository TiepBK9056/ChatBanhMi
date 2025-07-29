
using BanhMi.Application.Commands.Messages;
using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Interfaces.Repositories;
using Ecommerce.Application.Interfaces.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BanhMi.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IMediator _mediator;
        private readonly IConversationRepository _conversationRepository;
        private readonly ICurrentUserService _currentUserService;

        public ChatHub(IMediator mediator, IConversationRepository conversationRepository, ICurrentUserService currentUserService)
        {
            _mediator = mediator;
            _conversationRepository = conversationRepository;
            _currentUserService = currentUserService;
        }

        public async Task JoinConversation(int conversationId)
        {
            var userId = _currentUserService.GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User is not authenticated.");
            }

            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null || !conversation.Participants.Any(p => p.UserId == userId.Value))
            {
                throw new HubException("User is not a participant of this conversation.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
        }

        public async Task LeaveConversation(int conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());
        }

        public async Task SendMessage(int conversationId, string content)
        {
            var userId = _currentUserService.GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User is not authenticated.");
            }

            var command = new CreateMessageCommand
            {
                ConversationId = conversationId,
                Content = content,
                SenderId = userId.Value
            };
            var newMessage = await _mediator.Send(command);

            // Broadcast tin nhắn với CreatedAt là DateTime
            await Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", new MessageDto
            {
                MessageId = newMessage.MessageId,
                ConversationId = newMessage.ConversationId,
                SenderId = newMessage.SenderId,
                Content = newMessage.Content,
                CreatedAt = newMessage.CreatedAt, // Giữ DateTime
                IsRead = newMessage.IsRead
            });
        }

        public async Task Typing(int conversationId, bool isTyping)
        {
            var userId = _currentUserService.GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User is not authenticated.");
            }

            await Clients.OthersInGroup(conversationId.ToString()).SendAsync("TypingIndicator", userId.Value, isTyping);
        }

        public async Task MarkMessageAsRead(int conversationId, int messageId)
        {
            var userId = _currentUserService.GetUserId();
            if (!userId.HasValue)
            {
                throw new HubException("User is not authenticated.");
            }

            var command = new MarkMessageAsReadCommand { MessageId = messageId };
            await _mediator.Send(command);

            await Clients.Group(conversationId.ToString()).SendAsync("MessageRead", messageId);
        }
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}