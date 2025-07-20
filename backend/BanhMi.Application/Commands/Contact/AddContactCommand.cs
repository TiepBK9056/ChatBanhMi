using MediatR;

namespace BanhMi.Application.Commands.Contacts
{
    public class AddContactCommand : IRequest<string>
    {
        public int FriendId { get; set; }
    }
}