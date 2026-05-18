import { MapPin, Phone, Users, Bed, CheckCircle, Star, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HospitalCard({ hospital }) {
  const navigate = useNavigate();
  const rating = Number(hospital.rating) || 0;
  const reviewCount = Number(hospital.review_count) || 0;
  const hasReviews = rating > 0 || reviewCount > 0;
  const bedsAvailable = Number(hospital.beds_available);
  const bedsTotal = Number(hospital.beds_total);
  const hasBedCounts = Number.isFinite(bedsAvailable) && Number.isFinite(bedsTotal) && bedsTotal > 0;

  const getHospitalTypeLabel = (type) => {
    const labels = {
      'government': '🏛️ Government Hospital',
      'private': '🏥 Private Hospital',
      'clinic': '⚕️ Clinic'
    };
    return labels[type] || type;
  };

  const handleViewDetails = () => {
    navigate(`/hospitals/${hospital.id}`);
  };

  const bedOccupancy = hasBedCounts ? Math.round(((bedsTotal - bedsAvailable) / bedsTotal) * 100) : 0;

  return (
    <div className="group card overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-48 sm:h-56">
        <img 
          src={hospital.image_url || "https://images.unsplash.com/photo-1587745914519-3e0f623fd1b5?w=400&h=300&fit=crop"} 
          alt={hospital.name}
          onError={(e) => e.target.src = "https://images.unsplash.com/photo-1587745914519-3e0f623fd1b5?w=400&h=300&fit=crop"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-4 right-4 space-y-2">
          {hospital.emergency_available && (
            <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse-gentle">
              <AlertCircle size={14} />
              Emergency
            </div>
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
          <p className="text-sm font-bold text-gray-900">{getHospitalTypeLabel(hospital.type)}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="card-body p-5 sm:p-6 flex-1 flex flex-col gap-4">
        
        {/* Hospital Name */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {hospital.name}
          </h3>
        </div>

        {/* Rating Section */}
        {hasReviews ? (
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
              <span className="text-xs text-gray-600">({reviewCount} reviews)</span>
            </div>
          </div>
        ) : null}

        {/* Bed Availability */}
        {hasBedCounts ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bed size={16} className="text-blue-600" />
                <span className="font-semibold text-gray-900">Bed Availability</span>
              </div>
              <span className="text-sm font-bold text-primary-600">{bedsAvailable} of {bedsTotal}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                style={{ width: `${100 - bedOccupancy}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{bedOccupancy}% Occupied</p>
          </div>
        ) : null}

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{hospital.address}, {hospital.district}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone size={16} className="text-primary-600 flex-shrink-0" />
            <a href={`tel:${hospital.phone_primary}`} className="hover:text-primary-600 transition-colors">
              {hospital.phone_primary}
            </a>
          </div>
        </div>

        {/* Features */}
        {hospital.has_icu || hospital.has_ccu ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-900 mb-2">Specialized Services:</p>
            <div className="flex flex-wrap gap-2">
              {hospital.has_icu && <span className="badge badge-success text-xs">ICU Available</span>}
              {hospital.has_ccu && <span className="badge badge-success text-xs">CCU Available</span>}
            </div>
          </div>
        ) : null}

        {/* Action Button */}
        <button 
          onClick={handleViewDetails}
          className="btn btn-primary w-full mt-auto py-2.5 text-sm hover:scale-105 transition-transform"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
