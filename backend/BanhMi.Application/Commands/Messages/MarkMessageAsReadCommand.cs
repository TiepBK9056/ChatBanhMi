using MediatR;

namespace BanhMi.Application.Commands.Messages
{
    public class MarkMessageAsReadCommand : IRequest
    {
        public int MessageId { get; set; }
    }
}