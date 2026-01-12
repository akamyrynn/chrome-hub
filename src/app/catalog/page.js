"use client";
import "./catalog.css";
import { useEffect, useRef, useState } from "react";

import { getProducts, getBrands, getCategories } from "@/lib/products";
import Product from "@/components/Product/Product";
import Copy from "@/components/Copy/Copy";

import { gsap } from "gsap";

// Helper to create slug
const slugify = (text) => {
  if (!text) return 'item';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

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

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeBrand, setActiveBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const productRefs = useRef([]);
  const isInitialMount = useRef(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getBrands(),
        getCategories(),
      ]);
      
      setProducts(productsRes.data || []);
      setBrands(brandsRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (activeCategory !== "All" && product.category !== activeCategory) return false;
    if (activeBrand && product.brand !== activeBrand) return false;
    return true;
  });

  const handleFilterChange = (newCategory, newBrand) => {
    if (isAnimating) return;
    if (newCategory === activeCategory && newBrand === activeBrand) return;

    setIsAnimating(true);

    gsap.killTweensOf(productRefs.current);

    gsap.to(productRefs.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.25,
      stagger: 0.05,
      ease: "power3.out",
      onComplete: () => {
        setActiveCategory(newCategory);
        setActiveBrand(newBrand);
        setIsAnimating(false);
      },
    });
  };

  useEffect(() => {
    if (loading) return;
    
    productRefs.current = productRefs.current.slice(0, filteredProducts.length);
    gsap.killTweensOf(productRefs.current);

    gsap.fromTo(
      productRefs.current,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: isInitialMount.current ? 0.5 : 0.25,
        stagger: isInitialMount.current ? 0.05 : 0.05,
        ease: "power3.out",
        onComplete: () => {
          isInitialMount.current = false;
        },
      }
    );
  }, [filteredProducts, loading]);

  if (loading) {
    return (
      <div className="catalog-loading">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <section className="products-header">
        <div className="container">
          <Copy animateOnScroll={false} delay={0.65}>
            <h1>Каталог</h1>
          </Copy>
          <div className="products-header-divider"></div>
          <div className="product-filter-bar">
            <div className="filter-bar-header">
              <p className="bodyCopy">Категория</p>
            </div>
            <div className="filter-bar-tags">
              <p
                className={`bodyCopy ${activeCategory === "All" ? "active" : ""}`}
                onClick={() => handleFilterChange("All", activeBrand)}
              >
                Все
              </p>
              {categories.map((cat) => (
                <p
                  key={cat}
                  className={`bodyCopy ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => handleFilterChange(cat, activeBrand)}
                >
                  {translateCategory(cat)}
                </p>
              ))}
            </div>
            <div className="filter-bar-brands">
              <div className="filter-bar-header">
                <p className="bodyCopy">Бренд</p>
              </div>
              <div className="filter-bar-tags">
                {brands.map((brand) => (
                  <p
                    key={brand}
                    className={`bodyCopy brand-tag ${activeBrand === brand ? "active" : ""}`}
                    onClick={() => handleFilterChange(activeCategory, activeBrand === brand ? null : brand)}
                  >
                    {brand}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="product-list">
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>Товары не найдены</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                ref={(el) => (productRefs.current[index] = el)}
                style={{ opacity: 0, transform: "scale(0.5)" }}
              >
                <Product
                  product={product}
                  productIndex={index + 1}
                  showAddToCart={true}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
