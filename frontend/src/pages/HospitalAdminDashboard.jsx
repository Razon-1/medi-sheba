import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import '../styles/AdminDashboard.css';
import * as hospitalApi from '../api/hospitals';
import * as doctorApi from '../api/doctors';
import * as ambulanceApi from '../api/ambulance';
import * as edoctorApi from '../api/edoctor';

const HospitalAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('doctors');
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [edoctors, setEdoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showMoreSpecializations, setShowMoreSpecializations] = useState(false);

  const commonSpecializations = [
    'General Practitioner',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics'
  ];

  const moreSpecializations = [
    'Dermatology',
    'Ophthalmology',
    'ENT (Otolaryngology)',
    'Psychiatry',
    'Oncology',
    'Urology',
    'Gastroenterology',
    'Pulmonology',
    'Nephrology'
  ];

  useEffect(() => {
    // Redirect if not hospital admin
    if (user && !user.roles.includes('hospital_admin')) {
      navigate('/');
      return;
    }

    if (user && user.roles.includes('hospital_admin')) {
      loadHospitalData();
    }
  }, [navigate, activeTab, user]);

  const loadHospitalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load hospital info
      const hospitalData = await hospitalApi.getMyHospital();
      setHospital(hospitalData);

      // Load data based on active tab
      if (activeTab === 'doctors') {
        const doctorsData = await doctorApi.getMyDoctors();
        console.log('Doctors data:', doctorsData);
        setDoctors(doctorsData);
      } else if (activeTab === 'ambulances') {
        const ambulancesData = await ambulanceApi.getMyAmbulances();
        setAmbulances(ambulancesData);
      } else if (activeTab === 'edoctors') {
        const edoctorsData = await edoctorApi.getMyEdoctors();
        setEdoctors(edoctorsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      
      // Check if it's a 404 error (no hospital found)
      if (err.message && err.message.includes('404')) {
        console.log('No hospital assigned to admin. Redirecting to hospital creation page...');
        navigate('/hospital-create');
        return;
      }
      
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(true);
    setShowMoreSpecializations(false);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    
    // Flatten user data if it exists (for doctors)
    let flattenedData = {...item};
    if (item.user) {
      flattenedData = {
        ...flattenedData,
        first_name: item.user.first_name || '',
        last_name: item.user.last_name || '',
        email: item.user.email || '',
        phone_number: item.user.phone_number || ''
      };
    }
    
    setFormData(flattenedData);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'doctors') {
        await doctorApi.deleteDoctor(id);
        setDoctors(doctors.filter(d => d.id !== id));
      } else if (activeTab === 'ambulances') {
        await ambulanceApi.deleteAmbulance(id);
        setAmbulances(ambulances.filter(a => a.id !== id));
      } else if (activeTab === 'edoctors') {
        await edoctorApi.deleteEdoctor(id);
        setEdoctors(edoctors.filter(e => e.id !== id));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let submitData = {...formData};
      
      if (activeTab === 'doctors') {
        // Handle custom specialty
        if (submitData.specialty === 'other' && submitData.customSpecialty) {
          submitData.specialty = submitData.customSpecialty;
        }
        delete submitData.customSpecialty;
        
        // Ensure required fields
        if (!submitData.first_name || !submitData.last_name || !submitData.bmdc_number || !submitData.specialty || !submitData.qualifications || !submitData.consultation_fee || !submitData.email) {
          setError('Please fill in all required fields (marked with *): First Name, Last Name, BMDC Number, Specialty, Qualifications, Consultation Fee, and Email');
          return;
        }

        if (editingItem) {
          const updated = await doctorApi.updateDoctor(editingItem.id, submitData);
          setDoctors(doctors.map(d => d.id === updated.id ? updated : d));
        } else {
          // Create a new doctor with user data
          await doctorApi.addDoctor({
            ...submitData,
            hospital: hospital.id,
            experience_years: parseInt(submitData.experience_years || 0),
            consultation_fee: parseFloat(submitData.consultation_fee)
          });
          // Refresh doctors list to get the complete data with user info
          const updatedDoctors = await doctorApi.getMyDoctors();
          setDoctors(updatedDoctors);
        }
      } else if (activeTab === 'ambulances') {
        if (editingItem) {
          const updated = await ambulanceApi.updateAmbulance(editingItem.id, submitData);
          setAmbulances(ambulances.map(a => a.id === updated.id ? updated : a));
        } else {
          await ambulanceApi.addAmbulance({...submitData, hospital: hospital.id});
          // Refresh ambulances list to get complete data
          const updatedAmbulances = await ambulanceApi.getMyAmbulances();
          setAmbulances(updatedAmbulances);
        }
      } else if (activeTab === 'edoctors') {
        // Ensure required fields for edoctors
        if (!submitData.name || !submitData.specialization || !submitData.qualification || !submitData.experience_years || !submitData.registration_number || !submitData.email || !submitData.phone_number) {
          setError('Please fill in all required fields (marked with *)');
          return;
        }

        // Handle custom specialization
        if (submitData.specialization === 'other' && submitData.customSpecialization) {
          submitData.specialization = submitData.customSpecialization;
        }
        delete submitData.customSpecialization;
        
        if (editingItem) {
          const updated = await edoctorApi.updateEdoctor(editingItem.id, submitData);
          setEdoctors(edoctors.map(e => e.id === updated.id ? updated : e));
        } else {
          await edoctorApi.addEdoctor({
            ...submitData,
            hospital: hospital.id,
            experience_years: parseInt(submitData.experience_years),
            is_available: submitData.is_available || true
          });
          // Refresh e-doctors list to get complete data
          const updatedEdoctors = await edoctorApi.getMyEdoctors();
          setEdoctors(updatedEdoctors);
        }
      }
      setShowForm(false);
      setFormData({});
      setEditingItem(null);
      setShowMoreSpecializations(false);
      setError(null);
    } catch (err) {
      console.error('Form submission error:', err);
      console.error('Error details:', err.response || err.message);
      setError(err.message || 'An error occurred while saving');
    }
    }
  };

  const DoctorsTab = () => (
    <div className="admin-content">
      <h2>🩺 Manage Doctors</h2>
      <button className="btn btn-primary" onClick={handleAddClick}>+ Add Doctor</button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Qualification</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors && Array.isArray(doctors) ? doctors.map(doctor => (
            <tr key={doctor.id}>
              <td>{doctor.user?.first_name} {doctor.user?.last_name}</td>
              <td>{doctor.specialty}</td>
              <td>{doctor.qualifications}</td>
              <td>{doctor.user?.phone_number}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEditClick(doctor)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(doctor.id)}>Delete</button>
              </td>
            </tr>
          )) : null}
        </tbody>
      </table>
    </div>
  );

  const AmbulancesTab = () => (
    <div className="admin-content">
      <h2>🚑 Manage Ambulances</h2>
      <button className="btn btn-primary" onClick={handleAddClick}>+ Add Ambulance</button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Vehicle Type</th>
            <th>Driver</th>
            <th>Phone</th>
            <th>Cost/KM</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ambulances.map(ambulance => (
            <tr key={ambulance.id}>
              <td>{ambulance.name}</td>
              <td>{ambulance.vehicle_type}</td>
              <td>{ambulance.driver_name}</td>
              <td>{ambulance.phone_number}</td>
              <td>৳{parseFloat(ambulance.cost_per_km).toFixed(2)}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEditClick(ambulance)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(ambulance.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const EdoctorsTab = () => (
    <div className="admin-content">
      <h2>💻 Manage E-Doctors</h2>
      <button className="btn btn-primary" onClick={handleAddClick}>+ Add E-Doctor</button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Phone</th>
            <th>Consultation Fee</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {edoctors.map(edoctor => (
            <tr key={edoctor.id}>
              <td>{edoctor.name}</td>
              <td>{edoctor.specialization}</td>
              <td>{edoctor.phone_number}</td>
              <td>৳{parseFloat(edoctor.consultation_fee).toFixed(2)}</td>
              <td>{edoctor.is_available ? '✓' : '✗'}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEditClick(edoctor)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(edoctor.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const HospitalInfoTab = () => (
    <div className="admin-content">
      <h2>🏥 Hospital Information</h2>
      {hospital && (
        <div className="info-card">
          <p><strong>Hospital Name:</strong> {hospital.name}</p>
          <p><strong>Phone:</strong> {hospital.phone_number}</p>
          <p><strong>Email:</strong> {hospital.email}</p>
          <p><strong>Address:</strong> {hospital.address}</p>
          <p><strong>District:</strong> {hospital.district?.name}</p>
          <p><strong>Type:</strong> {hospital.hospital_type}</p>
          <p><strong>Beds:</strong> {hospital.total_beds}</p>
          <p><strong>Status:</strong> {hospital.is_active ? 'Active' : 'Inactive'}</p>
        </div>
      )}
    </div>
  );

  if (!user || !user.roles.includes('hospital_admin')) {
    return null;
  }

  if (loading && !hospital) {
    return <div className="loading">Loading Hospital Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🏥 Hospital Admin Dashboard</h1>
        {hospital && <p className="hospital-name">{hospital.name} (ID: {hospital.id})</p>}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          🩺 Doctors
        </button>
        <button
          className={`tab-button ${activeTab === 'ambulances' ? 'active' : ''}`}
          onClick={() => setActiveTab('ambulances')}
        >
          🚑 Ambulances
        </button>
        <button
          className={`tab-button ${activeTab === 'edoctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('edoctors')}
        >
          💻 E-Doctors
        </button>
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          ℹ️ Hospital Info
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'doctors' && <DoctorsTab />}
        {activeTab === 'ambulances' && <AmbulancesTab />}
        {activeTab === 'edoctors' && <EdoctorsTab />}
        {activeTab === 'info' && <HospitalInfoTab />}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSubmit}>
              {activeTab === 'doctors' && (
                <>
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="BMDC Number *"
                    value={formData.bmdc_number || ''}
                    onChange={(e) => setFormData({...formData, bmdc_number: e.target.value})}
                    required
                  />
                  <div className="specialization-field">
                    <label>Specialty *</label>
                    <select
                      value={formData.specialty || ''}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      required
                    >
                      <option value="">Select Specialty</option>
                      {commonSpecializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                      <option value="---more---" disabled>─────────────</option>
                      {showMoreSpecializations && moreSpecializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                      {!showMoreSpecializations && (
                        <option value="---more---">➕ More Specializations</option>
                      )}
                      <option value="other">🔍 Other (Write Manually)</option>
                    </select>
                    {formData.specialty === '---more---' && (
                      <button
                        type="button"
                        className="btn-more-specs"
                        onClick={() => setShowMoreSpecializations(true)}
                      >
                        View More Specializations
                      </button>
                    )}
                    {formData.specialty === 'other' && (
                      <input
                        type="text"
                        placeholder="Enter your specialty"
                        value={formData.customSpecialty || ''}
                        onChange={(e) => setFormData({...formData, customSpecialty: e.target.value})}
                        className="custom-specialization-input"
                        required
                      />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Qualifications *"
                    value={formData.qualifications || ''}
                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Experience Years"
                    value={formData.experience_years || 0}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                  />
                  <input
                    type="number"
                    placeholder="Consultation Fee (BDT) *"
                    step="0.01"
                    value={formData.consultation_fee || ''}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  />
                </>
              )}
              {activeTab === 'ambulances' && (
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <select
                    value={formData.vehicle_type || ''}
                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    required
                  >
                    <option>Select Vehicle Type</option>
                    <option value="basic">Basic Ambulance</option>
                    <option value="advanced">Advanced Life Support</option>
                    <option value="icu">ICU Ambulance</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={formData.driver_name || ''}
                    onChange={(e) => setFormData({...formData, driver_name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Cost Per KM"
                    step="0.01"
                    value={formData.cost_per_km || ''}
                    onChange={(e) => setFormData({...formData, cost_per_km: e.target.value})}
                    required
                  />
                </>
              )}
              {activeTab === 'edoctors' && (
                <>
                  <input
                    type="text"
                    placeholder="Name *"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <div className="specialization-field">
                    <label>Specialization *</label>
                    <select
                      value={formData.specialization || ''}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      required
                    >
                      <option value="">Select Specialization</option>
                      {commonSpecializations.map((spec) => (
                        <option key={spec} value={spec.toLowerCase().replace(/\s+/g, '_')}>{spec}</option>
                      ))}
                      <option value="---more---" disabled>─────────────</option>
                      {showMoreSpecializations && moreSpecializations.map((spec) => (
                        <option key={spec} value={spec.toLowerCase().replace(/\s+/g, '_')}>{spec}</option>
                      ))}
                      {!showMoreSpecializations && (
                        <option value="---more---">➕ More Specializations</option>
                      )}
                      <option value="other">🔍 Other (Write Manually)</option>
                    </select>
                    {formData.specialization === '---more---' && (
                      <button
                        type="button"
                        className="btn-more-specs"
                        onClick={() => setShowMoreSpecializations(true)}
                      >
                        View More Specializations
                      </button>
                    )}
                    {formData.specialization === 'other' && (
                      <input
                        type="text"
                        placeholder="Enter your specialization"
                        value={formData.customSpecialization || ''}
                        onChange={(e) => setFormData({...formData, customSpecialization: e.target.value})}
                        className="custom-specialization-input"
                        required
                      />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Qualification *"
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Experience Years *"
                    value={formData.experience_years || 0}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Registration Number *"
                    value={formData.registration_number || ''}
                    onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone *"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Consultation Fee (BDT)"
                    step="0.01"
                    value={formData.consultation_fee || ''}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_available || false}
                      onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    />
                    Available for consultation
                  </label>
                </>
              )}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowForm(false);
                  setShowMoreSpecializations(false);
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminDashboard;
