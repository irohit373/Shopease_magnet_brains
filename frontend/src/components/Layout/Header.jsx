import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { cartCount } = useCart();

  return (
    <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4f46e5' }}>ShopEase</span>
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link
              to="/"
              style={{ color: '#374151', textDecoration: 'none', fontWeight: '500' }}
            >
              Home
            </Link>
            <Link
              to="/products"
              style={{ color: '#374151', textDecoration: 'none', fontWeight: '500' }}
            >
              Products
            </Link>
          </nav>

          {/* Cart Icon */}
          <Link
            to="/cart"
            style={{ position: 'relative', padding: '0.5rem', color: '#374151', textDecoration: 'none' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ height: '1.5rem', width: '1.5rem' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', backgroundColor: '#4f46e5', color: 'white', fontSize: '0.75rem', fontWeight: '700', borderRadius: '9999px', height: '1.25rem', width: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
