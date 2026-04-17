import { MapPin, Phone, Users } from 'lucide-react';
import '../styles/components/HospitalCard.css';

export default function HospitalCard({ hospital }) {
  return (
    <div className="hospital-card">
      <div className="hospital-image">
        <img src={hospital.image || 'https://via.placeholder.com/300'} alt={hospital.name} />
      </div>
      <div className="hospital-info">
        <h3>{hospital.name}</h3>
        <p className="type">{hospital.type}</p>
        <div className="contact-info">
          <div className="info-item">
            <MapPin size={14} />
            <span>{hospital.address}</span>
          </div>
          <div className="info-item">
            <Phone size={14} />
            <span>{hospital.phone}</span>
          </div>
          <div className="info-item">
            <Users size={14} />
            <span>{hospital.doctors_count} Doctors</span>
          </div>
        </div>
        <button className="btn-view">View Details</button>
      </div>
    </div>
  );
}
