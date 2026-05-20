import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import { bloodAPI } from '../api/blood';
import useAuthStore from '../context/authStore';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Blood.css';

export default function BloodBank() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.blood);
  const { user } = useAuthStore();
  
  const [bloodDonors, setBloodDonors] = useState([]);
  const [allDonors, setAllDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeBloodType, setActiveBloodType] = useState('');
  const [activeForm, setActiveForm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [donorForm, setDonorForm] = useState({
    blood_group: '',
    contact_phone: '',
    district: '',
    upazila: '',
    last_donation_date: '',
    total_donations: 0,
    is_available: true,
    health_conditions: ''
  });
  const ITEMS_PER_PAGE = 16;

  useEffect(() => {
    fetchDonors();
  }, []);

  const getCurrentPageDonors = (donors, page = currentPage) => (
    donors.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  );

  const mergeSavedDonor = (donors, savedDonor) => {
    if (!savedDonor || savedDonor.is_available === false) {
      return donors;
    }

    return [
      savedDonor,
      ...donors.filter((donor) => donor.id !== savedDonor.id)
    ];
  };

  const fetchDonors = async (savedDonor = null) => {
    try {
      setLoading(true);
      let allDonorsData = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await bloodAPI.listDonors({ page });
        const data = response.data;
        const pageDonors = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];

        allDonorsData = [...allDonorsData, ...pageDonors];
        hasMore = !!data?.next;
        page++;
      }

      const visibleDonors = mergeSavedDonor(allDonorsData, savedDonor);

      setAllDonors(visibleDonors);
      setBloodDonors(getCurrentPageDonors(visibleDonors, 1));
      setTotalCount(visibleDonors.length);
      setTotalPages(Math.ceil(visibleDonors.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error('Error fetching blood donors:', err);
      setError('Failed to load blood donors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setActiveBloodType('');
      setBloodDonors(getCurrentPageDonors(allDonors, 1));
      setTotalCount(allDonors.length);
      setTotalPages(Math.ceil(allDonors.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
      return;
    }

    try {
      setLoading(true);
      setActiveBloodType('');
      
      const filtered = allDonors.filter(donor => {
        const donorName = (donor.user_name || `${donor.user?.first_name || ''} ${donor.user?.last_name || ''}`).toLowerCase();
        const query = searchQuery.toLowerCase();
        return (
          donorName.includes(query) ||
          (donor.blood_group || '').toLowerCase().includes(query) ||
          (donor.district || '').toLowerCase().includes(query)
        );
      });
      
      setBloodDonors(getCurrentPageDonors(filtered, 1));
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

  const getApiErrorMessage = (err, fallback) => {
    const data = err.response?.data;

    if (!data) {
      return fallback;
    }

    if (typeof data === 'string') {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    const messages = Object.entries(data)
      .flatMap(([field, value]) => {
        const text = Array.isArray(value) ? value.join(' ') : String(value);
        return `${field.replaceAll('_', ' ')}: ${text}`;
      })
      .filter(Boolean);

    return messages.length ? messages.join(' ') : fallback;
  };

  const filterByBloodType = async (type) => {
    try {
      setLoading(true);
      setActiveBloodType(type);
      
      const filtered = allDonors.filter(donor => donor.blood_group === type);
      setBloodDonors(getCurrentPageDonors(filtered, 1));
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    const sourceDonors = activeBloodType
      ? allDonors.filter(donor => donor.blood_group === activeBloodType)
      : searchQuery.trim()
      ? allDonors.filter(donor => {
          const donorName = (donor.user_name || `${donor.user?.first_name || ''} ${donor.user?.last_name || ''}`).toLowerCase();
          const query = searchQuery.toLowerCase();
          return (
            donorName.includes(query) ||
            (donor.blood_group || '').toLowerCase().includes(query) ||
            (donor.district || '').toLowerCase().includes(query)
          );
        })
      : allDonors;

    setBloodDonors(getCurrentPageDonors(sourceDonors, page));
    setCurrentPage(page);
  };

  const populateDonorForm = (donor) => {
    setDonorForm({
      blood_group: donor.blood_group || '',
      contact_phone: donor.contact_phone || donor.phone || user?.phone || '',
      district: donor.district || '',
      upazila: donor.upazila || '',
      last_donation_date: donor.last_donation_date || '',
      total_donations: donor.total_donations ?? 0,
      is_available: donor.is_available ?? true,
      health_conditions: donor.health_conditions || ''
    });
  };

  const loadMyDonorDetails = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const response = await bloodAPI.getMyDonor();
      populateDonorForm(response.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setFormError(getApiErrorMessage(err, 'Failed to load your donor details.'));
      }
    }
  };

  const openBloodForm = async (type) => {
    setActiveForm(type);
    setFormError('');
    setFormSuccess('');

    if (type === 'donate') {
      if (user?.phone && !donorForm.contact_phone) {
        setDonorForm((current) => ({
          ...current,
          contact_phone: user.phone
        }));
      }
      await loadMyDonorDetails();
    }
  };

  const closeBloodForm = () => {
    setActiveForm(null);
    setFormError('');
    setFormSuccess('');
  };

  const handleDonorSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setFormError('Please login before adding donor details.');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');
      const donorData = {
        ...donorForm,
        contact_phone: donorForm.contact_phone,
        last_donation_date: donorForm.last_donation_date || null,
        total_donations: Number(donorForm.total_donations) || 0,
        is_available: true,
        upazila: donorForm.upazila || null,
        health_conditions: donorForm.health_conditions || null
      };

      const response = await bloodAPI.saveMyDonor(donorData);
      const savedDonor = response.data || response;
      setFormSuccess('Your donation details were updated successfully.');
      populateDonorForm(savedDonor);
      setSearchQuery('');
      setActiveBloodType('');
      await fetchDonors(savedDonor);
    } catch (err) {
      console.error('Error submitting donor details:', err);
      setFormError(getApiErrorMessage(err, 'Failed to submit donor details. Please try again.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleContactDonor = (phoneNumber) => {
    if (!phoneNumber) {
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      navigator.clipboard.writeText(phoneNumber).then(() => {
        alert(`Phone number copied to clipboard: ${phoneNumber}\n\nYou can now dial it manually.`);
      }).catch(() => {
        alert(`Call this number: ${phoneNumber}`);
      });
    }
  };

  const formatDonationDate = (dateValue) => {
    if (!dateValue) {
      return 'Not provided';
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="blood-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Blood Bank</h1>
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
        <div className="blood-action-buttons">
          <button className="blood-action-btn blood-action-btn-donate" onClick={() => openBloodForm('donate')}>
            Donate Blood
          </button>
        </div>
      </div>

      {activeForm && (
        <div className="blood-modal-overlay" role="dialog" aria-modal="true">
          <div className="blood-modal">
            <div className="blood-modal-header">
              <div>
                <h2>Donate Blood</h2>
                <p>Provide your donor details so people can contact you.</p>
              </div>
              <button className="blood-modal-close" onClick={closeBloodForm} aria-label="Close form">
                <X size={20} />
              </button>
            </div>

            {formSuccess && <div className="blood-form-success">{formSuccess}</div>}
            {formError && <div className="blood-form-error">{formError}</div>}

            <form className="blood-form" onSubmit={handleDonorSubmit}>
              <div className="blood-form-grid">
                <label>
                  Blood Group
                  <select
                    value={donorForm.blood_group}
                    onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                    required
                  >
                    <option value="">Select group</option>
                    {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label>
                  Phone Number
                  <input
                    type="tel"
                    value={donorForm.contact_phone}
                    onChange={(e) => setDonorForm({ ...donorForm, contact_phone: e.target.value })}
                    required
                  />
                </label>
                <label>
                  District
                  <input
                    type="text"
                    value={donorForm.district}
                    onChange={(e) => setDonorForm({ ...donorForm, district: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Upazila
                  <input
                    type="text"
                    value={donorForm.upazila}
                    onChange={(e) => setDonorForm({ ...donorForm, upazila: e.target.value })}
                  />
                </label>
                <label>
                  Last Donation Date
                  <input
                    type="date"
                    value={donorForm.last_donation_date}
                    onChange={(e) => setDonorForm({ ...donorForm, last_donation_date: e.target.value })}
                  />
                </label>
                <label>
                  Total Donations
                  <input
                    type="number"
                    min="0"
                    value={donorForm.total_donations}
                    onChange={(e) => setDonorForm({ ...donorForm, total_donations: e.target.value })}
                  />
                </label>
                <label className="blood-checkbox-field">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                  />
                  Available to donate
                </label>
                <label className="blood-form-wide">
                  Health Notes
                  <textarea
                    rows="3"
                    value={donorForm.health_conditions}
                    onChange={(e) => setDonorForm({ ...donorForm, health_conditions: e.target.value })}
                  />
                </label>
              </div>
              <div className="blood-form-actions">
                <button type="button" className="blood-form-secondary" onClick={closeBloodForm}>Cancel</button>
                <button type="submit" className="blood-form-primary" disabled={formLoading}>
                  {formLoading ? 'Submitting...' : 'Submit Donor Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <button onClick={fetchDonors} className="btn-search">Retry</button>
          </div>
        ) : bloodDonors.length > 0 ? (
          <>
            <div className="donors-grid">
              {bloodDonors.map(donor => {
                const donorName = donor.user_name || (donor.user ? `${donor.user.first_name} ${donor.user.last_name}` : donor.name);
                const phone = donor.user?.phone || donor.phone || donor.contact_phone || '';
                const displayPhone = phone || 'Contact details unavailable';
                const location = `${donor.district || 'Location unavailable'}${donor.upazila ? ', ' + donor.upazila : ''}`;
                
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
                        <span>{displayPhone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="last-donated">
                          Last donated: {formatDonationDate(donor.last_donation_date)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="last-donated">
                          Total donations: {donor.total_donations}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-contact"
                      onClick={() => handleContactDonor(phone)}
                      disabled={!phone}
                    >
                      Contact Donor
                    </button>
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
            <p>
              {searchQuery.trim() || activeBloodType
                ? 'Try different search criteria'
                : 'No available donors are listed yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
