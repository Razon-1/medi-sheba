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

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo Section - Left */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <img src="/logo.png" alt="Medi Sheba" className="logo-image" />
          <span className="logo-text">Medi Sheba</span>
        </Link>

        {/* Mobile Toggle */}
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center Menu */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/doctors" className="nav-link" onClick={closeMenu}>
              Doctors
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/hospitals" className="nav-link" onClick={closeMenu}>
              Hospitals
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/blood" className="nav-link" onClick={closeMenu}>
              Blood Bank
            </Link>
          </li>
          {user && (
            <li className="nav-item">
              <Link to="/appointments" className="nav-link" onClick={closeMenu}>
                My Appointments
              </Link>
            </li>
          )}

          {/* Mobile Auth Section - Inside Menu */}
          <li className="nav-auth-mobile">
            {user ? (
              <div className="user-section-mobile">
                <span className="user-name-mobile">{user.name || user.email}</span>
                <button onClick={() => { handleLogout(); closeMenu(); }} className="btn-logout-mobile">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons-mobile">
                <Link to="/login" className="btn-login-mobile" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn-register-mobile" onClick={closeMenu}>
                  Register
                </Link>
              </div>
            )}
          </li>
        </ul>

        {/* Auth Section - Right (Desktop Only) */}
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
