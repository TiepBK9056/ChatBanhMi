namespace BanhMi.Domain.Entities;
public class MessageStatus
{
    public int StatusId { get; set; }
    public int MessageId { get; set; }
    public int ReceiverId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Message Message { get; set; }
    public User Receiver { get; set; } 
}