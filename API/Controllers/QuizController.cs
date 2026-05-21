using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using API.Data;
using API.Models;
using API.DTOs;
using System.Text.Json.Serialization;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuizController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;
    private static readonly Random _random = new Random();
    
    private readonly Dictionary<int, List<(string Question, List<string> Options, string CorrectAnswer)>> _questionBank = new()
    {
        [17] = new() 
        {
            ("What is the chemical symbol for Gold?", new List<string> { "Go", "Gd", "Au", "Ag" }, "Au"),
            ("What is the hardest natural substance?", new List<string> { "Iron", "Diamond", "Steel", "Platinum" }, "Diamond"),
            ("What planet is known as the Red Planet?", new List<string> { "Jupiter", "Mars", "Venus", "Saturn" }, "Mars"),
        },
        [18] = new()
        {
            ("What does HTML stand for?", new List<string> { "Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language" }, "Hyper Text Markup Language"),
            ("Who created the World Wide Web?", new List<string> { "Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg" }, "Tim Berners-Lee"),
            ("What does CPU stand for?", new List<string> { "Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit" }, "Central Processing Unit"),
        },
        [21] = new() 
        {
            ("How many players on a basketball team?", new List<string> { "5", "6", "7", "8" }, "5"),
            ("What sport is 'the beautiful game'?", new List<string> { "Basketball", "Tennis", "Soccer", "Baseball" }, "Soccer"),
            ("Touchdown points in NFL?", new List<string> { "3", "5", "6", "7" }, "6"),
        },
        [23] = new()
        {
            ("Who painted the Mona Lisa?", new List<string> { "Van Gogh", "Picasso", "Da Vinci", "Rembrandt" }, "Da Vinci"),
            ("WWII end year?", new List<string> { "1943", "1944", "1945", "1946" }, "1945"),
            ("First person on moon?", new List<string> { "Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "Michael Collins" }, "Neil Armstrong"),
        },
        [11] = new() 
        {
            ("Director of Inception?", new List<string> { "Cameron", "Spielberg", "Nolan", "Tarantino" }, "Christopher Nolan"),
            ("Who played Jack in Titanic?", new List<string> { "Brad Pitt", "DiCaprio", "Matt Damon", "Johnny Depp" }, "Leonardo DiCaprio"),
            ("2020 Best Picture winner?", new List<string> { "1917", "Joker", "Parasite", "Once Upon a Time" }, "Parasite"),
        },
        [12] = new() 
        {
            ("King of Pop?", new List<string> { "Elvis Presley", "Michael Jackson", "Prince", "Freddie Mercury" }, "Michael Jackson"),
            ("Band that performed 'Bohemian Rhapsody'?", new List<string> { "Beatles", "Led Zeppelin", "Queen", "Pink Floyd" }, "Queen"),
            ("Who sang 'Rolling in the Deep'?", new List<string> { "Adele", "Beyoncé", "Amy Winehouse", "Lady Gaga" }, "Adele"),
        }
    };
    
    public QuizController(AppDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClient = httpClientFactory.CreateClient();
    }
    
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }
    
    private string DecodeHtml(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        return System.Net.WebUtility.HtmlDecode(text);
    }
    

  [HttpGet("generate/{categoryId}")]
public async Task<IActionResult> GenerateQuiz(int categoryId)
{
    var userId = GetUserId();
    var user = await _context.Users.FindAsync(userId);
    if (user == null) return NotFound();
    
    var questions = new List<object>();
    bool apiSuccess = false;
    
    var url = $"https://opentdb.com/api.php?amount=5&category={categoryId}&type=multiple";
    
    try
    {
        var response = await _httpClient.GetAsync(url);
        var json = await response.Content.ReadAsStringAsync();
        
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var triviaData = JsonSerializer.Deserialize<TriviaResponse>(json, options);
        
        if (triviaData?.ResponseCode == 0 && triviaData.Results != null && triviaData.Results.Count > 0)
        {
            apiSuccess = true;
            
            foreach (var q in triviaData.Results)
            {
                var optionsList = q.IncorrectAnswers.Select(DecodeHtml).ToList();
                optionsList.Add(DecodeHtml(q.CorrectAnswer));
                optionsList = optionsList.OrderBy(x => Guid.NewGuid()).ToList();
                
                questions.Add(new
                {
                    Question = DecodeHtml(q.Question),
                    Options = optionsList,
                    CorrectAnswer = DecodeHtml(q.CorrectAnswer)
                });
            }
        }
    }
    
    catch (Exception ex)
    {
        Console.WriteLine($"Error: {ex.Message}");
    }
    
    if (!apiSuccess || questions.Count == 0)
    {
        if (!_questionBank.ContainsKey(categoryId))
            return BadRequest(new { message = "Category not found" });
        
        var allQuestions = _questionBank[categoryId];
        questions = allQuestions
            .OrderBy(x => _random.Next())
            .Take(3)
            .Select(q => new
            {
                Question = q.Question,
                Options = q.Options.OrderBy(x => _random.Next()).ToList(),
                CorrectAnswer = q.CorrectAnswer
            })
            .Cast<object>()
            .ToList();
    }
    
    var session = new QuizSession
    {
        UserId = userId,
        Category = GetCategoryName(categoryId),
        TotalQuestions = questions.Count,
        CreatedAt = DateTime.Now
    };
    
    _context.QuizSessions.Add(session);
    await _context.SaveChangesAsync();
    
    return Ok(new { sessionId = session.Id, questions });
}
    
    [HttpPost("submit")]
public async Task<IActionResult> SubmitQuiz([FromBody] CompleteQuizDto dto)
{
    var userId = GetUserId();
    var user = await _context.Users.FindAsync(userId);
    if (user == null) return NotFound();
    
    var session = await _context.QuizSessions.FindAsync(dto.SessionId);
    if (session == null) return BadRequest(new { message = "Session not found" });
    
    foreach (var answer in dto.Answers)
    {
        var quizAnswer = new QuizAnswer
        {
            SessionId = dto.SessionId,
            QuestionText = answer.Question,
            UserAnswer = answer.UserAnswer,
            CorrectAnswer = answer.CorrectAnswer,
            IsCorrect = answer.UserAnswer == answer.CorrectAnswer,
            TimeToAnswer = answer.TimeToAnswer
        };
        _context.QuizAnswers.Add(quizAnswer);
    }
    
    var maxXP = dto.TotalQuestions * 10;
    var percentageScore = maxXP > 0 ? (int)Math.Round((double)dto.Score / maxXP * 100) : 0;
    
    session.Score = percentageScore;
    session.XPReceived = dto.Score;
    session.CompletedAt = DateTime.Now;
    
    user.TotalXP += dto.Score;
    
    var today = DateTime.Now.Date;
    var lastActive = user.LastActiveDate.Date;
    
    if (user.TotalXP == dto.Score && user.CurrentStreak == 0)
    {
        user.CurrentStreak = 1;
        user.LongestStreak = 1;
    }
    else if (lastActive == today)
    {
        
    }
    else if (lastActive == today.AddDays(-1))
    {
        user.CurrentStreak++;
    }
    else
    {
        user.CurrentStreak = 1;
    }
    
    if (user.CurrentStreak > user.LongestStreak)
    {
        user.LongestStreak = user.CurrentStreak;
    }
    
    user.LastActiveDate = today;
    
    _context.Entry(user).State = EntityState.Modified;
    await _context.SaveChangesAsync();
    
    var verifyUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
    
    return Ok(new
    {
        xpEarned = dto.Score,
        totalXP = user.TotalXP,
        currentStreak = verifyUser?.CurrentStreak ?? user.CurrentStreak,
        longestStreak = verifyUser?.LongestStreak ?? user.LongestStreak,
        percentageScore = percentageScore
    });
}
    
    private string GetCategoryName(int categoryId)
    {
        return categoryId switch
        {
            17 => "Science",
            23 => "History",
            18 => "Technology",
            21 => "Sports",
            11 => "Movies",
            12 => "Music",
            _ => "General"
        };
    }
}


public class TriviaResponse
{
    [JsonPropertyName("response_code")]
    public int ResponseCode { get; set; }
    
    [JsonPropertyName("results")]
    public List<TriviaQuestion> Results { get; set; } = new();
}

public class TriviaQuestion
{
    [JsonPropertyName("question")]
    public string Question { get; set; } = string.Empty;
    
    [JsonPropertyName("correct_answer")]
    public string CorrectAnswer { get; set; } = string.Empty;
    
    [JsonPropertyName("incorrect_answers")]
    public List<string> IncorrectAnswers { get; set; } = new();
}