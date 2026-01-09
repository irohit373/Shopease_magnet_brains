import api from './api';

export const checkoutService = {
  // Create Stripe checkout session
  createCheckoutSession: async (items, customerEmail) => {
    const response = await api.post('/api/checkout/create-session', {
      items,
      customerEmail,
    });
    return response.data;
  },

  // Get checkout session details
  getCheckoutSession: async (sessionId) => {
    const response = await api.get(`/api/checkout/session/${sessionId}`);
    return response.data;
  },

  // Get order by session ID
  getOrderBySessionId: async (sessionId) => {
    const response = await api.get(`/api/orders/session/${sessionId}`);
    return response.data;
  },
};

export default checkoutService;
