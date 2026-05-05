import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Award, Clock } from 'lucide-react';
import BookAppointmentModal from './BookAppointmentModal';
import '../styles/components/DoctorCard.css';

export default function DoctorCard({ doctor, onAppointmentBooked }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const doctorName = doctor.user_name ? `Dr. ${doctor.user_name}` : (doctor.user ? `Dr. ${doctor.user.first_name} ${doctor.user.last_name}` : doctor.name);
  const phone = doctor.user?.phone || doctor.phone || 'N/A';
  const hospitalName = doctor.hospital?.name || doctor.hospital_name || 'Multi-specialty Hospital';
  
  const handleViewDetails = () => {
    navigate(`/doctors/${doctor.id}`);
  };
  
  return (
    <>
      <div className="doctor-card">
        <div className="doctor-image">
          <img 
            src="https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=300&h=300&fit=crop" 
            alt={doctorName} 
          />
          {doctor.is_verified && <div className="badge">Verified</div>}
        </div>
        <div className="doctor-info">
          <h3>{doctorName}</h3>
          <p className="specialty">{doctor.specialty}</p>
          <p className="qualification">{doctor.qualifications}</p>
          
          <div className="rating-section">
            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.round(doctor.rating) ? '#FFA500' : '#ddd'} 
                  color={i < Math.round(doctor.rating) ? '#FFA500' : '#ddd'}
                />
              ))}
              <span className="rating-value">{doctor.rating}</span>
              <span className="reviews">({doctor.review_count} reviews)</span>
            </div>
          </div>

          <div className="experience">
            <Clock size={16} />
            <span>{doctor.experience_years} years experience</span>
          </div>

          <div className="contact-info">
            <div className="info-item">
              <Phone size={14} />
              <span>{phone}</span>
            </div>
            <div className="info-item">
              <MapPin size={14} />
              <span>{hospitalName}</span>
            </div>
          </div>

          <div className="consultation-fee">
            <strong>Fee: BDT {doctor.consultation_fee}</strong>
          </div>

          <div className="doctor-card-actions">
            <button 
              className="btn-details"
              onClick={handleViewDetails}
            >
              View Details & Reviews
            </button>
            <button 
              className="btn-appointment"
              onClick={() => setIsModalOpen(true)}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      <BookAppointmentModal 
        doctor={doctor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(data) => {
          if (onAppointmentBooked) {
            onAppointmentBooked(data);
          }
        }}
      />
    </>
  );
}
