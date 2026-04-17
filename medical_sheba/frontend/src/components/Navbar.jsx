import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../context/authStore';
import '../styles/components/Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo Section - Left */}
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="Medi Sheba" className="logo-image" />
          <span className="logo-text">Medical Sheba</span>
        </Link>

        {/* Mobile Toggle */}
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center Menu */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/doctors" className="nav-link">
              Doctors
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/hospitals" className="nav-link">
              Hospitals
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/blood" className="nav-link">
              Blood Bank
            </Link>
          </li>
          {user && (
            <li className="nav-item">
              <Link to="/appointments" className="nav-link">
                My Appointments
              </Link>
            </li>
          )}
        </ul>

        {/* Auth Section - Right */}
        <div className="nav-auth">
          {user ? (
            <div className="user-section">
              <span className="user-name">{user.name || user.email}</span>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
