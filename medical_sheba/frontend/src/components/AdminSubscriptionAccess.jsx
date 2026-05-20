import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import paymentsAPI from '../api/payments';

export function useAdminSubscriptionAccess(requiredRole) {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessState, setAccessState] = useState('checking');
  const [accessError, setAccessError] = useState('');
  const [trialLoading, setTrialLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      if (!user) {
        if (!cancelled) {
          setCheckingAccess(false);
          setAccessState('none');
        }
        return;
      }

      if (!user.roles?.includes(requiredRole) && !user.is_superuser) {
        navigate('/');
        return;
      }

      try {
        const activeSubscription = await paymentsAPI.getActiveSubscription();
        if (activeSubscription) {
          if (!user.has_made_first_payment && !cancelled) {
            const updated = { ...user, has_made_first_payment: true };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
          }
          if (!cancelled) {
            setAccessState('active');
            setAccessError('');
          }
          return;
        }

        if (!cancelled) {
          setAccessState(user.has_made_first_payment ? 'expired' : 'none');
        }
      } catch (error) {
        if (!cancelled) {
          setAccessState(user.has_made_first_payment ? 'expired' : 'none');
        }
      } finally {
        if (!cancelled) {
          setCheckingAccess(false);
        }
      }
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [navigate, requiredRole, setUser, user]);

  const startTrial = async () => {
    try {
      setAccessError('');
      setTrialLoading(true);
      const response = await paymentsAPI.startTrial();
      if (response && user) {
        const updated = { ...user, has_made_first_payment: true };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      setAccessState('active');
    } catch (error) {
      if (error.status === 401) {
        setAccessError('You must be logged in to start a trial. Redirecting to login...');
        setTimeout(() => navigate('/login'), 1200);
        return;
      }
      setAccessError(error.detail || error.message || 'Failed to start trial');
    } finally {
      setTrialLoading(false);
    }
  };

  return {
    checkingAccess,
    accessState,
    accessError,
    trialLoading,
    startTrial,
  };
}

export function AdminSubscriptionPrompt({
  accessState,
  accessError,
  trialLoading,
  onStartTrial,
  serviceName,
  loadingTitle,
  loadingText,
}) {
  const navigate = useNavigate();
  const isExpired = accessState === 'expired';

  if (accessState === 'checking') {
    return (
      <div className="subscription-required">
        <div className="subscription-box">
          <h2>{loadingTitle || 'Checking Access'}</h2>
          <p>{loadingText || 'Checking your subscription access...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-required">
      <div className="subscription-box">
        <h2>{isExpired ? 'Trial Expired' : 'Subscription Required'}</h2>
        <p>
          {isExpired
            ? `Your free trial ended. Please choose a monthly or yearly plan to continue using ${serviceName}.`
            : `Start your free trial to unlock ${serviceName}.`}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isExpired && (
            <div style={{ flex: '1 1 260px', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Free Trial</div>
              <div style={{ fontSize: 13, opacity: 0.95, marginTop: 4 }}>3 days - No upfront payment - Continue after activation</div>
            </div>
          )}
          {isExpired && (
            <div style={{ flex: '1 1 260px', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Paid Plans</div>
              <div style={{ fontSize: 13, opacity: 0.95, marginTop: 4 }}>Monthly and yearly plans unlock access again after successful payment.</div>
            </div>
          )}
        </div>
        <div className="subscription-actions">
          {isExpired ? (
            <button className="btn-primary" type="button" onClick={() => navigate('/#subscription-plans')}>
              Choose Paid Plan
            </button>
          ) : (
            <button className="btn-outline" type="button" onClick={onStartTrial} disabled={trialLoading}>
              {trialLoading ? 'Starting Trial...' : 'Continue Free Trial'}
            </button>
          )}
        </div>
        {accessError && !isExpired && <div className="error-banner"><span>{accessError}</span></div>}
      </div>
    </div>
  );
}
