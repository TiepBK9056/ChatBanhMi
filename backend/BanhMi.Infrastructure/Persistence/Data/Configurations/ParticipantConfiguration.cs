using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BanhMi.Domain.Entities;

namespace BanhMi.Infrastructure.Persistence.Data.Configurations;
public class ParticipantConfiguration : IEntityTypeConfiguration<Participant>
{
    public void Configure(EntityTypeBuilder<Participant> builder)
    {
        builder.HasKey(p => p.ParticipantId);

        builder.Property(p => p.JoinedAt)
               .IsRequired();

        builder.HasOne(p => p.Conversation)
               .WithMany(c => c.Participants)
               .HasForeignKey(p => p.ConversationId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.User)
               .WithMany()
               .HasForeignKey(p => p.UserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}