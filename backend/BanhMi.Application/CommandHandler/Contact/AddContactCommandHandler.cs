using BanhMi.Application.Commands.Contacts;
using BanhMi.Application.Interfaces.Repositories;
using Ecommerce.Application.Interfaces.Services;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace BanhMi.Application.CommandHandlers.Contacts
{
    public class AddContactCommandHandler : IRequestHandler<AddContactCommand, string>
    {
        private readonly IUserContactRepository _userContactRepository;
        private readonly ICurrentUserService _currentUserService;

        public AddContactCommandHandler(
            IUserContactRepository userContactRepository,
            ICurrentUserService currentUserService)
        {
            _userContactRepository = userContactRepository;
            _currentUserService = currentUserService;
        }

        public async Task<string> Handle(AddContactCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (!userId.HasValue)
            {
                return "User not authenticated.";
            }

            if (userId.Value == request.FriendId)
            {
                return "Cannot add yourself as a friend.";
            }

            var isFriend = await _userContactRepository.IsFriendAsync(userId.Value, request.FriendId);
            if (isFriend)
            {
                return "User is already a friend.";
            }

            var hasPendingRequest = await _userContactRepository.HasPendingRequestAsync(userId.Value, request.FriendId);
            if (hasPendingRequest)
            {
                return "Friend request already exists.";
            }

            await _userContactRepository.AddContactAsync(userId.Value, request.FriendId);
            return "Friend request sent successfully.";
        }
    }
}