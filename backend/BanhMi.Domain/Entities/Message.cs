namespace BanhMi.Domain.Entities;
public class Message
{
    public int MessageId { get; set; }
    public int ConversationId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }

    // Navigation properties
    public Conversation Conversation { get; set; } = new Conversation();
    public User Sender { get; set; } = new User();
    public List<Attachment> Attachments { get; set; } = new List<Attachment>();
    public List<MessageStatus> MessageStatuses { get; set; } = new List<MessageStatus>();
}