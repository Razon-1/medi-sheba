import { Link } from 'react-router-dom';
import { Users, Building2, Droplet, Calendar, CheckCircle, Stethoscope, Clock, Award } from 'lucide-react';
import '../styles/pages/Home.css';

export default function Home() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+' },
    { icon: Building2, label: 'Hospitals', value: '500+' },
    { icon: Stethoscope, label: 'Doctors', value: '5K+' },
    { icon: Calendar, label: 'Appointments', value: '100K+' },
  ];

  const features = [
    {
      icon: Users,
      title: 'Find Expert Doctors',
      description: 'Browse and connect with qualified doctors across all specialties',
      link: '/doctors'
    },
    {
      icon: Building2,
      title: 'Search Hospitals',
      description: 'Discover world-class healthcare facilities near you',
      link: '/hospitals'
    },
    {
      icon: Droplet,
      title: 'Blood Bank',
      description: 'Find blood donors and manage emergency requests',
      link: '/blood'
    },
    {
      icon: Calendar,
      title: 'Book Appointments',
      description: 'Schedule appointments with just a few clicks',
      link: '/appointments'
    },
  ];

  const benefits = [
    { icon: Clock, text: '24/7 Availability' },
    { icon: CheckCircle, text: 'Verified Professionals' },
    { icon: Award, text: 'Top-rated Service' },
    { icon: Users, text: 'Expert Community' },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Your Trusted Healthcare Partner</h1>
            <p>Connect with experienced doctors, find the best hospitals, and manage your health with Medical Sheba</p>
            <div className="hero-buttons">
              <button className="btn-primary">
                <Link to="/doctors">Book Appointment Now</Link>
              </button>
              <button className="btn-secondary">
                <Link to="/hospitals">Find Hospital</Link>
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="medical-illustration">
              <Stethoscope size={80} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <h2 className="section-title">Trusted by Millions</h2>
        <div className="stats-grid">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="stat-card">
                <Icon size={40} className="stat-icon" />
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="services-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Comprehensive healthcare solutions at your fingertips</p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Icon size={48} className="feature-icon" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link to={feature.link} className="feature-link">
                  Explore Now →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us">
        <h2 className="section-title">Why Choose Medical Sheba?</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="benefit-item">
                <Icon size={32} className="benefit-icon" />
                <p>{benefit.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of patients who trust Medical Sheba for their healthcare needs</p>
          <button className="btn-primary">
            <Link to="/doctors">Get Started Today</Link>
          </button>
        </div>
      </section>
    </div>
  );
}
