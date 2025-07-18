using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;
public class GroupSettingConfiguration : IEntityTypeConfiguration<GroupSetting>
{
    public void Configure(EntityTypeBuilder<GroupSetting> builder)
    {
        builder.HasKey(gs => gs.SettingId);

        builder.Property(gs => gs.SettingName)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(gs => gs.SettingValue)
               .IsRequired();

        builder.Property(gs => gs.UpdatedAt)
               .IsRequired();

        builder.HasOne(gs => gs.Conversation)
               .WithMany(c => c.GroupSettings)
               .HasForeignKey(gs => gs.ConversationId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}