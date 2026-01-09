import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const styles = {
  container: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    textAlign: 'center',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  errorIcon: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  warningIcon: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.75rem',
  },
  message: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  errorCode: {
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    padding: '0.75rem',
    marginBottom: '1.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#4b5563',
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
  },
  helpSection: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  helpTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  helpList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    textAlign: 'left',
  },
  helpItem: {
    fontSize: '0.875rem',
    color: '#6b7280',
    padding: '0.25rem 0',
    paddingLeft: '1.25rem',
    position: 'relative',
  },
};

// Error messages for different Stripe error codes
const errorMessages = {
  card_declined: {
    title: 'Card Declined',
    message: 'Your card was declined. Please try a different payment method or contact your card issuer.',
    type: 'error',
  },
  expired_card: {
    title: 'Card Expired',
    message: 'Your card has expired. Please use a different card.',
    type: 'error',
  },
  incorrect_cvc: {
    title: 'Incorrect CVC',
    message: 'The CVC code you entered is incorrect. Please check and try again.',
    type: 'error',
  },
  insufficient_funds: {
    title: 'Insufficient Funds',
    message: 'Your card has insufficient funds. Please try a different payment method.',
    type: 'error',
  },
  processing_error: {
    title: 'Processing Error',
    message: 'An error occurred while processing your payment. Please try again.',
    type: 'error',
  },
  payment_cancelled: {
    title: 'Payment Cancelled',
    message: 'You cancelled the payment. Your order has not been placed.',
    type: 'warning',
  },
  session_expired: {
    title: 'Session Expired',
    message: 'Your checkout session has expired. Please try again.',
    type: 'warning',
  },
  default: {
    title: 'Payment Failed',
    message: 'We were unable to process your payment. Please try again or use a different payment method.',
    type: 'error',
  },
};

const PaymentError = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const errorCode = searchParams.get('error') || 'default';
  const sessionId = searchParams.get('session_id');
  // orderId can be used for tracking/support reference if needed
  const _orderId = searchParams.get('order_id');
  
  const errorInfo = errorMessages[errorCode] || errorMessages.default;
  const isWarning = errorInfo.type === 'warning';

  const handleRetry = () => {
    navigate('/cart');
  };

  const handleContact = () => {
    // In a real app, this might open a support chat or contact page
    window.location.href = 'mailto:support@example.com?subject=Payment Issue';
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div
          style={{
            ...styles.iconContainer,
            ...(isWarning ? styles.warningIcon : styles.errorIcon),
          }}
        >
          {isWarning ? (
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
        </div>

        <h1 style={styles.title}>{errorInfo.title}</h1>
        <p style={styles.message}>{errorInfo.message}</p>

        {(sessionId || errorCode !== 'default') && (
          <div style={styles.errorCode}>
            {errorCode !== 'default' && <div>Error Code: {errorCode}</div>}
            {sessionId && (
              <div style={{ marginTop: sessionId && errorCode !== 'default' ? '0.5rem' : 0 }}>
                Reference: {sessionId.substring(0, 20)}...
              </div>
            )}
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button
            onClick={handleRetry}
            style={styles.primaryButton}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#4338ca')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#4f46e5')}
          >
            Try Again
          </button>
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

        <div style={styles.helpSection}>
          <h3 style={styles.helpTitle}>Need Help?</h3>
          <ul style={styles.helpList}>
            <li style={styles.helpItem}>• Check that your card details are correct</li>
            <li style={styles.helpItem}>• Ensure your card has sufficient funds</li>
            <li style={styles.helpItem}>• Try a different payment method</li>
            <li style={styles.helpItem}>
              •{' '}
              <button
                onClick={handleContact}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit',
                }}
              >
                Contact support
              </button>{' '}
              if the problem persists
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
