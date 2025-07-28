using BanhMi.Application.Common.DTOs;
using MediatR;

namespace BanhMi.Application.Queries.Messages
{
    public class GetMessagesByConversationQuery : IRequest<List<MessageDto>>
    {
        public int ConversationId { get; set; }
        public int UserId { get; set; }
    }
}