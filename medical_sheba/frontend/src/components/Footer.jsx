import { Facebook, Twitter, Linkedin, Mail, Phone } from 'lucide-react';
import '../styles/components/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Medical Sheba</h3>
          <p>Professional healthcare management platform for Bangladesh</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/doctors">Doctors</a></li>
            <li><a href="/hospitals">Hospitals</a></li>
            <li><a href="/blood">Blood Bank</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-item">
            <Phone size={18} />
            <span>+880 1700 000000</span>
          </div>
          <div className="contact-item">
            <Mail size={18} />
            <span>support@medicalsheba.com</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Medical Sheba. All rights reserved.</p>
      </div>
    </footer>
  );
}
