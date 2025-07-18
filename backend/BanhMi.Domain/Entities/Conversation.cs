namespace BanhMi.Domain.Entities;

public class Conversation
{
    public int ConversationId { get; set; }
    public string ConversationName { get; set; } = string.Empty;
    public bool IsGroup { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public List<Message> Messages { get; set; } = new List<Message>();
    public List<Participant> Participants { get; set; } = new List<Participant>();
    public List<GroupSetting> GroupSettings { get; set; } = new List<GroupSetting>();
}