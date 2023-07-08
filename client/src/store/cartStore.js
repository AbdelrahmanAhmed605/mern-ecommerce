import { create } from "zustand";

// Used to determine whether a cart has been created (when a product is added) so we can refetch the cart data
const useCartCreatedStore = create((set) => ({
  cartCreated: false,
  setCartCreated: (value) => set(() => ({ cartCreated: value })),
}));

export { useCartCreatedStore };
