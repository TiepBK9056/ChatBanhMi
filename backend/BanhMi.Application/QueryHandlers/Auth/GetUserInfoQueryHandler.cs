using BanhMi.Application.Common.Utilities;
using BanhMi.Application.Interfaces;
using BanhMi.Application.Queries;
using BanhMi.Domain.Entities;
using BanhMi.Shared.Dtos;
using Microsoft.Extensions.Logging;

namespace BanhMi.Application.QueryHandlers;

public class GetUserInfoQueryHandler
{
    private readonly IAuthRepository _authRepository;
    private readonly ILogger<GetUserInfoQueryHandler> _logger;

    public GetUserInfoQueryHandler(IAuthRepository authRepository, ILogger<GetUserInfoQueryHandler> logger)
    {
        _authRepository = authRepository;
        _logger = logger;
    }

    public async Task<Result<UserDto>> Handle(GetUserInfoQuery query)
    {
        try {
            var user = await _authRepository.FindByIdAsync(query.UserId);
            if(user == null)
                return Result<UserDto>.Failure("User not found");

            _logger.LogInformation("User info retrieved for ID: {UserId}", query.UserId);
            return Result<UserDto>.Success(new UserDto {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin người dùng với ID: {UserId}", query.UserId);
            string errorMessage = ex.Message.Contains("not found")
                ? "Không tìm thấy thông tin người dùng, kiểm tra lại ID nhé!"
                : "Có lỗi xảy ra khi lấy thông tin người dùng, xin thử lại nhé!";
            return Result<UserDto>.Failure(errorMessage);
        }
    }
}