namespace API.Models;

public class QuizSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Score { get; set; }
    public int XPReceived { get; set; }
    public int TotalQuestions { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? CompletedAt { get; set; }
    
    public User? User { get; set; }
    public List<QuizAnswer> Answers { get; set; } = new();
}