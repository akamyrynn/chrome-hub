import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product) => {
        set((state) => {
          // For luxury items, each item is unique (no quantity stacking)
          // Check by product ID
          const existingItem = state.cartItems.find(
            (item) => item.id === product.id
          );
          
          if (existingItem) {
            // Item already in cart - don't add again for luxury items
            return state;
          }

          const newItem = {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image || product.main_image_url,
            size: product.size || 'One Size',
            quantity: 1,
            addedAt: new Date().toISOString(),
          };

          return {
            cartItems: [...state.cartItems, newItem],
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== productId),
        }));
      },

      clearCart: () => {
        set({ cartItems: [] });
      },

      getCartItem: (productId) => {
        return get().cartItems.find((item) => item.id === productId);
      },

      isInCart: (productId) => {
        return get().cartItems.some((item) => item.id === productId);
      },
    }),
    {
      name: 'chrome-hub-cart',
    }
  )
);

export const useCartCount = () =>
  useCartStore((state) => state.cartItems.length);

export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.cartItems.reduce(
      (total, item) => total + parseFloat(item.price || 0),
      0
    )
  );
