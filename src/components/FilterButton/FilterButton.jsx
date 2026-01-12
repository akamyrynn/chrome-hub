"use client";
import "./FilterButton.css";
import { usePathname } from "next/navigation";
import { useFilterStore } from "@/store/filterStore";

const FilterButton = () => {
  const pathname = usePathname();
  const { isFilterOpen, toggleFilter } = useFilterStore();
  
  // Показываем только на главной (не в админке)
  if (pathname !== "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <button 
      className={`filter-button ${isFilterOpen ? 'active' : ''}`} 
      onClick={toggleFilter}
    >
      <span className="filter-icon">FILTER</span>
    </button>
  );
};

export default FilterButton;
