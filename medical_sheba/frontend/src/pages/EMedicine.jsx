import { useState, useEffect } from 'react';
import { Pill, MapPin, DollarSign, Clock, AlertCircle, Heart } from 'lucide-react';
import Pagination from '../components/Pagination';
import { emedicineAPI } from '../api/emedicine';
import { useSEO, pageMetadata } from '../utils/seo';
import OrderMedicinesModal from '../components/OrderMedicinesModal';
import { fetchPaginatedList } from '../utils/pagination';
import '../styles/pages/EMedicine.css';

export default function EMedicine() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.emedicine || { 
    title: 'E-Medicine | Medi Sheba', 
    description: 'Order medicines online with home delivery' 
  });
  
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pharmacies');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [medicineCurrentPage, setMedicineCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;
  const MEDICINES_PER_PAGE = 40;

  useEffect(() => {
    fetchPharmacies();
    fetchMedicines();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const allPharmacies = await fetchPaginatedList(
        (page) => emedicineAPI.listPharmacies({ page }),
        {
          onFirstPage: (firstPharmacies) => {
            setPharmacies(firstPharmacies);
            setFilteredPharmacies(firstPharmacies);
            setLoading(false);
          },
        }
      );
      
      setPharmacies(allPharmacies);
      setFilteredPharmacies(allPharmacies);
      setError(null);
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
      setError('Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const allMedicines = await fetchPaginatedList(
        (page) => emedicineAPI.listMedicines({ page }),
        {
          onFirstPage: (firstMedicines) => {
            setMedicines(firstMedicines);
            setMedicineCurrentPage(1);
          },
        }
      );

      setMedicines(allMedicines);
      setMedicineCurrentPage(1);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const handleSearch = () => {
    let filtered = pharmacies;

    // Apply pharmacy type filter
    if (filterType) {
      filtered = filtered.filter(pharm => pharm.pharmacy_type === filterType);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(pharm =>
        pharm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharm.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharm.phone_number.includes(searchQuery)
      );
    }

    setFilteredPharmacies(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    handleSearch();
  }, [filterType]);

  const getPharmacyTypeLabel = (type) => {
    const types = {
      'chain': 'Chain Pharmacy',
      'independent': 'Independent Pharmacy',
      'hospital': 'Hospital Pharmacy'
    };
    return types[type] || type;
  };

  const getPharmacyTypeColor = (type) => {
    const colors = {
      'chain': '#3498db',
      'independent': '#2ecc71',
      'hospital': '#e74c3c'
    };
    return colors[type] || '#333';
  };

  const handleOrderMedicines = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsOrderModalOpen(true);
  };



  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedPharmacy(null);
  };

  return (
    <div className="emedicine-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Online Medicine Delivery</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'pharmacies' ? 'active' : ''}`}
          onClick={() => setActiveTab('pharmacies')}
        >
          🏥 Pharmacies
        </button>
        <button 
          className={`tab-button ${activeTab === 'medicines' ? 'active' : ''}`}
          onClick={() => setActiveTab('medicines')}
        >
          💊 Medicines
        </button>
      </div>

      {/* Pharmacies Tab */}
      {activeTab === 'pharmacies' && (
        <>
          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="search-box">
              <Pill size={20} />
              <input
                type="text"
                placeholder="Search by pharmacy name, address, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} className="btn-search">Search</button>
            </div>

            <div className="filter-buttons">
              <h3>Filter by Type:</h3>
              <div className="button-group">
                <button
                  className={`filter-btn ${filterType === '' ? 'active' : ''}`}
                  onClick={() => setFilterType('')}
                >
                  All Types
                </button>
                <button
                  className={`filter-btn ${filterType === 'chain' ? 'active' : ''}`}
                  onClick={() => setFilterType('chain')}
                >
                  Chain
                </button>
                <button
                  className={`filter-btn ${filterType === 'independent' ? 'active' : ''}`}
                  onClick={() => setFilterType('independent')}
                >
                  Independent
                </button>
                <button
                  className={`filter-btn ${filterType === 'hospital' ? 'active' : ''}`}
                  onClick={() => setFilterType('hospital')}
                >
                  Hospital
                </button>
              </div>
            </div>
          </div>

          {/* Pharmacy List */}
          <div className="pharmacy-list">
            {loading ? (
              <div className="no-results">
                <h3>Loading pharmacies...</h3>
              </div>
            ) : error ? (
              <div className="no-results">
                <AlertCircle size={48} />
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={fetchPharmacies} className="btn-search">Retry</button>
              </div>
            ) : filteredPharmacies.length > 0 ? (
              filteredPharmacies
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map(pharmacy => (
                <div key={pharmacy.id} className="pharmacy-card">
                  <div className="pharmacy-image">
                    <img 
                      src={pharmacy.image_url || "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop"} 
                      alt={pharmacy.name}
                      onError={(e) => e.target.src = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop"}
                    />
                  </div>
                  <div className="pharmacy-header">
                    <div className="pharmacy-name-section">
                      <h3>{pharmacy.name}</h3>
                      <span 
                        className="pharmacy-type-badge" 
                        style={{ backgroundColor: getPharmacyTypeColor(pharmacy.pharmacy_type) }}
                      >
                        {getPharmacyTypeLabel(pharmacy.pharmacy_type)}
                      </span>
                    </div>
                  </div>

                  <div className="pharmacy-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <Pill size={16} />
                        <span className="label">License:</span>
                        <span className="value">{pharmacy.license_number}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span className="label">Delivery:</span>
                        <span className="value">{pharmacy.delivery_time_hours}h</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <Pill size={16} />
                        <span className="label">Contact:</span>
                        <span className="value">{pharmacy.phone_number}</span>
                      </div>
                      <div className="detail-item">
                        <DollarSign size={16} />
                        <span className="label">Min Order:</span>
                        <span className="value">BDT {pharmacy.min_order_amount}</span>
                      </div>
                    </div>

                    <div className="address-info">
                      <MapPin size={16} />
                      <span className="label">Address:</span>
                      <span className="value">{pharmacy.address}</span>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button className="btn-order" onClick={() => handleOrderMedicines(pharmacy)}>Order Medicines</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <AlertCircle size={48} />
                <h3>No pharmacies found</h3>
                <p>Try adjusting your search filters</p>
              </div>
            )}
          </div>

        {filteredPharmacies.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredPharmacies.length / ITEMS_PER_PAGE)}
            totalItems={filteredPharmacies.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
        </>
      )}

      {/* Medicines Tab */}
      {activeTab === 'medicines' && (
        <div className="medicines-section">
          <h2>Available Medicines</h2>
          <div className="medicines-grid">
            {medicines.length > 0 ? (
              medicines
                .slice((medicineCurrentPage - 1) * MEDICINES_PER_PAGE, medicineCurrentPage * MEDICINES_PER_PAGE)
                .map(medicine => (
                <div key={medicine.id} className="medicine-card">
                  <div className="medicine-header">
                    <h4>{medicine.name}</h4>
                    <span className="generic-name">{medicine.generic_name}</span>
                  </div>
                  <div className="medicine-info">
                    <p><strong>Strength:</strong> {medicine.strength} {medicine.strength_unit}</p>
                    <p><strong>Type:</strong> {medicine.medicine_type}</p>
                    <p><strong>Manufacturer:</strong> {medicine.manufacturer}</p>
                    <p className="price"><strong>BDT {parseFloat(medicine.price).toFixed(2)}</strong></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No medicines available</p>
              </div>
            )}
          </div>

          {medicines.length > MEDICINES_PER_PAGE && (
            <Pagination
              currentPage={medicineCurrentPage}
              totalPages={Math.ceil(medicines.length / MEDICINES_PER_PAGE)}
              totalItems={medicines.length}
              itemsPerPage={MEDICINES_PER_PAGE}
              onPageChange={setMedicineCurrentPage}
            />
          )}
        </div>
      )}

      {/* Order Medicines Modal */}
      <OrderMedicinesModal
        pharmacy={selectedPharmacy}
        medicines={selectedPharmacy ? medicines.filter(medicine => medicine.pharmacy === selectedPharmacy.id) : []}
        isOpen={isOrderModalOpen}
        onClose={closeOrderModal}
        onSuccess={() => {
          // Refresh the page or show success message
          console.log('Order placed successfully');
        }}
      />
    </div>
  );
}
