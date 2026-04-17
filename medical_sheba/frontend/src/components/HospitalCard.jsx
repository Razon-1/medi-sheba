import { MapPin, Phone, Users, Bed, CheckCircle } from 'lucide-react';
import '../styles/components/HospitalCard.css';

export default function HospitalCard({ hospital }) {
  return (
    <div className="hospital-card">
      <div className="hospital-image">
        <img src={hospital.image} alt={hospital.name} />
        <div className="hospital-badge">Premium</div>
      </div>
      <div className="hospital-info">
        <h3>{hospital.name}</h3>
        <p className="type">{hospital.type}</p>
        
        <div className="quick-stats">
          <div className="stat">
            <Users size={16} />
            <span>{hospital.doctors_count} Doctors</span>
          </div>
          <div className="stat">
            <Bed size={16} />
            <span>{hospital.beds} Beds</span>
          </div>
        </div>

        <div className="contact-info">
          <div className="info-item">
            <MapPin size={14} />
            <span>{hospital.address}</span>
          </div>
          <div className="info-item">
            <Phone size={14} />
            <span>{hospital.phone}</span>
          </div>
        </div>

        <div className="services-section">
          <h4>Services</h4>
          <div className="services-list">
            {hospital.services?.slice(0, 3).map((service, idx) => (
              <span key={idx} className="service-tag">
                <CheckCircle size={12} />
                {service}
              </span>
            ))}
          </div>
        </div>

        <button className="btn-view">View Details</button>
      </div>
    </div>
  );
}
