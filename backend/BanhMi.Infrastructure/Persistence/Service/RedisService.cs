using BanhMi.Application.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace BanhMi.Infrastructure.Persistence;

public class RedisService : IRedisService
{
    private readonly IDatabase _redis;
    private readonly ILogger<RedisService> _logger;

    public RedisService(IConnectionMultiplexer redis, ILogger<RedisService> logger)
    {
        _redis = redis.GetDatabase();
        _logger = logger;
    }

    public async Task<bool> CanSendOtpAsync(string email)
    {
        try
        {
            var key = $"otp:limit:{email}";
            var count = (string?)await _redis.StringGetAsync(key); // Ép kiểu thành string?
            int countValue;

            if (string.IsNullOrEmpty(count))
            {
                countValue = 0;
            }
            else if (!int.TryParse(count, out countValue))
            {
                _logger.LogError("Giá trị count trong Redis không hợp lệ cho email: {Email}", email);
                throw new InvalidOperationException("Giá trị count trong Redis không hợp lệ!");
            }

            if (countValue >= 5) return false;

            await _redis.StringSetAsync(key, (countValue + 1).ToString(), TimeSpan.FromHours(24));
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kiểm tra giới hạn gửi OTP cho: {Email}", email);
            throw;
        }
    }

    public async Task SetOtpAsync(string email, string otp, TimeSpan expiry)
    {
        try
        {
            await _redis.StringSetAsync($"otp:{email}", otp, expiry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting OTP for: {Email}", email);
            throw;
        }
    }

    public async Task<string?> GetOtpAsync(string email)
    {
        try
        {
            return await _redis.StringGetAsync($"otp:{email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting OTP for: {Email}", email);
            throw;
        }
    }

    public async Task RemoveOtpAsync(string email)
    {
        try
        {
            await _redis.KeyDeleteAsync($"otp:{email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing OTP for: {Email}", email);
            throw;
        }
    }

    public async Task<bool> CanAttemptOtpAsync(string email)
    {
        try
        {
            var key = $"otp:attempts:{email}";
            var attempts = (string?)await _redis.StringGetAsync(key);
            int attemptCount;

            if (string.IsNullOrEmpty(attempts))
            {
                attemptCount = 0;
            }
            else if (!int.TryParse(attempts, out attemptCount))
            {
                _logger.LogError("Giá trị attempts trong Redis không hợp lệ cho email: {Email}", email);
                throw new InvalidOperationException("Giá trị attempts trong Redis không hợp lệ!");
            }

            return attemptCount < 5;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kiểm tra số lần thử OTP cho: {Email}", email);
            throw;
        }
    }

    public async Task IncrementOtpAttemptAsync(string email)
    {
        try
        {
            var key = $"otp:attempts:{email}";
            var attempts = (string?)await _redis.StringGetAsync(key);
            int attemptCount;

            if (string.IsNullOrEmpty(attempts))
            {
                attemptCount = 0;
            }
            else if (!int.TryParse(attempts, out attemptCount))
            {
                _logger.LogError("Giá trị attempts trong Redis không hợp lệ cho email: {Email}", email);
                throw new InvalidOperationException("Giá trị attempts trong Redis không hợp lệ!");
            }

            await _redis.StringSetAsync(key, (attemptCount + 1).ToString(), TimeSpan.FromMinutes(5));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tăng số lần thử OTP cho: {Email}", email);
            throw;
        }
    }

    public async Task ResetOtpAttemptsAsync(string email)
    {
        try
        {
            await _redis.KeyDeleteAsync($"otp:attempts:{email}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting OTP attempts for: {Email}", email);
            throw;
        }
    }

    public async Task<int> GetOtpAttemptsAsync(string email)
    {
        try
        {
            var attempts = (string?)await _redis.StringGetAsync($"otp:attempts:{email}");
            if (string.IsNullOrEmpty(attempts))
            {
                return 0;
            }

            if (!int.TryParse(attempts, out int attemptCount))
            {
                _logger.LogError("Giá trị attempts trong Redis không hợp lệ cho email: {Email}", email);
                throw new InvalidOperationException("Giá trị attempts trong Redis không hợp lệ!");
            }

            return attemptCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy số lần thử OTP cho: {Email}", email);
            throw;
        }
    }
}