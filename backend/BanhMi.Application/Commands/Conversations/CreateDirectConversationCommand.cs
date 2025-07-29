using MediatR;

namespace BanhMi.Application.Commands.Conversations
{
    public class CreateDirectConversationCommand : IRequest<int>
    {
        public int TargetUserId { get; set; }
    }
}