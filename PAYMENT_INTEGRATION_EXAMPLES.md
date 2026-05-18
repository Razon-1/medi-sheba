# Payment Integration Examples - Real Use Cases

## How to Add Payment to Your Existing Pages

---

## 1. Doctor Appointment Page

### Before Payment (Existing Code)
```javascript
// HospitalAdminDashboard.jsx or AppointmentBooking.jsx

function BookAppointment() {
  const [appointments, setAppointments] = useState([]);
  
  const handleBookAppointment = async (appointmentData) => {
    try {
      const response = await api.post('/appointments/', appointmentData);
      setAppointments([...appointments, response]);
      // Old: Just show confirmation
      // New: Show payment modal
    } catch (error) {
      setError(error.message);
    }
  };
}
```

### After Payment Integration
```javascript
import Payment from '../components/Payment';
import { useState } from 'react';

function BookAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [appointmentForPayment, setAppointmentForPayment] = useState(null);

  const handleBookAppointment = async (appointmentData) => {
    try {
      // 1. Create appointment with unpaid status
      const response = await api.post('/appointments/', appointmentData);
      
      // 2. Show payment modal
      setAppointmentForPayment(response);
      setShowPayment(true);
      
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePaymentSuccess = (paymentResponse) => {
    // 3. Update appointment to paid
    const updatedAppointment = {
      ...appointmentForPayment,
      payment_status: 'paid',
      payment_id: paymentResponse.payment_id
    };
    
    // 4. Update local state
    setAppointments([...appointments, updatedAppointment]);
    setShowPayment(false);
    
    // 5. Show success message
    alert('Appointment confirmed and payment received!');
  };

  return (
    <>
      {/* Your existing appointment form */}
      <form onSubmit={handleBookAppointment}>
        {/* Form fields */}
        <button type="submit">Book Appointment</button>
      </form>

      {/* Add Payment Component */}
      {appointmentForPayment && (
        <Payment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          paymentType="appointment"
          amount={appointmentForPayment.fee_amount}
          referenceId={appointmentForPayment.id}
          referenceType="appointment"
          serviceName="Doctor Appointment"
          patientName={appointmentForPayment.patient_name}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

export default BookAppointment;
```

---

## 2. E-Doctor Consultation Page

### Integration Code
```javascript
import Payment from '../components/Payment';

function BookEDoctorConsultation() {
  const [consultations, setConsultations] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingConsultation, setPendingConsultation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectSlot = async (doctorId, slotTime) => {
    try {
      setLoading(true);
      
      // Create consultation (unpaid)
      const consultationData = {
        doctor_id: doctorId,
        scheduled_time: slotTime,
        patient_name: 'Current User Name',
        patient_email: 'user@example.com',
        chief_complaint: 'Consultation',
        status: 'scheduled',
        payment_status: 'unpaid'
      };

      const response = await api.post('/edoctor/consultations/', consultationData);
      
      // Set for payment
      setPendingConsultation(response);
      setShowPayment(true);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      // Update consultation payment status
      await api.patch(`/edoctor/consultations/${pendingConsultation.id}/`, {
        payment_status: 'paid',
        is_paid: true,
        payment_id: paymentResponse.payment_id
      });

      // Add to list
      setConsultations([...consultations, {
        ...pendingConsultation,
        payment_status: 'paid'
      }]);

      setShowPayment(false);
      setPendingConsultation(null);
      
      // Show message
      alert('Consultation booked! Video link will be sent before appointment.');
      
    } catch (err) {
      setError('Failed to confirm payment');
    }
  };

  return (
    <>
      <div className="doctor-slots">
        {/* Your slot selection UI */}
        {slots.map(slot => (
          <button
            key={slot.id}
            onClick={() => handleSelectSlot(slot.doctor_id, slot.time)}
            disabled={loading}
          >
            {slot.time}
          </button>
        ))}
      </div>

      {pendingConsultation && (
        <Payment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          paymentType="edoctor"
          amount={pendingConsultation.fee_amount}
          referenceId={pendingConsultation.id}
          referenceType="edoctor"
          serviceName="E-Doctor Consultation"
          patientName={pendingConsultation.patient_name}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

export default BookEDoctorConsultation;
```

---

## 3. Ambulance Service Page

### Integration Code
```javascript
import Payment from '../components/Payment';

function RequestAmbulance() {
  const [showPayment, setShowPayment] = useState(false);
  const [ambulanceRequest, setAmbulanceRequest] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(0);

  // Calculate estimated fare based on distance
  const calculateFare = (distance) => {
    const baseFare = 200;
    const perKmCharge = 50;
    return baseFare + (distance * perKmCharge);
  };

  const handleRequestAmbulance = async (requestData) => {
    try {
      // Calculate fare
      const distance = requestData.distance || 5;
      const fare = calculateFare(distance);

      // Create request
      const response = await api.post('/ambulance/requests/', {
        ...requestData,
        estimated_fare: fare,
        payment_status: 'unpaid'
      });

      setAmbulanceRequest(response);
      setEstimatedFare(fare);
      setShowPayment(true);

    } catch (error) {
      console.error('Failed to request ambulance:', error);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      // Update request
      await api.patch(`/ambulance/requests/${ambulanceRequest.id}/`, {
        payment_status: 'paid',
        payment_id: paymentResponse.payment_id,
        status: 'accepted'
      });

      setShowPayment(false);
      alert('Ambulance will arrive shortly!');

    } catch (error) {
      console.error('Payment confirmation failed:', error);
    }
  };

  return (
    <>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleRequestAmbulance({
          patient_name: 'John Doe',
          contact_phone: '01712345678',
          pickup_location: 'Home Address',
          pickup_address: '123 Main Street',
          urgency: 'urgent',
          distance: 10 // km
        });
      }}>
        {/* Your form fields */}
        <p>Estimated Fare: {estimatedFare} BDT</p>
        <button type="submit">Request Ambulance</button>
      </form>

      {ambulanceRequest && (
        <Payment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          paymentType="ambulance"
          amount={estimatedFare}
          referenceId={ambulanceRequest.id}
          referenceType="ambulance"
          serviceName={`Ambulance - ${ambulanceRequest.urgency}`}
          patientName={ambulanceRequest.patient_name}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

export default RequestAmbulance;
```

---

## 4. Medicine Order Page

### Integration Code
```javascript
import Payment from '../components/Payment';
import paymentsAPI from '../api/payments';

function MedicineOrderCheckout() {
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [order, setOrder] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async (pharmacy_id) => {
    try {
      // Calculate total
      const total = calculateTotal(cartItems);
      setTotalAmount(total);

      // Create order
      const orderData = {
        pharmacy_id: pharmacy_id,
        patient_name: 'Current User Name',
        contact_phone: '01712345678',
        delivery_address: 'User Address',
        medicines_list: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: total,
        payment_status: 'unpaid'
      };

      const response = await api.post('/emedicine/orders/', orderData);
      setOrder(response);
      setShowPayment(true);

    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      // Update order to processing
      await api.patch(`/emedicine/orders/${order.id}/`, {
        payment_status: 'paid',
        payment_id: paymentResponse.payment_id,
        status: 'confirmed'
      });

      // Clear cart
      setCartItems([]);
      setShowPayment(false);

      alert('Order confirmed! Delivery expected within 24 hours.');

    } catch (error) {
      console.error('Payment confirmation failed:', error);
    }
  };

  return (
    <>
      <div className="cart-summary">
        <h3>Order Summary</h3>
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
            <span>{item.price * item.quantity} BDT</span>
          </div>
        ))}
        <div className="total">
          <strong>Total: {totalAmount} BDT</strong>
        </div>
        <button onClick={() => handlePlaceOrder(1)}>
          Place Order & Pay
        </button>
      </div>

      {order && (
        <Payment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          paymentType="medicine"
          amount={totalAmount}
          referenceId={order.id}
          referenceType="medicine"
          serviceName={`Medicine Order from ${order.pharmacy_name}`}
          patientName={order.patient_name}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

export default MedicineOrderCheckout;
```

---

## 5. Dashboard - Show Payment Status

### Integration Code
```javascript
import { useState, useEffect } from 'react';
import paymentsAPI from '../api/payments';

function DashboardPaymentStatus() {
  const [paymentStats, setPaymentStats] = useState({
    total_paid: 0,
    pending_payments: 0,
    recent_payments: []
  });

  useEffect(() => {
    fetchPaymentStatus();
  }, []);

  const fetchPaymentStatus = async () => {
    try {
      // Get all payments
      const payments = await paymentsAPI.getMyPayments();
      
      // Calculate stats
      const stats = {
        total_paid: payments
          .filter(p => p.status === 'success')
          .reduce((sum, p) => sum + p.amount, 0),
        pending_payments: payments.filter(p => p.status === 'pending').length,
        recent_payments: payments.slice(0, 5)
      };

      setPaymentStats(stats);
    } catch (error) {
      console.error('Failed to fetch payment status:', error);
    }
  };

  return (
    <div className="payment-stats-section">
      <h3>Payment Overview</h3>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h4>Total Spent</h4>
          <p className="amount">{paymentStats.total_paid} BDT</p>
        </div>
        
        <div className="stat-card">
          <h4>Pending Payments</h4>
          <p className="amount">{paymentStats.pending_payments}</p>
        </div>
      </div>

      <div className="recent-payments">
        <h4>Recent Payments</h4>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paymentStats.recent_payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.payment_type_display}</td>
                <td>{payment.amount} BDT</td>
                <td>
                  <span className={`status ${payment.status}`}>
                    {payment.status_display}
                  </span>
                </td>
                <td>{new Date(payment.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardPaymentStatus;
```

---

## 6. Admin - Monitor Payments

### Integration Code
```javascript
import { useState, useEffect } from 'react';
import paymentsAPI from '../api/payments';

function AdminPaymentMonitor() {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'success',
    payment_type: 'all'
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      const queryParams = {};
      if (filters.status) queryParams.status = filters.status;
      if (filters.payment_type !== 'all') queryParams.payment_type = filters.payment_type;

      const response = await paymentsAPI.getMyPayments(queryParams);
      setPayments(response);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to refund this payment?')) return;

    try {
      const reason = prompt('Enter refund reason:');
      await paymentsAPI.refundPayment(paymentId, reason);
      alert('Payment refunded successfully');
      fetchPayments();
    } catch (error) {
      alert('Failed to refund payment');
    }
  };

  return (
    <div className="admin-payment-monitor">
      <h2>Payment Management</h2>

      <div className="filters">
        <select 
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select 
          value={filters.payment_type}
          onChange={(e) => setFilters({...filters, payment_type: e.target.value})}
        >
          <option value="all">All Types</option>
          <option value="appointment">Appointment</option>
          <option value="edoctor">E-Doctor</option>
          <option value="ambulance">Ambulance</option>
          <option value="medicine">Medicine</option>
          <option value="subscription">Subscription</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Gateway</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.transaction_id}</td>
              <td>{payment.user_name}</td>
              <td>{payment.amount} BDT</td>
              <td>{payment.payment_type_display}</td>
              <td>{payment.gateway_display}</td>
              <td>
                <span className={`badge ${payment.status}`}>
                  {payment.status_display}
                </span>
              </td>
              <td>{new Date(payment.created_at).toLocaleDateString()}</td>
              <td>
                {payment.status === 'success' && (
                  <button onClick={() => handleRefund(payment.id)}>
                    Refund
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPaymentMonitor;
```

---

## Key Integration Points

### ✅ Always Include These Steps:
1. **Create Service (Unpaid)**
   ```javascript
   const response = await api.post('/service/', {
     ...data,
     payment_status: 'unpaid'
   });
   ```

2. **Show Payment Modal**
   ```javascript
   setServiceForPayment(response);
   setShowPayment(true);
   ```

3. **Handle Success**
   ```javascript
   const handlePaymentSuccess = (paymentResponse) => {
     // Update service status
     api.patch(`/service/${service.id}/`, {
       payment_status: 'paid',
       payment_id: paymentResponse.payment_id
     });
   };
   ```

4. **Pass Correct Props to Payment Component**
   - `paymentType`: Exactly match your service type
   - `amount`: Total amount to charge
   - `referenceId`: ID of the service record
   - `referenceType`: Same as paymentType

---

## Common Mistakes to Avoid

❌ **Wrong:** Deleting service if payment fails
✅ **Right:** Keep service in unpaid state, allow retry

❌ **Wrong:** Showing payment modal before creating service
✅ **Right:** Create service first (unpaid), then show payment

❌ **Wrong:** Not updating service after payment succeeds
✅ **Right:** Update service payment_status to 'paid'

❌ **Wrong:** Different values for paymentType and referenceType
✅ **Right:** Keep them consistent (both 'appointment', both 'medicine', etc)

---

## Testing Your Integration

### Before going live:
1. Book a service in your app
2. Complete payment flow
3. Verify payment record created in admin
4. Verify service status changed to 'paid'
5. Test refund flow
6. Check payment history appears in dashboard

### Success Indicators:
- ✅ Payment modal appears
- ✅ All fields validate correctly
- ✅ Payment verification succeeds
- ✅ Service status updates to paid
- ✅ Payment appears in history
- ✅ No console errors

---

You're all set! Integrate these examples into your pages and you'll have a complete payment system! 🎉

