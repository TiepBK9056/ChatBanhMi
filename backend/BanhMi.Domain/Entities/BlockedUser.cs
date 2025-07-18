namespace BanhMi.Domain.Entities;
public class BlockedUser
{
    public int BlockId { get; set; }
    public int UserId { get; set; }
    public int BlockedUserId { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = new User();
    public User BlockUser { get; set; } = new User();
}