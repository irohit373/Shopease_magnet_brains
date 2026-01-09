import { Link } from 'react-router-dom';

const CheckoutCancel = () => {
  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center' }}>
        {/* Cancel Icon */}
        <div style={{ margin: '0 auto', width: '5rem', height: '5rem', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg
            style={{ width: '2.5rem', height: '2.5rem', color: '#dc2626' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
          Payment Cancelled
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.125rem', marginBottom: '2rem' }}>
          Your payment was cancelled. No charges have been made to your account.
        </p>

        {/* Info Message */}
        <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
          <p style={{ color: '#854d0e' }}>
            Your cart items are still saved. You can continue shopping or try
            checkout again.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/cart"
            style={{ display: 'inline-block', backgroundColor: '#4f46e5', color: 'white', fontWeight: '600', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}
          >
            Return to Cart
          </Link>
          <Link
            to="/products"
            style={{ display: 'inline-block', backgroundColor: '#e5e7eb', color: '#1f2937', fontWeight: '600', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}
          >
            Continue Shopping
          </Link>
        </div>

        {/* Help Section */}
        <div style={{ marginTop: '3rem', color: '#4b5563' }}>
          <p style={{ marginBottom: '0.5rem' }}>Need help with your order?</p>
          <a
            href="mailto:support@shopease.com"
            style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
