"use client";
import "../../../../unit/unit.css";
import "./product-page.css";
import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { getProductById } from "@/lib/products";
import Copy from "@/components/Copy/Copy";
import { useCartStore } from "@/store/cartStore";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

export default function ProductPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('pid');
  
  const heroRef = useRef(null);
  const activeMinimapIndex = useRef(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const addToCart = useCartStore((state) => state.addToCart);

  // Load product
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      if (productId) {
        const { data } = await getProductById(productId);
        if (data) {
          setProduct(data);
          const sizes = parseSizes(data.sizes);
          if (sizes.length > 0) {
            setSelectedSize(sizes[0]);
          }
        }
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  // Parse sizes
  const parseSizes = (sizes) => {
    if (!sizes) return [];
    if (Array.isArray(sizes)) return sizes;
    if (typeof sizes === 'string') {
      try { return JSON.parse(sizes); } catch { return []; }
    }
    return [];
  };

  // Get images array
  const getImages = () => {
    if (!product) return [];
    const images = [];
    
    if (product.main_image_url) {
      images.push(product.main_image_url);
    }
    
    if (product.product_images?.length > 0) {
      product.product_images
        .filter(img => img.section_type === 'gallery' || !img.section_type)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .forEach(img => {
          if (img.image_url && !images.includes(img.image_url)) {
            images.push(img.image_url);
          }
        });
    }
    
    if (images.length === 0) {
      return [
        '/product/product_shot_01.jpg',
        '/product/product_shot_02.jpg',
        '/product/product_shot_03.jpg',
      ];
    }
    
    return images;
  };

  // Get section image
  const getSectionImage = (sectionType, fallbackIndex) => {
    if (!product) return `/product/product_shot_0${fallbackIndex}.jpg`;
    
    const sectionImg = product.product_images?.find(img => img.section_type === sectionType);
    if (sectionImg) return sectionImg.image_url;
    
    const images = getImages();
    return images[fallbackIndex - 1] || images[0] || `/product/product_shot_0${fallbackIndex}.jpg`;
  };

  // Format price in RUB
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.main_image_url,
      brand: product.brand,
      size: selectedSize || 'Один размер',
    });
  };

  // GSAP Animation
  useGSAP(() => {
    if (!heroRef.current || loading || !product) return;

    const snapshots = heroRef.current.querySelectorAll(".product-snapshot");
    const minimapImages = heroRef.current.querySelectorAll(".product-snapshot-minimap-img");
    const totalImages = snapshots.length;

    if (totalImages === 0) return;

    ScrollTrigger.getAll().forEach(st => st.kill());

    // If only 1 image, no scroll animation needed
    if (totalImages === 1) {
      gsap.set(snapshots[0], { y: "0%", scale: 1 });
      if (minimapImages[0]) gsap.set(minimapImages[0], { scale: 1.25 });
      return;
    }

    gsap.set(snapshots[0], { y: "0%", scale: 1 });
    if (minimapImages[0]) gsap.set(minimapImages[0], { scale: 1.25 });
    
    for (let i = 1; i < totalImages; i++) {
      gsap.set(snapshots[i], { y: "100%", scale: 1 });
      if (minimapImages[i]) gsap.set(minimapImages[i], { scale: 1 });
    }

    // Scroll distance based on number of images
    const scrollDistance = window.innerHeight * Math.max(2, totalImages);

    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: `+=${scrollDistance}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        let currentActiveIndex = 0;

        for (let i = 1; i < totalImages; i++) {
          const imageStart = (i - 1) / (totalImages - 1);
          const imageEnd = i / (totalImages - 1);

          let localProgress = (progress - imageStart) / (imageEnd - imageStart);
          localProgress = Math.max(0, Math.min(1, localProgress));

          const yValue = 100 - localProgress * 100;
          gsap.set(snapshots[i], { y: `${yValue}%` });

          const scaleValue = 1 + localProgress * 0.5;
          gsap.set(snapshots[i - 1], { scale: scaleValue });

          if (localProgress >= 0.5) {
            currentActiveIndex = i;
          }
        }

        if (currentActiveIndex !== activeMinimapIndex.current && minimapImages.length > 0) {
          gsap.to(minimapImages[currentActiveIndex], {
            scale: 1.25,
            duration: 0.3,
            ease: "power2.out",
          });

          for (let i = 0; i < currentActiveIndex; i++) {
            gsap.to(minimapImages[i], {
              scale: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          }

          for (let i = currentActiveIndex + 1; i < totalImages; i++) {
            gsap.to(minimapImages[i], {
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }

          activeMinimapIndex.current = currentActiveIndex;
        }
      },
    });

    window.scrollTo(0, 0);
    
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [loading, product]);

  if (loading) {
    return (
      <div className="product-loading">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Товар не найден</h2>
        <Link href="/catalog">Вернуться в каталог</Link>
      </div>
    );
  }

  const images = getImages();
  const sizes = parseSizes(product.sizes);

  return (
    <>
      <section className="product-hero" ref={heroRef}>
        <div className="product-hero-col product-snapshots">
          {images.map((img, index) => (
            <div key={index} className="product-snapshot">
              <img src={img} alt={`${product.name} - ${index + 1}`} />
            </div>
          ))}
          
          {images.length > 1 && (
            <div className="product-snapshot-minimap">
              {images.map((img, index) => (
                <div key={index} className="product-snapshot-minimap-img">
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="product-hero-col product-meta">
          <div className="product-meta-container">
            {/* Breadcrumbs */}
            <nav className="breadcrumbs">
              <Link href="/catalog">Каталог</Link>
              <span className="breadcrumb-separator">/</span>
              <Link href={`/catalog?category=${encodeURIComponent(product.category)}`}>
                {translateCategory(product.category)}
              </Link>
              <span className="breadcrumb-separator">/</span>
              <Link href={`/catalog?brand=${encodeURIComponent(product.brand)}`}>
                {product.brand}
              </Link>
            </nav>

            <div className="product-meta-header">
              <h3>{product.name}</h3>
              <h3>{formatPrice(product.price)}</h3>
            </div>
            <div className="product-meta-header-divider"></div>
            
            <div className="product-color-container">
              <p className="md">Бренд</p>
              <div className="product-brand-name">
                <p className="md">{product.brand}</p>
              </div>
            </div>
            
            {sizes.length > 0 && (
              <div className="product-sizes-container">
                <p className="md">Размер</p>
                <div className="product-sizes">
                  {sizes.map(size => (
                    <p 
                      key={size} 
                      className={`md ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      style={{ cursor: 'pointer' }}
                    >
                      [ {size} ]
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {product.condition && (
              <div className="product-color-container">
                <p className="md">Состояние</p>
                <div className="product-condition">
                  <p className="md">{product.condition.replace('_', ' ')}</p>
                </div>
              </div>
            )}
            
            <div className="product-meta-buttons">
              <button
                className="primary"
                onClick={handleAddToCart}
                disabled={product.status !== 'available'}
              >
                {product.status === 'available' ? 'В корзину' : 
                 product.status === 'reserved' ? 'Зарезервировано' : 'Продано'}
              </button>
              <button className="secondary">Сохранить</button>
            </div>
          </div>
        </div>
      </section>

      {product.description && (
        <section className="product-details specifications">
          <div className="product-col product-col-copy">
            <div className="product-col-copy-wrapper">
              <Copy>
                <h4>Описание</h4>
              </Copy>
              <Copy>
                <p className="bodyCopy lg">{product.description}</p>
              </Copy>
            </div>
          </div>
          <div className="product-col product-col-img">
            <img src={getSectionImage('description', 3)} alt="" />
          </div>
        </section>
      )}

      {product.care_info && (
        <section className="product-details shipping-details">
          <div className="product-col product-col-img">
            <img src={getSectionImage('care', 4)} alt="" />
          </div>
          <div className="product-col product-col-copy">
            <div className="product-col-copy-wrapper">
              <Copy>
                <h4>Уход за изделием</h4>
              </Copy>
              <Copy>
                <p className="bodyCopy lg">{product.care_info}</p>
              </Copy>
            </div>
          </div>
        </section>
      )}

      {product.brand_story && (
        <section className="product-details specifications">
          <div className="product-col product-col-copy">
            <div className="product-col-copy-wrapper">
              <Copy>
                <h4>О бренде {product.brand}</h4>
              </Copy>
              <Copy>
                <p className="bodyCopy lg">{product.brand_story}</p>
              </Copy>
            </div>
          </div>
          <div className="product-col product-col-img">
            <img src={getSectionImage('brand', 5)} alt="" />
          </div>
        </section>
      )}
    </>
  );
}
