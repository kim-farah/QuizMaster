import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await API.post('/Auth/register', { email, username, password });
      console.log('Register response:', response.data);
      
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('userId', response.data.userId);
      sessionStorage.setItem('username', response.data.username);
      
      // Use window.location for guaranteed redirect
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <span className="auth-icon">🎯</span>
        <h1>QuizMaster</h1>
        <p>Start your learning journey today!</p>
      </div>
      
      <h2>Create Account</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
          />
        </div>
        
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="input-group">
          <label>Password (min 6 characters)</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength="6"
            />
            <span 
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>
        
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      
      <p className="auth-footer">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default Register;