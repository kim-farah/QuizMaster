import { useEffect, useState } from 'react';
import API from '../services/api';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = sessionStorage.getItem('username');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get('/User/leaderboard');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading leaderboard...</div>;

  const totalPlayers = users.length;
  const topXP = users[0]?.totalXP || 0;
  const topStreak = users[0]?.currentStreak || 0;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Global Leaderboard</h1>
        <p>Top players ranked by experience points</p>
      </div>

      <div className="leaderboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{totalPlayers}</div>
          <div className="stat-label">Total Players</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{topXP}</div>
          <div className="stat-label">Top Player XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{topStreak}</div>
          <div className="stat-label">Top Streak</div>
        </div>
      </div>

      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>XP</th>
              <th>Streak</th>
              <th>Badge</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const rank = index + 1;
              let rankDisplay = '';
              let medalColor = '';
              
              if (rank === 1) {
                rankDisplay = '🥇';
                medalColor = '#ffd700';
              } else if (rank === 2) {
                rankDisplay = '🥈';
                medalColor = '#c0c0c0';
              } else if (rank === 3) {
                rankDisplay = '🥉';
                medalColor = '#cd7f32';
              } else {
                rankDisplay = `#${rank}`;
              }

              let badge = '';
              if (user.totalXP >= 1000) badge = '🏆 Legend';
              else if (user.totalXP >= 500) badge = '⭐ Master';
              else if (user.totalXP >= 100) badge = '🌟 Rising Star';
              else if (user.totalXP >= 50) badge = '🌱 Beginner';
              else badge = '🆕 Newbie';

              const isCurrentUser = user.username === currentUser;

              return (
                <tr key={index} className={isCurrentUser ? 'current-user-row' : ''}>
                  <td className="rank-cell">
                    <span className="rank-medal" style={{ color: medalColor }}>{rankDisplay}</span>
                  </td>
                  <td className="player-cell">
                    <div className="player-info">
                      <span className="player-avatar">👤</span>
                      <span className="player-name">{user.username}</span>
                      {isCurrentUser && <span className="you-badge">You</span>}
                    </div>
                  </td>
                  <td className="xp-cell">
                    <span className="xp-value">{user.totalXP}</span>
                    <span className="xp-label">XP</span>
                  </td>
                  <td className="streak-cell">
                    <span className="streak-value">{user.currentStreak}</span>
                    <span className="streak-label">days</span>
                  </td>
                  <td className="badge-cell">
                    <span className="player-badge">{badge}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;