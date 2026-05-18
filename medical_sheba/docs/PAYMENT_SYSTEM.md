# Payment System Documentation

## Overview
The Medi Sheba healthcare platform includes a comprehensive payment system supporting multiple payment methods:
- Mobile Money: bKash, Nagad, Rocket
- Card Payments: Debit/Credit cards
- Bank Transfers (optional)

## Payment Flows

### 1. Doctor Appointment Payment
```
1. User books appointment with doctor
2. Payment is required to confirm booking
3. User initiates payment via Payment modal
4. After verification, appointment status updates to "paid"
```

### 2. E-Doctor Consultation Payment
```
1. User books online consultation
2. Payment is required before consultation
3. User completes payment
4. Consultation status updated to "paid"
5. Video call link becomes accessible
```

### 3. Ambulance Service Payment
```
1. User requests ambulance
2. System calculates estimated fare
3. User initiates payment
4. After payment, ambulance assignment confirmed
5. Final fare can be adjusted after service completion
```

### 4. Medicine Order Payment
```
1. User places medicine order
2. Order total calculated
3. User completes payment
4. Order status: processing → shipped → delivered
```

### 5. Subscription Plan Payment
```
1. User selects subscription plan
2. Duration selected (monthly/quarterly/annual)
3. User initiates payment
4. Subscription activated after payment
5. Features unlocked based on plan
```

## Payment Methods

### Mobile Money (bKash, Nagad, Rocket)
**For Demo/Testing:**
1. Select payment method
2. Enter mobile number and account name
3. Send specified amount to merchant number
4. Enter transaction ID received
5. Payment verified automatically

**How System Verifies:**
- Checks if gateway_reference (transaction ID) is provided
- In production: Would validate with actual payment gateway APIs
- For testing: Any non-empty transaction ID is accepted

### Card Payment
**For Demo/Testing:**
1. Select "Card/Debit" payment method
2. Enter cardholder name
3. Enter last 4 digits of card
4. Receive verification reference
5. Enter reference to complete payment

**Security Note:** In production, use Stripe/SSLCommerz for actual card processing

## Backend API Endpoints

### Payment Endpoints
```
POST /api/payments/payments/initiate/
- Initiates a new payment
- Required fields: amount, gateway, payment_type, reference_id (optional)
- Returns: transaction_id, session_token, payment_instructions

POST /api/payments/payments/verify/
- Verifies payment with transaction reference
- Required fields: transaction_id, gateway_reference
- Updates payment status and handles post-payment logic

POST /api/payments/payments/refund/
- Refunds a successful payment
- Required fields: reason (optional)

GET /api/payments/payments/my_payments/
- Gets all payments for current user
- Supports filtering by status and payment_type
```

### Subscription Endpoints
```
POST /api/payments/subscriptions/create_subscription/
- Creates a subscription and initiates payment
- Required fields: plan, duration
- Plans: basic, premium, professional
- Durations: monthly, quarterly, annual

GET /api/payments/subscriptions/my_subscriptions/
- Gets all subscriptions for user

GET /api/payments/subscriptions/active_subscription/
- Gets current active subscription

POST /api/payments/subscriptions/{id}/cancel/
- Cancels a subscription
```

### Payment Intent Endpoints
```
GET /api/payments/intents/check_status/
- Checks payment intent status
- Query param: session_token
```

## Frontend Components

### Payment Component
**Location:** `frontend/src/components/Payment.jsx`

**Props:**
```javascript
<Payment
  isOpen={boolean}              // Controls modal visibility
  onClose={function}            // Called when modal closes
  paymentType={string}          // Type of payment (appointment, edoctor, etc)
  amount={number}               // Amount to pay in BDT
  referenceId={number|string}   // ID of the service (optional)
  referenceType={string}        // Type of reference (optional)
  serviceName={string}          // Display name of service
  patientName={string}          // Patient name (optional)
  onPaymentSuccess={function}   // Called after successful payment
/>
```

**Usage Example:**
```javascript
const [showPayment, setShowPayment] = useState(false);

const handlePaymentSuccess = (response) => {
  console.log('Payment successful:', response);
  // Update service status, refresh data, etc
};

return (
  <>
    <button onClick={() => setShowPayment(true)}>Pay Now</button>
    <Payment
      isOpen={showPayment}
      onClose={() => setShowPayment(false)}
      paymentType="appointment"
      amount={500}
      referenceId={appointmentId}
      referenceType="appointment"
      serviceName="Doctor Appointment"
      onPaymentSuccess={handlePaymentSuccess}
    />
  </>
);
```

### Subscription Payment Page
**Location:** `frontend/src/pages/SubscriptionPaymentPage.jsx`

Features:
- Browse all subscription plans
- Compare plans side-by-side
- Select plan and duration
- View savings for longer durations
- Manage current subscription
- Initiate payment for upgrades

## Integration Guide

### Step 1: Add Payment Field to Service Model
```python
# models.py
from django.db import models
from apps.payments.models import Payment

class MyService(models.Model):
    # ... other fields ...
    
    # Payment tracking
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name='my_services')
    service_cost = models.DecimalField(max_digits=10, decimal_places=2)
```

### Step 2: Update Serializer
```python
# serializers.py
class MyServiceSerializer(serializers.ModelSerializer):
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = MyService
        fields = ['...', 'payment_status', 'payment', 'service_cost']
```

### Step 3: Add Payment Handler to Views
```python
# views.py
def create_service_and_initiate_payment(self, request):
    # Create service
    service = MyService.objects.create(...)
    
    # Show payment modal in frontend
    return Response({
        'service_id': service.id,
        'requires_payment': True,
        'amount': service.service_cost,
        'payment_type': 'my_service_type'
    })
```

### Step 4: Add Payment Verification Handler
```python
# In payments/views.py PaymentViewSet._handle_payment_success()

elif payment.payment_type == 'my_service':
    self._handle_my_service_payment(payment)

def _handle_my_service_payment(self, payment):
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

### Step 5: Frontend Integration
```javascript
// In your service booking component

const [showPayment, setShowPayment] = useState(false);
const [serviceData, setServiceData] = useState(null);

const handleBookService = async (data) => {
  try {
    const response = await api.bookService(data);
    setServiceData(response);
    setShowPayment(true);
  } catch (error) {
    console.error('Booking failed:', error);
  }
};

const handlePaymentSuccess = async (paymentResponse) => {
  // Refresh service data
  const updated = await api.getService(serviceData.id);
  // Update UI
  console.log('Service payment completed:', updated);
};

return (
  <>
    <button onClick={() => handleBookService(data)}>
      Book & Pay
    </button>
    
    <Payment
      isOpen={showPayment}
      onClose={() => setShowPayment(false)}
      paymentType={serviceData?.type}
      amount={serviceData?.cost}
      referenceId={serviceData?.id}
      referenceType={serviceData?.type}
      serviceName={serviceData?.name}
      onPaymentSuccess={handlePaymentSuccess}
    />
  </>
);
```

## Testing Payment Flows

### Manual Testing
1. **Mobile Money Flow:**
   - Select bKash/Nagad/Rocket
   - Enter any mobile number
   - Enter any 5-10 digit transaction ID
   - Payment will be marked as success

2. **Card Payment Flow:**
   - Select Card/Debit
   - Enter any cardholder name
   - Enter any 4 digits
   - Enter any reference ID
   - Payment will be marked as success

3. **Payment Verification:**
   - Check database for Payment records
   - Verify status changes to 'success'
   - Verify linked service updates payment_status

### Unit Tests
```python
# tests.py
from django.test import TestCase
from apps.payments.models import Payment
from apps.users.models import User

class PaymentTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(...)
    
    def test_initiate_payment(self):
        response = self.client.post(
            '/api/payments/payments/initiate/',
            {
                'amount': 1000,
                'gateway': 'bkash',
                'payment_type': 'appointment'
            },
            HTTP_AUTHORIZATION='Bearer token'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('transaction_id', response.data)
    
    def test_verify_payment(self):
        # Create payment
        payment = Payment.objects.create(...)
        
        # Verify
        response = self.client.post(
            '/api/payments/payments/verify/',
            {
                'transaction_id': payment.transaction_id,
                'gateway_reference': 'TXN123456'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'success')
```

## Real Payment Gateway Integration

### For Production Use (bKash):
```python
import requests

def verify_bkash_payment(app_key, app_secret, bkash_account, amount, transaction_id):
    url = "https://tokenized.bkash.com/v1.2.0/agreement/payment/request"
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {app_key}:{app_secret}',
        'X-App-Key': app_key,
    }
    
    data = {
        'amount': str(amount),
        'currency': 'BDT',
        'intent': 'sale',
        'reference': transaction_id,
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()
```

## Support & Troubleshooting

### Common Issues

1. **Payment Not Verified:**
   - Ensure gateway_reference is provided
   - Check payment status in database
   - Verify linked service exists

2. **Session Token Expired:**
   - Default expiry: 30 minutes
   - User must reinitiate payment if expired
   - Check PaymentIntent.expires_at

3. **Payment Created But Service Not Updated:**
   - Verify payment reference_id and reference_type
   - Check payment handler in views.py
   - Ensure payment status is 'success'

## Future Enhancements

1. Real payment gateway integration (SSLCommerz, Stripe)
2. Payment receipts and invoices
3. Refund processing automation
4. Payment reminders and notifications
5. Payment analytics dashboard
6. Recurring/automatic subscription renewal
7. Payment method tokenization for faster checkout
