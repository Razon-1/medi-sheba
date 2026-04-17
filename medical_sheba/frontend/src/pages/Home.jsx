import { Link } from 'react-router-dom';
import { Users, Building2, Droplet, Calendar } from 'lucide-react';
import '../styles/pages/Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Medical Sheba</h1>
          <p>Your trusted healthcare management platform</p>
          <button className="btn-hero">
            <Link to="/doctors">Get Started</Link>
          </button>
        </div>
      </section>

      <section className="features">
        <h2>Our Services</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Users size={48} className="feature-icon" />
            <h3>Find Doctors</h3>
            <p>Browse and book appointments with qualified doctors</p>
            <Link to="/doctors" className="feature-link">Explore →</Link>
          </div>
          <div className="feature-card">
            <Building2 size={48} className="feature-icon" />
            <h3>Hospitals</h3>
            <p>Discover hospitals near you with complete information</p>
            <Link to="/hospitals" className="feature-link">Explore →</Link>
          </div>
          <div className="feature-card">
            <Droplet size={48} className="feature-icon" />
            <h3>Blood Bank</h3>
            <p>Find blood donors and manage blood bank requests</p>
            <Link to="/blood" className="feature-link">Explore →</Link>
          </div>
          <div className="feature-card">
            <Calendar size={48} className="feature-icon" />
            <h3>Appointments</h3>
            <p>Manage your medical appointments easily</p>
            <Link to="/appointments" className="feature-link">Explore →</Link>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Book an Appointment?</h2>
        <p>Find the best doctors and hospitals in Bangladesh</p>
        <button className="btn-cta">
          <Link to="/doctors">Book Now</Link>
        </button>
      </section>
    </div>
  );
}
