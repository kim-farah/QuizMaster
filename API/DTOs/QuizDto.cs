namespace API.DTOs;

public class QuizQuestionDto
{
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string CorrectAnswer { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class SubmitAnswerDto
{
    public int SessionId { get; set; }
    public int QuestionIndex { get; set; }
    public string Question { get; set; } = string.Empty;
    public string UserAnswer { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public int TimeToAnswer { get; set; }
}

public class CompleteQuizDto
{
    public int SessionId { get; set; }
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new();
}

public class LeaderboardEntryDto
{
    public int Rank { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TotalXP { get; set; }
    public int CurrentStreak { get; set; }
    public bool IsCurrentUser { get; set; }
}