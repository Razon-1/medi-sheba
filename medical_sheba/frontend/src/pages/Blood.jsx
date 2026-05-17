import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Phone } from 'lucide-react';
import Pagination from '../components/Pagination';
import { bloodAPI } from '../api/blood';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Blood.css';

export default function BloodBank() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.blood);
  
  const [bloodDonors, setBloodDonors] = useState([]);
  const [allDonors, setAllDonors] = useState([]); // Store all donors for client-side filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFilteredSearch, setIsFilteredSearch] = useState(false);
  const ITEMS_PER_PAGE = 20; // Match API page size

  useEffect(() => {
    fetchDonors(1);
  }, []);

  const fetchDonors = async (page = 1) => {
    try {
      setLoading(true);
      const response = await bloodAPI.listDonors({ page });
      const { count = 0, results = [] } = response.data;
      
      setBloodDonors(results);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      setCurrentPage(page);
      setError(null);
      
      // Load all donors on first page for client-side filtering
      if (page === 1 && count > 0) {
        await fetchAllDonorsForFiltering(count);
      }
    } catch (err) {
      console.error('Error fetching blood donors:', err);
      setError('Failed to load blood donors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDonorsForFiltering = async (total) => {
    try {
      // Fetch all pages to have complete dataset for filtering
      const pages = Math.ceil(total / ITEMS_PER_PAGE);
      let allDonorsData = [];
      
      for (let page = 1; page <= pages; page++) {
        const response = await bloodAPI.listDonors({ page });
        allDonorsData = [...allDonorsData, ...(response.data.results || [])];
      }
      
      setAllDonors(allDonorsData);
    } catch (err) {
      console.error('Error fetching all donors for filtering:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsFilteredSearch(false);
      fetchDonors(1);
      return;
    }

    try {
      setLoading(true);
      setIsFilteredSearch(true);
      
      // Use client-side filtering on all loaded donors
      const filtered = allDonors.filter(donor => {
        const donorName = `${donor.user?.first_name || ''} ${donor.user?.last_name || ''}`.toLowerCase();
        return (
          donorName.includes(searchQuery.toLowerCase()) ||
          donor.blood_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
          donor.district.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      
      setBloodDonors(filtered);
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error('Error searching donors:', err);
      setError('Error searching donors');
    } finally {
      setLoading(false);
    }
  };

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const filterByBloodType = async (type) => {
    try {
      setLoading(true);
      setIsFilteredSearch(true);
      
      // Filter all donors by blood type, then show first page
      const filtered = allDonors.filter(donor => donor.blood_group === type);
      setBloodDonors(filtered);
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (isFilteredSearch) {
      // For filtered results, just update the current page (data already in memory)
      setCurrentPage(page);
    } else {
      // For API results, fetch the specific page
      fetchDonors(page);
    }
  };

  return (
    <div className="blood-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Blood Bank</h1>
          <p>Find blood donors and manage emergency requests</p>
        </div>
      </div>

      <div className="blood-actions">
        <div className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, blood type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn-search">Search</button>
          </div>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Request Blood
        </button>
      </div>

      <div className="blood-type-filter">
        <h3>Quick Filter by Blood Type:</h3>
        <div className="blood-type-buttons">
          {bloodTypes.map(type => (
            <button 
              key={type} 
              className="blood-type-btn"
              onClick={() => filterByBloodType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="donors-container">
        {loading ? (
          <div className="no-results">
            <h3>Loading blood donors...</h3>
          </div>
        ) : error ? (
          <div className="no-results">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => fetchDonors(1)} className="btn-search">Retry</button>
          </div>
        ) : bloodDonors.length > 0 ? (
          <>
            <div className="donors-grid">
              {bloodDonors.map(donor => {
                const donorName = donor.user ? `${donor.user.first_name} ${donor.user.last_name}` : donor.name;
                const phone = donor.user?.phone;
                const location = `${donor.district}${donor.upazila ? ', ' + donor.upazila : ''}`;
                
                return (
                  <div key={donor.id} className="donor-card">
                    <div className="donor-header">
                      <h3>{donorName}</h3>
                      <div className="blood-badge">{donor.blood_group}</div>
                    </div>
                    <div className="donor-details">
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{location}</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} />
                        <span>{phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="last-donated">
                          Total donations: {donor.total_donations}
                        </span>
                      </div>
                    </div>
                    <button className="btn-contact">Contact Donor</button>
                  </div>
                );
              })}
            </div>
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="no-results">
            <h3>No donors found</h3>
            <p>Try different search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
