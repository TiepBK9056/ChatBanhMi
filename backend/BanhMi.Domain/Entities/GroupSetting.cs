namespace BanhMi.Domain.Entities;
public class GroupSetting
{
    public int SettingId { get; set; }
    public int ConversationId { get; set; }
    public string SettingName { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public Conversation Conversation { get; set; } = new Conversation();
}