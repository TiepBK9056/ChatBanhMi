using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace BanhMi.Infrastructure.Persistence
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../BanhMi.Api")) 
                .AddJsonFile("appsettings.json", optional: true)// Tuỳ chọn , nếu có thôi nha ae
                .AddUserSecrets<AppDbContext>() // Thêm userSecrets
                .Build();

            var builder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection"); 

            builder.UseSqlServer(connectionString);

            return new AppDbContext(builder.Options);
        }
    }
}