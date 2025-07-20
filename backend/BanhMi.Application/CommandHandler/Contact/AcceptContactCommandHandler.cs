using BanhMi.Application.Commands.Contacts;
using BanhMi.Application.Interfaces.Repositories;
using Ecommerce.Application.Interfaces.Services;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace BanhMi.Application.CommandHandlers.Contacts
{
    public class AcceptContactCommandHandler : IRequestHandler<AcceptContactCommand, string>
    {
        private readonly IUserContactRepository _userContactRepository;
        private readonly ICurrentUserService _currentUserService;

        public AcceptContactCommandHandler(
            IUserContactRepository userContactRepository,
            ICurrentUserService currentUserService)
        {
            _userContactRepository = userContactRepository;
            _currentUserService = currentUserService;
        }

        public async Task<string> Handle(AcceptContactCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (!userId.HasValue)
            {
                return "User not authenticated.";
            }

            var success = await _userContactRepository.AcceptContactAsync(userId.Value, request.FriendId);
            if (!success)
            {
                return "No pending friend request found.";
            }

            return "Friend request accepted successfully.";
        }
    }
}