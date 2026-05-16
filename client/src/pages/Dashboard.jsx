import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalXP: 0,
    currentStreak: 0,
    totalQuizzes: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get('/User/stats');
      console.log('Dashboard stats:', res.data);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Science', icon: '🔬', categoryId: 17 },
    { name: 'History', icon: '📜', categoryId: 23 },
    { name: 'Technology', icon: '💻', categoryId: 18 },
    { name: 'Sports', icon: '⚽', categoryId: 21 },
    { name: 'Movies', icon: '🎬', categoryId: 11 },
    { name: 'Music', icon: '🎵', categoryId: 12 }
  ];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome back, {username}! 👋</h1>
        <p>Ready to test your knowledge today?</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.totalXP}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.averageScore}%</div>
          <div className="stat-label">Avg Score</div>
        </div>
      </div>

      <h2 style={{ marginTop: 20, marginBottom: 20 }}>🎯 Choose a Category</h2>
      
      <div className="categories-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px',
        marginTop: '10px'
      }}>
        {categories.map(cat => (
          <div key={cat.categoryId} className="category-card">
            <div className="category-icon">{cat.icon}</div>
            <h3>{cat.name}</h3>
            <button 
              onClick={() => navigate(`/quiz/${cat.categoryId}`)} 
              className="btn-play"
            >
              Play →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;