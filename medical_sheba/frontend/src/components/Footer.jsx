import { Facebook, MessageCircle, Mail, Phone } from 'lucide-react';
import '../styles/components/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = '01322458732';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Medi Sheba</h3>
          <p>Professional healthcare management platform for Bangladesh</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/doctors">Find Doctors</a></li>
            <li><a href="/hospitals">Hospitals</a></li>
            <li><a href="/appointments">My Appointments</a></li>
            <li><a href="/blood">Blood Bank</a></li>
            <li><a href="/ambulance">Ambulance</a></li>
            <li><a href="/emedicine">E-Medicine</a></li>
            <li><a href="/edoctor">E-Doctor</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-item">
            <Phone size={18} />
            <span>+880 1322458732</span>
          </div>
          <div className="contact-item">
            <MessageCircle size={18} />
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              WhatsApp: +880 1322458732
            </a>
          </div>
          <div className="contact-item">
            <Mail size={18} />
            <span>support.medisheba@gmail.com</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Medi Sheba. All rights reserved.</p>
      </div>
    </footer>
  );
}
