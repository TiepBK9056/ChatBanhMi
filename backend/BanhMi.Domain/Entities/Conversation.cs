namespace BanhMi.Domain.Entities;

public class Conversation
{
    public int ConversationId { get; set; }
    public string ConversationName { get; set; } = string.Empty;
    public bool IsGroup { get; set; }
    public DateTime CreatedAt { get; set; }
    public string avartarUrl { get; set; }

    // Navigation properties
    public List<Message> Messages { get; set; } 
    public List<Participant> Participants { get; set; }
    public List<GroupSetting> GroupSettings { get; set; }
}