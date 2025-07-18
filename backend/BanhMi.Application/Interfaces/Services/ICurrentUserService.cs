namespace Ecommerce.Application.Interfaces.Services
{
    public interface ICurrentUserService
    {
        /// <summary>
        /// Gets the ID of the currently authenticated user, or null if not authenticated
        /// </summary>
        /// <returns>The user ID or null if not authenticated</returns>
        int? GetUserId();
        
        /// <summary>
        /// Gets the username of the currently authenticated user, or null if not authenticated
        /// </summary>
        /// <returns>The username or null if not authenticated</returns>
        string GetUsername();

        bool IsAuthenticated();
    }
} 