using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;
public class MessageStatusConfiguration : IEntityTypeConfiguration<MessageStatus>
{
    public void Configure(EntityTypeBuilder<MessageStatus> builder)
    {
        builder.HasKey(ms => ms.StatusId);

        builder.Property(ms => ms.Status)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(ms => ms.UpdatedAt)
               .IsRequired();

        builder.HasOne(ms => ms.Message)
               .WithMany(m => m.MessageStatuses)
               .HasForeignKey(ms => ms.MessageId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ms => ms.Receiver)
               .WithMany()
               .HasForeignKey(ms => ms.ReceiverId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}