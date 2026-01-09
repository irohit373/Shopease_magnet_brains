import { useState, useEffect } from 'react';
import ProductList from '../components/Products/ProductList';
import productService from '../services/productService';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'home', label: 'Home' },
    { value: 'sports', label: 'Sports' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = selectedCategory !== 'all' 
          ? { category: selectedCategory } 
          : {};
        
        const response = await productService.getAllProducts(params);
        setProducts(response.data);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>All Products</h1>
        <p style={{ color: '#4b5563' }}>
          Browse our collection of premium products
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedCategory === category.value ? '#4f46e5' : '#e5e7eb',
                color: selectedCategory === category.value ? 'white' : '#374151'
              }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <ProductList products={products} loading={loading} error={error} />
    </div>
  );
};

export default ProductsPage;
