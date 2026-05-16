import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const token = sessionStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          token ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/leaderboard" element={
          token ? <Layout><Leaderboard /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/profile" element={
          token ? <Layout><Profile /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/quiz/:categoryId" element={
          token ? <Layout><Quiz /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/results/:sessionId" element={
          token ? <Layout><Results /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;