using BanhMi.Application.Commands;
using BanhMi.Application.Common.Utilities;
using BanhMi.Application.Interfaces;
using Microsoft.Extensions.Logging;

public class LogoutCommandHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly ILogger<LogoutCommandHandler> _logger;

    public LogoutCommandHandler(
        IAuthRepository authRepository,
        ILogger<LogoutCommandHandler> logger)
    {
        _authRepository = authRepository;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(LogoutCommand command)
    {
        try
        {
            var token = await _authRepository.FindRefreshTokenAsync(command.RefreshToken);
            if (token == null || token.RevokedAt != null)
                return Result<bool>.Failure("Invalid or already revoked refresh token");

            token.RevokedAt = DateTime.UtcNow;
            await _authRepository.UpdateRefreshTokenAsync(token);

            _logger.LogInformation("User logged out with token: {Token}", command.RefreshToken);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging out with token: {Token}", command.RefreshToken);
            return Result<bool>.Failure("An error occurred while logging out");
        }
    }
}