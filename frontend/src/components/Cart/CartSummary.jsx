import { useCart } from '../../context/CartContext';

const CartSummary = ({ onCheckout, loading }) => {
  const { items, cartTotal } = useCart();

  const subtotal = cartTotal;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>Order Summary</h3>

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

      <button
        onClick={onCheckout}
        disabled={loading || items.length === 0}
        style={{
          marginTop: '1.5rem',
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          fontWeight: '600',
          border: 'none',
          cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer',
          backgroundColor: loading || items.length === 0 ? '#d1d5db' : '#4f46e5',
          color: loading || items.length === 0 ? '#6b7280' : 'white'
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
  );
};

export default CartSummary;
