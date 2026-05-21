import { useEffect, useState } from 'react';
import API from '../services/api';

function Profile() {
  const [stats, setStats] = useState({
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageScore: 0,
    totalQuizzes: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const username = sessionStorage.getItem('username');
  const email = sessionStorage.getItem('email');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/User/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const clearPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const openModal = () => {
    clearPasswordForm();
    setShowPasswordModal(true);
  };

  const closeModal = () => {
    clearPasswordForm();
    setShowPasswordModal(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await API.post('/User/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-user-section">
          <div className="profile-avatar">🎯</div>
          <div className="profile-user-info">
            <div className="profile-row">
              <span className="profile-label">Username:</span>
              <span className="profile-value">{username}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{email}</span>
            </div>
          </div>
        </div>

        <div className="profile-stats-section">
          <div className="profile-row">
            <span className="profile-label">⭐ Total XP:</span>
            <span className="profile-value">{stats.totalXP}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">🔥 Current Streak:</span>
            <span className="profile-value">{stats.currentStreak} days</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">🏆 Longest Streak:</span>
            <span className="profile-value">{stats.longestStreak} days</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">📊 Average Score:</span>
            <span className="profile-value">{stats.averageScore}%</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">📚 Total Quizzes:</span>
            <span className="profile-value">{stats.totalQuizzes}</span>
          </div>
        </div>

        <div className="profile-password-btn-container">
          <button onClick={openModal} className="profile-password-btn">
            🔒 Change Password
          </button>
        </div>
      </div>

      
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔒 Change Password</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="New Password (min 6 characters)"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
              <div className="modal-buttons">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={passwordLoading} className="btn-save">
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;