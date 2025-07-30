using BanhMi.Application.Interfaces;
using BanhMi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BanhMi.Infrastructure.Persistence.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly AppDbContext _dbContext;

    public AuthRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User> RegisterAsync(User user)
    {
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();
        return user;
    }

    public async Task<User> FindByEmailAsync(string email)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> FindByIdAsync(int id)
    {
        return await _dbContext.Users.FindAsync(id);
    }

    public async Task AddRefreshTokenAsync(RefreshToken token)
    {
        _dbContext.RefreshTokens.Add(token);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<RefreshToken> FindRefreshTokenAsync(string token)
    {
        var refreshToken = await _dbContext.RefreshTokens.Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == token);

        if (refreshToken == null) throw new KeyNotFoundException($"Không tìm thấy RefreshToken với giá trị: {token}");

        return refreshToken;
    }

    public async Task UpdateUserAsync(User user)
    {
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();
    }
    public async Task AddUserAsync(User user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user), "Không thể thêm user vì user là null!");

        await _dbContext.Users.AddAsync(user);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateRefreshTokenAsync(RefreshToken token)
    {
        _dbContext.RefreshTokens.Update(token);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(int userId)
    {
        var user = await FindByIdAsync(userId);
        if (user != null)
        {
            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();
        }
    }
    public async Task<User?> FindByRoleAsync(string role)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Role == role);
    }
    public async Task RevokeRefreshTokenAsync(string token)
    {
        var existingToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == token);
        if (existingToken != null)
        {
            existingToken.RevokedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }
    }
    
}