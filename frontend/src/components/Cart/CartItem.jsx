import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(item._id, newQuantity);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      {/* Product Image */}
      <img
        src={item.image}
        alt={item.name}
        style={{ width: '5rem', height: '5rem', objectFit: 'cover', borderRadius: '0.5rem' }}
      />

      {/* Product Details */}
      <div style={{ flexGrow: 1 }}>
        <h3 style={{ fontWeight: '600', color: '#1f2937' }}>{item.name}</h3>
        <p style={{ color: '#4f46e5', fontWeight: '500' }}>${item.price.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: '1rem', width: '1rem' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>

        <span style={{ width: '2rem', textAlign: 'center', fontWeight: '500' }}>{item.quantity}</span>

        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: '1rem', width: '1rem' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Subtotal */}
      <div style={{ textAlign: 'right', minWidth: '5rem' }}>
        <p style={{ fontWeight: '600', color: '#1f2937' }}>
          ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item._id)}
        style={{ padding: '0.5rem', color: '#ef4444', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: '1.25rem', width: '1.25rem' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
};

export default CartItem;
