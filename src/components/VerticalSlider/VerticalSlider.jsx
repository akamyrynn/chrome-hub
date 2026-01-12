"use client";
import "./VerticalSlider.css";
import { useRef, useState, useEffect, useCallback } from "react";
import Product from "@/components/Product/Product";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const VerticalSlider = ({ products, onIndexChange }) => {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const triggersRef = useRef([]);

  const handleIndexChange = useCallback((index) => {
    setCurrentIndex(index);
    if (onIndexChange) {
      onIndexChange(index);
    }
  }, [onIndexChange]);

  useGSAP(() => {
    if (!containerRef.current || products.length === 0) return;

    // Kill existing triggers
    triggersRef.current.forEach(st => st.kill());
    triggersRef.current = [];

    const cards = containerRef.current.querySelectorAll('.slider-card-wrapper');
    
    cards.forEach((card, index) => {
      const trigger = ScrollTrigger.create({
        trigger: card,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => handleIndexChange(index),
        onEnterBack: () => handleIndexChange(index),
      });
      triggersRef.current.push(trigger);
    });

    // Refresh on next frame to ensure proper calculation
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      triggersRef.current.forEach(st => st.kill());
      triggersRef.current = [];
    };
  }, [products, handleIndexChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      triggersRef.current.forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="vertical-slider" ref={containerRef}>
      <div className="slider-content">
        {products.map((product, index) => (
          <div 
            key={product.id || `product-${index}`} 
            className="slider-card-wrapper"
            data-index={index}
          >
            <Product 
              product={product}
              productIndex={index + 1}
              showAddToCart={true}
              className={index === currentIndex ? 'active' : ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerticalSlider;
