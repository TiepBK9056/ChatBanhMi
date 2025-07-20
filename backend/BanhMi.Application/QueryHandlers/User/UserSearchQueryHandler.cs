using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Common.Utilities;
using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Application.Queries.Users;
using Ecommerce.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BanhMi.Application.QueryHandlers.Users
{
    public class SearchUserQueryHandler : IRequestHandler<SearchUserQuery, List<UserSearchDto>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserContactRepository _userContactRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<SearchUserQueryHandler> _logger;

        public SearchUserQueryHandler(
            IUserRepository userRepository, 
            IUserContactRepository userContactRepository,
            ICurrentUserService currentUserService,
            ILogger<SearchUserQueryHandler> logger)
        {
            _userRepository = userRepository;
            _userContactRepository = userContactRepository;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<List<UserSearchDto>> Handle(SearchUserQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Lấy userId từ CurrentUserService
                var currentUserId = _currentUserService.GetUserId();
                if (!currentUserId.HasValue)
                {
                    _logger.LogWarning("Could not retrieve current user ID from token.");
                    return new List<UserSearchDto>();
                }

                var users = await _userRepository.SearchByPhoneNumberAsync(request.PhoneNumber);
                var result = new List<UserSearchDto>();

                foreach (var user in users)
                {
                    // Kiểm tra trạng thái mối quan hệ
                    string friendshipStatus = "none";
                    if (await _userContactRepository.IsFriendAsync(currentUserId.Value, user.Id))
                    {
                        friendshipStatus = "accepted";
                    }
                    else if (await _userContactRepository.HasPendingRequestAsync(currentUserId.Value, user.Id))
                    {
                        friendshipStatus = "pending";
                    }

                    result.Add(new UserSearchDto
                    {
                        Id = user.Id,
                        Name = $"{user.FirstName} {user.LastName}".Trim(),
                        Email = user.Email,
                        PhoneNumber = user.PhoneNumber,
                        AvatarUrl = user.AvatarUrl,
                        FriendshipStatus = friendshipStatus
                    });
                }

                _logger.LogInformation("Found {Count} users for phone number: {PhoneNumber}", result.Count, request.PhoneNumber);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching users for phone number: {PhoneNumber}", request.PhoneNumber);
                return new List<UserSearchDto>();
            }
        }
    }
}