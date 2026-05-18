import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/payments';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const paymentsAPI = {
  // Initiate a new payment
  initiatePayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/initiate/', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to initiate payment' };
    }
  },

  // Verify payment with transaction details
  verifyPayment: async (verificationData) => {
    try {
      const response = await api.post('/payments/verify/', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to verify payment' };
    }
  },

  // Get payment status
  checkPaymentStatus: async (transactionId) => {
    try {
      const response = await api.get(`/payments/my_payments/`, {
        params: { 'transaction_id': transactionId }
      });
      return response.data[0] || null;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to check payment status' };
    }
  },

  // Get all payments for current user
  getMyPayments: async (filters = {}) => {
    try {
      const response = await api.get('/payments/my_payments/', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch payments' };
    }
  },

  // Refund a payment
  refundPayment: async (paymentId, reason) => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund/`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to refund payment' };
    }
  },

  // Subscription endpoints
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscriptions/create_subscription/', subscriptionData);
      return response.data;
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData && typeof responseData === 'object') {
        throw {
          ...responseData,
          status: error.response?.status,
        };
      }
      throw {
        detail: typeof responseData === 'string' && responseData.trim()
          ? responseData
          : 'Failed to create subscription',
        status: error.response?.status,
      };
    }
  },

  getMySubscriptions: async () => {
    try {
      const response = await api.get('/subscriptions/my_subscriptions/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch subscriptions' };
    }
  },

  getActiveSubscription: async () => {
    try {
      const response = await api.get('/subscriptions/active_subscription/');
      return response.data;
    } catch (error) {
      // No active subscription is not an error
      return null;
    }
  },

  startTrial: async () => {
    try {
      const response = await api.post('/subscriptions/start_trial/');
      return response.data;
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData && typeof responseData === 'object') {
        throw {
          ...responseData,
          status: error.response?.status,
        };
      }

      throw {
        detail: typeof responseData === 'string' && responseData.trim()
          ? responseData
          : 'Failed to start trial',
        status: error.response?.status,
      };
    }
  },

  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/cancel/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to cancel subscription' };
    }
  },

  // Payment intent endpoints
  checkPaymentIntentStatus: async (sessionToken) => {
    try {
      const response = await api.get('/intents/check_status/', {
        params: { session_token: sessionToken }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to check payment intent status' };
    }
  },
};

export default paymentsAPI;
