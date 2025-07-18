using BanhMi.Application.Interfaces;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace BanhMi.Infrastructure.Persistence;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOtpEmailAsync(string email, string otp)
    {
        try
        {
            string smtpServer = _config["Email:SmtpServer"] ?? throw new InvalidOperationException("SMTP Server không được cấu hình trong appsettings.json!");
            string port = _config["Email:Port"] ?? throw new InvalidOperationException("Port không được cấu hình trong appsettings.json!");
            string username = _config["Email:Username"] ?? throw new InvalidOperationException("Email Username không được cấu hình trong appsettings.json!");
            string password = _config["Email:Password"] ?? throw new InvalidOperationException("Email Password không được cấu hình trong appsettings.json!");

            // Tạo email message
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("BanhMi", username));
            message.To.Add(new MailboxAddress("", email));
            message.Subject = "Mã OTP của bạn từ BanhMi";

            
            string htmlBody = $@"<!DOCTYPE html>
    <html lang=""vi"">
    <head>
        <meta charset=""UTF-8"">
        <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
        <title>Mã OTP của bạn</title>
    </head>
    <body style=""margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"">
        <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
            <!-- Header -->
            <tr>
                <td style=""padding: 20px; background-color: #4CAF50; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;"">
                    <h1 style=""color: #ffffff; margin: 0; font-size: 24px;"">BanhMi</h1>
                    <p style=""color: #e0f7fa; margin: 5px 0 0; font-size: 14px;"">Mã OTP để xác minh tài khoản của bạn</p>
                </td>
            </tr>
            <!-- Body -->
            <tr>
                <td style=""padding: 30px; text-align: center;"">
                    <h2 style=""color: #333333; font-size: 20px; margin: 0 0 10px;"">Xin chào!</h2>
                    <p style=""color: #666666; font-size: 16px; margin: 0 0 20px;"">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đây là mã OTP của bạn:</p>
                    <div style=""display: inline-block; padding: 15px 25px; background-color: #e0f7fa; border-radius: 5px; font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px;"">
                        {otp}
                    </div>
                    <p style=""color: #666666; font-size: 14px; margin: 20px 0 0;"">Mã OTP này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng nhập mã này để xác minh tài khoản của bạn.</p>
                </td>
            </tr>
            <!-- Footer -->
            <tr>
                <td style=""padding: 20px; background-color: #f8f9fa; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;"">
                    <p style=""color: #999999; font-size: 12px; margin: 0;"">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                    <p style=""color: #999999; font-size: 12px; margin: 5px 0 0;"">Liên hệ với chúng tôi: <a href=""mailto:support@banhmi.com"" style=""color: #007bff; text-decoration: none;"">support@banhmi.com</a></p>
                </td>
            </tr>
        </table>
    </body>
    </html>";

            // Gán nội dung HTML cho email
            message.Body = new TextPart("html") { Text = htmlBody };

            // Gửi email
            using var client = new SmtpClient();
            await client.ConnectAsync(smtpServer, int.Parse(port), MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email đã gửi thành công tới: {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Không gửi được email tới: {Email}", email);
            throw new Exception("Không gửi được email OTP, vui lòng thử lại!");
        }
    }
}