import React from 'react';
import '../styles/pages/ContactSales.css';

export default function ContactSales() {
  return (
    <div className="contact-sales-page">
      <div className="contact-card">
        <h2>Contact Info</h2>
        <ul className="contact-list">
          <li>
            <strong>Phone:</strong>
            <a href="tel:+8801322458732">+880 1322458732</a>
          </li>
          <li>
            <strong>WhatsApp:</strong>
            <a href="https://wa.me/8801322458732" target="_blank" rel="noreferrer">+880 1322458732</a>
          </li>
          <li>
            <strong>Email:</strong>
            <a href="mailto:support.medisheba@gmail.com">support.medisheba@gmail.com</a>
          </li>
        </ul>
        <div className="contact-note">
          <p>If you'd like a custom plan or enterprise pricing, please contact our sales team and we'll get back to you shortly.</p>
        </div>
      </div>
    </div>
  );
}
