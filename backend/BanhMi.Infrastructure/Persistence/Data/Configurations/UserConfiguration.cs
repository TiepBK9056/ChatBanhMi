using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(u => u.PhoneNumber)
               .IsRequired()
               .HasMaxLength(20);

        builder.Property(u => u.Password)
               .IsRequired()
               .HasMaxLength(256);

        builder.Property(u => u.Role)
               .IsRequired()
               .HasMaxLength(50)
               .HasDefaultValue("User");

        builder.Property(u => u.FirstName)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(u => u.LastName)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(u => u.AvatarUrl)
               .HasMaxLength(500);

        builder.HasMany(u => u.RefreshTokens)
               .WithOne(rt => rt.User)
               .HasForeignKey(rt => rt.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(u => u.Email)
               .IsUnique();
    }
}