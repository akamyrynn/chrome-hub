"use client";
import "./Product.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCartStore } from "@/store/cartStore";

// Helper to create slug
const slugify = (text) => {
  if (!text) return 'item';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const Product = ({
  product,
  productIndex,
  showAddToCart = true,
  className = "",
  innerRef,
  style,
}) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const pathname = usePathname();

  const handleImageClick = () => {
    if (pathname.startsWith("/catalog/")) {
      window.dispatchEvent(new CustomEvent("scrollToTop"));
    }
  };

  // Generate product URL with SKU
  const getProductUrl = () => {
    const category = slugify(product.category || 'item');
    const brand = slugify(product.brand || 'brand');
    const name = slugify(product.name || 'product');
    const sku = product.sku || product.id.slice(-6);
    return `/catalog/${category}/${brand}/${name}-${sku}?pid=${product.id}`;
  };

  // Get image URL - support both old static and new Supabase images
  const getImageUrl = () => {
    if (product.main_image_url) return product.main_image_url;
    if (product.image) return product.image;
    return `/products/product_${productIndex || 1}.png`;
  };

  // Format price in RUB
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`product ${className}`} ref={innerRef} style={style}>
      <Link href={getProductUrl()} className="product-img" onClick={handleImageClick}>
        <img src={getImageUrl()} alt={product.name} />
      </Link>
      <div className="product-info">
        <div className="product-info-wrapper">
          <p>{product.name}</p>
          <p>{formatPrice(product.price)}</p>
        </div>
        {product.brand && (
          <p className="product-brand">{product.brand}</p>
        )}
        {showAddToCart && (
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: getImageUrl(),
              brand: product.brand,
              size: product.sizes?.[0] || 'Один размер',
            })}
          >
            В корзину
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;
