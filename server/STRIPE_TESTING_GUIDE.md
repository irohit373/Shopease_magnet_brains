# Stripe Integration Testing Guide

This guide covers testing the Stripe integration locally using Stripe CLI and test cards.

## Prerequisites

1. Node.js and npm installed
2. Stripe account (sign up at https://stripe.com)
3. Stripe CLI installed

## Installing Stripe CLI

### Windows (PowerShell as Administrator)
```powershell
# Using Scoop
scoop install stripe

# Or download from https://github.com/stripe/stripe-cli/releases
```

### macOS
```bash
brew install stripe/stripe-cli/stripe
```

### Linux
```bash
# Download and extract
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

## Setup

### 1. Login to Stripe CLI
```bash
stripe login
```
This will open a browser window for authentication.

### 2. Get Your API Keys
From the Stripe Dashboard (https://dashboard.stripe.com/test/apikeys):
- **Publishable key** (pk_test_...) - for frontend
- **Secret key** (sk_test_...) - for backend

### 3. Configure Environment Variables

**Backend (.env):**
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
```

## Testing Webhooks Locally

### 1. Start Webhook Forwarding
```bash
stripe listen --forward-to localhost:5000/webhook
```

This will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**Copy this secret to your backend .env file as `STRIPE_WEBHOOK_SECRET`**

### 2. Keep the listener running in a separate terminal

## Test Card Numbers

Use these card numbers for testing different scenarios:

### Successful Payments
| Card Number | Description |
|------------|-------------|
| 4242424242424242 | Visa - Always succeeds |
| 5555555555554444 | Mastercard - Always succeeds |
| 378282246310005 | American Express - Always succeeds |

### Declined Payments
| Card Number | Description |
|------------|-------------|
| 4000000000000002 | Generic decline |
| 4000000000009995 | Insufficient funds |
| 4000000000009987 | Lost card |
| 4000000000009979 | Stolen card |

### 3D Secure / Authentication
| Card Number | Description |
|------------|-------------|
| 4000002500003155 | Requires authentication |
| 4000002760003184 | Requires authentication on all transactions |
| 4000008260003178 | Authentication always succeeds |

### Special Cases
| Card Number | Description |
|------------|-------------|
| 4000000000000077 | Charges succeed, then dispute |
| 4000000000005126 | Fails with incorrect CVC |
| 4000003720000278 | Fraud blocked |

### Test Card Details
- **Expiry Date:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (4 for Amex)
- **ZIP:** Any 5 digits

## Testing Checkout Flow

### 1. Start the Backend Server
```bash
cd server
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Start Stripe CLI Webhook Listener
```bash
stripe listen --forward-to localhost:5000/webhook
```

### 4. Test the Flow
1. Add products to cart
2. Click "Checkout"
3. Fill in test card details
4. Complete payment
5. Verify webhook received in terminal
6. Check order in database

## Triggering Test Events

You can trigger test webhook events manually:

```bash
# Successful payment
stripe trigger checkout.session.completed

# Failed payment
stripe trigger payment_intent.payment_failed

# Refund
stripe trigger charge.refunded

# Dispute
stripe trigger charge.dispute.created
```

## Viewing Logs

### Stripe Dashboard
Visit https://dashboard.stripe.com/test/events to see all events.

### CLI Logs
The Stripe CLI shows real-time webhook events:
```
2024-01-09 10:30:15   --> checkout.session.completed [evt_xxx]
2024-01-09 10:30:15  <--  [200] POST http://localhost:5000/webhook
```

## Testing Refunds

### Via API
```bash
# Create a refund for a payment intent
curl -X POST http://localhost:5000/api/refunds/payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_xxx",
    "reason": "requested_by_customer"
  }'
```

### Via Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/payments
2. Click on a payment
3. Click "Refund"

## Common Issues

### Webhook Signature Verification Failed
- Ensure STRIPE_WEBHOOK_SECRET matches the CLI output
- Make sure the webhook endpoint receives raw body (not parsed JSON)
- Restart the server after updating .env

### Payment Intent Not Found
- Verify the session/payment was completed
- Check if using correct environment (test vs live)

### CORS Errors
- Ensure CLIENT_URL in backend matches frontend URL
- Check CORS middleware configuration

## Production Checklist

Before going live:
1. [ ] Switch to live API keys
2. [ ] Set up production webhook endpoint in Stripe Dashboard
3. [ ] Update STRIPE_WEBHOOK_SECRET with production secret
4. [ ] Test with real (small amount) payments
5. [ ] Configure proper error handling and logging
6. [ ] Set up monitoring for failed webhooks
7. [ ] Enable webhook retry settings in Stripe Dashboard

## Useful Stripe CLI Commands

```bash
# Check CLI version
stripe version

# List recent events
stripe events list --limit 10

# View specific event
stripe events retrieve evt_xxx

# List charges
stripe charges list --limit 5

# View a specific payment intent
stripe payment_intents retrieve pi_xxx

# Create a test customer
stripe customers create --email test@example.com

# List webhooks endpoints
stripe webhook_endpoints list
```

## Resources

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Webhook Events](https://stripe.com/docs/webhooks)
- [Checkout Documentation](https://stripe.com/docs/payments/checkout)
