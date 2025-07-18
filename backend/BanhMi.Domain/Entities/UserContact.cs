namespace BanhMi.Domain.Entities;
public class UserContact
{
    public int ContactId { get; set; }
    public int UserId { get; set; }
    public int FriendId { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
    public bool IsBlocked { get; set; }

    // Navigation properties
    public User User { get; set; } = new User();
    public User Friend { get; set; } = new User();
}