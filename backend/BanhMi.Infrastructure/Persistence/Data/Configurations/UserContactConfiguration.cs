using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;
public class UserContactConfiguration : IEntityTypeConfiguration<UserContact>
{
    public void Configure(EntityTypeBuilder<UserContact> builder)
    {
        builder.HasKey(uc => uc.ContactId);

        builder.Property(uc => uc.Status)
               .IsRequired()
               .HasMaxLength(50)
               .HasDefaultValue("pending");

        builder.Property(uc => uc.CreatedAt)
               .IsRequired();

        builder.Property(uc => uc.IsBlocked)
               .IsRequired()
               .HasDefaultValue(false);

        builder.HasOne(uc => uc.User)
               .WithMany()
               .HasForeignKey(uc => uc.UserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(uc => uc.Friend)
               .WithMany()
               .HasForeignKey(uc => uc.FriendId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}