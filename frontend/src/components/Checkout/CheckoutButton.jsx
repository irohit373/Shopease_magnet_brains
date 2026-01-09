import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import checkoutService from '../../services/checkoutService';

const CheckoutButton = () => {
  const { items, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare items for checkout
      const checkoutItems = items.map((item) => ({
        productId: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // Create checkout session
      const response = await checkoutService.createCheckoutSession(checkoutItems);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe-hosted checkout page using the URL
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    border: 'none',
    cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer',
    backgroundColor: loading || items.length === 0 ? '#d1d5db' : '#4f46e5',
    color: loading || items.length === 0 ? '#6b7280' : 'white'
  };

  return (
    <div>
      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem', textAlign: 'center' }}>{error}</p>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        style={buttonStyle}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <svg
              style={{ height: '1.25rem', width: '1.25rem' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Checkout · $${cartTotal.toFixed(2)}`
        )}
      </button>
    </div>
  );
};

export default CheckoutButton;
