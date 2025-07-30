using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Interfaces;
using BanhMi.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Ecommere.Application.Common;

public class TokenService
{
    private readonly IConfiguration _config;
    private readonly IAuthRepository _authRepository;
    private readonly ILogger<TokenService> _logger;

    public TokenService(
        IConfiguration config,
        IAuthRepository authRepository,
        ILogger<TokenService> logger)
    {
        _config = config;
        _authRepository = authRepository;
        _logger = logger;
    }

    public string GenerateAccessToken(User user)
    {
        if (user == null)
        {
            _logger.LogError("Cannot generate access token: User is null");
            throw new ArgumentNullException(nameof(user));
        }

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, user.Role ?? string.Empty),
            new Claim("IsVerified", user.IsVerified.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] 
            ?? throw new InvalidOperationException("JWT Key không được cấu hình!")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        _logger.LogInformation("Access token generated for user: {Email}", user.Email);
        return tokenString;
    }

    public async Task<RefreshToken> GenerateRefreshToken(int userId)
    {
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = Guid.NewGuid().ToString(),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _authRepository.AddRefreshTokenAsync(refreshToken);
        _logger.LogInformation("Refresh token generated and saved for user ID: {UserId}", userId);
        return refreshToken;
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            var token = await _authRepository.FindRefreshTokenAsync(refreshToken);
            if (token == null || token.ExpiresAt < DateTime.UtcNow || token.RevokedAt != null)
            {
                _logger.LogWarning("Invalid or expired refresh token: {RefreshToken}", refreshToken);
                throw new SecurityTokenException("Invalid or expired refresh token");
            }

            var user = await _authRepository.FindByIdAsync(token.UserId);
            if (user == null)
            {
                _logger.LogWarning("User not found for refresh token: {RefreshToken}", refreshToken);
                throw new SecurityTokenException("User not found");
            }

            var newAccessToken = GenerateAccessToken(user);
            var newRefreshToken = await GenerateRefreshToken(user.Id);

            await _authRepository.RevokeRefreshTokenAsync(refreshToken);
            _logger.LogInformation("Refresh token revoked and new token generated for user: {Email}", user.Email);

            return new LoginResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token,
                ExpiresIn = 15 * 60
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token: {RefreshToken}", refreshToken);
            throw;
        }
    }
}