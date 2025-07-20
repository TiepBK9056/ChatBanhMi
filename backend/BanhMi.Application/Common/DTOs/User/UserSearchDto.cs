namespace BanhMi.Application.Common.DTOs
{
    public class UserSearchDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string FriendshipStatus { get; set; } = "none";
    }
}