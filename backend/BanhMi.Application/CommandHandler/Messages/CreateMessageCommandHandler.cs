using BanhMi.Application.Commands.Messages;
using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;
using Ecommerce.Application.Interfaces.Services;
using MediatR;

namespace BanhMi.Application.CommandHandler.Messages
{
    public class CreateMessageCommandHandler : IRequestHandler<CreateMessageCommand, MessageDto>
    {
        private readonly IMessageRepository _messageRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateMessageCommandHandler(IMessageRepository messageRepository, ICurrentUserService currentUserService)
        {
            _messageRepository = messageRepository;
            _currentUserService = currentUserService;
        }

        public async Task<MessageDto> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (!userId.HasValue || userId.Value != request.SenderId)
            {
                throw new UnauthorizedAccessException("User is not authorized to send this message.");
            }

            var message = new Message
            {
                ConversationId = request.ConversationId,
                SenderId = request.SenderId,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            var savedMessage = await _messageRepository.AddAsync(message);

            return new MessageDto
            {
                MessageId = savedMessage.MessageId,
                ConversationId = savedMessage.ConversationId,
                SenderId = savedMessage.SenderId,
                Content = savedMessage.Content,
                CreatedAt = savedMessage.CreatedAt,
                IsRead = savedMessage.IsRead
            };
        }
    }
}