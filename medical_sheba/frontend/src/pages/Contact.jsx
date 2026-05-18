import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, AlertCircle } from 'lucide-react';
import { useSEO } from '../utils/seo';
import { contactAPI } from '../api/contact';
import '../styles/pages/Support.css';

export default function Contact() {
  useSEO({
    title: 'Contact Us - Medi Sheba',
    description: 'Get in touch with Medi Sheba. We are here to help you with any queries or concerns.',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await contactAPI.submitMessage(formData);

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
      console.error('Error submitting contact form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Contact Us</h1>
        </div>
      </div>

      <div className="support-content">
        <div className="contact-container">
          <div className="contact-info-section">
            <h2>Contact Information</h2>
            
            <div className="contact-card">
              <Mail size={32} />
              <div className="contact-card-content">
                <h3>Email</h3>
                <p>support_medisheba@gmail.com</p>
                <small>We'll respond within 24 hours</small>
              </div>
            </div>

            <div className="contact-card">
              <Phone size={32} />
              <div className="contact-card-content">
                <h3>Phone</h3>
                <p>+880 1322458732</p>
                <small>Available 24/7 for emergencies</small>
              </div>
            </div>

            <div className="contact-card">
              <MessageCircle size={32} />
              <div className="contact-card-content">
                <h3>WhatsApp</h3>
                <p>+880 1322458732</p>
                <small>Quick support via WhatsApp</small>
              </div>
            </div>

            <div className="contact-card">
              <MapPin size={32} />
              <div className="contact-card-content">
                <h3>Location</h3>
                <p>Dhaka, Bangladesh</p>
                <small>Nationwide service coverage</small>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            
            {submitted && (
              <div className="success-message">
                ✓ Thank you for your message! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.15))',
                borderLeft: '4px solid #ef4444',
                color: '#991b1b',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+880 1xxxxxxxxx"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Tell us more about your concern..."
                  rows="5"
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                <Send size={18} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-item">
            <h3>How do I book an appointment?</h3>
            <p>
              Visit our Doctors page, select your preferred doctor, and click "Book Appointment". Fill in your details 
              and confirm to complete the booking.
            </p>
          </div>
          <div className="faq-item">
            <h3>Can I cancel or reschedule my appointment?</h3>
            <p>
              Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time. 
              Visit "My Appointments" to manage your bookings.
            </p>
          </div>
          <div className="faq-item">
            <h3>Is my personal information safe?</h3>
            <p>
              Absolutely. We use advanced encryption and security measures to protect your personal and medical information. 
              Please read our Privacy Policy for more details.
            </p>
          </div>
          <div className="faq-item">
            <h3>How does E-Doctor work?</h3>
            <p>
              E-Doctor allows you to consult with doctors online from the comfort of your home. Book a video or audio 
              consultation and connect with a qualified healthcare professional.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
