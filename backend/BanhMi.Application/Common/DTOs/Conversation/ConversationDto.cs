namespace BanhMi.Application.Common.DTOs
{
    public class ConversationDto
    {
        public int ConversationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsGroup { get; set; }
        public string Preview { get; set; } = "Chưa có tin nhắn";
        public DateTime Time { get; set; }
        public int UnreadCount { get; set; }
        public string? AvatarUrl { get; set; }
    }
}