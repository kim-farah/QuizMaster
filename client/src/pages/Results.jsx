import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../services/api';

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || { score: 0, total: 10 };
  const [stats, setStats] = useState(null);
  
  const maxScore = total * 10;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const correctCount = score / 10;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/User/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  let message = '';
  let messageIcon = '';
  if (percentage >= 80) {
    message = 'Excellent! You\'re a quiz master!';
    messageIcon = '🏆';
  } else if (percentage >= 60) {
    message = 'Good job! Keep practicing!';
    messageIcon = '👍';
  } else if (percentage >= 40) {
    message = 'Not bad! Review and try again!';
    messageIcon = '📚';
  } else {
    message = 'Keep studying! You\'ll do better next time!';
    messageIcon = '💪';
  }

  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-icon">🎉</div>
        <h1>Quiz Complete!</h1>
        
        <div className="score-circle">
          <div className="score-value">{percentage}%</div>
          <div className="score-label">Your Score</div>
        </div>
        
        <div className="results-stats-grid">
          <div className="result-stat">
            <div className="result-stat-icon">✅</div>
            <div className="result-stat-info">
              <div className="result-stat-label">Correct Answers</div>
              <div className="result-stat-value">{correctCount} / {total}</div>
            </div>
          </div>
          <div className="result-stat">
            <div className="result-stat-icon">⭐</div>
            <div className="result-stat-info">
              <div className="result-stat-label">XP Earned</div>
              <div className="result-stat-value">{score} XP</div>
            </div>
          </div>
          {stats && (
            <>
              <div className="result-stat">
                <div className="result-stat-icon">🏅</div>
                <div className="result-stat-info">
                  <div className="result-stat-label">Total XP</div>
                  <div className="result-stat-value">{stats.totalXP} XP</div>
                </div>
              </div>
              <div className="result-stat">
                <div className="result-stat-icon">🔥</div>
                <div className="result-stat-info">
                  <div className="result-stat-label">Current Streak</div>
                  <div className="result-stat-value">{stats.currentStreak} days</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="result-message">
          <span className="result-message-icon">{messageIcon}</span>
          <span>{message}</span>
        </div>
        
        <div className="results-actions">
          <button onClick={goToDashboard} className="btn-home">
            🏠 Back to Home
          </button>
          <button onClick={() => navigate('/leaderboard')} className="btn-leaderboard">
            🏆 View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;