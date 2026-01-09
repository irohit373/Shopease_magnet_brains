import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        setProduct(response.data);
      } catch (err) {
        setError('Product not found.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ backgroundColor: '#d1d5db', height: '24rem', borderRadius: '0.5rem' }} />
            <div>
              <div style={{ height: '2rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '75%', marginBottom: '1rem' }} />
              <div style={{ height: '1.5rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '25%', marginBottom: '1rem' }} />
              <div style={{ height: '1rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '100%', marginBottom: '0.5rem' }} />
              <div style={{ height: '1rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '100%', marginBottom: '0.5rem' }} />
              <div style={{ height: '1rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '66%', marginBottom: '1.5rem' }} />
              <div style={{ height: '3rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
          {error || 'Product not found'}
        </h2>
        <Link
          to="/products"
          style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '2rem' }}>
        <ol style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', listStyle: 'none', padding: 0, margin: 0 }}>
          <li>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
              Products
            </Link>
          </li>
          <li>/</li>
          <li style={{ color: '#1f2937', fontWeight: '500' }}>{product.name}</li>
        </ol>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Product Image */}
        <div style={{ position: 'relative' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', objectFit: 'cover' }}
          />
          {product.featured && (
            <span style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: '#4f46e5', color: 'white', fontSize: '0.875rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '0.25rem' }}>
              Featured
            </span>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.875rem', fontWeight: '700', color: '#4f46e5' }}>
              ${product.price.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize', backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
              {product.category}
            </span>
          </div>

          <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.625' }}>
            {product.description}
          </p>

          {/* Stock Status */}
          <div style={{ marginBottom: '1.5rem' }}>
            {product.stock > 0 ? (
              <span style={{ color: '#16a34a', fontWeight: '500' }}>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span style={{ color: '#dc2626', fontWeight: '500' }}>Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '0.5rem' }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.25rem', fontWeight: '500', width: '3rem', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              border: 'none',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: product.stock === 0 ? '#d1d5db' : addedToCart ? '#16a34a' : '#4f46e5',
              color: product.stock === 0 ? '#6b7280' : 'white'
            }}
          >
            {product.stock === 0
              ? 'Out of Stock'
              : addedToCart
              ? 'Added to Cart!'
              : 'Add to Cart'}
          </button>

          {/* Additional Info */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Product Information
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#4b5563' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Category:</span>{' '}
                <span style={{ textTransform: 'capitalize' }}>{product.category}</span>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Availability:</span>{' '}
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Shipping:</span> Free on orders
                over $100
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
