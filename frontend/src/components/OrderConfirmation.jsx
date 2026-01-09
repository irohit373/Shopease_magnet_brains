import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../utils/paymentUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const styles = {
  container: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#d1fae5',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
  },
  orderInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  orderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  orderRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
  },
  orderLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  orderValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  orderTotal: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#10b981',
  },
  itemsSection: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6',
  },
  itemImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginRight: '1rem',
    backgroundColor: '#f3f4f6',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1f2937',
  },
  itemQuantity: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  emailNote: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  emailIcon: {
    display: 'inline-block',
    marginRight: '0.5rem',
  },
  emailText: {
    fontSize: '0.875rem',
    color: '#1e40af',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    display: 'inline-block',
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    color: '#4f46e5',
    border: '2px solid #4f46e5',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s',
    display: 'inline-block',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },
  error: {
    textAlign: 'center',
    color: '#dc2626',
    padding: '2rem',
  },
};

// Add keyframes for spinner animation
const spinKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add spinner keyframes
    const style = document.createElement('style');
    style.textContent = spinKeyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        // First verify the session
        const verifyResponse = await fetch(`${API_URL}/checkout/verify/${sessionId}`);
        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          throw new Error(verifyData.message || 'Failed to verify payment');
        }

        // If there's an order ID, fetch order details
        if (verifyData.orderId) {
          const orderResponse = await fetch(`${API_URL}/orders/${verifyData.orderId}`);
          const orderData = await orderResponse.json();
          
          if (orderResponse.ok) {
            setOrder(orderData);
            return;
          }
        }

        // If no order yet, create one from session data
        if (verifyData.session) {
          setOrder({
            _id: verifyData.session.id?.substring(8, 24) || 'PENDING',
            total: verifyData.session.amount_total / 100,
            paymentStatus: verifyData.session.payment_status,
            items: [],
            customerEmail: verifyData.session.customer_email || verifyData.session.customer_details?.email,
          });
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Confirming your order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.error}>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <Link to="/products" style={{ ...styles.primaryButton, marginTop: '1rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.successIcon}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={styles.title}>Order Confirmed!</h1>
          <p style={styles.subtitle}>
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <div style={styles.orderInfo}>
          <div style={styles.orderRow}>
            <span style={styles.orderLabel}>Order Number</span>
            <span style={styles.orderValue}>#{order?._id?.toUpperCase() || 'N/A'}</span>
          </div>
          <div style={styles.orderRow}>
            <span style={styles.orderLabel}>Payment Status</span>
            <span
              style={{
                ...styles.orderValue,
                color: order?.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
              }}
            >
              {order?.paymentStatus === 'paid' ? 'Paid' : 'Processing'}
            </span>
          </div>
          <div style={styles.orderRow}>
            <span style={styles.orderLabel}>Date</span>
            <span style={styles.orderValue}>
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div style={styles.orderRowLast}>
            <span style={styles.orderLabel}>Total Amount</span>
            <span style={styles.orderTotal}>{formatPrice(order?.total || 0)}</span>
          </div>
        </div>

        {order?.items && order.items.length > 0 && (
          <div style={styles.itemsSection}>
            <h3 style={styles.sectionTitle}>Order Items</h3>
            {order.items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={styles.itemImage}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                )}
                <div style={styles.itemDetails}>
                  <div style={styles.itemName}>{item.name || 'Product'}</div>
                  <div style={styles.itemQuantity}>Qty: {item.quantity || 1}</div>
                </div>
                <div style={styles.itemPrice}>
                  {formatPrice((item.price || 0) * (item.quantity || 1))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.emailNote}>
          <span style={styles.emailText}>
            A confirmation email has been sent to{' '}
            <strong>{order?.customerEmail || 'your email address'}</strong>
          </span>
        </div>

        <div style={styles.buttonGroup}>
          <Link
            to="/orders"
            style={styles.primaryButton}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#4338ca')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#4f46e5')}
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            style={styles.secondaryButton}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#4f46e5';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.color = '#4f46e5';
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
