import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import useAuthStore from '../context/authStore';
import { medicineAPI } from '../api/emedicine';
import '../styles/pages/PharmacyAdminDashboard.css';

export default function PharmacyAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('medicines');
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showEditPharmacy, setShowEditPharmacy] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Redirect if not pharmacy admin
  useEffect(() => {
    if (user && !user.roles.includes('pharmacy_admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch pharmacy data and initial medicines
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch pharmacy data
        let pharmacyRes;
        try {
          pharmacyRes = await medicineAPI.getMyPharmacy();
          setPharmacy(pharmacyRes.data);
        } catch (err) {
          console.error('Error fetching pharmacy:', err);
          if (err.response?.status === 404 || err.message?.includes('404')) {
            console.log('No pharmacy assigned to admin. Redirecting to pharmacy creation page...');
            navigate('/pharmacy-create');
            return;
          } else if (err.response?.status === 403) {
            setError('You do not have permission to access this pharmacy.');
          } else {
            setError(`Failed to load pharmacy: ${err.message}`);
          }
          setLoading(false);
          return;
        }
        
        // Fetch medicines
        try {
          const medicinesRes = await medicineAPI.getMyMedicines();
          setMedicines(medicinesRes.data || []);
        } catch (err) {
          console.error('Error fetching medicines:', err);
          // Don't fail entirely if medicines fail - they might not exist yet
          setMedicines([]);
        }
        
        // Always fetch orders on initial load
        try {
          const ordersRes = await medicineAPI.listOrders();
          // Handle paginated response - extract results from paginated response
          const ordersData = ordersRes.data.results || ordersRes.data || [];
          setOrders(ordersData);
        } catch (err) {
          console.error('Error fetching orders:', err);
          setOrders([]);
        }
      } catch (err) {
        console.error('Unexpected error in fetchData:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.roles.includes('pharmacy_admin')) {
      fetchData();
    }
  }, [user]);

  // Refetch orders when tab changes to 'orders'
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const ordersRes = await medicineAPI.listOrders();
          // Handle paginated response - extract results from paginated response
          const ordersData = ordersRes.data.results || ordersRes.data || [];
          setOrders(ordersData);
        } catch (err) {
          console.error('Error fetching orders:', err);
          setOrders([]);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  if (!user || !user.roles.includes('pharmacy_admin')) {
    return null;
  }

  if (loading) {
    return <div className="pharmacy-admin-loading">Loading pharmacy dashboard...</div>;
  }

  if (error) {
    return (
      <div className="pharmacy-admin-error">
        <AlertCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="pharmacy-admin-dashboard">
      <div className="dashboard-header">
        <h1>Pharmacy Admin Dashboard</h1>
        {pharmacy && <p className="pharmacy-name">{pharmacy.name}</p>}
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'medicines' ? 'active' : ''}`}
          onClick={() => setActiveTab('medicines')}
        >
          💊 Medicines ({medicines.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders ({orders.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'pharmacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('pharmacy')}
        >
          🏪 Pharmacy Info
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'medicines' && (
          <MedicinesTab
            medicines={medicines}
            setMedicines={setMedicines}
            showAddMedicine={showAddMedicine}
            setShowAddMedicine={setShowAddMedicine}
            editingMedicine={editingMedicine}
            setEditingMedicine={setEditingMedicine}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            setOrders={setOrders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {activeTab === 'pharmacy' && pharmacy && (
          <PharmacyInfoTab
            pharmacy={pharmacy}
            setPharmacy={setPharmacy}
            showEditPharmacy={showEditPharmacy}
            setShowEditPharmacy={setShowEditPharmacy}
          />
        )}
      </div>
    </div>
  );
}

function OrdersTab({ orders, setOrders, selectedOrder, setSelectedOrder }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');

  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const urgencyMatch = filterUrgency === 'all' || order.urgency === filterUrgency;
    return statusMatch && urgencyMatch;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#4169E1',
      processing: '#9370DB',
      shipped: '#20B2AA',
      delivered: '#28A745',
      cancelled: '#DC3545',
    };
    return colors[status] || '#666';
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      normal: '🔵 Normal',
      urgent: '🟠 Urgent',
      critical: '🔴 Critical',
    };
    return badges[urgency] || urgency;
  };

  return (
    <div className="orders-tab">
      <div className="tab-header">
        <h2>📦 Manage Orders & Deliveries</h2>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Urgency:</label>
          <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} className="filter-select">
            <option value="all">All Levels</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found. {filterStatus !== 'all' || filterUrgency !== 'all' ? 'Try adjusting filters.' : ''}</p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <h3>Order #{order.order_id}</h3>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="order-status" style={{ borderLeft: `4px solid ${getStatusColor(order.status)}` }}>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="order-info">
                <div className="info-row">
                  <span className="label">Patient:</span>
                  <span className="value">{order.patient_name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Contact:</span>
                  <span className="value">{order.contact_phone}</span>
                </div>
                <div className="info-row">
                  <span className="label">Urgency:</span>
                  <span className="urgency-badge">{getUrgencyBadge(order.urgency)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Delivery Address:</span>
                  <span className="value address">{order.delivery_address}</span>
                </div>
                <div className="info-row">
                  <span className="label">Total Amount:</span>
                  <span className="value amount">৳{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                {order.notes && (
                  <div className="info-row">
                    <span className="label">Notes:</span>
                    <span className="value">{order.notes}</span>
                  </div>
                )}
              </div>

              <div className="order-actions">
                <button 
                  className="btn-view" 
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                >
                  {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {selectedOrder?.id === order.id && (
                <OrderDetailsModal
                  order={order}
                  orders={orders}
                  setOrders={setOrders}
                  onClose={() => setSelectedOrder(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetailsModal({ order, orders, setOrders, onClose }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusChange = async () => {
    if (newStatus === order.status) {
      setError('Please select a different status');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await medicineAPI.updateOrderStatus(order.id, newStatus);
      
      // Update local state
      const updatedOrders = orders.map(o => 
        o.id === order.id ? { ...o, status: newStatus } : o
      );
      setOrders(updatedOrders);
      setError(null);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.detail || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setLoading(true);
      setError(null);
      await medicineAPI.cancelOrder(order.id);
      
      // Update local state
      const updatedOrders = orders.map(o => 
        o.id === order.id ? { ...o, status: 'cancelled' } : o
      );
      setOrders(updatedOrders);
      onClose();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      await medicineAPI.confirmOrder(order.id);
      
      // Update local state
      const updatedOrders = orders.map(o => 
        o.id === order.id ? { ...o, status: 'confirmed' } : o
      );
      setOrders(updatedOrders);
    } catch (err) {
      console.error('Error confirming order:', err);
      setError(err.response?.data?.detail || 'Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineDelivery = async (medicineName, isDelivered) => {
    try {
      setLoading(true);
      setError(null);
      
      const quantity = order.medicines_list[medicineName];
      
      if (isDelivered) {
        // Mark as delivered
        await medicineAPI.markMedicineDelivered(order.id, medicineName, quantity);
      } else {
        // Unmark as delivered
        await medicineAPI.unmarkMedicineDelivered(order.id, medicineName);
      }
      
      // Fetch updated order
      const updatedOrder = await medicineAPI.getOrder(order.id);
      const updatedOrders = orders.map(o => 
        o.id === order.id ? updatedOrder.data : o
      );
      setOrders(updatedOrders);
    } catch (err) {
      console.error('Error updating medicine delivery:', err);
      setError(err.response?.data?.detail || 'Failed to update medicine delivery status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-details-modal">
      <div className="modal-body">
        <h4>Order Management</h4>

        {error && <div className="error-message">{error}</div>}

        <div className="medicines-section">
          <h5>📦 Medicines & Delivery Status:</h5>
          {typeof order.medicines_list === 'object' && order.medicines_list !== null && (
            <div className="medicines-delivery-list">
              {Object.entries(order.medicines_list).map(([medicineName, quantity]) => {
                const isDelivered = order.delivered_medicines_list && order.delivered_medicines_list[medicineName];
                return (
                  <div key={medicineName} className="medicine-delivery-item">
                    <input 
                      type="checkbox"
                      id={`medicine-${medicineName}`}
                      checked={isDelivered ? true : false}
                      onChange={(e) => handleMedicineDelivery(medicineName, e.target.checked)}
                      disabled={loading || order.status === 'cancelled' || order.status === 'delivered'}
                      className="medicine-checkbox"
                    />
                    <label htmlFor={`medicine-${medicineName}`} className={`medicine-label ${isDelivered ? 'delivered' : ''}`}>
                      <span className="medicine-name">{medicineName}</span>
                      <span className="medicine-qty">x{quantity}</span>
                      {isDelivered && <span className="delivery-badge">✓ Delivered</span>}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="status-section">
          <label>Update Order Status:</label>
          <div className="status-control">
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={order.status === 'cancelled' || order.status === 'delivered'}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <button 
              className="btn-update-status" 
              onClick={handleStatusChange}
              disabled={loading || order.status === 'cancelled' || order.status === 'delivered'}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

        <div className="modal-actions">
          {order.status === 'pending' && (
            <button 
              className="btn-confirm" 
              onClick={handleConfirmOrder}
              disabled={loading}
            >
              ✓ Confirm Order
            </button>
          )}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button 
              className="btn-cancel" 
              onClick={handleCancelOrder}
              disabled={loading}
            >
              ✕ Cancel Order
            </button>
          )}
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function MedicinesTab({ medicines, setMedicines, showAddMedicine, setShowAddMedicine, editingMedicine, setEditingMedicine }) {
  return (
    <div className="medicines-tab">
      <div className="tab-header">
        <h2>Manage Medicines</h2>
        <button className="btn-primary" onClick={() => setShowAddMedicine(!showAddMedicine)}>
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {showAddMedicine && (
        <AddMedicineForm
          medicines={medicines}
          setMedicines={setMedicines}
          onClose={() => setShowAddMedicine(false)}
        />
      )}

      {editingMedicine && (
        <EditMedicineForm
          medicine={editingMedicine}
          medicines={medicines}
          setMedicines={setMedicines}
          onClose={() => setEditingMedicine(null)}
        />
      )}

      <div className="medicines-list">
        {medicines.length === 0 ? (
          <div className="empty-state">
            <p>No medicines added yet. Click "Add Medicine" to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="medicines-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Generic Name</th>
                  <th>Strength</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(medicine => (
                  <tr key={medicine.id}>
                    <td>{medicine.name}</td>
                    <td>{medicine.generic_name}</td>
                    <td>{medicine.strength} {medicine.strength_unit}</td>
                    <td>{medicine.medicine_type}</td>
                    <td>৳{parseFloat(medicine.price).toFixed(2)}</td>
                    <td>{medicine.stock}</td>
                    <td>
                      <span className={`status-badge ${medicine.is_available ? 'available' : 'unavailable'}`}>
                        {medicine.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon edit"
                        onClick={() => setEditingMedicine(medicine)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => deleteMedicine(medicine.id, setMedicines)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AddMedicineForm({ medicines, setMedicines, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    manufacturer: '',
    medicine_type: 'tablet',
    strength: '',
    strength_unit: 'mg',
    price: '',
    stock: '',
    description: '',
    is_available: true,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      const response = await medicineAPI.addMedicine(payload);
      setMedicines([...medicines, response.data]);
      onClose();
    } catch (err) {
      console.error('Error adding medicine:', err);
      setError(err.response?.data?.detail || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-form-container">
      <div className="medicine-form">
        <h3>Add New Medicine</h3>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Aspirin"
              />
            </div>
            <div className="form-group">
              <label>Generic Name *</label>
              <input
                type="text"
                name="generic_name"
                value={formData.generic_name}
                onChange={handleChange}
                required
                placeholder="e.g., Acetylsalicylic acid"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Manufacturer *</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                required
                placeholder="e.g., Bayer"
              />
            </div>
            <div className="form-group">
              <label>Medicine Type *</label>
              <select name="medicine_type" value={formData.medicine_type} onChange={handleChange}>
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
                <option value="cream">Cream/Ointment</option>
                <option value="syrup">Syrup</option>
                <option value="powder">Powder</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Strength *</label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                required
                placeholder="e.g., 500"
              />
            </div>
            <div className="form-group">
              <label>Unit *</label>
              <select name="strength_unit" value={formData.strength_unit} onChange={handleChange}>
                <option value="mg">Milligrams (mg)</option>
                <option value="mcg">Micrograms (mcg)</option>
                <option value="g">Grams (g)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="iu">International Units (IU)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (BDT) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                placeholder="e.g., 50.00"
              />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                placeholder="e.g., 100"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Medicine description..."
              rows="3"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
            />
            <label htmlFor="is_available">Available for sale</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Medicine'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditMedicineForm({ medicine, medicines, setMedicines, onClose }) {
  const [formData, setFormData] = useState(medicine);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      await medicineAPI.updateMedicine(medicine.id, payload);
      setMedicines(medicines.map(m => m.id === medicine.id ? { ...formData } : m));
      onClose();
    } catch (err) {
      console.error('Error updating medicine:', err);
      setError(err.response?.data?.detail || 'Failed to update medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      setLoading(true);
      await medicineAPI.deleteMedicine(medicine.id);
      setMedicines(medicines.filter(m => m.id !== medicine.id));
      onClose();
    } catch (err) {
      console.error('Error deleting medicine:', err);
      setError(err.response?.data?.detail || 'Failed to delete medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-form-container">
      <div className="medicine-form edit">
        <h3>Edit Medicine</h3>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Generic Name *</label>
              <input
                type="text"
                name="generic_name"
                value={formData.generic_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Manufacturer *</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Medicine Type *</label>
              <select name="medicine_type" value={formData.medicine_type} onChange={handleChange}>
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
                <option value="cream">Cream/Ointment</option>
                <option value="syrup">Syrup</option>
                <option value="powder">Powder</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Strength *</label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Unit *</label>
              <select name="strength_unit" value={formData.strength_unit} onChange={handleChange}>
                <option value="mg">Milligrams (mg)</option>
                <option value="mcg">Micrograms (mcg)</option>
                <option value="g">Grams (g)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="iu">International Units (IU)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (BDT) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
            />
            <label htmlFor="is_available">Available for sale</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-danger" onClick={handleDelete} disabled={loading}>
              Delete
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function deleteMedicine(medicineId, setMedicines) {
  if (!window.confirm('Are you sure you want to delete this medicine?')) return;

  try {
    await medicineAPI.deleteMedicine(medicineId);
    setMedicines(prev => prev.filter(m => m.id !== medicineId));
  } catch (err) {
    console.error('Error deleting medicine:', err);
    alert('Failed to delete medicine');
  }
}

function PharmacyInfoTab({ pharmacy, setPharmacy, showEditPharmacy, setShowEditPharmacy }) {
  return (
    <div className="pharmacy-info-tab">
      <div className="tab-header">
        <h2>Pharmacy Information</h2>
        <button className="btn-primary" onClick={() => setShowEditPharmacy(!showEditPharmacy)}>
          <Edit2 size={18} /> Edit Info
        </button>
      </div>

      {showEditPharmacy && (
        <EditPharmacyForm
          pharmacy={pharmacy}
          setPharmacy={setPharmacy}
          onClose={() => setShowEditPharmacy(false)}
        />
      )}

      <div className="pharmacy-details">
        <div className="detail-row">
          <span className="label">Pharmacy Name:</span>
          <span className="value">{pharmacy.name}</span>
        </div>
        <div className="detail-row">
          <span className="label">License Number:</span>
          <span className="value">{pharmacy.license_number}</span>
        </div>
        <div className="detail-row">
          <span className="label">Type:</span>
          <span className="value">{pharmacy.pharmacy_type}</span>
        </div>
        <div className="detail-row">
          <span className="label">Email:</span>
          <span className="value">{pharmacy.email}</span>
        </div>
        <div className="detail-row">
          <span className="label">Phone:</span>
          <span className="value">{pharmacy.phone_number}</span>
        </div>
        <div className="detail-row">
          <span className="label">Address:</span>
          <span className="value">{pharmacy.address}</span>
        </div>
        <div className="detail-row">
          <span className="label">Delivery Time:</span>
          <span className="value">{pharmacy.delivery_time_hours} hours</span>
        </div>
        <div className="detail-row">
          <span className="label">Min Order Amount:</span>
          <span className="value">৳{pharmacy.min_order_amount}</span>
        </div>
        <div className="detail-row">
          <span className="label">Delivery Charge:</span>
          <span className="value">৳{pharmacy.delivery_charge}</span>
        </div>
        <div className="detail-row">
          <span className="label">Status:</span>
          <span className={`value status-badge ${pharmacy.is_available ? 'available' : 'unavailable'}`}>
            {pharmacy.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="detail-row">
          <span className="label">Verified:</span>
          <span className={`value status-badge ${pharmacy.is_verified ? 'verified' : 'unverified'}`}>
            {pharmacy.is_verified ? 'Verified' : 'Pending Verification'}
          </span>
        </div>
      </div>
    </div>
  );
}

function EditPharmacyForm({ pharmacy, setPharmacy, onClose }) {
  const [formData, setFormData] = useState({
    name: pharmacy.name || '',
    phone_number: pharmacy.phone_number || '',
    email: pharmacy.email || '',
    address: pharmacy.address || '',
    delivery_time_hours: pharmacy.delivery_time_hours || 24,
    min_order_amount: pharmacy.min_order_amount || 100,
    delivery_charge: pharmacy.delivery_charge || 50,
    is_available: pharmacy.is_available || true,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        delivery_time_hours: parseInt(formData.delivery_time_hours),
        min_order_amount: parseFloat(formData.min_order_amount),
        delivery_charge: parseFloat(formData.delivery_charge),
      };

      const response = await medicineAPI.updatePharmacy(pharmacy.id, payload);
      setPharmacy(response.data);
      onClose();
    } catch (err) {
      console.error('Error updating pharmacy:', err);
      setError(err.response?.data?.detail || 'Failed to update pharmacy info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharmacy-form-container">
      <div className="pharmacy-form">
        <h3>Edit Pharmacy Information</h3>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Pharmacy Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Delivery Time (hours) *</label>
              <input
                type="number"
                name="delivery_time_hours"
                value={formData.delivery_time_hours}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Min Order Amount (BDT) *</label>
              <input
                type="number"
                name="min_order_amount"
                value={formData.min_order_amount}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Delivery Charge (BDT) *</label>
              <input
                type="number"
                name="delivery_charge"
                value={formData.delivery_charge}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
            />
            <label htmlFor="is_available">Available for orders</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
