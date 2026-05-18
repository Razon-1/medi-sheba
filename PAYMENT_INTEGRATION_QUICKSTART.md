# Payment System Quick Start Guide

## Overview
Complete payment system for healthcare services with multiple payment methods (Mobile Money & Card).

## Key Features
✅ Multiple payment methods (bKash, Nagad, Rocket, Card)  
✅ Real-time payment verification  
✅ Service-linked payments  
✅ Subscription management  
✅ Payment history tracking  
✅ No real API needed for testing  

## Supported Payment Types
1. **Doctor Appointments** - Pay before appointment confirmation
2. **E-Doctor Consultations** - Pay before online consultation
3. **Ambulance Services** - Pay with estimated fare calculation
4. **Medicine Orders** - Pay for medicine delivery
5. **Subscription Plans** - Pay for premium features

---

## Quick Integration (5 minutes)

### Step 1: Import Payment Component
```javascript
import Payment from '../components/Payment';
import { useState } from 'react';

function BookAppointment() {
  const [showPayment, setShowPayment] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
```

### Step 2: Add Pay Button
```javascript
  const handleConfirmAppointment = (appointment) => {
    setAppointmentData(appointment);
    setShowPayment(true);
  };

  return (
    <button onClick={() => handleConfirmAppointment(appointmentData)}>
      Confirm & Pay
    </button>
  );
```

### Step 3: Add Payment Modal
```javascript
  const handlePaymentSuccess = (paymentResponse) => {
    console.log('Payment successful:', paymentResponse);
    // Update appointment status
    updateAppointment(appointmentData.id, { payment_status: 'paid' });
  };

  return (
    <>
      <Payment
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        paymentType="appointment"
        amount={appointmentData?.fee_amount}
        referenceId={appointmentData?.id}
        referenceType="appointment"
        serviceName="Doctor Appointment"
        patientName={appointmentData?.patient_name}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
```

---

## Payment Modal Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Show/hide payment modal |
| `onClose` | function | Called when user closes modal |
| `paymentType` | string | Type: appointment, edoctor, ambulance, medicine, subscription |
| `amount` | number | Amount in BDT |
| `referenceId` | number/string | ID of the service being paid for |
| `referenceType` | string | Type of reference: appointment, edoctor, ambulance, medicine, subscription |
| `serviceName` | string | Display name of service |
| `patientName` | string | Patient name (optional) |
| `onPaymentSuccess` | function | Callback after successful payment |

---

## Payment Flow Diagram

```
User clicks "Pay" 
    ↓
Select Payment Method (bKash/Nagad/Rocket/Card)
    ↓
Enter Payment Details
    ↓
Initiate Payment → Create Payment Record in DB
    ↓
Display Payment Instructions
    ↓
User Sends Money / Enters Card Details
    ↓
User Enters Transaction Reference/ID
    ↓
Verify Payment → Check if Reference Exists
    ↓
Mark Payment as Success
    ↓
Update Linked Service (Appointment/Order/etc)
    ↓
Show Success Page → Close Modal
```

---

## Testing Payment Flow

### Scenario 1: Mobile Money Payment (bKash)
1. Click "Pay Now"
2. Select "bKash"
3. Enter mobile number: `01XXXXXXXXX`
4. Enter account name: `Any Name`
5. Enter transaction ID: `12345678` (anything works)
6. Click "Verify Payment"
7. ✅ Payment successful!

### Scenario 2: Card Payment
1. Click "Pay Now"
2. Select "Card/Debit"
3. Enter name: `John Doe`
4. Enter last 4 digits: `1234`
5. Enter reference ID: `REF123456`
6. Click "Verify Payment"
7. ✅ Payment successful!

---

## Backend Integration

### Models Must Have:
```python
class MyService(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='unpaid'
    )
    payment = models.ForeignKey(
        'payments.Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='my_services'
    )
    service_cost = models.DecimalField(max_digits=10, decimal_places=2)
```

### Payment Handler (in payments/views.py):
```python
def _handle_my_service_payment(self, payment):
    """Handle payment for my service"""
    if payment.reference_id and payment.reference_type == 'my_service':
        try:
            from apps.myapp.models import MyService
            service = MyService.objects.get(id=payment.reference_id)
            service.payment = payment
            service.payment_status = 'paid'
            service.save()
        except MyService.DoesNotExist:
            pass
```

Add to `_handle_payment_success` method:
```python
elif payment.payment_type == 'my_service':
    self._handle_my_service_payment(payment)
```

---

## API Endpoints

### Initiate Payment
```
POST /api/payments/payments/initiate/

Body:
{
  "amount": 500,
  "gateway": "bkash",
  "payment_type": "appointment",
  "reference_id": 1,
  "reference_type": "appointment"
}

Response:
{
  "payment_id": 1,
  "transaction_id": "TXN-1-123456-abc",
  "session_token": "token_here",
  "amount": 500,
  "status": "pending",
  "payment_instructions": {...}
}
```

### Verify Payment
```
POST /api/payments/payments/verify/

Body:
{
  "transaction_id": "TXN-1-123456-abc",
  "gateway_reference": "12345678"
}

Response:
{
  "status": "success",
  "transaction_id": "TXN-1-123456-abc",
  "amount": 500,
  "paid_at": "2024-01-15T10:30:00Z"
}
```

---

## Payment Methods & Testing

### bKash
- **Dial Code:** *222#
- **Test Reference:** Any 10-digit number
- **Example:** Enter `1234567890` as transaction ID

### Nagad
- **Dial Code:** *167#
- **Test Reference:** Any 10-digit number
- **Example:** Enter `9876543210` as transaction ID

### Rocket
- **Dial Code:** *322#
- **Test Reference:** Any 10-digit number
- **Example:** Enter `5555555555` as transaction ID

### Card Payment
- **Cardholder:** Any name
- **Last 4 Digits:** Any 4 digits (1234, 5678, etc.)
- **Reference:** Any reference string

---

## Subscription Payment

### Plans & Pricing
```
BASIC PLAN:
- Monthly: 99 BDT
- Quarterly: 279 BDT (6% savings)
- Annual: 999 BDT (17% savings)

PREMIUM PLAN:
- Monthly: 199 BDT
- Quarterly: 549 BDT
- Annual: 1999 BDT

PROFESSIONAL PLAN:
- Monthly: 399 BDT
- Quarterly: 1099 BDT
- Annual: 3999 BDT
```

### Features by Plan
```
BASIC:
- 5 consultations/month
- 10 appointments
- Standard support

PREMIUM:
- 20 consultations/month
- 50 appointments
- Priority 24/7 support
- Video consultations

PROFESSIONAL:
- Unlimited consultations
- Unlimited appointments
- VIP 24/7 support
- Full analytics
```

---

## usePayment Hook

```javascript
import usePayment from '../hooks/usePayment';

function MyComponent() {
  const payment = usePayment();

  const handlePayClick = () => {
    payment.initiatePayment({
      type: 'appointment',
      amount: 500,
      referenceId: 1,
      referenceType: 'appointment',
      serviceName: 'Appointment',
      patientName: 'John'
    });
  };

  return (
    <>
      <button onClick={handlePayClick}>Pay</button>
      
      {payment.error && <p>{payment.error}</p>}
      {payment.success && <p>Success!</p>}
    </>
  );
}
```

---

## Common Tasks

### Task 1: Add Payment to Appointment Booking
```javascript
const handleBookAppointment = async (appointmentData) => {
  // 1. Create appointment
  const appointment = await bookAppointment(appointmentData);
  
  // 2. Show payment modal
  setAppointmentForPayment(appointment);
  setShowPayment(true);
};

const handlePaymentSuccess = (response) => {
  // 3. Update appointment to paid
  markAppointmentAsPaid(appointmentForPayment.id);
  
  // 4. Refresh UI
  refreshAppointments();
};
```

### Task 2: Add Payment to Medicine Order
```javascript
const handlePlaceOrder = async (orderData) => {
  // 1. Create order in unpaid state
  const order = await createOrder(orderData);
  
  // 2. Initiate payment
  setShowPayment({
    type: 'medicine',
    amount: order.total_amount,
    referenceId: order.id,
    serviceName: 'Medicine Order'
  });
};
```

### Task 3: Check Payment Status
```javascript
const checkPaymentStatus = async (transactionId) => {
  try {
    const payment = await paymentsAPI.checkPaymentStatus(transactionId);
    console.log('Payment status:', payment.status);
    return payment;
  } catch (error) {
    console.error('Failed to check status:', error);
  }
};
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Payment modal not opening | Check `isOpen` prop is true |
| Payment verification fails | Ensure `gateway_reference` is provided |
| Service not updated after payment | Verify `reference_id` and `reference_type` match |
| Token auth errors | Check token is in localStorage as `access_token` |
| Payment component not showing | Import style CSS file: `import '../components/Payment.css'` |

---

## Demo Page
Visit **Payment Demo Page** to test all payment flows interactively!

Routes:
- Payment Demo: `/payment-demo`
- Subscription Plans: `/subscription`

---

## Files & Locations

| File | Location | Purpose |
|------|----------|---------|
| Payment.jsx | `frontend/src/components/` | Main payment component |
| Payment.css | `frontend/src/components/` | Component styles |
| payments.js | `frontend/src/api/` | API client |
| usePayment.js | `frontend/src/hooks/` | Custom hook |
| SubscriptionPaymentPage.jsx | `frontend/src/pages/` | Subscription management |
| PaymentDemoPage.jsx | `frontend/src/pages/` | Interactive demo |
| payments/models.py | `medical_sheba/apps/payments/` | Payment models |
| payments/views.py | `medical_sheba/apps/payments/` | Payment endpoints |
| PAYMENT_SYSTEM.md | `medical_sheba/docs/` | Full documentation |

---

## Support
For issues or questions about payment integration, refer to:
1. `docs/PAYMENT_SYSTEM.md` - Comprehensive documentation
2. `frontend/src/pages/PaymentDemoPage.jsx` - Live examples
3. Backend admin panel - Check Payment records in database

