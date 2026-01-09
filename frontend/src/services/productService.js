import api from './api';

export const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 4) => {
    const response = await api.get('/api/products', {
      params: { featured: true, limit },
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    const response = await api.get('/api/products', {
      params: { category },
    });
    return response.data;
  },
};

export default productService;
