using BanhMi.Application.Common.DTOs;
using MediatR;

namespace BanhMi.Application.Commands.Messages
{
    public class CreateMessageCommand : IRequest<MessageDto>
    {
        public int ConversationId { get; set; }
        public string Content { get; set; } = string.Empty;
        public int SenderId { get; set; }
    }
}