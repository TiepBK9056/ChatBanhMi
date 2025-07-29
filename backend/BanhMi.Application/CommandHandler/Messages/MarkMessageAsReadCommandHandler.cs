using BanhMi.Application.Commands.Messages;
using BanhMi.Application.Interfaces.Repositories;
using Ecommerce.Application.Interfaces.Services;
using MediatR;


namespace BanhMi.Application.CommandHandler.Messages
{
    public class MarkMessageAsReadCommandHandler : IRequestHandler<MarkMessageAsReadCommand>
    {
        private readonly IMessageRepository _messageRepository;
        private readonly ICurrentUserService _currentUserService;

        public MarkMessageAsReadCommandHandler(IMessageRepository messageRepository, ICurrentUserService currentUserService)
        {
            _messageRepository = messageRepository;
            _currentUserService = currentUserService;
        }

        public async Task Handle(MarkMessageAsReadCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (!userId.HasValue)
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var status = await _messageRepository.GetStatusesByMessageIdAsync(request.MessageId);
            var userStatus = status.FirstOrDefault(s => s.ReceiverId == userId.Value);
            if (userStatus != null)
            {
                userStatus.Status = "read";
                userStatus.UpdatedAt = DateTime.UtcNow;
                await _messageRepository.UpdateStatusAsync(userStatus);
            }

            var message = await _messageRepository.GetByIdAsync(request.MessageId);
            if (message != null)
            {
                message.IsRead = true;
                await _messageRepository.UpdateAsync(message);
            }
        }
    }
}