using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using API.Data;
using API.DTOs;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public UserController(AppDbContext context)
    {
        _context = context;
    }
    
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }
 
 /*
[HttpGet("stats")]
public async Task<IActionResult> GetStats()
{
    var userId = GetUserId();
    var user = await _context.Users.FindAsync(userId);
    if (user == null) return NotFound();
    
    var totalQuizzes = await _context.QuizSessions
        .Where(q => q.UserId == userId && q.CompletedAt != null)
        .CountAsync();
    
    var averageScore = totalQuizzes > 0
        ? (int)Math.Round(await _context.QuizSessions
            .Where(q => q.UserId == userId && q.CompletedAt != null)
            .AverageAsync(q => (double)q.Score))
        : 0;
    
    return Ok(new
    {
        totalXP = user.TotalXP,
        currentStreak = user.CurrentStreak,
        longestStreak = user.LongestStreak,
        averageScore = averageScore,
        totalQuizzes = totalQuizzes
    });
}*/

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        var leaderboard = await _context.Users
            .OrderByDescending(u => u.TotalXP)
            .Take(50)
            .Select(u => new
            {
                u.Username,
                u.TotalXP,
                u.CurrentStreak
            })
            .ToListAsync();
        
        return Ok(leaderboard);
    }

[HttpGet("stats")]
public async Task<IActionResult> GetStats()
{
    var userId = GetUserId();
    var user = await _context.Users.FindAsync(userId);
    if (user == null) return NotFound();
    
     // ===== STREAK RESET LOGIC =====
    var today = DateTime.Now.Date;
    var lastActive = user.LastActiveDate.Date;
    var yesterday = today.AddDays(-1);
    
    if (lastActive != today && user.CurrentStreak > 0)
    {
        user.CurrentStreak = 0;
        await _context.SaveChangesAsync();
    }

    var totalQuizzes = await _context.QuizSessions
        .Where(q => q.UserId == userId && q.CompletedAt != null)
        .CountAsync();
    
    var averageScore = totalQuizzes > 0
        ? (int)Math.Round(await _context.QuizSessions
            .Where(q => q.UserId == userId && q.CompletedAt != null)
            .AverageAsync(q => (double)q.Score))
        : 0;
    
    return Ok(new
    {
        totalXP = user.TotalXP,
        currentStreak = user.CurrentStreak,
        longestStreak = user.LongestStreak,
        averageScore = averageScore,
        totalQuizzes = totalQuizzes
    });
}

    [HttpPost("change-password")]
public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
{
    var userId = GetUserId();
    var user = await _context.Users.FindAsync(userId);
    
    if (user == null)
        return BadRequest(new { message = "User not found" });
    
    bool isCurrentPasswordCorrect = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
    
    if (!isCurrentPasswordCorrect)
        return BadRequest(new { message = "Current password is incorrect" });
    
    if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
        return BadRequest(new { message = "New password must be at least 6 characters" });
    
    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
    await _context.SaveChangesAsync();
    
    return Ok(new { message = "Password changed successfully" });
}
}