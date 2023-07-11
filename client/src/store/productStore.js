import { create } from "zustand";

// Store for managing selected categories
const useProductCategoriesStore = create((set) => ({
  selectedCategories: [],

  // Action to set selected categories
  setSelectedCategories: (itemId) => {
    set((state) => {
      const { selectedCategories } = state;
      if (selectedCategories.includes(itemId)) {
        // If category is already selected, remove it from the array
        return {
          selectedCategories: selectedCategories.filter((id) => id !== itemId),
        };
      } else {
        // If category is not selected, add it to the array
        return { selectedCategories: [...selectedCategories, itemId] };
      }
    });
  },

  // Action to clear selected categories
  clearSelectedCategories: () => {
    set({ selectedCategories: [] });
  },
}));

// Store for managing the sort option
const useProductSortingStore = create((set) => ({
  sortOption: undefined,

  // Action to set the sort option
  setSortOption: (value) => set(() => ({ sortOption: value })),
}));

// Store for managing the minimum and maximum price filters
const useProductPriceStore = create((set) => ({
  minPrice: undefined,

  // Action to set the minimum price
  setMinPrice: (value) => set(() => ({ minPrice: value })),

  maxPrice: undefined,

  // Action to set the maximum price
  setMaxPrice: (value) => set(() => ({ maxPrice: value })),
}));

// Store for managing the minimum and maximum rating filters
const useProductRatingStore = create((set) => ({
  minRating: undefined,

  // Action to set the minimum rating
  setMinRating: (value) => set(() => ({ minRating: value })),

  maxRating: undefined,

  // Action to set the maximum rating
  setMaxRating: (value) => set(() => ({ maxRating: value })),
}));

export {
  useProductCategoriesStore,
  useProductSortingStore,
  useProductPriceStore,
  useProductRatingStore,
};
