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
  const [editingHospital, setEditingHospital] = useState(false);

  useEffect(() => {
    if (user && !user.roles.includes('hospital_admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadHospitalData();
  }, [activeTab]);

  const loadHospitalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load hospital info
      const hospitalRes = await hospitalApi.getMyHospital();
      setHospital(hospitalRes.data);

      // Load data based on active tab
      if (activeTab === 'doctors') {
        const doctorsRes = await doctorApi.getMyDoctors();
        setDoctors(doctorsRes.data);
      } else if (activeTab === 'ambulances') {
        const ambulancesRes = await ambulanceApi.getMyAmbulances();
        setAmbulances(ambulancesRes.data);
      } else if (activeTab === 'edoctors') {
        const edoctorsRes = await edoctorApi.getMyEdoctors();
        setEdoctors(edoctorsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData(item);
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
      if (editingHospital) {
        // Handle hospital info update
        const res = await hospitalApi.updateHospital(hospital.id, formData);
        setHospital(res.data);
        setEditingHospital(false);
        setFormData({});
        setError(null);
      } else if (activeTab === 'doctors') {
        if (editingItem) {
          const res = await doctorApi.updateDoctor(editingItem.id, formData);
          const updated = res.data;
          setDoctors(doctors.map(d => d.id === updated.id ? updated : d));
        } else {
          const res = await doctorApi.addDoctor({...formData, hospital: hospital.id});
          const newDoctor = res.data;
          setDoctors([...doctors, newDoctor]);
        }
      } else if (activeTab === 'ambulances') {
        if (editingItem) {
          const res = await ambulanceApi.updateAmbulance(editingItem.id, formData);
          const updated = res.data;
          setAmbulances(ambulances.map(a => a.id === updated.id ? updated : a));
        } else {
          const res = await ambulanceApi.addAmbulance({...formData, hospital: hospital.id});
          const newAmbulance = res.data;
          setAmbulances([...ambulances, newAmbulance]);
        }
      } else if (activeTab === 'edoctors') {
        if (editingItem) {
          const res = await edoctorApi.updateEdoctor(editingItem.id, formData);
          const updated = res.data;
          setEdoctors(edoctors.map(e => e.id === updated.id ? updated : e));
        } else {
          const res = await edoctorApi.addEdoctor({...formData, hospital: hospital.id});
          const newEdoctor = res.data;
          setEdoctors([...edoctors, newEdoctor]);
        }
      }
      setShowForm(false);
      setFormData({});
      setEditingItem(null);
    } catch (err) {
      setError(err.message);
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
          {doctors.map(doctor => (
            <tr key={doctor.id}>
              <td>{doctor.name}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.qualification}</td>
              <td>{doctor.phone_number}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEditClick(doctor)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(doctor.id)}>Delete</button>
              </td>
            </tr>
          ))}
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

  const handleEditHospital = () => {
    setFormData(hospital);
    setEditingHospital(true);
    setShowForm(true);
  };

  const HospitalInfoTab = () => (
    <div className="admin-content">
      <h2>🏥 Hospital Information</h2>
      {hospital && (
        <>
          <div className="info-card">
            <p><strong>Hospital Name:</strong> {hospital.name}</p>
            <p><strong>Phone:</strong> {hospital.phone_primary || hospital.phone_number}</p>
            <p><strong>Email:</strong> {hospital.email}</p>
            <p><strong>Address:</strong> {hospital.address}</p>
            <p><strong>District:</strong> {hospital.district}</p>
            <p><strong>Type:</strong> {hospital.type}</p>
            <p><strong>Beds:</strong> Total: {hospital.beds_total} | Available: {hospital.beds_available}</p>
            <p><strong>Status:</strong> {hospital.is_active ? 'Active' : 'Inactive'}</p>
            <p><strong>Emergency Available:</strong> {hospital.emergency_available ? 'Yes' : 'No'}</p>
            <p><strong>Rating:</strong> {hospital.rating} ⭐ ({hospital.review_count} reviews)</p>
          </div>
          <button className="btn btn-primary" onClick={handleEditHospital} style={{marginTop: '20px'}}>
            ✏️ Edit Hospital Information
          </button>
        </>
      )}
    </div>
  );

  if (loading && !hospital) {
    return <div className="loading">Loading Hospital Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🏥 Hospital Admin Dashboard</h1>
        {hospital && <p className="hospital-name">{hospital.name}</p>}
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
        <div className="modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingHospital(false);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingHospital ? 'Edit Hospital Information' : (editingItem ? 'Edit Item' : 'Add New Item')}
            </h3>
            <form onSubmit={handleSubmit}>
              {activeTab === 'doctors' && (
                <>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="BMDC Number"
                    value={formData.bmdc_number || ''}
                    onChange={(e) => setFormData({...formData, bmdc_number: e.target.value})}
                    required
                  />
                  <select
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    required
                  >
                    <option value="">Select Specialty</option>
                    <option value="General Practice">General Practice</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="ENT">ENT</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Qualifications (e.g., MBBS, MD)"
                    value={formData.qualifications || ''}
                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Years of Experience"
                    value={formData.experience_years || ''}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Consultation Fee (BDT)"
                    step="0.01"
                    value={formData.consultation_fee || ''}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Follow-up Fee (BDT)"
                    step="0.01"
                    value={formData.follow_up_fee || ''}
                    onChange={(e) => setFormData({...formData, follow_up_fee: e.target.value})}
                  />
                  <textarea
                    placeholder="Chamber Address"
                    value={formData.chamber_address || ''}
                    onChange={(e) => setFormData({...formData, chamber_address: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Available Days (e.g., Mon,Tue,Wed)"
                    value={formData.available_days || ''}
                    onChange={(e) => setFormData({...formData, available_days: e.target.value})}
                  />
                  <input
                    type="time"
                    placeholder="Available Time Start"
                    value={formData.available_time_start || ''}
                    onChange={(e) => setFormData({...formData, available_time_start: e.target.value})}
                  />
                  <input
                    type="time"
                    placeholder="Available Time End"
                    value={formData.available_time_end || ''}
                    onChange={(e) => setFormData({...formData, available_time_end: e.target.value})}
                  />
                  <textarea
                    placeholder="Bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
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
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <select
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    required
                  >
                    <option>Select Specialization</option>
                    <option value="general">General Practitioner</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                  </select>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    placeholder="Consultation Fee"
                    step="0.01"
                    value={formData.consultation_fee || ''}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    required
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
              {editingHospital && (
                <>
                  <input
                    type="text"
                    placeholder="Hospital Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="">Select Hospital Type</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="clinic">Clinic</option>
                  </select>
                  <textarea
                    placeholder="Address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="District"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Upazila"
                    value={formData.upazila || ''}
                    onChange={(e) => setFormData({...formData, upazila: e.target.value})}
                  />
                  <input
                    type="tel"
                    placeholder="Primary Phone"
                    value={formData.phone_primary || ''}
                    onChange={(e) => setFormData({...formData, phone_primary: e.target.value})}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Secondary Phone"
                    value={formData.phone_secondary || ''}
                    onChange={(e) => setFormData({...formData, phone_secondary: e.target.value})}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input
                    type="url"
                    placeholder="Website"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Total Beds"
                    value={formData.beds_total || ''}
                    onChange={(e) => setFormData({...formData, beds_total: parseInt(e.target.value)})}
                  />
                  <input
                    type="number"
                    placeholder="Available Beds"
                    value={formData.beds_available || ''}
                    onChange={(e) => setFormData({...formData, beds_available: parseInt(e.target.value)})}
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                  <textarea
                    placeholder="Services (comma-separated)"
                    value={formData.services || ''}
                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                  />
                  <textarea
                    placeholder="Special Facilities (comma-separated)"
                    value={formData.special_facilities || ''}
                    onChange={(e) => setFormData({...formData, special_facilities: e.target.value})}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.emergency_available || false}
                      onChange={(e) => setFormData({...formData, emergency_available: e.target.checked})}
                    />
                    Emergency Available (24/7)
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Active Status
                  </label>
                </>
              )}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowForm(false);
                  setEditingHospital(false);
                  setFormData({});
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
