using BanhMi.Domain.Entities;
using BanhMi.Infrastructure.Persistence.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace BanhMi.Infrastructure.Persistence;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSet cho các thực thể
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Participant> Participants { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    public DbSet<MessageStatus> MessageStatuses { get; set; }
    public DbSet<UserContact> UserContacts { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<BlockedUser> BlockedUsers { get; set; }
    public DbSet<GroupSetting> GroupSettings { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (IMutableEntityType entityType in modelBuilder.Model.GetEntityTypes())
        {
            // Lấy tên entity và đặt làm tên bảng
            string tableName = entityType.ClrType.Name;
            modelBuilder.Entity(entityType.Name).ToTable(tableName);
        }
        // Áp dụng các configuration 
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new ConversationConfiguration());
        modelBuilder.ApplyConfiguration(new MessageConfiguration());
        modelBuilder.ApplyConfiguration(new ParticipantConfiguration());
        modelBuilder.ApplyConfiguration(new AttachmentConfiguration());
        modelBuilder.ApplyConfiguration(new MessageStatusConfiguration());
        modelBuilder.ApplyConfiguration(new UserContactConfiguration());
        modelBuilder.ApplyConfiguration(new NotificationConfiguration());
        modelBuilder.ApplyConfiguration(new BlockedUserConfiguration());
        modelBuilder.ApplyConfiguration(new GroupSettingConfiguration());
    }
}