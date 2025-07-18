using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;

public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.HasKey(c => c.ConversationId);

        builder.Property(c => c.ConversationName)
               .HasMaxLength(100);

        builder.Property(c => c.IsGroup)
               .IsRequired();

        builder.Property(c => c.CreatedAt)
               .IsRequired();

        builder.HasMany(c => c.Messages)
               .WithOne(m => m.Conversation)
               .HasForeignKey(m => m.ConversationId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Participants)
               .WithOne(p => p.Conversation)
               .HasForeignKey(p => p.ConversationId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.GroupSettings)
               .WithOne(gs => gs.Conversation)
               .HasForeignKey(gs => gs.ConversationId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
