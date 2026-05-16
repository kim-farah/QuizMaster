import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = sessionStorage.getItem('username');

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '🏠' },
    { path: '/leaderboard', name: 'Leaderboard', icon: '🏆' },
    { path: '/profile', name: ' Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🎯</div>
        <h2>QuizMaster</h2>
        <p className="sidebar-user">👋 {username}</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div onClick={handleLogout} className="sidebar-item logout-item">
          <span className="sidebar-icon">🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;