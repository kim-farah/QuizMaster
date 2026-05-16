namespace API.Models;

public class QuizAnswer
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string UserAnswer { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int TimeToAnswer { get; set; } = 0;
    public DateTime AnsweredAt { get; set; } = DateTime.Now;
    
    public QuizSession? Session { get; set; }
}