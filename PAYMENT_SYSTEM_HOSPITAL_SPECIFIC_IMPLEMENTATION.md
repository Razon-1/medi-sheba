# Hospital-Specific Payment System - Implementation Complete

## Summary
Successfully implemented a hospital-specific payment system where each hospital uses its own primary phone number for payment transactions. The system routes payments through the appropriate hospital based on service affiliation.

## Changes Made

### 1. **Database Model Updates** (`apps/payments/models.py`)

#### Added Fields
- `hospital` - ForeignKey to Hospital model (nullable)
  - Stores which hospital the payment is associated with
  - Used for payment routing and audit trails

- `hospital_payment_number` - CharField(max_length=20)
  - Stores the hospital's phone number (from hospital.phone_primary)
  - Displayed to users for payment instructions

#### Removed Fields
- `card_last_four` - No longer needed (card payments removed)
- `card_holder_name` - No longer needed (card payments removed)

#### Gateway Choices Updated
- `GATEWAY_CHOICES` now only includes:
  - `bkash` - bKash mobile money
  - `nagad` - Nagad mobile money
  - `rocket` - Rocket mobile money
- Removed: `card`, `bank_transfer` options

**Migration Created:** `apps/payments/migrations/0003_remove_payment_card_holder_name_and_more.py`

### 2. **Business Logic Updates** (`apps/payments/views.py`)

#### New Method: `_get_hospital_for_service()`
Maps payment types to associated hospitals:

```python
def _get_hospital_for_service(self, payment_type, reference_id):
    try:
        if payment_type == 'appointment' and reference_id:
            doctor = Doctor.objects.get(id=reference_id)
            return doctor.hospital
        elif payment_type == 'edoctor' and reference_id:
            edoctor = EDoctorProfile.objects.get(id=reference_id)
            return edoctor.hospital
        elif payment_type == 'ambulance' and reference_id:
            ambulance = AmbulanceService.objects.get(id=reference_id)
            return ambulance.hospital
        elif payment_type == 'subscription':
            if hasattr(self.request.user, 'hospital_admin'):
                return self.request.user.hospital_admin
            return None
        return None
    except (Doctor.DoesNotExist, EDoctorProfile.DoesNotExist, AmbulanceService.DoesNotExist):
        return None
```

#### Updated Method: `_get_payment_instructions()`
Now uses hospital-specific payment number:

```python
def _get_payment_instructions(self, payment):
    payment_number = payment.hospital_payment_number or '01322458732'  # Fallback
    instructions = {
        'bkash': {
            'description': 'Send money to bKash',
            'phone': payment_number,
            'note': f'Send {payment.amount} BDT to merchant account...'
        },
        'nagad': {
            'description': 'Send money to Nagad',
            'phone': payment_number,
            'note': f'Send {payment.amount} BDT to merchant account...'
        },
        'rocket': {
            'description': 'Send money to Rocket',
            'phone': payment_number,
            'note': f'Send {payment.amount} BDT to merchant account...'
        },
    }
    return instructions.get(payment.gateway, {})
```

#### Updated Method: `initiate()`
Now resolves hospital and stores in payment:

```python
# In initiate() action:
hospital = self._get_hospital_for_service(payment_type, reference_id)
payment.hospital = hospital
payment.hospital_payment_number = hospital.phone_primary if hospital else None

# Response includes:
response_data = {
    ...existing fields...,
    'hospital': payment.hospital.id if payment.hospital else None,
    'hospital_name': payment.hospital.name if payment.hospital else None,
    'hospital_payment_number': payment.hospital_payment_number,
    'payment_instructions': self._get_payment_instructions(payment),
}
```

### 3. **API Serializer Updates** (`apps/payments/serializers.py`)

#### PaymentSerializer
Added/Updated fields:
- `hospital` - ForeignKey to hospital
- `hospital_name` - Read-only SerializerMethodField
- `hospital_payment_number` - Payment phone number

Removed fields:
- `card_last_four`
- `card_holder_name`

#### PaymentInitiateSerializer
Removed fields:
- `card_holder_name`
- `card_last_four`

Kept fields:
- `amount`, `gateway`, `payment_type`, `reference_id`, `reference_type`
- `mobile_number`, `mobile_name`

### 4. **Frontend Component Updates** (`frontend/src/components/Payment.jsx`)

#### Payment Methods Updated
- Now only shows 3 options: bKash, Nagad, Rocket
- Removed Card/Debit payment option

#### Form Fields Simplified
- `mobile_number` - User's mobile account number
- `mobile_name` - User's mobile account name
- Removed: `card_last_four`, `card_holder_name`

#### Validation
- Function renamed: `validateCardDetails()` → `validatePaymentDetails()`
- Now validates only mobile payment fields
- No card validation logic

#### API Integration
- Sends payment type and reference ID
- Receives `hospital_payment_number` in response
- Displays hospital-specific phone number to user

#### Removed Code
- Removed `getDialCode()` function (no longer needed)
- Removed all card-related input handlers
- Removed card payment validation logic

## Payment Flow

### Doctor Appointment Payment
1. User selects doctor → Creates appointment
2. Payment modal opens with `payment_type='appointment'`, `reference_id=doctor.id`
3. Backend resolves: `Doctor.hospital` → hospital
4. Stores: `payment.hospital_payment_number = hospital.phone_primary`
5. API returns hospital-specific payment number
6. User pays to that hospital's mobile money account

### E-Doctor Consultation Payment
1. User selects e-doctor → Creates consultation
2. Payment modal: `payment_type='edoctor'`, `reference_id=edoctor.id`
3. Backend resolves: `EDoctorProfile.hospital` → hospital
4. Stores: `payment.hospital_payment_number = hospital.phone_primary`
5. User pays to hospital's mobile account

### Ambulance Service Payment
1. User requests ambulance → Creates booking
2. Payment modal: `payment_type='ambulance'`, `reference_id=ambulance.id`
3. Backend resolves: `AmbulanceService.hospital` → hospital
4. Stores: `payment.hospital_payment_number = hospital.phone_primary`
5. User pays to hospital's mobile account

### Subscription Payment
1. User purchases subscription → Creates subscription
2. Payment modal: `payment_type='subscription'`, no reference_id needed
3. Backend resolves: `user.hospital_admin` if user has hospital affiliation
4. Stores: `payment.hospital_payment_number` from hospital or uses fallback
5. User pays to appropriate mobile account

## Fallback Behavior
- If hospital not found: Uses default phone `01322458732`
- If hospital has no phone_primary: Uses default phone
- Works for any hospital configuration

## Database Migration
Run the following to apply changes:
```bash
cd medical_sheba
python manage.py makemigrations payments
python manage.py migrate payments
```

## Testing Results ✓

### Model Validation
- ✓ `hospital` field exists in Payment model
- ✓ `hospital_payment_number` field exists in Payment model
- ✓ `card_last_four` field removed
- ✓ `card_holder_name` field removed
- ✓ Payment model migration applied successfully

### Gateway Choices
- ✓ Only bKash, Nagad, Rocket available
- ✓ No card or bank transfer options

### Serializer Updates
- ✓ `hospital` field included in response
- ✓ `hospital_payment_number` field included in response
- ✓ Card fields removed from serializer
- ✓ Mobile payment fields retained

### Frontend Component
- ✓ Only 3 payment method buttons (bKash, Nagad, Rocket)
- ✓ No card option visible
- ✓ Mobile payment details form working
- ✓ Validation functions properly named
- ✓ `getDialCode()` function removed
- ✓ All card-related code removed

## API Endpoint Response Example

### POST /api/payments/payments/initiate/

**Request:**
```json
{
  "amount": 500,
  "gateway": "bkash",
  "payment_type": "appointment",
  "reference_id": 123,
  "mobile_number": "01700000000",
  "mobile_name": "John Doe"
}
```

**Response:**
```json
{
  "id": 456,
  "transaction_id": "TXN-123-1234567890.123456-abcd1234",
  "amount": 500,
  "currency": "BDT",
  "gateway": "bkash",
  "payment_type": "appointment",
  "reference_id": 123,
  "reference_type": "appointment",
  "hospital": 1,
  "hospital_name": "City Hospital",
  "hospital_payment_number": "01711111111",
  "status": "pending",
  "mobile_number": "01700000000",
  "mobile_name": "John Doe",
  "payment_instructions": {
    "bkash": {
      "description": "Send money to bKash",
      "phone": "01711111111",
      "note": "Send 500 BDT to merchant account..."
    }
  },
  "created_at": "2026-05-18T10:00:00Z"
}
```

## Files Modified

1. `medical_sheba/apps/payments/models.py`
   - Added `hospital` ForeignKey
   - Added `hospital_payment_number` CharField
   - Removed `card_last_four` CharField
   - Removed `card_holder_name` CharField
   - Updated `GATEWAY_CHOICES`

2. `medical_sheba/apps/payments/views.py`
   - Added `_get_hospital_for_service()` method
   - Updated `_get_payment_instructions()` method
   - Updated `initiate()` action
   - Added imports: Hospital, Doctor, EDoctorProfile, AmbulanceService

3. `medical_sheba/apps/payments/serializers.py`
   - Updated `PaymentSerializer` fields
   - Updated `PaymentInitiateSerializer` fields
   - Removed card field references

4. `medical_sheba/frontend/src/components/Payment.jsx`
   - Updated `paymentMethods` array (3 methods only)
   - Updated `paymentDetails` state structure
   - Removed `handleCardInput()` function
   - Renamed `validateCardDetails()` to `validatePaymentDetails()`
   - Removed `getDialCode()` function
   - Updated form rendering for mobile-only payment

5. `medical_sheba/apps/payments/migrations/0003_*.py`
   - Created migration for model field changes

## Status: ✓ COMPLETE

The hospital-specific payment system is fully implemented and tested. Each hospital now uses its own primary phone number for payment transactions, providing better payment tracking and routing to the correct hospital merchant accounts.
