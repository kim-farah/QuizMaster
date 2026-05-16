import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
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
      const response = await API.post('/Auth/login', { email, password });
      console.log('Login response:', response.data);
      
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('userId', response.data.userId);
      sessionStorage.setItem('username', response.data.username);
      
      console.log('Token saved, navigating to /dashboard');
      
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <span className="auth-icon">🎯</span>
        <h1>QuizMaster</h1>
        <p>Test your knowledge and compete with others!</p>
      </div>
      
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
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
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p className="auth-footer">
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default Login;