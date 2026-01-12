"use client";
import "./FilterBar.css";
import { useFilterStore } from "@/store/filterStore";

const FilterBar = ({ 
  brands = ['Chrome Hearts', 'Loro Piana', 'Hermès'],
  categories = ['Clothing', 'Accessories', 'Jewelry']
}) => {
  const { isFilterOpen, filters, setBrand, setCategory, clearFilters } = useFilterStore();
  const { brand: activeBrand, category: activeCategory } = filters;

  const handleBrandClick = (brand) => {
    setBrand(activeBrand === brand ? null : brand);
  };

  const handleCategoryClick = (category) => {
    setCategory(activeCategory === category ? null : category);
  };

  const hasActiveFilters = activeBrand || activeCategory;

  return (
    <div className={`filter-bar ${isFilterOpen ? 'open' : ''}`}>
      <div className="filter-bar-content">
        <div className="filter-group">
          <span className="filter-label">Brand</span>
          <div className="filter-options">
            {brands.map(brand => (
              <button
                key={brand}
                className={`filter-btn ${activeBrand === brand ? 'active' : ''}`}
                onClick={() => handleBrandClick(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Category</span>
          <div className="filter-options">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <button className="filter-clear-btn" onClick={clearFilters}>
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
