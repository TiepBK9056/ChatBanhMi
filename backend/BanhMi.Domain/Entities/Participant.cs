namespace BanhMi.Domain.Entities;

public class Participant
{
    public int ParticipantId { get; set; }
    public int ConversationId { get; set; }
    public int UserId { get; set; }
    public DateTime JoinedAt { get; set; }

    // Navigation properties
    public Conversation Conversation { get; set; }
    public User User { get; set; }
}