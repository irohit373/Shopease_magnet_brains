# E-Commerce Application with Stripe Integration

A full-stack e-commerce application built with React, Node.js, Express, MongoDB, and Stripe payment integration.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payment processing)

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend - Create `server/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:5173
```

#### Frontend - Create `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 3. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers > API keys
3. Copy the **Publishable key** (starts with `pk_test_`) for frontend
4. Copy the **Secret key** (starts with `sk_test_`) for backend

### 4. MongoDB Setup

**Option A: MongoDB Atlas (Recommended)**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Whitelist your IP address
- Get your connection string and update `MONGODB_URI` in server `.env`

**Option B: Local MongoDB**
- Install MongoDB locally and ensure it's running
- Use `mongodb://localhost:27017/ecommerce` as your URI

### 5. Run the Application

```bash
# Terminal 1 - Start backend server
cd server
npm start

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Project Structure

```
├── frontend/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Cart)
│   │   └── services/      # API service functions
│   └── package.json
│
├── server/                # Node.js backend (Express)
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── webhooks/      # Stripe webhook handlers
│   └── package.json
│
└── README.md
```

## Testing Payments

Use these Stripe test cards:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Payment succeeds |
| 4000 0000 0000 0002 | Payment declined |
| 4000 0025 0000 3155 | Requires 3D Secure |

- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any billing postal code

## Webhook Setup (Local Development)

To receive Stripe webhook events locally:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:5000/api/webhook
```

4. Copy the webhook signing secret (starts with `whsec_`) to your `server/.env`

## Features

- Product catalog with categories
- Shopping cart functionality
- Email collection before checkout
- Stripe checkout integration
- Order management and tracking
- Payment success/failure handling
- Webhook event processing for order updates

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get single product |
| POST | /api/checkout/create-session | Create Stripe checkout session |
| GET | /api/checkout/session/:id | Get checkout session details |
| GET | /api/orders | Get all orders |
| GET | /api/orders/:id | Get order by ID |
| POST | /api/webhook | Stripe webhook handler |

## Troubleshooting

**Port already in use:**
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**MongoDB connection failed:**
- Verify your connection string is correct
- Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)
- Ensure your database user has correct permissions

**Stripe errors:**
- Ensure you're using test mode keys (start with `pk_test_` and `sk_test_`)
- Verify keys match between frontend and backend
- Check Stripe Dashboard for error logs

**Webhook not receiving events:**
- Ensure Stripe CLI is running with `stripe listen`
- Verify the webhook secret in `.env` matches CLI output
- Check that the webhook URL is correct

## License

ISC
