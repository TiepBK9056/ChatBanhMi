using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;
public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.HasKey(a => a.AttachmentId);

        builder.Property(a => a.FileUrl)
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(a => a.FileType)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(a => a.FileSize)
               .IsRequired();

        builder.Property(a => a.UploadedAt)
               .IsRequired();

        builder.HasOne(a => a.Message)
               .WithMany(m => m.Attachments)
               .HasForeignKey(a => a.MessageId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}