import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Users, Building2, Droplet, Calendar, CheckCircle, Stethoscope, Clock, Award, Truck, Pill, Bell, MapPin, Search, Check, Zap } from 'lucide-react';
import { useSEO, pageMetadata } from '../utils/seo';
import useAuthStore from '../context/authStore';
import '../styles/pages/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [adminType, setAdminType] = useState('pharmacy');
  const { user } = useAuthStore();
  // Set SEO metadata for this page
  useSEO(pageMetadata.home);
  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+' },
    { icon: Building2, label: 'Hospitals', value: '500+' },
    { icon: Stethoscope, label: 'Doctors', value: '5K+' },
    { icon: Calendar, label: 'Appointments', value: '100K+' },
  ];

  const features = [
    {
      icon: Stethoscope,
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
    {
      icon: Truck,
      title: 'Emergency Ambulance',
      description: 'Get immediate ambulance service with real-time tracking',
      link: '/ambulance'
    },
    {
      icon: Stethoscope,
      title: 'E-Doctor (Telemedicine)',
      description: 'Consult with doctors online from the comfort of your home',
      link: '/edoctor'
    },
    {
      icon: Pill,
      title: 'E-Medicine (Pharmacy)',
      description: 'Order medicines online and get them delivered to your doorstep',
      link: '/emedicine'
    },
  ];

  const pharmacyPlans = [
    {
      name: '3 Days Trial',
      duration: 'Trial Period',
      price: 'Free',
      description: 'Perfect to explore all features',
      features: [
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Advanced inventory management',
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Order processing & management',
        'Delivery tracking system',       
        'Priority support 24/7',
        'Medicine expiry tracking',
        'Automated low stock alerts',
        'Monthly performance reports',
        'Billing & invoice management',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Monthly Plan',
      duration: 'Per Month',
      price: '৳999',
      description: 'Best for growing pharmacies',
      features: [
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Advanced inventory management',
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Order processing & management',
        'Delivery tracking system',       
        'Priority support 24/7',
        'Medicine expiry tracking',
        'Automated low stock alerts',
        'Monthly performance reports',
        'Billing & invoice management',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Yearly Plan',
      duration: 'Per Year',
      price: '৳9,999',
      description: '17% savings on annual plan',
      features: [
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Advanced inventory management',
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Order processing & management',
        'Delivery tracking system',       
        'Priority support 24/7',
        'Medicine expiry tracking',
        'Automated low stock alerts',
        'Monthly performance reports',
        'Billing & invoice management',
      ],
      cta: 'Subscribe Now',
      popular: false,
    },
    {
      name: 'Custom Plan',
      duration: 'Flexible',
      price: 'Custom',
      description: 'Enterprise solutions for chains',
      features: [
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Advanced inventory management',
        'Order processing & management',
        'Delivery tracking system',       
        'Priority support 24/7',
        'Training & onboarding',
        'Medicine expiry tracking',
        'Automated low stock alerts',
        'Monthly performance reports',
        'Billing & invoice management',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const hospitalPlans = [
    {
      name: '3 Days Trial',
      duration: 'Trial Period',
      price: 'Free',
      description: 'Perfect to explore all features',
      features: [
        'Complete hospital admin dashboard',
        'Unlimited doctor profiles',
        'Patient appointment scheduling',
        'Medical records digitization',
        'Priority support 24/7',
        'Billing & invoice management',
        'Monthly performance reports',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Monthly Plan',
      duration: 'Per Month',
      price: '৳1,999',
      description: 'Best for mid-size hospitals',
      features: [
        'Complete hospital admin dashboard',
        'Unlimited doctor profiles',
        'Patient appointment scheduling',
        'Medical records digitization',
        'Priority support 24/7',
        'Billing & invoice management',
        'Monthly performance reports',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Yearly Plan',
      duration: 'Per Year',
      price: '৳19,999',
      description: '17% savings on annual plan',
      features: [
        'Complete hospital admin dashboard',
        'Unlimited doctor profiles',
        'Patient appointment scheduling',
        'Medical records digitization',
        'Priority support 24/7',
        'Billing & invoice management',
        'Monthly performance reports',
      ],
      cta: 'Subscribe Now',
      popular: false,
    },
    {
      name: 'Enterprise Plan',
      duration: 'Flexible',
      price: 'Custom',
      description: 'Complete healthcare solutions',
      features: [
        'Complete hospital admin dashboard',
        'Unlimited doctor profiles',
        'Patient appointment scheduling',
        'Medical records digitization',
        'Priority support 24/7',
        'Billing & invoice management',
        'Advanced analytics & dashboards',
        'Monthly performance reports',
        'Training & onboarding',
      ],
      cta: 'Contact Sales',
      popular: false,
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
            <p>Connect with experienced doctors, find the best hospitals, and manage your health with Medi Sheba</p>
            <div className="hero-buttons">
              <Link to="/doctors" className="btn-primary">Book Appointment Now</Link>
              <Link to="/hospitals" className="btn-secondary">Find Hospital</Link>
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
              <Link key={idx} to={feature.link} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Icon size={48} className="feature-icon" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-link">
                  Explore Now →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="subscription">
        <div className="subscription-header">
          <h2 className="section-title">Subscription Plans</h2>
          <p className="section-subtitle">Choose Your Admin Type</p>
          <p className="section-description">Select tailored plans for your healthcare business</p>
          
          {/* Toggle Between Pharmacy and Hospital Admin */}
          <div className="admin-type-toggle">
            <button 
              className={`toggle-btn ${adminType === 'pharmacy' ? 'active' : ''}`}
              onClick={() => setAdminType('pharmacy')}
            >
              <Pill size={20} />
              <span>Pharmacy Admin</span>
            </button>
            <button 
              className={`toggle-btn ${adminType === 'hospital' ? 'active' : ''}`}
              onClick={() => setAdminType('hospital')}
            >
              <Building2 size={20} />
              <span>Hospital Admin</span>
            </button>
          </div>
        </div>
        
        <div className="subscription-grid">
          {(adminType === 'pharmacy' ? pharmacyPlans : hospitalPlans).map((plan, idx) => (
            <div key={idx} className={`subscription-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && (
                <div className="popular-badge">
                  <Zap size={16} />
                  Most Popular
                </div>
              )}
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-duration">{plan.duration}</p>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
              </div>
              <p className="plan-description">{plan.description}</p>
              <button 
                className={`btn-plan ${plan.popular ? 'btn-popular' : ''}`}
                onClick={() => {
                  if (plan.cta === 'Contact Sales') {
                    navigate('/contact-sales');
                    return;
                  }

                  if (!user) {
                    navigate('/login', { state: { next: '/payment' } });
                    return;
                  }

                  navigate('/payment', { state: { plan } });
                }}
              >
                {plan.cta}
              </button>
              <div className="plan-divider"></div>
              <ul className="features-list">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx}>
                    <Check size={18} className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us">
        <h2 className="section-title">Why Choose Medi Sheba?</h2>
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
          <p>Join thousands of patients who trust Medi Sheba for their healthcare needs</p>
          <Link to="/login" className="btn-primary">Get Started Today</Link>
        </div>
      </section>
    </div>
  );
}
