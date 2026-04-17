import { useState } from 'react';
import { Search, MapPin, Phone, Star, Award } from 'lucide-react';
import DoctorCard from '../components/DoctorCard';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Doctors.css';

const sampleDoctors = [
  {
    id: 1,
    name: 'Dr. Ahmed Hasan',
    specialty: 'Cardiologist',
    experience: '12 years',
    rating: 4.9,
    reviews: 342,
    location: 'Apollo Hospital, Dhaka',
    phone: '+880-1700-000001',
    image: 'https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=300&h=300&fit=crop',
    qualification: 'MBBS, MD (Cardiology)',
  },
  {
    id: 2,
    name: 'Dr. Fatima Rahman',
    specialty: 'Gynecologist',
    experience: '10 years',
    rating: 4.8,
    reviews: 298,
    location: 'Square Hospital, Dhaka',
    phone: '+880-1700-000002',
    image: 'https://images.unsplash.com/photo-1594824476967-48c687c9d88e?w=300&h=300&fit=crop',
    qualification: 'MBBS, MD (Obstetrics)',
  },
  {
    id: 3,
    name: 'Dr. Mohammad Karim',
    specialty: 'Orthopedic Surgeon',
    experience: '15 years',
    rating: 4.9,
    reviews: 405,
    location: 'National Hospital, Dhaka',
    phone: '+880-1700-000003',
    image: 'https://images.unsplash.com/photo-1607746882042-f3eed3e64e81?w=300&h=300&fit=crop',
    qualification: 'MBBS, MS (Orthopedics)',
  },
  {
    id: 4,
    name: 'Dr. Samina Begum',
    specialty: 'Neurologist',
    experience: '8 years',
    rating: 4.7,
    reviews: 256,
    location: 'Labaid Hospital, Dhaka',
    phone: '+880-1700-000004',
    image: 'https://images.unsplash.com/photo-1559839734033-6461efb1b11a?w=300&h=300&fit=crop',
    qualification: 'MBBS, MD (Neurology)',
  },
  {
    id: 5,
    name: 'Dr. Rajesh Kumar',
    specialty: 'Dermatologist',
    experience: '9 years',
    rating: 4.8,
    reviews: 289,
    location: 'Evercare Hospital, Dhaka',
    phone: '+880-1700-000005',
    image: 'https://images.unsplash.com/photo-1612349317150-e88e6ff1d7b4?w=300&h=300&fit=crop',
    qualification: 'MBBS, MD (Dermatology)',
  },
  {
    id: 6,
    name: 'Dr. Hafiza Aisha',
    specialty: 'Pediatrician',
    experience: '11 years',
    rating: 4.9,
    reviews: 378,
    location: 'Ibn Sina Hospital, Dhaka',
    phone: '+880-1700-000006',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=300&fit=crop',
    qualification: 'MBBS, MD (Pediatrics)',
  },
];

export default function Doctors() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.doctors);
  
  const [doctors] = useState(sampleDoctors);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(sampleDoctors);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
      return;
    }
    const filtered = doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Find Expert Doctors</h1>
          <p>Browse and connect with qualified healthcare professionals</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or specialty (e.g., Cardiologist)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-search">Search</button>
        </div>
      </div>

      <div className="filter-info">
        <p>Showing <strong>{filteredDoctors.length}</strong> doctors</p>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))
        ) : (
          <div className="no-results">
            <h3>No doctors found</h3>
            <p>Try different search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
