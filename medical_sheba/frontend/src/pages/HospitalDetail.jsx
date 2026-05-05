import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Users, Bed, Clock, CheckCircle, Star, ArrowLeft, AlertCircle } from 'lucide-react';
import { hospitalsAPI } from '../api/hospitals';
import { doctorsAPI } from '../api/doctors';
import { updateMetaTags } from '../utils/seo';
import '../styles/pages/HospitalDetail.css';

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [doctorCount, setDoctorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHospitalDetails();
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching hospital details for ID:', id);
      
      // Fetch hospital details
      const response = await hospitalsAPI.get(id);
      console.log('Hospital API Response:', response.data);
      const hospitalData = response.data;
      setHospital(hospitalData);
      
      // Fetch doctor count for this hospital
      try {
        const doctorsResponse = await doctorsAPI.list({ hospital: id });
        console.log('Doctors API Response:', doctorsResponse.data);
        const doctors = doctorsResponse.data.results || doctorsResponse.data || [];
        setDoctorCount(Array.isArray(doctors) ? doctors.length : 0);
      } catch (err) {
        console.log('Could not fetch doctor count:', err);
        setDoctorCount(0);
      }
      
      // Set SEO metadata
      console.log('Setting SEO metadata for:', hospitalData.name);
      updateMetaTags({
        title: `${hospitalData.name} - Medi Sheba`,
        description: `${hospitalData.name} in ${hospitalData.district}. ${hospitalData.type}. Emergency: ${hospitalData.emergency_available ? 'Available' : 'Not Available'}`
      });
    } catch (err) {
      console.error('Error fetching hospital details:', err);
      console.error('Error details:', err.message, err.response?.data);
      setError('Failed to load hospital details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getHospitalTypeLabel = (type) => {
    const labels = {
      'government': 'Government Hospital',
      'private': 'Private Hospital',
      'clinic': 'Clinic'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="hospital-detail">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hospital-detail">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/hospitals')} className="btn-primary">
            Back to Hospitals
          </button>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="hospital-detail">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Hospital Not Found</h2>
          <p>The hospital you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/hospitals')} className="btn-primary">
            Back to Hospitals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-detail">
      {/* Back Button */}
      <button onClick={() => navigate('/hospitals')} className="btn-back">
        <ArrowLeft size={20} />
        Back to Hospitals
      </button>

      {/* Header Section */}
      <div className="detail-header">
        <div className="header-image">
          <img 
            src="https://images.unsplash.com/photo-1587745914519-3e0f623fd1b5?w=800&h=400&fit=crop" 
            alt={hospital.name}
          />
          {hospital.emergency_available && (
            <div className="emergency-badge">
              <CheckCircle size={20} />
              Emergency Available 24/7
            </div>
          )}
        </div>

        <div className="header-info">
          <h1>{hospital.name}</h1>
          <p className="hospital-type">{getHospitalTypeLabel(hospital.type)}</p>
          
          <div className="rating-section">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  fill={i < Math.round(hospital.rating) ? '#FFA500' : '#ddd'} 
                  color={i < Math.round(hospital.rating) ? '#FFA500' : '#ddd'}
                />
              ))}
            </div>
            <span className="rating-text">{hospital.rating} ({hospital.review_count} reviews)</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Contact & Quick Info */}
        <section className="contact-section">
          <h2>Contact Information</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <MapPin size={24} />
              <div>
                <h4>Address</h4>
                <p>{hospital.address}</p>
                <p className="location">{hospital.district}, Bangladesh</p>
              </div>
            </div>

            <div className="contact-card">
              <Phone size={24} />
              <div>
                <h4>Primary Phone</h4>
                <p><a href={`tel:${hospital.phone_primary}`}>{hospital.phone_primary}</a></p>
                {hospital.phone_secondary && (
                  <>
                    <h4 style={{ marginTop: '0.5rem' }}>Secondary Phone</h4>
                    <p><a href={`tel:${hospital.phone_secondary}`}>{hospital.phone_secondary}</a></p>
                  </>
                )}
              </div>
            </div>

            {hospital.email && (
              <div className="contact-card">
                <Mail size={24} />
                <div>
                  <h4>Email</h4>
                  <p><a href={`mailto:${hospital.email}`}>{hospital.email}</a></p>
                </div>
              </div>
            )}

            <div className="contact-card">
              <Clock size={24} />
              <div>
                <h4>Visiting Hours</h4>
                {hospital.visiting_hours_start && hospital.visiting_hours_end ? (
                  <>
                    <p>{hospital.visiting_hours_start.substring(0, 5)} - {hospital.visiting_hours_end.substring(0, 5)}</p>
                  </>
                ) : (
                  <p>Check with hospital</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Facilities & Capacity */}
        <section className="facilities-section">
          <h2>Facilities & Capacity</h2>
          <div className="facilities-grid">
            <div className="facility-card">
              <Bed size={32} />
              <div>
                <h4>Total Beds</h4>
                <p className="number">{hospital.beds_total}</p>
              </div>
            </div>

            <div className="facility-card">
              <Bed size={32} />
              <div>
                <h4>Available Beds</h4>
                <p className="number">{hospital.beds_available}</p>
              </div>
            </div>

            <div className="facility-card">
              <Users size={32} />
              <div>
                <h4>Doctors</h4>
                <p className="number">{doctorCount}</p>
              </div>
            </div>

            <div className="facility-card">
              <CheckCircle size={32} />
              <div>
                <h4>Emergency</h4>
                <p className="status">
                  {hospital.emergency_available ? '✓ Available' : '✗ Not Available'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        {hospital.services && hospital.services.trim().length > 0 && (
          <section className="services-section">
            <h2>Services</h2>
            <div className="services-list">
              {hospital.services.split(',').map((service, idx) => (
                <div key={idx} className="service-item">
                  <CheckCircle size={18} />
                  <span>{service.trim()}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About */}
        {hospital.description && hospital.description.trim().length > 0 && (
          <section className="about-section">
            <h2>About</h2>
            <div className="about-content">
              <p>{hospital.description}</p>
            </div>
          </section>
        )}

        {/* Facilities Details */}
        {hospital.special_facilities && hospital.special_facilities.trim().length > 0 && (
          <section className="special-facilities-section">
            <h2>Special Facilities</h2>
            <div className="special-facilities-list">
              {hospital.special_facilities.split(',').map((facility, idx) => (
                <div key={idx} className="facility-item">
                  <CheckCircle size={18} />
                  <span>{facility.trim()}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Need Medical Attention?</h2>
        <p>Schedule an appointment or contact the hospital directly</p>
        <div className="cta-buttons">
          <button 
            onClick={() => navigate('/doctors')} 
            className="btn-primary"
          >
            Find Doctors
          </button>
          <button 
            onClick={() => window.location.href = `tel:${hospital.phone_primary}`}
            className="btn-secondary"
          >
            <Phone size={18} />
            Call Now
          </button>
        </div>
      </section>
    </div>
  );
}
