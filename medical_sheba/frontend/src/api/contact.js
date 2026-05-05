import client from './client';

const API_URL = '/contact';

export const contactAPI = {
  // Submit a contact message
  submitMessage: async (data) => {
    try {
      const response = await client.post(`${API_URL}/messages/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit message' };
    }
  },

  // Get all messages (admin only)
  getMessages: async () => {
    try {
      const response = await client.get(`${API_URL}/messages/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch messages' };
    }
  },

  // Get new messages (admin only)
  getNewMessages: async () => {
    try {
      const response = await client.get(`${API_URL}/messages/new_messages/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch new messages' };
    }
  },

  // Mark message as read (admin only)
  markAsRead: async (messageId) => {
    try {
      const response = await client.post(`${API_URL}/messages/${messageId}/mark_as_read/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark as read' };
    }
  },

  // Mark message as responded (admin only)
  markAsResponded: async (messageId) => {
    try {
      const response = await client.post(`${API_URL}/messages/${messageId}/mark_as_responded/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark as responded' };
    }
  },

  // Update message (admin only)
  updateMessage: async (messageId, data) => {
    try {
      const response = await client.patch(`${API_URL}/messages/${messageId}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update message' };
    }
  },

  // Delete message (admin only)
  deleteMessage: async (messageId) => {
    try {
      const response = await client.delete(`${API_URL}/messages/${messageId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete message' };
    }
  },
};
