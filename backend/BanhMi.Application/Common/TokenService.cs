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

public class TokenService {
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
        var claims = new []
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("IsVerified", user.IsVerified.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key không được cấu hình!")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );

        _logger.LogInformation("Access token generated for user: {Email}", user.Email);
        return new JwtSecurityTokenHandler().WriteToken(token);
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

        _logger.LogInformation("Refresh token generated for user ID: {UserId}", userId);
        return refreshToken;
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(string refreshToken)
    {
        try {
            var token = await _authRepository.FindRefreshTokenAsync(refreshToken);
            if (token == null || token.ExpiresAt < DateTime.UtcNow || token.RevokedAt != null)
                throw new Exception("Invalid or expirred refresh token");

            var user = await _authRepository.FindByIdAsync(token.UserId);
            var newAcessToken = GenerateAccessToken(user);
            var newRefreshToken = await GenerateRefreshToken(user.Id);

            _logger.LogInformation("Token refresed for user: {Email}", user.Email);

            return new LoginResponseDto
            {
                AccessToken = newAcessToken,
                RefreshToken = newRefreshToken.Token,
                ExpiresIn = 15 * 60
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token: {RefreshTOken}", refreshToken);
            throw;
        }
    }
}