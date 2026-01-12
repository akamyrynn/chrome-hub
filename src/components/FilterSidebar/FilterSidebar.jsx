"use client";
import "./FilterSidebar.css";
import { useState, useEffect } from "react";

// Перевод категорий
const CATEGORY_TRANSLATIONS = {
  'Clothing': 'Одежда',
  'Accessories': 'Аксессуары',
  'Jewelry': 'Украшения',
  'Shoes': 'Обувь',
  'Bags': 'Сумки',
  'Watches': 'Часы',
};

const translateCategory = (cat) => CATEGORY_TRANSLATIONS[cat] || cat;

const FilterSidebar = ({ 
  onFilterChange,
  brands = ['Chrome Hearts', 'Loro Piana', 'Hermès'],
  categories = ['Clothing', 'Accessories', 'Jewelry']
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleBrandClick = (brand) => {
    const newBrand = activeBrand === brand ? null : brand;
    setActiveBrand(newBrand);
    onFilterChange?.({ brand: newBrand, category: activeCategory });
  };

  const handleCategoryClick = (category) => {
    const newCategory = activeCategory === category ? null : category;
    setActiveCategory(newCategory);
    onFilterChange?.({ brand: activeBrand, category: newCategory });
  };

  const handleClearAll = () => {
    setActiveBrand(null);
    setActiveCategory(null);
    onFilterChange?.({ brand: null, category: null });
  };

  const hasActiveFilters = activeBrand || activeCategory;
  const activeCount = (activeBrand ? 1 : 0) + (activeCategory ? 1 : 0);

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

  return (
    <div className="filter-sidebar-container">
      <button className="filter-button" onClick={toggleSidebar}>
        <span className="filter-icon">ФИЛЬТР</span>
        {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
      </button>

      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filter-sidebar-content">
          <div className="filter-header">
            <h2>Фильтры</h2>
            <button className="filter-close" onClick={toggleSidebar}>
              Закрыть
            </button>
          </div>

          <div className="filter-sections">
            {/* Brands */}
            <div className="filter-section">
              <h3>Бренд</h3>
              <div className="filter-options">
                {brands.map(brand => (
                  <button
                    key={brand}
                    className={`filter-option ${activeBrand === brand ? 'active' : ''}`}
                    onClick={() => handleBrandClick(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="filter-section">
              <h3>Категория</h3>
              <div className="filter-options">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`filter-option ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {translateCategory(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="filter-footer">
              <button className="filter-clear" onClick={handleClearAll}>
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
