namespace API.DTOs;

public class UserStatsDto
{
    public int TotalXP { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public int Hearts { get; set; }
    public int TotalQuizzes { get; set; }
    public double AverageScore { get; set; }
}