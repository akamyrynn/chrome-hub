"use client";
import "./ShoppingCart.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { useCartStore, useCartCount, useCartSubtotal } from "@/store/cartStore";

const ShoppingCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();
  const pathname = usePathname();

  // Hide cart only on admin pages
  const isAdminPage = pathname.startsWith("/admin");
  const isHidden = isAdminPage;

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Don't render anything on admin pages
  if (isAdminPage) {
    return null;
  }

  // Format price in RUB
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="shopping-cart-container">
      {!isHidden && (
        <button className="cart-button" onClick={toggleCart}>
          <span className="cart-icon">BAG</span>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      )}

      <div
        className={`cart-sidebar ${isOpen ? "open" : ""}`}
        onWheel={(e) => {
          const target = e.currentTarget;
          const cartItemsEl = target.querySelector(".cart-items");
          if (cartItemsEl) {
            const { scrollTop, scrollHeight, clientHeight } = cartItemsEl;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

            if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
              e.stopPropagation();
            }
          }
        }}
      >
        <div className="cart-sidebar-content">
          <div className="cart-header">
            <h2>Корзина</h2>
            <button className="cart-close" onClick={toggleCart}>
              Закрыть
            </button>
          </div>
          <div
            className="cart-items"
            onWheel={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <p>Корзина пуста</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={item.image || `/products/product_1.png`}
                      alt={item.name}
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-name-row">
                      <p className="cart-item-name">{item.name}</p>
                    </div>
                    <p className="cart-item-brand">{item.brand}</p>
                    <p className="cart-item-size">Размер: {item.size}</p>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>Итого</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <button className="cart-checkout">Оформить заказ</button>
              <button 
                className="cart-clear"
                onClick={clearCart}
              >
                Очистить корзину
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
