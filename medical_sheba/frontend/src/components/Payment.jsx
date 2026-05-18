import React, { useState } from 'react';
import paymentsAPI from '../api/payments';
import './Payment.css';

const Payment = ({ 
  isOpen, 
  onClose, 
  paymentType = 'appointment', 
  amount = 0, 
  referenceId = null, 
  referenceType = null,
  onPaymentSuccess = null,
  patientName = '',
  serviceName = ''
}) => {
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [step, setStep] = useState(1); // 1: select method, 2: enter details, 3: verify
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    mobile_number: '',
    mobile_name: '',
    card_holder_name: '',
    card_last_four: '',
    bkash_ref: '',
    nagad_ref: '',
    card_ref: '',
    rocket_ref: '',
  });

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', iconUrl: 'https://my.easycommerce.dev/wp-content/uploads/2025/03/Bkash-1.png', color: '#E2144F' },
    { id: 'nagad', name: 'Nagad', iconUrl: 'https://www.bssnews.net/assets/news_photos/2022/02/04/image-42525-1643965434.jpg', color: '#FE6D00' },
    { id: 'card', name: 'Card', icon: '💳', color: '#2563EB' },
    { id: 'rocket', name: 'Rocket', iconUrl: 'https://my.easycommerce.dev/wp-content/uploads/2025/04/Rocket-Payment-Integration.png', color: '#8E3BA1' },
  ];

  const currentMethod = paymentMethods.find(m => m.id === paymentMethod);

  const getPaymentTypeDisplay = () => {
    const types = {
      'appointment': 'Doctor Appointment',
      'edoctor': 'E-Doctor Consultation',
      'ambulance': 'Ambulance Service',
      'medicine': 'Medicine Order',
      'subscription': 'Subscription Plan',
    };
    return types[paymentType] || paymentType;
  };

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const paymentData = {
        amount: parseFloat(amount),
        gateway: paymentMethod,
        payment_type: paymentType,
        reference_id: referenceId,
        reference_type: referenceType || paymentType,
        ...paymentDetails,
      };

      const response = await paymentsAPI.initiatePayment(paymentData);

      console.log('Payment API Response:', response);
      console.log('Payment Instructions:', response.payment_instructions);
      setTransactionId(response.transaction_id);
      setSessionToken(response.session_token);
      setPaymentInstructions(response.payment_instructions);
      setStep(2); // Move to verification step
    } catch (err) {
      console.error('Payment initiation error:', err);
      const errorMessage = err.detail || err.message || 'Failed to initiate payment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate mobile details
      if (!validatePaymentDetails()) {
        setLoading(false);
        return;
      }

      if (!paymentDetails[`${paymentMethod}_ref`]) {
        setError(`Please enter the ${paymentMethod} transaction reference/ID`);
        setLoading(false);
        return;
      }

      const verificationData = {
        transaction_id: transactionId,
        gateway_reference: paymentDetails[`${paymentMethod}_ref`],
      };

      const response = await paymentsAPI.verifyPayment(verificationData);

      if (response.status === 'success') {
        setSuccess('Payment verified successfully!');
        setStep(3); // Move to success step
        
        // Call success callback
        if (onPaymentSuccess) {
          setTimeout(() => {
            onPaymentSuccess(response);
          }, 2000);
        }
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      setError(err.detail || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'card') {
      if (!paymentDetails.card_holder_name.trim()) {
        setError('Card holder name is required');
        return false;
      }
      if (!paymentDetails.card_last_four.trim() || paymentDetails.card_last_four.trim().length !== 4) {
        setError('Card last 4 digits are required');
        return false;
      }
      return true;
    }

    if (!paymentDetails.mobile_number.trim()) {
      setError('Mobile number is required');
      return false;
    }
    if (!paymentDetails.mobile_name.trim()) {
      setError('Name is required');
      return false;
    }
    return true;
  };

  const renderPaymentMethodStep = () => (
    <div className="payment-modal-content">
      <div className="payment-header">
        <h3>Select Payment Method</h3>
        <p>{getPaymentTypeDisplay()}</p>
      </div>

      <div className="payment-amount-display">
        <span className="amount">{amount} BDT</span>
        {serviceName && <p className="service-name">{serviceName}</p>}
        {patientName && <p className="patient-name">Patient: {patientName}</p>}
      </div>

      <div className="payment-methods-grid">
        {paymentMethods.map(method => (
          <button
            key={method.id}
            className={`payment-method-btn ${paymentMethod === method.id ? 'active' : ''}`}
            style={{
              borderColor: paymentMethod === method.id ? method.color : '#ddd',
              backgroundColor: paymentMethod === method.id ? method.color + '10' : '#f9f9f9',
            }}
            onClick={() => setPaymentMethod(method.id)}
          >
            <div className="method-icon">
              {method.iconUrl ? (
                <img src={method.iconUrl} alt={method.name} className="method-img" />
              ) : (
                method.icon
              )}
            </div>
            <div className="method-name">{method.name}</div>
          </button>
        ))}
      </div>

      <button
        className="btn-primary payment-continue-btn"
        onClick={handleInitiatePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Continue'}
      </button>

      {error && <div className="error-message">{error}</div>}
    </div>
  );

  const renderPaymentDetailsStep = () => (
    <div className="payment-modal-content">
      <div className="payment-header">
        <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
        <h3>Enter Payment Details</h3>
        <div className="selected-method" style={{ color: currentMethod.color }}>
          {currentMethod.iconUrl ? (
            <img src={currentMethod.iconUrl} alt={currentMethod.name} className="method-img inline" />
          ) : (
            currentMethod.icon
          )}
          {' '}{currentMethod.name}
        </div>
      </div>

      <div className="payment-form">
        {paymentMethod === 'card' ? (
          <>
            <div className="form-group">
              <label>Card Holder Name</label>
              <input
                type="text"
                placeholder="Name on card"
                value={paymentDetails.card_holder_name}
                onChange={(e) => handleInputChange('card_holder_name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Card Last 4 Digits</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={paymentDetails.card_last_four}
                onChange={(e) => handleInputChange('card_last_four', e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={paymentDetails.mobile_number}
                onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter name"
                value={paymentDetails.mobile_name}
                onChange={(e) => handleInputChange('mobile_name', e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="payment-instructions">
          <h4>Payment Instructions:</h4>
          <ol>
            <li>
              Send <strong>{amount} BDT</strong> to merchant account using{' '}
              {currentMethod.name}
            </li>
            {paymentMethod === 'card' ? (
              <>
                <li>Enter your <strong>card holder name</strong> and <strong>last 4 digits</strong></li>
                <li>Use the card transaction/reference ID to verify payment</li>
              </>
            ) : paymentInstructions && paymentInstructions.phone ? (
              <>
                <li>Send money to: <strong>{paymentInstructions.phone}</strong></li>
                <li>Reference: <strong>{paymentInstructions.note || 'Provide transaction ID'}</strong></li>
              </>
            ) : (
              <>
                <li>Note down the transaction reference/ID</li>
              </>
            )}
          </ol>
        </div>

        <div className="form-group">
          <label>{currentMethod.name} Transaction ID</label>
          <input
            type="text"
            placeholder={`Enter your ${currentMethod.name} transaction reference or ID`}
            value={paymentDetails[`${paymentMethod}_ref`]}
            onChange={(e) => handleInputChange(`${paymentMethod}_ref`, e.target.value)}
            required
          />
          <small>This is required to verify your payment</small>
        </div>

        <div className="payment-summary">
          <div className="summary-row">
            <span>Amount:</span>
            <strong>{amount} BDT</strong>
          </div>
          <div className="summary-row">
            <span>Service:</span>
            <strong>{getPaymentTypeDisplay()}</strong>
          </div>
          <div className="summary-row">
            <span>Payment Method:</span>
            <strong>{currentMethod.name}</strong>
          </div>
        </div>

        <button
          className="btn-primary payment-verify-btn"
          onClick={handleVerifyPayment}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Payment'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="payment-modal-content">
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h3>Payment Successful!</h3>
        <p>Your payment has been verified and processed.</p>
        
        <div className="success-details">
          <div className="detail-row">
            <span>Transaction ID:</span>
            <strong className="transaction-id">{transactionId}</strong>
          </div>
          <div className="detail-row">
            <span>Amount:</span>
            <strong>{amount} BDT</strong>
          </div>
          <div className="detail-row">
            <span>Service:</span>
            <strong>{getPaymentTypeDisplay()}</strong>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <strong>{currentMethod.name}</strong>
          </div>
        </div>

        <p className="confirmation-note">
          A confirmation email has been sent to your registered email address.
        </p>

        <button
          className="btn-primary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="close-btn" onClick={onClose}>✕</button>
        
        {step === 1 && renderPaymentMethodStep()}
        {step === 2 && renderPaymentDetailsStep()}
        {step === 3 && renderSuccessStep()}
      </div>
    </div>
  );
};

export default Payment;
