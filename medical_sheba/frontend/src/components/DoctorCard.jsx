import { Star, MapPin, Phone, Award, Clock } from 'lucide-react';
import '../styles/components/DoctorCard.css';

export default function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card">
      <div className="doctor-image">
        <img src={doctor.image} alt={doctor.name} />
        <div className="badge">Verified</div>
      </div>
      <div className="doctor-info">
        <h3>{doctor.name}</h3>
        <p className="specialty">{doctor.specialty}</p>
        <p className="qualification">{doctor.qualification}</p>
        
        <div className="rating-section">
          <div className="rating">
            <Star size={16} className="star-filled" />
            <span className="rating-value">{doctor.rating}</span>
            <span className="reviews">({doctor.reviews} reviews)</span>
          </div>
        </div>

        <div className="experience">
          <Clock size={16} />
          <span>{doctor.experience} experience</span>
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
