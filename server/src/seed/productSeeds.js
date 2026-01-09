const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Sample product data
const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'electronics',
    stock: 50,
    featured: true,
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with heart rate monitoring, GPS tracking, and 7-day battery life. Water resistant up to 50m.',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'electronics',
    stock: 30,
    featured: true,
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Ultra-soft 100% organic cotton t-shirt. Available in multiple colors. Perfect for everyday wear.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    category: 'clothing',
    stock: 100,
    featured: false,
  },
  {
    name: 'Leather Laptop Bag',
    description: 'Genuine leather laptop bag with padded compartment for laptops up to 15 inches. Multiple pockets for accessories.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    category: 'accessories',
    stock: 25,
    featured: true,
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with extra thickness for joint protection. Eco-friendly materials.',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    category: 'sports',
    stock: 60,
    featured: false,
  },
  {
    name: 'Minimalist Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness and color temperature. USB charging port included.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    category: 'home',
    stock: 40,
    featured: true,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. 750ml capacity.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    category: 'sports',
    stock: 80,
    featured: false,
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek and compact design.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=500',
    category: 'electronics',
    stock: 45,
    featured: false,
  },
  {
    name: 'Denim Jacket Classic',
    description: 'Classic denim jacket with modern fit. Durable construction and timeless style.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
    category: 'clothing',
    stock: 35,
    featured: true,
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 handcrafted ceramic coffee mugs. Microwave and dishwasher safe. 350ml capacity each.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
    category: 'home',
    stock: 55,
    featured: false,
  },
  {
    name: 'Running Shoes Elite',
    description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper. Perfect for marathons.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'sports',
    stock: 40,
    featured: true,
  },
  {
    name: 'Sunglasses Polarized',
    description: 'Premium polarized sunglasses with UV400 protection. Lightweight titanium frame.',
    price: 159.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    category: 'accessories',
    stock: 30,
    featured: false,
  },
];

// Seed function
const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stripe-ecommerce');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`Inserted ${createdProducts.length} products`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run seed
seedProducts();