using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public int TotalXP { get; set; } = 0;
    public int CurrentStreak { get; set; } = 0;
    public int LongestStreak { get; set; } = 0;
    public DateTime LastActiveDate { get; set; } = DateTime.Now;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public List<QuizSession> QuizSessions { get; set; } = new();
}