import ProductCard from './ProductCard';

const ProductList = ({ products, loading, error }) => {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}
          >
            <div style={{ width: '100%', height: '12rem', backgroundColor: '#d1d5db' }} />
            <div style={{ padding: '1rem' }}>
              <div style={{ height: '1rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '75%', marginBottom: '0.5rem' }} />
              <div style={{ height: '0.75rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '100%', marginBottom: '0.25rem' }} />
              <div style={{ height: '0.75rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '66%', marginBottom: '1rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ height: '1.5rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '5rem' }} />
                <div style={{ height: '1.25rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '4rem' }} />
              </div>
              <div style={{ height: '2.5rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem', width: '100%', marginTop: '1rem' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: '#dc2626', fontSize: '1.125rem' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', backgroundColor: '#4f46e5', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>No products found.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
