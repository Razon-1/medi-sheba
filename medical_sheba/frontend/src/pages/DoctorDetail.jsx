// Search keyword: Page Doctor Detail - doctor profile, reviews, and booking.
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Phone, MapPin, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { doctorsAPI } from '../api/doctors';
import { reviewsAPI } from '../api/reviews';
import useAuthStore from '../context/authStore';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { useSEO, pageMetadata, updateMetaTags } from '../utils/seo';
import '../styles/pages/DoctorDetail.css';

// Main component: renders a single doctor's profile page.
export default function DoctorDetail() {
  useSEO(pageMetadata.doctorDetail);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const userRoles = user?.roles || [];
  const isPatientUser = userRoles.includes('patient')
    && !userRoles.some((role) => ['pharmacy_admin', 'hospital_admin', 'ambulance_driver_admin', 'doctor', 'admin'].includes(role));
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch doctor details
      const doctorResponse = await doctorsAPI.get(id);
      const doctorData = doctorResponse.data;
      setDoctor(doctorData);
      updateMetaTags({
        title: `Dr. ${doctorData.user?.first_name || doctorData.first_name || doctorData.name || 'Doctor'} ${doctorData.user?.last_name || doctorData.last_name || ''} | Medi Sheba`,
        description: `View ${doctorData.specialty || doctorData.specialization || 'doctor'} profile, consultation details, reviews, and appointment options on Medi Sheba.`,
        keywords: `doctor profile, ${doctorData.specialty || doctorData.specialization || 'doctor'}, appointment, Medi Sheba`,
        ogUrl: `https://medisheba.bd/doctors/${id}`
      });

      // Fetch reviews
      const reviewsResponse = await reviewsAPI.getByDoctor(id);
      const reviewsList = reviewsResponse.data.results || reviewsResponse.data || [];
      setReviews(Array.isArray(reviewsList) ? reviewsList : []);

      // Check if user already has a review
      if (isPatientUser && user) {
        const existingReview = reviewsList.find(r => r.patient === user.id);
        if (existingReview) {
          setUserReview(existingReview);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      setError('Failed to load doctor details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = async () => {
    // Refresh reviews
    await fetchDoctorDetails();
    setShowReviewForm(false);
  };

  const getSpecialtyLabel = (specialty) => {
    return specialty || 'General Practitioner';
  };

  if (loading) {
    return (
      <div className="doctor-detail">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-detail">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/doctors')} className="btn-primary">
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-detail">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Doctor Not Found</h2>
          <p>The doctor you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/doctors')} className="btn-primary">
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  // Page layout: doctor profile, booking action, review form, and review list.
  return (
    <div className="doctor-detail">
      {/* Back Button */}
      <button onClick={() => navigate('/doctors')} className="btn-back">
        <ArrowLeft size={20} />
        Back to Doctors
      </button>

      {/* Header Section */}
      <div className="detail-header">
        <div className="header-right">
          <h1>Dr. {doctor.user.first_name} {doctor.user.last_name}</h1>
          <p className="specialty">{getSpecialtyLabel(doctor.specialty)}</p>

          {doctor.subspecialty && (
            <p className="subspecialty">{doctor.subspecialty}</p>
          )}

          <div className="rating-section">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i < Math.round(doctor.rating) ? '#FFA500' : '#ddd'}
                  color={i < Math.round(doctor.rating) ? '#FFA500' : '#ddd'}
                />
              ))}
            </div>
            <span className="rating-text">
              {doctor.rating || 'No'} rating ({doctor.review_count} reviews)
            </span>
          </div>

          <div className="badges">
            {doctor.is_verified && (
              <span className="badge verified">
                <CheckCircle size={16} />
                Verified Doctor
              </span>
            )}
            {doctor.is_available && (
              <span className="badge available">
                <CheckCircle size={16} />
                Available
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Quick Info Cards */}
        <section className="quick-info">
          <div className="info-card">
            <BookOpen size={24} />
            <div>
              <h4>Experience</h4>
              <p>{doctor.experience_years}+ years</p>
            </div>
          </div>

          <div className="info-card">
            <Phone size={24} />
            <div>
              <h4>Consultation Fee</h4>
              <p>৳{doctor.consultation_fee}</p>
            </div>
          </div>

          {doctor.follow_up_fee && (
            <div className="info-card">
              <Phone size={24} />
              <div>
                <h4>Follow-up Fee</h4>
                <p>৳{doctor.follow_up_fee}</p>
              </div>
            </div>
          )}

          <div className="info-card">
            <Clock size={24} />
            <div>
              <h4>Availability</h4>
              {doctor.available_days ? (
                <>
                  <p>{doctor.available_days}</p>
                  {doctor.available_time_start && (
                    <p className="time">
                      {doctor.available_time_start.substring(0, 5)} - {doctor.available_time_end.substring(0, 5)}
                    </p>
                  )}
                </>
              ) : (
                <p>Check hospital for hours</p>
              )}
            </div>
          </div>
        </section>

        {/* Bio & Qualifications */}
        {doctor.bio && (
          <section className="bio-section">
            <h2>About Dr. {doctor.user.first_name}</h2>
            <p>{doctor.bio}</p>
          </section>
        )}

        {doctor.qualifications && (
          <section className="qualifications-section">
            <h2>Qualifications</h2>
            <p>{doctor.qualifications}</p>
          </section>
        )}

        {doctor.chamber_address && (
          <section className="chamber-section">
            <h2>Chamber Address</h2>
            <div className="chamber-info">
              <MapPin size={20} />
              <p>{doctor.chamber_address}</p>
            </div>
          </section>
        )}

        {doctor.languages && (
          <section className="languages-section">
            <h2>Languages</h2>
            <p>{doctor.languages}</p>
          </section>
        )}

        {/* Reviews Section */}
        <section className="reviews-section">
          <div className="reviews-header">
            <h2>Patient Reviews ({reviews.length})</h2>
            {isPatientUser && !userReview && (
              <button
                className="btn-review-action"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>

          {showReviewForm && isPatientUser && (
            <ReviewForm
              doctorId={id}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          {isAuthenticated && !isPatientUser && (
            <div className="no-reviews">
              <p>Only patient accounts can write doctor reviews.</p>
            </div>
          )}

          {reviews.length > 0 ? (
            <ReviewList reviews={reviews} doctorId={id} onReviewMarkedHelpful={() => fetchDoctorDetails()} />
          ) : (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this doctor!</p>
            </div>
          )}
        </section>
      </div>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Book an Appointment?</h2>
        <p>Schedule your consultation with Dr. {doctor.user.first_name}</p>
        <button
          className="btn-primary btn-large"
          onClick={() => setShowAppointmentModal(true)}
        >
          Book Appointment
        </button>
      </section>

      <BookAppointmentModal
        doctor={{
          ...doctor,
          user_name: `${doctor.user.first_name} ${doctor.user.last_name}`,
          name: `${doctor.user.first_name} ${doctor.user.last_name}`,
        }}
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />
    </div>
  );
}
