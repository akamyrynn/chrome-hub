import { create } from "zustand";

export const useFilterStore = create((set) => ({
  isFilterOpen: false,
  filters: {
    brand: null,
    category: null,
  },
  
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  closeFilter: () => set({ isFilterOpen: false }),
  openFilter: () => set({ isFilterOpen: true }),
  
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: { brand: null, category: null } }),
  
  setBrand: (brand) => set((state) => ({ 
    filters: { ...state.filters, brand } 
  })),
  
  setCategory: (category) => set((state) => ({ 
    filters: { ...state.filters, category } 
  })),
}));
