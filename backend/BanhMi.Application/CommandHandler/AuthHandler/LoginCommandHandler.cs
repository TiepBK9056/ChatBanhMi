using BanhMi.Application.Commands;
using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Common.Utilities;
using BanhMi.Application.Interfaces;
using Ecommere.Application.Common;
using Microsoft.Extensions.Logging;

namespace BanhMi.Application.CommandHandler;
public class LoginCommandHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly TokenService _tokenService;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        IAuthRepository authRepository,
        TokenService tokenService,
        ILogger<LoginCommandHandler> logger)
    {
        _authRepository = authRepository;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<Result<LoginResponseDto>> Handle(LoginCommand command)
    {
        try
        {
            var dto = command.LoginDto;
            var user = await _authRepository.FindByEmailAsync(dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                return Result<LoginResponseDto>.Failure("Invalid credentials");

            if (!user.IsVerified)
                return Result<LoginResponseDto>.Failure("Email not verified");

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = await _tokenService.GenerateRefreshToken(user.Id);
            

            _logger.LogInformation("User logged in: {Email}", dto.Email);
            return Result<LoginResponseDto>.Success(new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                ExpiresIn = 15 * 60
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging in user: {Email}", command.LoginDto.Email);
            return Result<LoginResponseDto>.Failure("An error occurred while logging in");
        }
    }
}