// Search keyword: Page Home - landing dashboard and main service links.
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Users, Building2, Droplet, CheckCircle, Stethoscope, Clock, Award, Truck, Pill, Bell, MapPin, Search, Check, Zap } from 'lucide-react';
import { useSEO, pageMetadata } from '../utils/seo';
import useAuthStore from '../context/authStore';
import paymentsAPI from '../api/payments';
import client from '../api/client';
import '../styles/pages/Home.css';

// Main component: renders the home page and main service entry points.
export default function Home() {
  const navigate = useNavigate();
  const [adminType, setAdminType] = useState('pharmacy');
  const [paymentStarting, setPaymentStarting] = useState(null);
  const [homeStats, setHomeStats] = useState({
    active_users: null,
    hospitals: null,
    doctors: null,
  });
  const { user } = useAuthStore();
  // Set SEO metadata for this page
  useSEO(pageMetadata.home);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeStats = async () => {
      try {
        const response = await client.get('/users/home_stats/');
        if (isMounted) {
          setHomeStats(response.data);
        }
      } catch (err) {
        console.error('Failed to load home stats:', err);
      }
    };

    fetchHomeStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatStatValue = (value) => {
    if (typeof value !== 'number') return '-';
    return `${Math.max(0, value - 1).toLocaleString()}+`;
  };

  const stats = [
    { icon: Users, label: 'Active Users', value: formatStatValue(homeStats.active_users) },
    { icon: Building2, label: 'Hospitals', value: formatStatValue(homeStats.hospitals) },
    { icon: Stethoscope, label: 'Doctors', value: formatStatValue(homeStats.doctors) },
  ];

    // Service cards: each `link` controls where the matching homepage card navigates.
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

  // Subscription plans: pharmacy admin pricing, trial route, paid checkout amount, and feature list.
  const pharmacyPlans = [
    {
      name: '3 Days Trial',
      duration: 'Trial Period',
      price: 'Free',
      description: 'Perfect to explore all features',
      isTrial: true,
      next: '/pharmacy-admin',
      features: [
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Advanced inventory management',
        'Unlimited medicine listings',
        'Full pharmacy admin dashboard',
        'Order processing & management',
        'Delivery tracking system',       
        'Priority support 24/7',
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
      priceAmount: 999,
      durationKey: 'monthly',
      backendPlan: 'professional',
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
        'Monthly performance reports',
        'Billing & invoice management',
      ],
      cta: 'Get Started',
      popular: true,
      next: '/pharmacy-admin',
    },
    {
      name: 'Yearly Plan',
      duration: 'Per Year',
      price: '৳9,999',
      priceAmount: 9999,
      durationKey: 'annual',
      backendPlan: 'professional',
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
        'Monthly performance reports',
        'Billing & invoice management',
      ],
      cta: 'Subscribe Now',
      popular: false,
      next: '/pharmacy-admin',
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
        'Monthly performance reports',
        'Billing & invoice management',
      ],
      cta: 'Contact Sales',
      popular: false,
      next: '/contact-sales',
    },
  ];

  // Subscription plans: hospital admin pricing, creation route, paid checkout amount, and feature list.
  const hospitalPlans = [
    {
      name: '3 Days Trial',
      duration: 'Trial Period',
      price: 'Free',
      description: 'Perfect to explore all features',
      isTrial: true,
      next: '/hospital-create',
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
      priceAmount: 1999,
      durationKey: 'monthly',
      backendPlan: 'professional',
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
      next: '/hospital-create',
    },
    {
      name: 'Yearly Plan',
      duration: 'Per Year',
      price: '৳19,999',
      priceAmount: 19999,
      durationKey: 'annual',
      backendPlan: 'professional',
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
      next: '/hospital-create',
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
      next: '/contact-sales',
    },
  ];

  // Subscription plans: ambulance driver admin pricing, admin route, paid checkout amount, and feature list.
  const ambulancePlans = [
    {
      name: '3 Days Trial',
      duration: 'Trial Period',
      price: 'Free',
      description: 'Open your ambulance service and test requests',
      isTrial: true,
      next: '/ambulance-admin',
      features: [
        'Ambulance driver admin dashboard',
        'Create and update ambulance listings',
        'Control availability and service details',
        'View assigned ambulance requests',
        'Update request status from accepted to completed',
        'Revenue review from paid/completed requests',
        'Priority support 24/7',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Monthly Plan',
      duration: 'Per Month',
      price: '৳1,499',
      priceAmount: 1499,
      durationKey: 'monthly',
      backendPlan: 'professional',
      description: 'Best for independent ambulance operators',
      next: '/ambulance-admin',
      features: [
        'Ambulance driver admin dashboard',
        'Create and update ambulance listings',
        'Control availability and service details',
        'View assigned ambulance requests',
        'Update request status from accepted to completed',
        'Revenue review from paid/completed requests',
        'Priority support 24/7',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Yearly Plan',
      duration: 'Per Year',
      price: '৳14,999',
      priceAmount: 14999,
      durationKey: 'annual',
      backendPlan: 'professional',
      description: 'Save with annual ambulance service access',
      next: '/ambulance-admin',
      features: [
        'Ambulance driver admin dashboard',
        'Create and update ambulance listings',
        'Control availability and service details',
        'View assigned ambulance requests',
        'Update request status from accepted to completed',
        'Revenue review from paid/completed requests',
        'Priority support 24/7',
      ],
      cta: 'Subscribe Now',
      popular: false,
    },
    {
      name: 'Fleet Plan',
      duration: 'Flexible',
      price: 'Custom',
      description: 'For ambulance fleets and service companies',
      next: '/contact-sales',
      features: [
        'Multi-ambulance fleet management',
        'Request tracking and dispatch support',
        'Custom onboarding and training',
        'Priority support 24/7',
        'Monthly performance reports',
        'Billing & invoice management',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  // Subscription toggle uses this map to show the correct plan cards for the selected admin type.
  const plansByAdminType = {
    pharmacy: pharmacyPlans,
    hospital: hospitalPlans,
    ambulance: ambulancePlans,
  };

  const benefits = [
    { icon: Clock, text: '24/7 Availability' },
    { icon: CheckCircle, text: 'Verified Professionals' },
    { icon: Award, text: 'Top-rated Service' },
    { icon: Users, text: 'Expert Community' },
  ];

  // Subscription CTA flow: contact plans go to sales, trials go to admin pages, and paid plans open SSLCommerz.
  const handlePlanClick = async (plan, planKey) => {
    if (plan.cta === 'Contact Sales') {
      navigate('/contact-sales');
      return;
    }

    if (!user) {
      navigate('/login', { state: { next: plan.next || '/' } });
      return;
    }

    if (plan.isTrial || !plan.priceAmount) {
      navigate(plan.next || '/');
      return;
    }

    try {
      setPaymentStarting(planKey);
      const subscription = await paymentsAPI.createSubscription({
        plan: plan.backendPlan || 'professional',
        duration: plan.durationKey || 'monthly',
        amount: plan.priceAmount,
      });
      const checkout = await paymentsAPI.initiateSSLCommerzPayment({
        amount: subscription.amount || plan.priceAmount,
        payment_type: 'subscription',
        reference_type: 'subscription',
        reference_id: subscription.subscription_id,
      });
      window.location.href = checkout.gateway_url;
    } catch (err) {
      alert(err.detail || err.message || 'Failed to start SSLCommerz payment');
      setPaymentStarting(null);
    }
  };

  // Page layout: hero, service sections, featured content, admin links, and calls to action.
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

      {/* Subscription Plans Section: renders admin-type toggle and subscription cards from plansByAdminType. */}
      <section className="subscription" id="subscription-plans">
        <div className="subscription-header">
          <h2 className="section-title">Subscription Plans</h2>
          <p className="section-subtitle">Choose Your Admin Type</p>
          <p className="section-description">Select tailored plans for your healthcare business</p>
          
          {/* Subscription admin-type toggle: switches between pharmacy, hospital, and ambulance plan data. */}
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
            <button 
              className={`toggle-btn ${adminType === 'ambulance' ? 'active' : ''}`}
              onClick={() => setAdminType('ambulance')}
            >
              <Truck size={20} />
              <span>Ambulance Driver Admin</span>
            </button>
          </div>
        </div>
        
        {/* Subscription card list: each button calls handlePlanClick with the selected plan. */}
        <div className="subscription-grid">
          {plansByAdminType[adminType].map((plan, idx) => {
            const planKey = `${adminType}-${idx}`;

            return (
            <div key={planKey} className={`subscription-card ${plan.popular ? 'popular' : ''}`}>
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
                onClick={() => handlePlanClick(plan, planKey)}
                disabled={Boolean(paymentStarting)}
              >
                {paymentStarting === planKey ? 'Opening SSLCommerz...' : plan.cta}
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
          );
          })}
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
