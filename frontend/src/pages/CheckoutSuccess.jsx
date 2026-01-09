import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import checkoutService from '../services/checkoutService';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Clear the cart after successful payment
        clearCart();

        // Fetch order details
        const response = await checkoutService.getCheckoutSession(sessionId);
        if (response.success) {
          setOrder(response.data);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '3rem', height: '3rem', border: '2px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center' }}>
        {/* Success Icon */}
        <div style={{ margin: '0 auto', width: '5rem', height: '5rem', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg
            style={{ width: '2.5rem', height: '2.5rem', color: '#16a34a' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.125rem', marginBottom: '2rem' }}>
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {/* Order Details */}
        {order && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Order Details
            </h2>
            <div style={{ color: '#4b5563' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Order ID:</span>{' '}
                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{order.id}</span>
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Email:</span> {order.customerEmail}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Total:</span>{' '}
                <span style={{ color: '#4f46e5', fontWeight: '600' }}>
                  ${order.totalAmount?.toFixed(2)} {order.currency?.toUpperCase()}
                </span>
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Status:</span>{' '}
                <span style={{ textTransform: 'capitalize', color: '#16a34a' }}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Confirmation Message */}
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
          <p style={{ color: '#1e40af' }}>
            A confirmation email has been sent to your email address with
            your order details.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/products"
            style={{ display: 'inline-block', backgroundColor: '#4f46e5', color: 'white', fontWeight: '600', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            style={{ display: 'inline-block', backgroundColor: '#e5e7eb', color: '#1f2937', fontWeight: '600', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
