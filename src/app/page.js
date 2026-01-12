"use client";
import "./home.css";
import { useState, useEffect, useCallback, useMemo } from "react";

import { getProducts, getBrands, getCategories, subscribeToProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase";
import DotMatrix from "@/components/DotMatrix/DotMatrix";
import VerticalSlider from "@/components/VerticalSlider/VerticalSlider";
import Minimap from "@/components/Minimap/Minimap";
import Menu from "@/components/Menu/Menu";
import FilterSidebar from "@/components/FilterSidebar/FilterSidebar";

// Пары цветов: [фон, точки] - светлый фон + насыщенные точки
const COLOR_PAIRS = [
  { bg: "#E8E0E0", dot: "#8B4D5C" },  // розовый фон + бордовые точки
  { bg: "#D8E8D8", dot: "#2D5A3D" },  // мятный фон + тёмно-зелёные точки
  { bg: "#E0E0F0", dot: "#4A4A8C" },  // лавандовый фон + фиолетовые точки
  { bg: "#F0EBD8", dot: "#8C7A3D" },  // кремовый фон + горчичные точки
  { bg: "#D8ECEC", dot: "#2D6A6A" },  // бирюзовый фон + тёмно-бирюзовые точки
  { bg: "#ECD8EC", dot: "#6A2D6A" },  // сиреневый фон + пурпурные точки
  { bg: "#E5ECD8", dot: "#4A6A2D" },  // оливковый фон + тёмно-оливковые точки
  { bg: "#F0E5D8", dot: "#8C5A3D" },  // персиковый фон + терракотовые точки
  { bg: "#D8E5F0", dot: "#3D5A8C" },  // голубой фон + синие точки
  { bg: "#E8F0D8", dot: "#5A8C3D" },  // лаймовый фон + зелёные точки
];

export default function Index() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState({ brand: null, category: null });
  const [loading, setLoading] = useState(true);

  // Цвета меняются в зависимости от текущей карточки
  const currentColors = useMemo(() => {
    return COLOR_PAIRS[currentIndex % COLOR_PAIRS.length];
  }, [currentIndex]);

  // Плавный переход цвета фона
  useEffect(() => {
    document.body.style.transition = 'background-color 0.5s ease-out';
    document.body.style.backgroundColor = currentColors.bg;
    
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.transition = '';
    };
  }, [currentColors.bg]);

  // Load products and filters
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        getProducts(filters),
        getBrands(),
        getCategories(),
      ]);

      setProducts(productsRes.data || []);
      setBrands(brandsRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    }

    loadData();
  }, [filters]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const subscription = subscribeToProducts(() => {
      getProducts(filters).then(res => {
        setProducts(res.data || []);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [filters]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [filters]);

  const handleIndexChange = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleMinimapNavigate = useCallback((index) => {
    setCurrentIndex(index);
    const sliderCards = document.querySelectorAll('.slider-card-wrapper');
    if (sliderCards[index]) {
      sliderCards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <>
      {/* Fixed DotMatrix background - цвет плавно меняется при скролле */}
      <DotMatrix
        color={currentColors.dot}
        dotSize={2}
        spacing={5}
        opacity={0.85}
        delay={0.5}
        fixed={true}
      />

      {/* Menu Button */}
      <Menu />

      {/* Filter Sidebar */}
      <FilterSidebar 
        onFilterChange={handleFilterChange}
        brands={brands.map(b => b.name || b)}
        categories={categories.map(c => c.name || c)}
      />

      {/* Main content */}
      <main className="chrome-main">
        {loading ? (
          <div className="loading-state">
            <p>Загрузка...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <VerticalSlider 
              products={products}
              onIndexChange={handleIndexChange}
            />
            
            <Minimap 
              products={products}
              currentIndex={currentIndex}
              onNavigate={handleMinimapNavigate}
            />
          </>
        ) : (
          <div className="no-products">
            <p>Товары не найдены</p>
          </div>
        )}
      </main>

      {/* Product count indicator */}
      {!loading && products.length > 0 && (
        <div className="product-counter">
          <span>{currentIndex + 1}</span>
          <span className="separator">/</span>
          <span>{products.length}</span>
        </div>
      )}

      {/* Supabase status indicator (dev only) */}
      {!isSupabaseConfigured() && (
        <div className="supabase-notice">
          Демо режим
        </div>
      )}
    </>
  );
}
