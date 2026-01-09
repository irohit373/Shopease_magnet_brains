import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/Cart/CartItem';
import checkoutService from '../services/checkoutService';

const CartPage = () => {
  const { items, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const subtotal = cartTotal;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Validate email
    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    setLoading(true);
    setError(null);

    try {
      const checkoutItems = items.map((item) => ({
        productId: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const response = await checkoutService.createCheckoutSession(checkoutItems, email);

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

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <svg
            style={{ margin: '0 auto', height: '6rem', width: '6rem', color: '#9ca3af' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 style={{ marginTop: '1.5rem', fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            Your cart is empty
          </h2>
          <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
            Looks like you haven't added any items yet.
          </p>
          <Link
            to="/products"
            style={{ marginTop: '1.5rem', display: 'inline-block', backgroundColor: '#4f46e5', color: 'white', fontWeight: '600', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '2rem' }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Cart Items */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
            <Link
              to="/products"
              style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}
            >
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              style={{ color: '#dc2626', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '1.5rem', position: 'sticky', top: '6rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Order Summary
            </h3>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '0.75rem' }}>
                <span>Subtotal ({items.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '0.75rem' }}>
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span style={{ color: '#16a34a' }}>Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', marginBottom: '0.75rem' }}>
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              {subtotal < 100 && (
                <p style={{ fontSize: '0.875rem', color: '#4f46e5' }}>
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Email Input Field */}
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Email Address <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="Enter your email for order confirmation"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: emailError ? '2px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = emailError ? '#dc2626' : '#d1d5db'}
              />
              {emailError && (
                <p style={{ marginTop: '0.25rem', color: '#dc2626', fontSize: '0.75rem' }}>{emailError}</p>
              )}
              <p style={{ marginTop: '0.25rem', color: '#6b7280', fontSize: '0.75rem' }}>
                We'll send your order confirmation and receipt to this email.
              </p>
            </div>

            {error && (
              <p style={{ marginTop: '1rem', color: '#dc2626', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                backgroundColor: loading ? '#d1d5db' : '#4f46e5',
                color: loading ? '#6b7280' : 'white'
              }}
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
                'Proceed to Checkout'
              )}
            </button>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: '1rem', width: '1rem' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Secure checkout with Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
