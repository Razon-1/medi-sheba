import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Clock } from 'lucide-react';
import BookAppointmentModal from './BookAppointmentModal';
import { resolveImageUrl } from '../utils/images';

export default function DoctorCard({ doctor, onAppointmentBooked }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const doctorName = doctor.user_name ? `Dr. ${doctor.user_name}` : (doctor.user ? `Dr. ${doctor.user.first_name} ${doctor.user.last_name}` : doctor.name);
  const phone = doctor.phone || doctor.phone_number || doctor.user?.phone || 'N/A';
  const hospitalName = doctor.hospital?.name || doctor.hospital_name || 'Multi-specialty Hospital';
  const rating = Number(doctor.rating) || 0;
  const fallbackImage = "https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=300&h=300&fit=crop";
  
  const formatTime = (time) => {
    if (!time) return 'N/A';
    if (typeof time === 'string') {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    }
    return time;
  };

  const getAvailabilityText = () => {
    if (!doctor.available_time_start || !doctor.available_time_end) {
      return 'Check with hospital';
    }
    return `${formatTime(doctor.available_time_start)} - ${formatTime(doctor.available_time_end)}`;
  };
  
  const handleViewDetails = () => {
    navigate(`/doctors/${doctor.id}`);
  };
  
  return (
    <>
      <div className="group card overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-48 sm:h-56">
          <img 
            src={resolveImageUrl(doctor.image_url, fallbackImage)} 
            alt={doctorName}
            onError={(e) => e.target.src = fallbackImage}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Experience Badge */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
            <p className="text-sm font-bold text-gray-900">{doctor.experience_years}+ Yrs</p>
            <p className="text-xs text-gray-600">Experience</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="card-body p-5 sm:p-6 flex-1 flex flex-col gap-4">
          
          {/* Doctor Name & Specialty */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {doctorName}
            </h3>
            <p className="text-sm text-primary-600 font-semibold">{doctor.specialty}</p>
            <p className="text-xs text-gray-600 mt-1">{doctor.qualifications}</p>
          </div>

          {/* Rating Section */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < Math.round(rating) ? '#fbbf24' : '#e5e7eb'}
                  color={i < Math.round(rating) ? '#fbbf24' : '#e5e7eb'}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-600">({doctor.review_count || 0} reviews)</span>
            </div>
          </div>

          {/* Available Time */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Clock size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Available</p>
                <p className="text-gray-700">{getAvailabilityText()}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone size={16} className="text-primary-600 flex-shrink-0" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin size={16} className="text-primary-600 flex-shrink-0" />
              <span>{hospitalName}</span>
            </div>
          </div>

          {/* Consultation Fee */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-3 border border-primary-200">
            <p className="text-xs text-gray-600">Consultation Fee</p>
            <p className="text-lg sm:text-xl font-bold text-primary-600">BDT {doctor.consultation_fee}</p>
          </div>

          {/* Action Buttons */}
          <div className="doctor-card-action-row mt-auto pt-4">
            <button 
              onClick={handleViewDetails}
              className="doctor-card-action-button btn btn-secondary w-full text-xs sm:text-sm hover:scale-[1.02] transition-transform"
            >
              View Profile
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="doctor-card-action-button btn btn-primary w-full text-xs sm:text-sm hover:scale-[1.02] transition-transform"
            >
              Book Now
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
