import { Star, MapPin, Phone } from 'lucide-react';
import '../styles/components/DoctorCard.css';

export default function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card">
      <div className="doctor-image">
        <img src={doctor.image || 'https://via.placeholder.com/300'} alt={doctor.name} />
      </div>
      <div className="doctor-info">
        <h3>{doctor.name}</h3>
        <p className="specialty">{doctor.specialty}</p>
        <div className="rating">
          <Star size={16} className="star-filled" />
          <span>{doctor.rating || 4.5}</span>
        </div>
        <div className="contact-info">
          <div className="info-item">
            <Phone size={14} />
            <span>{doctor.phone}</span>
          </div>
          <div className="info-item">
            <MapPin size={14} />
            <span>{doctor.location}</span>
          </div>
        </div>
        <button className="btn-appointment">Book Appointment</button>
      </div>
    </div>
  );
}
