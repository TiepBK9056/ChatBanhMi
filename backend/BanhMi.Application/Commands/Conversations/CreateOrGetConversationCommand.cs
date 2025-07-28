using MediatR;

namespace BanhMi.Application.Commands.Conversations
{
    public class CreateOrGetConversationCommand : IRequest<int>
    {
        public int UserId { get; set; } // ID của người dùng hiện tại
        public int FriendId { get; set; } // ID của người được chọn để chat
    }
}