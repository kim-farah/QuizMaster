using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Models;
using API.DTOs;
using API.Services;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    
    public AuthController(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already exists" });
        
        var user = new User
        {
            Email = dto.Email,
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        var token = _tokenService.CreateToken(user);
        
        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Username = user.Username,
            UserId = user.Id,
            TotalXP = user.TotalXP,
            CurrentStreak = user.CurrentStreak
        });
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        if (user == null)
            return Unauthorized(new { message = "Invalid credentials" });
        
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });
        
        var token = _tokenService.CreateToken(user);
        
        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Username = user.Username,
            UserId = user.Id,
            TotalXP = user.TotalXP,
            CurrentStreak = user.CurrentStreak
        });
    }
}