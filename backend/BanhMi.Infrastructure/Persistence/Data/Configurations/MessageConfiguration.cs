using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;
public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.HasKey(m => m.MessageId);

        builder.Property(m => m.Content)
               .IsRequired();

        builder.Property(m => m.CreatedAt)
               .IsRequired();

        builder.Property(m => m.IsRead)
               .IsRequired();

        builder.HasOne(m => m.Conversation)
               .WithMany(c => c.Messages)
               .HasForeignKey(m => m.ConversationId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Sender)
               .WithMany()
               .HasForeignKey(m => m.SenderId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(m => m.Attachments)
               .WithOne(a => a.Message)
               .HasForeignKey(a => a.MessageId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(m => m.MessageStatuses)
               .WithOne(ms => ms.Message)
               .HasForeignKey(ms => ms.MessageId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}