using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;
public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(n => n.NotificationId);

        builder.Property(n => n.Type)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(n => n.Content)
               .IsRequired();

        builder.Property(n => n.CreatedAt)
               .IsRequired();

        builder.Property(n => n.IsSeen)
               .IsRequired();

        builder.HasOne(n => n.User)
               .WithMany()
               .HasForeignKey(n => n.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}