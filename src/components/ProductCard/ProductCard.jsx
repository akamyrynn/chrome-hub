"use client";
import "./ProductCard.css";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

// Helper to create slug
const slugify = (text) => {
  if (!text) return 'item';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const ProductCard = ({ product, isActive = false, productIndex }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.main_image_url,
      brand: product.brand,
      size: product.sizes?.[0] || 'One Size',
    });
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get image URL
  const imageUrl = product.image || product.main_image_url || `/products/product_${productIndex || 1}.png`;

  // Parse sizes if it's a string (from Supabase JSON)
  const sizes = Array.isArray(product.sizes) 
    ? product.sizes 
    : (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : []);

  // Generate product URL with SKU
  const getProductUrl = () => {
    const category = slugify(product.category || 'item');
    const brand = slugify(product.brand || 'brand');
    const name = slugify(product.name || 'product');
    const sku = product.sku || product.id.slice(-6);
    return `/catalog/${category}/${brand}/${name}-${sku}?pid=${product.id}`;
  };

  return (
    <div className={`product-card ${isActive ? 'active' : ''}`}>
      <Link href={getProductUrl()} className="product-card-image">
        <img 
          src={imageUrl} 
          alt={product.name} 
        />
        {product.condition && product.condition !== 'excellent' && (
          <span className="product-card-condition">{product.condition.replace('_', ' ')}</span>
        )}
      </Link>
      
      <div className="product-card-info">
        <div className="product-card-header">
          <span className="product-card-name">{product.name}</span>
          <span className="product-card-brand">{product.brand}</span>
        </div>
        
        <div className="product-card-price">
          {formatPrice(product.price)}
        </div>
        
        {sizes.length > 0 && (
          <div className="product-card-sizes">
            {sizes.slice(0, 5).map(size => (
              <span key={size} className="size-tag">{size}</span>
            ))}
            {sizes.length > 5 && (
              <span className="size-tag more">+{sizes.length - 5}</span>
            )}
          </div>
        )}
        
        <button 
          className="product-card-btn"
          onClick={handleAddToCart}
          disabled={product.status !== 'available'}
        >
          {product.status === 'available' ? 'Add to Cart' : product.status === 'reserved' ? 'Reserved' : 'Sold'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
