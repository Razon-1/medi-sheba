// Search keyword: Page About Us - company information and platform mission.
import { Heart, Users, Target, Award } from 'lucide-react';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Support.css';

export default function AboutUs() {
  useSEO({
    title: 'About Us - Medi Sheba',
    description: 'Learn about Medi Sheba, Bangladesh\'s professional healthcare management platform.',
  });

  return (
    <div className="support-page">
      <div className="page-header">
        <div className="header-content">
          <h1>About Medi Sheba</h1>
        </div>
      </div>

      <div className="support-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Medi Sheba is dedicated to making quality healthcare accessible to every citizen of Bangladesh. 
            We bridge the gap between patients and healthcare professionals through innovative technology solutions.
          </p>
        </section>

        <section className="about-section">
          <h2>Why Choose Medi Sheba?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Heart size={32} />
              <h3>Patient-Centric Approach</h3>
              <p>We prioritize patient safety, comfort, and satisfaction in every service we provide.</p>
            </div>
            <div className="feature-card">
              <Users size={32} />
              <h3>Verified Professionals</h3>
              <p>All doctors and healthcare providers are thoroughly verified and qualified.</p>
            </div>
            <div className="feature-card">
              <Target size={32} />
              <h3>Comprehensive Services</h3>
              <p>From doctors to ambulances, blood bank to e-pharmacy - all in one platform.</p>
            </div>
            <div className="feature-card">
              <Award size={32} />
              <h3>Quality Assurance</h3>
              <p>We maintain the highest standards of healthcare service delivery.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Vision</h2>
          <p>
            To create a seamlessly connected healthcare ecosystem where patients can find reliable medical services, 
            access expert doctors, book appointments, and receive emergency care - all through a single, user-friendly platform.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Services</h2>
          <ul className="services-list">
            <li><strong>Find Doctors:</strong> Browse and consult with qualified medical professionals</li>
            <li><strong>Hospital Directory:</strong> Locate hospitals and medical centers near you</li>
            <li><strong>Appointment Booking:</strong> Easy online scheduling with your preferred doctor</li>
            <li><strong>Blood Bank:</strong> Blood donation and request services</li>
            <li><strong>Ambulance Services:</strong> Emergency medical transportation</li>
            <li><strong>E-Medicine:</strong> Online pharmacy with home delivery</li>
            <li><strong>E-Doctor:</strong> Telemedicine consultations from home</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Our Commitment</h2>
          <p>
            We are committed to transparency, reliability, and continuous improvement. Your health and trust are our 
            top priorities. We work tirelessly to ensure every interaction with Medi Sheba is safe, effective, and beneficial.
          </p>
        </section>
      </div>
    </div>
  );
}
