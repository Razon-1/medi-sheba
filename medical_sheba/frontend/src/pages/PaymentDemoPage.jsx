import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Payment from '../components/Payment';
import '../styles/PaymentDemo.css';
import useAuthStore from '../context/authStore';
import paymentsAPI from '../api/payments';

const PaymentDemoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = location.state?.plan;
  const isFreeTrial = Boolean(plan?.isTrial);
  const [subscriptionQuote, setSubscriptionQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const getBackendDuration = (planLabel) => {
    const label = String(planLabel?.duration || '').toLowerCase();
    if (label.includes('year')) return 'annual';
    if (label.includes('month')) return 'monthly';
    return 'monthly';
  };

  const getBackendPlan = (planLabel) => {
    const label = String(planLabel?.name || '').toLowerCase();
    if (label.includes('year')) return 'professional';
    if (label.includes('custom')) return 'professional';
    return 'premium';
  };

  const getPlanAmount = (planLabel) => {
    const parsed = Number.parseInt(String(planLabel?.price || '').replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    if (!plan || isFreeTrial) return;

    let cancelled = false;

    const createQuote = async () => {
      if (!user) {
        setQuoteError('Please log in to continue with your subscription purchase.');
        return;
      }

      try {
        setQuoteLoading(true);
        setQuoteError('');
        const response = await paymentsAPI.createSubscription({
          plan: getBackendPlan(plan),
          duration: getBackendDuration(plan),
          amount: getPlanAmount(plan),
        });

        if (!cancelled) {
          setSubscriptionQuote(response.subscription);
        }
      } catch (err) {
        if (!cancelled) {
          const userMessage = err?.detail || err?.message || (typeof err === 'string' ? err : null);
          setQuoteError(userMessage || 'Failed to prepare subscription');
        }
      } finally {
        if (!cancelled) {
          setQuoteLoading(false);
        }
      }
    };

    createQuote();

    return () => {
      cancelled = true;
    };
  }, [plan, isFreeTrial, user]);

  const paymentConfig = !isFreeTrial && plan
    ? {
        paymentType: 'subscription',
        amount: Number.parseInt(String(plan.price).replace(/[^0-9]/g, ''), 10) || 0,
        referenceId: null,
        referenceType: 'subscription',
        serviceName: `${plan.name} Subscription`,
        patientName: 'Account Holder',
      }
    : {
        paymentType: 'appointment',
        amount: 900,
        referenceId: 1,
        referenceType: 'appointment',
        serviceName: 'Appointment with Dr. Dr Hamid Islam',
        patientName: 'Patient Name',
      };

  const nextPath = location.state?.next || '/';

  const handlePaymentClose = () => {
    navigate(nextPath);
  };

  const handleStartFreeTrial = async () => {
    if (!user) {
      navigate('/login', { state: { next: location.pathname } });
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await paymentsAPI.startTrial();

      if (response && user) {
        const updated = { ...user, has_made_first_payment: true };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }

      navigate(nextPath, { replace: true });
    } catch (err) {
      if (err.status === 401) {
        setError('Please log in again to activate your free trial.');
        return;
      }
      setError(err.detail || err.message || 'Failed to start free trial');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (response) => {
    if (response && response.status === 'success' && user) {
      const updated = { ...user, has_made_first_payment: true };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
    navigate(nextPath);
  };

  if (isFreeTrial) {
    return (
      <div className="payment-demo-page" style={{ padding: '32px 16px' }}>
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #6236d6, #7b5cf0)',
            color: '#fff',
            borderRadius: 24,
            padding: '32px',
            boxShadow: '0 20px 50px rgba(50, 31, 120, 0.22)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 700, letterSpacing: 0.4 }}>Free Trial Activation</div>
              <h1 style={{ margin: '10px 0 8px', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>Activate your 3-day free trial</h1>
              <p style={{ margin: 0, fontSize: 17, opacity: 0.95, maxWidth: 640 }}>
                Unlock {nextPath.includes('pharmacy') ? 'pharmacy' : nextPath.includes('ambulance') ? 'ambulance' : 'hospital'} setup instantly with no upfront payment.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>What you get</div>
                <div style={{ fontSize: 14, opacity: 0.95 }}>Create your account, set up your profile, and start using the dashboard.</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Trial length</div>
                <div style={{ fontSize: 14, opacity: 0.95 }}>3 days free, one time per admin account.</div>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: '12px 14px', color: '#fff' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={handleStartFreeTrial}
                disabled={loading}
                className="btn-primary"
                style={{ width: 'auto', padding: '14px 24px', minWidth: 220, background: '#fff', color: '#532bd4' }}
              >
                {loading ? 'Activating...' : 'Activate Free Trial'}
              </button>
              <button
                onClick={handlePaymentClose}
                className="btn-primary"
                style={{ width: 'auto', padding: '14px 24px', minWidth: 220, background: 'transparent', border: '2px solid rgba(255,255,255,0.8)', color: '#fff' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quoteLoading) {
    return (
      <div className="payment-demo-page" style={{ padding: '32px 16px', textAlign: 'center' }}>
        Preparing subscription checkout...
      </div>
    );
  }

  if (quoteError) {
    return (
      <div className="payment-demo-page" style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', background: '#fff', borderRadius: 20, padding: 24 }}>
          <h2>Subscription Checkout Error</h2>
          <p>{quoteError}</p>
          <button className="btn-primary" onClick={handlePaymentClose}>Go Back</button>
      { !user && (
        <button
          className="btn-primary"
          style={{ marginTop: 12, backgroundColor: '#fff', color: '#2c3e50' }}
          onClick={() => navigate('/login', { state: { next: '/payment' } })}
        >
          Log in to continue
        </button>
      ) }
        </div>
      </div>
    );
  }

  return (
    <div className="payment-demo-page">
      <Payment
        isOpen={true}
        onClose={handlePaymentClose}
        paymentType={paymentConfig.paymentType}
        amount={subscriptionQuote?.amount || paymentConfig.amount}
        referenceId={subscriptionQuote?.id || paymentConfig.referenceId}
        referenceType={subscriptionQuote ? 'subscription' : paymentConfig.referenceType}
        serviceName={subscriptionQuote ? `${plan.name} Subscription` : paymentConfig.serviceName}
        patientName={paymentConfig.patientName}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PaymentDemoPage;
