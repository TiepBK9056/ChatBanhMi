using BanhMi.Application.Interfaces.Repositories;
using BanhMi.Domain.Entities;
using BanhMi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BanhMi.Infrastructure.Repositories
{
    public class UserContactRepository : IUserContactRepository
    {
        private readonly AppDbContext _context; // Thay YourDbContext bằng DbContext thực tế

        public UserContactRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsFriendAsync(int userId, int friendId)
        {
            return await _context.UserContacts
                .AnyAsync(uc => 
                    (uc.UserId == userId && uc.FriendId == friendId || 
                     uc.UserId == friendId && uc.FriendId == userId) && 
                    uc.Status == "accepted");
        }
        public async Task<bool> HasPendingRequestAsync(int userId, int friendId)
        {
            return await _context.UserContacts
                .AnyAsync(uc => 
                    (uc.UserId == userId && uc.FriendId == friendId || 
                     uc.UserId == friendId && uc.FriendId == userId) && 
                    uc.Status == "pending");
        }

        public async Task AddContactAsync(int userId, int friendId, string status = "pending")
        {
            var contact = new UserContact
            {
                UserId = userId,
                FriendId = friendId,
                Status = status,
                CreatedAt = DateTime.UtcNow,
                IsBlocked = false
            };
            _context.UserContacts.Add(contact);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> AcceptContactAsync(int userId, int friendId)
        {
            // Tìm yêu cầu kết bạn từ friendId tới userId
            var contact = await _context.UserContacts
                .FirstOrDefaultAsync(uc => uc.UserId == friendId && uc.FriendId == userId && uc.Status == "pending");

            if (contact == null)
            {
                return false; // Không tìm thấy yêu cầu kết bạn
            }

            // Cập nhật trạng thái thành accepted
            contact.Status = "accepted";
            // Thêm bản ghi ngược lại
            var reverseContact = new UserContact
            {
                UserId = userId,
                FriendId = friendId,
                Status = "accepted",
                CreatedAt = DateTime.UtcNow,
                IsBlocked = false
            };
            _context.UserContacts.Add(reverseContact);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}