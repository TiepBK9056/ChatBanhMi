namespace BanhMi.Domain.Entities;
public class Attachment
{
    public int AttachmentId { get; set; }
    public int MessageId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public int FileSize { get; set; }
    public DateTime UploadedAt { get; set; }

    // Navigation property
    public Message Message { get; set; } 
}