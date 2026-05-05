import { Shield } from 'lucide-react';
import { useSEO } from '../utils/seo';
import '../styles/pages/Support.css';

export default function PrivacyPolicy() {
  useSEO({
    title: 'Privacy Policy - Medi Sheba',
    description: 'Read our privacy policy to understand how we protect your personal and medical information.',
  });

  return (
    <div className="support-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Privacy Policy</h1>
          <p>How we protect your information</p>
        </div>
      </div>

      <div className="support-content">
        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            Medi Sheba ("we", "us", "our") operates the platform. This page informs you of our policies regarding the 
            collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes:</p>
          <ul className="policy-list">
            <li><strong>Personal Data:</strong> Name, email address, phone number, address</li>
            <li><strong>Medical Information:</strong> Health records, appointment history, medical conditions</li>
            <li><strong>Technical Data:</strong> IP address, browser type, pages visited, time spent on pages</li>
            <li><strong>Payment Information:</strong> Processed securely through authorized payment gateways</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Use of Data</h2>
          <p>Medi Sheba uses the collected data for various purposes:</p>
          <ul className="policy-list">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features of our platform</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so we can improve our service</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Medical Privacy</h2>
          <p>
            Your medical information is treated with the highest level of confidentiality and security. We comply with 
            all healthcare data protection regulations. Your health records are accessible only to authorized medical professionals.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Security of Data</h2>
          <p>
            The security of your data is important to us but remember that no method of transmission over the Internet or method 
            of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, 
            we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
            on this page and updating the "Last Updated" date at the bottom of this Privacy Policy.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="contact-info">
            <p>📧 support_medisheba@gmail.com</p>
            <p>📱 +880 1322458732</p>
          </div>
        </section>

        <p className="last-updated">Last Updated: May 5, 2026</p>
      </div>
    </div>
  );
}
