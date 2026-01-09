import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
      <Link to={`/product/${product._id}`}>
        <div style={{ position: 'relative' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '12rem', objectFit: 'cover' }}
          />
          {product.featured && (
            <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#4f46e5', color: 'white', fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: '600' }}>Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div style={{ padding: '1rem' }}>
        <Link to={`/product/${product._id}`}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </h3>
        </Link>

        <p style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '0.25rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.description}
        </p>

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4f46e5' }}>
            ${product.price.toFixed(2)}
          </span>

          <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize', backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
            {product.category}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            border: 'none',
            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            backgroundColor: product.stock === 0 ? '#d1d5db' : '#4f46e5',
            color: product.stock === 0 ? '#6b7280' : 'white',
          }}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
