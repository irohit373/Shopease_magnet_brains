const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#111827', color: 'white', marginTop: 'auto' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#818cf8' }}>ShopEase</h3>
            <p style={{ marginTop: '1rem', color: '#9ca3af', maxWidth: '28rem' }}>
              Your one-stop shop for premium products. Quality guaranteed with
              secure payments powered by Stripe.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                  Home
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/products" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                  Products
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/cart" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                  Cart
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Contact</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#9ca3af' }}>
              <li style={{ marginBottom: '0.5rem' }}>support@shopease.com</li>
              <li style={{ marginBottom: '0.5rem' }}>1-800-SHOP-EASE</li>
              <li style={{ marginBottom: '0.5rem' }}>Mon - Fri: 9AM - 6PM</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #374151', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center', color: '#9ca3af' }}>
          <p>&copy; {new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
