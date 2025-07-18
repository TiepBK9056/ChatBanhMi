using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;
public class BlockedUserConfiguration : IEntityTypeConfiguration<BlockedUser>
{
    public void Configure(EntityTypeBuilder<BlockedUser> builder)
    {
        builder.HasKey(bu => bu.BlockId);

        builder.Property(bu => bu.CreatedAt)
               .IsRequired();

        builder.HasOne(bu => bu.User)
               .WithMany()
               .HasForeignKey(bu => bu.UserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(bu => bu.BlockUser)
               .WithMany()
               .HasForeignKey(bu => bu.BlockedUserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}