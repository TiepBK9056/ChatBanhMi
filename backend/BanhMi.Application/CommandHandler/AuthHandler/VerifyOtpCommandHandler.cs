using BanhMi.Application.Commands;
using BanhMi.Application.Common.Utilities;
using BanhMi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace BanhMi.Application.CommandHandler;
public class VerifyOtpCommandHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly IRedisService _redisService;
    private readonly ILogger<VerifyOtpCommandHandler> _logger;

    public VerifyOtpCommandHandler(
        IAuthRepository authRepository,
        IRedisService redisService,
        ILogger<VerifyOtpCommandHandler> logger)
    {
        _authRepository = authRepository;
        _redisService = redisService;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(VerifyOtpCommand command)
    {
        try
        {
            var dto = command.VerifyOtpDto;
            if (!await _redisService.CanAttemptOtpAsync(dto.Email))
                return Result<bool>.Failure("Too many incorrect OTP attempts. Please request a new OTP.");

            var storedOtp = await _redisService.GetOtpAsync(dto.Email);
            if (storedOtp == null)
                return Result<bool>.Failure("OTP has expired or not found");

            if (storedOtp != dto.Otp)
            {
                await _redisService.IncrementOtpAttemptAsync(dto.Email);
                var attempts = await _redisService.GetOtpAttemptsAsync(dto.Email);
                return Result<bool>.Failure($"Incorrect OTP. You have {5 - attempts} attempts remaining.");
            }

            var user = await _authRepository.FindByEmailAsync(dto.Email);
            if (user == null)
                return Result<bool>.Failure("User not found");

            user.IsVerified = true;
            await _authRepository.UpdateUserAsync(user);
            await _redisService.RemoveOtpAsync(dto.Email);
            await _redisService.ResetOtpAttemptsAsync(dto.Email);

            _logger.LogInformation("OTP verified for user: {Email}", dto.Email);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying OTP for: {Email}", command.VerifyOtpDto.Email);
            return Result<bool>.Failure("An error occurred while verifying OTP");
        }
    }
}
