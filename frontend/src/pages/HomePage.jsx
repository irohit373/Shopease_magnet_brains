import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/Products/ProductList';
import productService from '../services/productService';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [featuredRes, allRes] = await Promise.all([
          productService.getFeaturedProducts(4),
          productService.getAllProducts({ limit: 8 }),
        ]);
        setFeaturedProducts(featuredRes.data);
        setAllProducts(allRes.data);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '6rem 1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              Welcome to ShopEase
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#c7d2fe', marginBottom: '2rem', maxWidth: '42rem', margin: '0 auto 2rem' }}>
              Discover premium products with secure checkout powered by Stripe
            </p>
            <Link
              to="/products"
              style={{ display: 'inline-block', backgroundColor: 'white', color: '#4f46e5', fontWeight: '600', padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none' }}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            Featured Products
          </h2>
          <Link
            to="/products"
            style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}
          >
            View All →
          </Link>
        </div>
        <ProductList
          products={featuredProducts}
          loading={loading}
          error={error}
        />
      </section>

      {/* All Products Preview */}
      <section style={{ backgroundColor: '#f3f4f6', padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              New Arrivals
            </h2>
            <Link
              to="/products"
              style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}
            >
              See More →
            </Link>
          </div>
          <ProductList products={allProducts} loading={loading} error={error} />
        </div>
      </section>

      {/* Features Section */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg
                style={{ width: '2rem', height: '2rem', color: '#4f46e5' }}
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Quality Products</h3>
            <p style={{ color: '#4b5563' }}>
              Carefully curated products with quality guarantee
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg
                style={{ width: '2rem', height: '2rem', color: '#4f46e5' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Secure Payments</h3>
            <p style={{ color: '#4b5563' }}>
              Safe and secure checkout powered by Stripe
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg
                style={{ width: '2rem', height: '2rem', color: '#4f46e5' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Fast Shipping</h3>
            <p style={{ color: '#4b5563' }}>
              Free shipping on orders over $100
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
