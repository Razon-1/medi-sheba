import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Plus, Minus, Trash2, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { emedicineAPI } from '../api/emedicine';
import paymentsAPI from '../api/payments';
import useAuthStore from '../context/authStore';
import '../styles/components/OrderMedicinesModal.css';

export default function OrderMedicinesModal({ pharmacy, medicines, isOpen, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [orderData, setOrderData] = useState(null);
  
  // Patient Information
  const [patientInfo, setPatientInfo] = useState({
    patient_name: user?.name || user?.first_name || '',
    contact_phone: user?.phone || '',
    delivery_address: '',
  });

  // Check if user is logged in when modal opens
  useEffect(() => {
    if (isOpen && !user) {
      setError('Please log in to place an order');
    } else {
      setError(null);
    }
  }, [isOpen, user]);

  const addToCart = (medicine) => {
    const existingItem = cartItems.find(item => item.id === medicine.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...medicine, quantity: 1 }]);
    }
  };

  const removeFromCart = (medicineId) => {
    setCartItems(cartItems.filter(item => item.id !== medicineId));
  };

  const updateQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === medicineId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
  };

  const getOrderTotal = () => {
    const total = orderData?.total_amount ?? getTotalPrice();
    return Number(total) || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate authentication
    if (!user || !user.id) {
      setError('Please log in to place an order');
      return;
    }

    // Validate patient information
    if (!patientInfo.patient_name || !patientInfo.patient_name.trim()) {
      setError('Patient name is required');
      return;
    }

    if (!patientInfo.contact_phone || !patientInfo.contact_phone.trim()) {
      setError('Contact phone number is required');
      return;
    }

    if (!patientInfo.delivery_address || !patientInfo.delivery_address.trim()) {
      setError('Delivery address is required');
      return;
    }

    // Validate cart
    if (cartItems.length === 0) {
      setError('Please add at least one medicine to your order');
      return;
    }

    // Check minimum order amount
    const totalPrice = parseFloat(getTotalPrice());
    if (totalPrice < pharmacy.min_order_amount) {
      setError(`Minimum order amount is BDT ${pharmacy.min_order_amount}. Current total: BDT ${totalPrice.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        patient_name: patientInfo.patient_name,
        contact_phone: patientInfo.contact_phone,
        delivery_address: patientInfo.delivery_address,
        pharmacy: pharmacy.id,
        medicines_list: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
        total_amount: parseFloat(totalPrice),
        notes: prescriptionNotes || 'Order placed through Medi Sheba',
        urgency: 'normal',
      };

      console.log('Submitting medicine order:', orderData);

      const response = await emedicineAPI.createOrder(orderData);
      const createdOrder = response.data || response;

      console.log('Order created successfully:', createdOrder);

      setOrderData(createdOrder);
      setSuccess(true);
      setCartItems([]);
      setPrescriptionNotes('');
      setPatientInfo({
        patient_name: user?.name || user?.first_name || '',
        contact_phone: user?.phone || '',
        delivery_address: '',
      });

      const checkoutResponse = await paymentsAPI.initiateSSLCommerzPayment({
        amount: Number(createdOrder.total_amount ?? totalPrice) || 0,
        payment_type: 'medicine',
        reference_id: createdOrder.id,
        reference_type: 'medicine_order',
      });
      const checkoutUrl = checkoutResponse.gateway_url || checkoutResponse.redirect_url || checkoutResponse.GatewayPageURL;

      if (!checkoutUrl) {
        throw { detail: 'Order placed, but SSLCommerz did not return a checkout URL' };
      }

      window.location.href = checkoutUrl;

    } catch (err) {
      console.error('Error placing order:', err);
      console.error('Error response:', err.response?.data);

      let errorMessage = 'Failed to place order. Please try again.';

      if (err.detail) {
        errorMessage = err.detail;
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0] || errorMessage;
        } else if (typeof err.response.data === 'object') {
          // Build detailed error message from field errors
          const errorMessages = [];
          Object.keys(err.response.data).forEach(key => {
            if (err.response.data[key]) {
              const fieldError = err.response.data[key];
              const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
              const errorText = Array.isArray(fieldError) ? fieldError[0] : fieldError;
              errorMessages.push(`${fieldName}: ${errorText}`);
            }
          });
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n');
          }
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    onClose();
    navigate('/login');
  };

  if (!isOpen || !pharmacy) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content order-medicines-modal">
        <div className="modal-header">
          <h2>Order Medicines</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="success-message">
              <CheckCircle size={48} color="#10B981" />
              <h3>Order Placed Successfully! 🎉</h3>
              <p>Thank you for your order at {pharmacy.name}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#666' }}>
                Redirecting to SSLCommerz secure checkout...
              </p>
            </div>
          ) : (
            <>
              {/* Pharmacy Information */}
              <div className="pharmacy-summary">
                <div className="pharmacy-summary-info">
                  <h4>{pharmacy.name}</h4>
                  <p className="pharmacy-contact">📞 {pharmacy.phone_number}</p>
                  <p className="pharmacy-address">📍 {pharmacy.address}</p>
                  <p className="delivery-time">🚚 Delivery in {pharmacy.delivery_time_hours} hours</p>
                  <p className="min-order">Minimum order: BDT {pharmacy.min_order_amount}</p>
                </div>
              </div>

              {error && (
                <div className="error-alert">
                  <AlertCircle size={18} />
                  <div className="error-content">
                    <span>{error}</span>
                    {!user && (
                      <button 
                        type="button"
                        className="btn-login-prompt"
                        onClick={handleLoginClick}
                      >
                        Login
                      </button>
                    )}
                  </div>
                </div>
              )}

              {user && (
                <>
                  {/* Available Medicines List */}
                  <div className="medicines-list-section">
                    <h3>Available Medicines</h3>
                    <div className="medicines-available">
                      {medicines && medicines.length > 0 ? (
                        medicines.map(medicine => (
                          <div key={medicine.id} className="medicine-item">
                            <div className="medicine-details">
                              <h5>{medicine.name}</h5>
                              <p className="generic-name">{medicine.generic_name}</p>
                              <p className="medicine-info">
                                <strong>{medicine.strength} {medicine.strength_unit}</strong> - {medicine.medicine_type}
                              </p>
                              <p className="manufacturer">{medicine.manufacturer}</p>
                              <p className="price">BDT {parseFloat(medicine.price).toFixed(2)}</p>
                            </div>
                            <button
                              type="button"
                              className="btn-add-medicine"
                              onClick={() => addToCart(medicine)}
                            >
                              + Add
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="no-medicines">No medicines available from this pharmacy</p>
                      )}
                    </div>
                  </div>

                  {/* Shopping Cart */}
                  {cartItems.length > 0 && (
                    <div className="cart-section">
                      <h3>Order Summary</h3>
                      <div className="cart-items">
                        {cartItems.map(item => (
                          <div key={item.id} className="cart-item">
                            <div className="cart-item-info">
                              <h5>{item.name}</h5>
                              <p className="item-strength">{item.strength} {item.strength_unit}</p>
                            </div>
                            <div className="cart-item-quantity">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="quantity">{item.quantity}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <div className="cart-item-price">
                              <p>BDT {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                            </div>
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="order-total">
                        <div className="total-row">
                          <span>Subtotal:</span>
                          <span>BDT {getTotalPrice()}</span>
                        </div>
                        <div className="total-row highlight">
                          <span>Total:</span>
                          <span>BDT {getTotalPrice()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Patient Information */}
                  <div className="patient-info-section">
                    <h3>Delivery Information</h3>
                    
                    <div className="form-group">
                      <label htmlFor="patient_name">Full Name *</label>
                      <input
                        type="text"
                        id="patient_name"
                        value={patientInfo.patient_name}
                        onChange={(e) => setPatientInfo({ ...patientInfo, patient_name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact_phone">Contact Phone *</label>
                      <input
                        type="tel"
                        id="contact_phone"
                        value={patientInfo.contact_phone}
                        onChange={(e) => setPatientInfo({ ...patientInfo, contact_phone: e.target.value })}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="delivery_address">Delivery Address *</label>
                      <textarea
                        id="delivery_address"
                        value={patientInfo.delivery_address}
                        onChange={(e) => setPatientInfo({ ...patientInfo, delivery_address: e.target.value })}
                        placeholder="Enter complete delivery address including building name, street, and area..."
                        rows="3"
                        required
                      />
                    </div>
                  </div>

                  {/* Prescription Notes */}
                  <div className="prescription-section">
                    <label htmlFor="notes">Prescription / Special Notes (Optional)</label>
                    <textarea
                      id="notes"
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      placeholder="Add prescription details, allergies, or special instructions..."
                      rows="3"
                    />
                  </div>

                  {/* Phone Confirmation Notice */}
                  <div className="phone-notice">
                    <Phone size={18} className="icon" />
                    <div>
                      <strong>How it works:</strong>
                      <p>We will call you to confirm your order and delivery address.</p>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-cancel" 
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      className="btn-confirm" 
                      onClick={handleSubmit}
                      disabled={loading || cartItems.length === 0}
                    >
                      {loading ? 'Placing Order...' : `Place Order (BDT ${getTotalPrice()})`}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
