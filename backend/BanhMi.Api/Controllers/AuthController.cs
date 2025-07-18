using BanhMi.Application.CommandHandler;
using BanhMi.Application.Commands;
using BanhMi.Application.Common.DTOs;
using BanhMi.Application.Queries;
using BanhMi.Application.QueryHandlers;
using BanhMi.Shared.Dtos;
using Ecommere.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BanhMi.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly RegisterCommandHandler _registerHandler;
    private readonly LoginCommandHandler _loginHandler;
    private readonly VerifyOtpCommandHandler _verifyOtpHandler;
    private readonly LogoutCommandHandler _logoutHandler;
    private readonly SendOtpCommandHandler _sendOtpHandler;
    private readonly GetUserInfoQueryHandler _userInfoHandler;
    private readonly TokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        RegisterCommandHandler registerHandler,
        LoginCommandHandler loginHandler,
        VerifyOtpCommandHandler verifyOtpHandler,
        LogoutCommandHandler logoutHandler,
        SendOtpCommandHandler sendOtpHandler,
        GetUserInfoQueryHandler userInfoHandler,
        TokenService tokenService,
        ILogger<AuthController> logger)
    {
        _registerHandler = registerHandler;
        _loginHandler = loginHandler;
        _verifyOtpHandler = verifyOtpHandler;
        _logoutHandler = logoutHandler;
        _sendOtpHandler = sendOtpHandler;
        _userInfoHandler = userInfoHandler;
        _tokenService = tokenService;
        _logger = logger;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _registerHandler.Handle(new RegisterCommand(dto));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(new { message = "Registration successful. Please verify your email.", userId = result.Value.Id });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _loginHandler.Handle(new LoginCommand(dto));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [AllowAnonymous]
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] string email)
    {
        var result = await _sendOtpHandler.Handle(new SendOtpCommand(email));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(new { message = "OTP sent to your email." });
    }

    [AllowAnonymous]
    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp([FromBody] string email)
    {
        return await SendOtp(email);
    }

    [AllowAnonymous]
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        var result = await _verifyOtpHandler.Handle(new VerifyOtpCommand(dto));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(new { message = "Email verified successfully." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetUserInfo()
    {
        var authorizationHeader = Request.Headers["Authorization"].ToString() ?? "Không có header Authorization";
        _logger.LogInformation("Received Authorization header: {Header}", authorizationHeader);
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (subClaim == null)
        {
            _logger.LogWarning("No 'sub' claim found in token. User claims: {Claims}", User.Claims.Select(c => $"{c.Type}: {c.Value}"));
            return Unauthorized("Invalid or missing token: 'sub' claim not found");
        }

        var userId = int.Parse(subClaim.Value);
        var result = await _userInfoHandler.Handle(new GetUserInfoQuery(userId));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
    {
        try
        {
            var response = await _tokenService.RefreshTokenAsync(dto.RefreshToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenDto dto)
    {
        var result = await _logoutHandler.Handle(new LogoutCommand(dto.RefreshToken));
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(new { message = "Logged out successfully." });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin-only")]
    public IActionResult AdminOnly()
    {
        return Ok("This is for admins only.");
    }
}