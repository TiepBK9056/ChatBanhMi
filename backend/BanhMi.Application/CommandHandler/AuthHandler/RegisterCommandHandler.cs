using BanhMi.Application.Commands;
using BanhMi.Application.Common.Utilities;
using BanhMi.Application.Interfaces;
using BanhMi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace BanhMi.Application.CommandHandler;

public class RegisterCommandHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly IRedisService _redisService;
    private readonly IEmailService _emailService;
    private readonly SendOtpCommandHandler _sendOtpHandler; // Inject SendOtpCommandHandler
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IAuthRepository authRepository,
        IRedisService redisService,
        IEmailService emailService,
        SendOtpCommandHandler sendOtpHandler, // Thêm dependency
        ILogger<RegisterCommandHandler> logger)
    {
        _authRepository = authRepository;
        _redisService = redisService;
        _emailService = emailService;
        _sendOtpHandler = sendOtpHandler;
        _logger = logger;
    }

    public async Task<Result<User>> Handle(RegisterCommand command)
    {
        try
        {
            var dto = command.RegisterDto;
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return Result<User>.Failure("Email and password are required");

            var existingUser = await _authRepository.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return Result<User>.Failure("Email already exists");

            var user = new User
            {
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };

            await _authRepository.RegisterAsync(user);
            _logger.LogInformation("User registered: {Email}", dto.Email);

            var sendOtpResult = await _sendOtpHandler.Handle(new SendOtpCommand(dto.Email));
            if (!sendOtpResult.IsSuccess)
            {
                await _authRepository.DeleteAsync(user.Id); // Rollback nếu gửi OTP thất bại
                return Result<User>.Failure(sendOtpResult.Error);
            }

            return Result<User>.Success(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user: {Email}", command.RegisterDto.Email);
            return Result<User>.Failure("An error occurred while registering");
        }
    }
}