import { useState } from 'react';
import { Search } from 'lucide-react';
import HospitalCard from '../components/HospitalCard';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Hospitals.css';

const sampleHospitals = [
  {
    id: 1,
    name: 'Apollo Hospital',
    type: 'Multi-specialty Hospital',
    address: 'Gulshan, Dhaka',
    location: 'Dhaka',
    phone: '+880-2-9881188',
    image: 'https://images.unsplash.com/photo-1587745914519-3e0f623fd1b5?w=400&h=300&fit=crop',
    doctors_count: 250,
    beds: 500,
    services: ['Emergency', 'ICU', 'Surgery', 'Cardiology'],
  },
  {
    id: 2,
    name: 'Square Hospital',
    type: 'Advanced Medical Center',
    address: 'Panthapath, Dhaka',
    location: 'Dhaka',
    phone: '+880-2-8633333',
    image: 'https://images.unsplash.com/photo-1631217314831-ffe75acf0b7b?w=400&h=300&fit=crop',
    doctors_count: 180,
    beds: 350,
    services: ['Emergency', 'Orthopedics', 'Neurology', 'Pediatrics'],
  },
  {
    id: 3,
    name: 'National Hospital',
    type: 'Tertiary Medical Institution',
    address: 'Mirpur, Dhaka',
    location: 'Dhaka',
    phone: '+880-2-9001001',
    image: 'https://images.unsplash.com/photo-1576091160550-112173e7d7cb?w=400&h=300&fit=crop',
    doctors_count: 320,
    beds: 600,
    services: ['Emergency', 'Trauma Center', 'Burn Unit', 'Surgery'],
  },
  {
    id: 4,
    name: 'Labaid Hospital',
    type: 'Comprehensive Care Center',
    address: 'Dhanmondi, Dhaka',
    location: 'Dhaka',
    phone: '+880-2-8148999',
    image: 'https://images.unsplash.com/photo-1631217314831-ffe75acf0b7b?w=400&h=300&fit=crop',
    doctors_count: 200,
    beds: 450,
    services: ['Emergency', 'Oncology', 'Gastroenterology', 'Cardiology'],
  },
  {
    id: 5,
    name: 'Evercare Hospital',
    type: 'Private Specialized Hospital',
    address: 'Bashundhara, Dhaka',
    location: 'Dhaka',
    phone: '+880-2-8883939',
    image: 'https://images.unsplash.com/photo-1587745914519-3e0f623fd1b5?w=400&h=300&fit=crop',
    doctors_count: 150,
    beds: 300,
    services: ['Orthopedics', 'Dermatology', 'Dental', 'Gynecology'],
  },
  {
    id: 6,
    name: 'Ibn Sina Hospital',
    type: 'Modern Medical Facility',
    address: 'Kawran Bazar, Dhaka',
    location: 'Dhaka',
    phone: '+880-2-9611050',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
    doctors_count: 220,
    beds: 380,
    services: ['Emergency', 'Pediatrics', 'Obstetrics', 'Neurology'],
  },
];

export default function Hospitals() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.hospitals);
  
  const [hospitals] = useState(sampleHospitals);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState(sampleHospitals);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredHospitals(hospitals);
      return;
    }
    const filtered = hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHospitals(filtered);
  };

  return (
    <div className="hospitals-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Find Hospitals</h1>
          <p>Discover world-class healthcare facilities near you</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by hospital name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-search">Search</button>
        </div>
      </div>

      <div className="filter-info">
        <p>Showing <strong>{filteredHospitals.length}</strong> hospitals</p>
      </div>

      <div className="hospitals-grid">
        {filteredHospitals.length > 0 ? (
          filteredHospitals.map(hospital => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))
        ) : (
          <div className="no-results">
            <h3>No hospitals found</h3>
            <p>Try different search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
