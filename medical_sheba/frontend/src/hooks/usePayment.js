import { useState, useCallback } from 'react';
import paymentsAPI from '../api/payments';

/**
 * Custom hook for handling payment operations
 * @param {Object} config - Configuration object
 * @returns {Object} Payment state and handlers
 */
export const usePayment = (config = {}) => {
  const [paymentState, setPaymentState] = useState({
    isOpen: false,
    loading: false,
    error: null,
    success: null,
    paymentData: {
      type: null,
      amount: 0,
      referenceId: null,
      referenceType: null,
      serviceName: null,
      patientName: null,
    },
  });

  const initiatePayment = useCallback(async (paymentConfig) => {
    const {
      type,
      amount,
      referenceId,
      referenceType,
      serviceName,
      patientName,
    } = paymentConfig;

    try {
      setPaymentState(prev => ({
        ...prev,
        isOpen: true,
        loading: false,
        error: null,
        paymentData: {
          type,
          amount,
          referenceId,
          referenceType,
          serviceName,
          patientName,
        },
      }));
    } catch (err) {
      setPaymentState(prev => ({
        ...prev,
        error: err.message || 'Failed to initiate payment',
      }));
    }
  }, []);

  const closePayment = useCallback(() => {
    setPaymentState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handlePaymentSuccess = useCallback((onSuccess) => {
    if (onSuccess && typeof onSuccess === 'function') {
      return (response) => {
        setPaymentState(prev => ({
          ...prev,
          isOpen: false,
          success: response,
        }));
        onSuccess(response);
      };
    }

    return (response) => {
      setPaymentState(prev => ({
        ...prev,
        isOpen: false,
        success: response,
      }));
    };
  }, []);

  const checkPaymentStatus = useCallback(async (transactionId) => {
    try {
      setPaymentState(prev => ({
        ...prev,
        loading: true,
      }));

      const payment = await paymentsAPI.checkPaymentStatus(transactionId);
      
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        success: payment,
      }));

      return payment;
    } catch (err) {
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: err.detail || 'Failed to check payment status',
      }));
      throw err;
    }
  }, []);

  const getPaymentHistory = useCallback(async (filters = {}) => {
    try {
      setPaymentState(prev => ({
        ...prev,
        loading: true,
      }));

      const payments = await paymentsAPI.getMyPayments(filters);
      
      setPaymentState(prev => ({
        ...prev,
        loading: false,
      }));

      return payments;
    } catch (err) {
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: err.detail || 'Failed to fetch payments',
      }));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setPaymentState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const clearSuccess = useCallback(() => {
    setPaymentState(prev => ({
      ...prev,
      success: null,
    }));
  }, []);

  return {
    ...paymentState,
    initiatePayment,
    closePayment,
    handlePaymentSuccess,
    checkPaymentStatus,
    getPaymentHistory,
    clearError,
    clearSuccess,
  };
};

export default usePayment;
