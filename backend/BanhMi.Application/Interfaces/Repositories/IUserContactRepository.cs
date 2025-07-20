namespace BanhMi.Application.Interfaces.Repositories
{
    public interface IUserContactRepository
    {
        Task<bool> IsFriendAsync(int userId, int friendId);
        Task<bool> HasPendingRequestAsync(int userId, int friendId);
        Task AddContactAsync(int userId, int friendId, string status = "pending");
        Task<bool> AcceptContactAsync(int userId, int friendId);
    }
}