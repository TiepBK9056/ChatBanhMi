using MediatR;

namespace BanhMi.Application.Commands.Contacts
{
    public class AcceptContactCommand : IRequest<string>
    {
        public int FriendId { get; set; }
    }
}