using BanhMi.Application.Commands;
using BanhMi.Application.Common.Utilities;
using BanhMi.Application.Interfaces;
using Microsoft.Extensions.Logging;

public class SendOtpCommandHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly IRedisService _redisService;
    private readonly IEmailService _emailService;
    private readonly ILogger<SendOtpCommandHandler> _logger;

    public SendOtpCommandHandler(
        IAuthRepository authRepository,
        IRedisService redisService,
        IEmailService emailService,
        ILogger<SendOtpCommandHandler> logger)
    {
        _authRepository = authRepository;
        _redisService = redisService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(SendOtpCommand command)
    {
        try
        {
            var user = await _authRepository.FindByEmailAsync(command.Email);
            if (user == null)
                return Result<bool>.Failure("User not found");

            if (!await _redisService.CanSendOtpAsync(command.Email))
                return Result<bool>.Failure("OTP request limit exceeded. Try again after 24 hours.");

            var otp = new Random().Next(100000, 999999).ToString();
            await _redisService.SetOtpAsync(command.Email, otp, TimeSpan.FromMinutes(5));
            await _emailService.SendOtpEmailAsync(command.Email, otp);

            _logger.LogInformation("OTP sent to: {Email}", command.Email);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP to: {Email}", command.Email);
            return Result<bool>.Failure("An error occurred while sending OTP");
        }
    }
}