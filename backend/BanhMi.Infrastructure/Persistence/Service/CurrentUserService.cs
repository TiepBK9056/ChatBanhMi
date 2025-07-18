using Ecommerce.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Ecommerce.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int? GetUserId()
        {
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt))
            {
                return null;
            }
            
            return userIdInt;
        }

        public string GetUsername()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);
        }
        public bool IsAuthenticated()
        {
            return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
        }
    }
} 