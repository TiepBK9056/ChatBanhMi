using BCrypt.Net;
using BanhMi.Application.Interfaces;
using BanhMi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace BanhMi.Infrastructure.Services
{
    public class AdminInitializer
    {
        private readonly IAuthRepository _authRepository;
        private readonly ILogger<AdminInitializer> _logger;
        private readonly IEmailService _emailService;
        public AdminInitializer(IAuthRepository authRepository, ILogger<AdminInitializer> logger, IEmailService emailService)
        {
            _authRepository = authRepository;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task InitializeAsync()
        {
            try
            {
                // Kiểm tra xem đã có tài khoản admin nào chưa
                var adminUser = await _authRepository.FindByRoleAsync("Admin");
                if (adminUser != null)
                {
                    _logger.LogInformation("Tài khoản admin đã tồn tại: {Email}", adminUser.Email);
                    return;
                }

                // Tạo tài khoản admin nếu chưa có
                var admin = new User
                {
                    Email = "admin@banhmi.com",
                    PhoneNumber = "123456789",
                    FirstName = "Admin",
                    LastName = "BanhMi",
                    AvatarUrl = "/admin.png",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin123"), // Mã hóa mật khẩu
                    Role = "Admin",
                    IsVerified = true, // Tài khoản admin được xác minh ngay
                };

                await _authRepository.AddUserAsync(admin);
                _logger.LogInformation("Tạo tài khoản admin thành công: {Email}", admin.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi khởi tạo tài khoản admin");
                throw;
            }
            
        }
    }
}