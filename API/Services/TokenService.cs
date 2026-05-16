using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using API.Models;

namespace API.Services;

public class TokenService
{
    private readonly IConfiguration _configuration;
    
    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("username", user.Username)
        };
        
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "your-super-secret-key-at-least-64-characters-long-here")
        );
        
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "QuizMasterAPI",
            audience: _configuration["Jwt:Audience"] ?? "QuizMasterClient",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}