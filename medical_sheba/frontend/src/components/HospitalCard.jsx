import { MapPin, Phone, Users, Bed, CheckCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/HospitalCard.css';

export default function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  const getHospitalTypeLabel = (type) => {
    const labels = {
      'government': 'Government Hospital',
      'private': 'Private Hospital',
      'clinic': 'Clinic'
    };
    return labels[type] || type;
  };

  const handleViewDetails = () => {
    navigate(`/hospitals/${hospital.id}`);
  };

  return (
    <div className="hospital-card">
      <div className="hospital-image">
        <img 
          src="https://images.unsplash.com/photo-1587745914519-3e0f623fd1b5?w=400&h=300&fit=crop" 
          alt={hospital.name} 
        />
        {hospital.emergency_available && <div className="hospital-badge">Emergency</div>}
      </div>
      <div className="hospital-info">
        <h3>{hospital.name}</h3>
        <p className="type">{getHospitalTypeLabel(hospital.type)}</p>
        
        <div className="rating-info">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                fill={i < Math.round(hospital.rating) ? '#FFA500' : '#ddd'} 
                color={i < Math.round(hospital.rating) ? '#FFA500' : '#ddd'}
              />
            ))}
          </div>
          <span className="rating">{hospital.rating} ({hospital.review_count} reviews)</span>
        </div>

        <div className="quick-stats">
          <div className="stat">
            <Bed size={16} />
            <span>{hospital.beds_available}/{hospital.beds_total} Beds</span>
          </div>
        </div>

        <div className="contact-info">
          <div className="info-item">
            <MapPin size={14} />
            <span>{hospital.address}, {hospital.district}</span>
          </div>
          <div className="info-item">
            <Phone size={14} />
            <span>{hospital.phone_primary}</span>
          </div>
        </div>

        <button className="btn-view" onClick={handleViewDetails}>View Details</button>
      </div>
    </div>
  );
}
