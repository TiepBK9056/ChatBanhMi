namespace BanhMi.Application.Interfaces;
public interface IRedisService
{
    Task<bool> CanSendOtpAsync(string email);
    Task SetOtpAsync(string email, string otp, TimeSpan expiry);
    Task<string> GetOtpAsync(string email);
    Task RemoveOtpAsync(string email);
    Task<bool> CanAttemptOtpAsync(string email);
    Task IncrementOtpAttemptAsync(string email);
    Task ResetOtpAttemptsAsync(string email);
    Task<int> GetOtpAttemptsAsync(string email); // Thêm để lấy số lần nhập sai hiện tại
}