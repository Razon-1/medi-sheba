// Search keyword: Page Terms Of Service - terms, conditions, and user responsibilities.
import { FileText } from 'lucide-react';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Support.css';

// Main component: renders the terms of service page.
export default function TermsOfService() {
  useSEO(pageMetadata.terms);

  // Page layout: terms sections, service rules, and user responsibilities.
  return (
    <div className="support-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Terms of Service</h1>
          <p>Rules and conditions for using Medi Sheba</p>
        </div>
      </div>

      <div className="support-content">
        <section className="policy-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Medi Sheba platform, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Medi Sheba's platform 
            for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under 
            this license you may not:
          </p>
          <ul className="policy-list">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose, or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the platform</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. User Accounts</h2>
          <p>
            When you create an account with Medi Sheba, you must provide information that is accurate, complete, and current at all times. 
            You are responsible for all activities that occur under your account and you agree to maintain the confidentiality of your account information.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Appointment Booking</h2>
          <p>
            When booking appointments through our platform:
          </p>
          <ul className="policy-list">
            <li>All information provided must be accurate and truthful</li>
            <li>You agree to honor booked appointments</li>
            <li>Cancellations should be made 24 hours in advance</li>
            <li>Fees are non-refundable unless cancelled within the specified timeframe</li>
            <li>Doctors reserve the right to reschedule appointments due to emergencies</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Medical Disclaimer</h2>
          <p>
            Medi Sheba is not a substitute for professional medical advice, diagnosis, or treatment. The services provided through our platform 
            are for facilitating connections between patients and healthcare professionals. Always consult with a qualified healthcare provider 
            regarding any health concerns.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall Medi Sheba, or its suppliers be liable for any damages (including, without limitation, damages for loss of data 
            or profit, or due to business interruption) arising out of the use or inability to use the materials on Medi Sheba's platform, 
            even if Medi Sheba or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Accuracy of Materials</h2>
          <p>
            The materials appearing on Medi Sheba's platform could include technical, typographical, or photographic errors. 
            Medi Sheba does not warrant that any of the materials on its platform are accurate, complete, or current. 
            Medi Sheba may make changes to the materials contained on its platform at any time without notice.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Links</h2>
          <p>
            Medi Sheba has not reviewed all of the sites linked to its platform and is not responsible for the contents of any such linked site. 
            The inclusion of any link does not imply endorsement by Medi Sheba of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section className="policy-section">
          <h2>9. Modifications</h2>
          <p>
            Medi Sheba may revise these terms of service for its platform at any time without notice. By using this platform, you are agreeing 
            to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section className="policy-section">
          <h2>10. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of Bangladesh, and you irrevocably submit 
            to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>

        <section className="policy-section">
          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
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
