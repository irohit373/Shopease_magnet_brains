import { useState, useCallback, useRef } from 'react';
import { getStripe, redirectToCheckout } from '../utils/paymentUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(delay + jitter, RETRY_CONFIG.maxDelay);
};

/**
 * Check if error is retryable
 */
const isRetryableError = (error, status) => {
  if (RETRY_CONFIG.retryableStatuses.includes(status)) {
    return true;
  }
  
  // Network errors are retryable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Stripe rate limit errors
  if (error.type === 'StripeRateLimitError') {
    return true;
  }
  
  return false;
};

/**
 * Custom hook for payment operations with retry logic
 */
const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef(null);

  /**
   * Reset error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  /**
   * Cancel ongoing request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Make API request with retry logic
   */
  const fetchWithRetry = useCallback(async (url, options = {}, attempt = 0) => {
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        
        // Check if we should retry
        if (isRetryableError(error, response.status) && attempt < RETRY_CONFIG.maxRetries) {
          const delay = getBackoffDelay(attempt);
          setRetryCount(attempt + 1);
          
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchWithRetry(url, options, attempt + 1);
        }
        
        throw error;
      }

      return response.json();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      
      // Network error - retry if possible
      if (err.name === 'TypeError' && attempt < RETRY_CONFIG.maxRetries) {
        const delay = getBackoffDelay(attempt);
        setRetryCount(attempt + 1);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, attempt + 1);
      }
      
      throw err;
    }
  }, []);

  /**
   * Create checkout session and redirect to Stripe
   */
  const createCheckout = useCallback(async (items, customerEmail = null) => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      // Validate items
      if (!items || items.length === 0) {
        throw new Error('No items to checkout');
      }

      // Prepare checkout data
      const checkoutData = {
        items: items.map((item) => ({
          productId: item._id || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      if (customerEmail) {
        checkoutData.customerEmail = customerEmail;
      }

      // Create checkout session
      const data = await fetchWithRetry(`${API_URL}/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe-hosted checkout page
      redirectToCheckout(data.url);

      return data;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to create checkout session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry]);

  /**
   * Create payment intent for custom payment flow
   */
  const createPaymentIntent = useCallback(async (amount, currency = 'usd', metadata = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry(`${API_URL}/checkout/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency, metadata }),
      });

      return data;
    } catch (err) {
      console.error('Payment intent error:', err);
      setError(err.message || 'Failed to create payment intent');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry]);

  /**
   * Verify checkout session
   */
  const verifySession = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry(`${API_URL}/checkout/verify/${sessionId}`);
      return data;
    } catch (err) {
      console.error('Session verification error:', err);
      setError(err.message || 'Failed to verify session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry]);

  /**
   * Request refund for an order
   */
  const requestRefund = useCallback(async (orderId, reason = '', amount = null) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = amount ? `${API_URL}/refunds/partial` : `${API_URL}/refunds/full`;
      const body = { orderId, reason };
      
      if (amount) {
        body.amount = amount;
      }

      const data = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      return data;
    } catch (err) {
      console.error('Refund error:', err);
      setError(err.message || 'Failed to process refund');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry]);

  /**
   * Get payment details
   */
  const getPaymentDetails = useCallback(async (paymentIntentId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry(`${API_URL}/checkout/payment/${paymentIntentId}`);
      return data;
    } catch (err) {
      console.error('Payment details error:', err);
      setError(err.message || 'Failed to get payment details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry]);

  /**
   * Initialize Stripe instance
   */
  const initStripe = useCallback(async () => {
    try {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }
      return stripe;
    } catch (err) {
      console.error('Stripe init error:', err);
      setError(err.message || 'Failed to initialize payment system');
      throw err;
    }
  }, []);

  return {
    // State
    loading,
    error,
    retryCount,
    
    // Actions
    createCheckout,
    createPaymentIntent,
    verifySession,
    requestRefund,
    getPaymentDetails,
    initStripe,
    clearError,
    cancelRequest,
  };
};

export default usePayment;
