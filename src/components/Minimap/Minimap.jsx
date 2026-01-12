"use client";
import "./Minimap.css";
import { useRef, useEffect, useState, useCallback } from "react";

const Minimap = ({ 
  products, 
  currentIndex, 
  onNavigate 
}) => {
  const containerRef = useRef(null);
  const itemsRef = useRef(null);
  const indicatorRef = useRef(null);
  
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [itemSize, setItemSize] = useState(60);
  const [containerSize, setContainerSize] = useState(0);
  
  // Animation values
  const itemsTranslateRef = useRef(0);
  const indicatorTranslateRef = useRef(0);
  const targetItemsTranslateRef = useRef(0);
  const targetIndicatorTranslateRef = useRef(0);
  const animationRef = useRef(null);

  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Update dimensions
  const updateDimensions = useCallback(() => {
    if (!containerRef.current || !itemsRef.current || products.length === 0) return;
    
    const horizontal = window.innerWidth <= 900;
    setIsHorizontal(horizontal);
    
    const items = itemsRef.current.querySelectorAll('.minimap-item');
    if (items.length === 0) return;

    const size = horizontal 
      ? items[0].getBoundingClientRect().width
      : items[0].getBoundingClientRect().height;
    
    const contSize = horizontal
      ? containerRef.current.getBoundingClientRect().width
      : containerRef.current.getBoundingClientRect().height;
    
    setItemSize(size);
    setContainerSize(contSize);
  }, [products.length]);

  // Calculate positions based on current index
  const calculatePositions = useCallback(() => {
    if (products.length === 0 || itemSize === 0 || containerSize === 0) return;

    const totalItems = products.length;
    const indicatorSize = itemSize;
    const centerOffset = (containerSize - indicatorSize) / 2;
    
    // Total content size
    const totalContentSize = totalItems * itemSize;
    
    // Position of current item
    const itemPosition = currentIndex * itemSize;
    
    let indicatorPos = 0;
    let itemsTranslate = 0;
    
    if (totalContentSize <= containerSize) {
      // All items fit in container - center them
      itemsTranslate = (containerSize - totalContentSize) / 2;
      indicatorPos = itemsTranslate + currentIndex * itemSize;
    } else {
      // Need scrolling
      const maxScroll = totalContentSize - containerSize;
      
      // Calculate how many items fit before center and after center
      const itemsBeforeCenter = Math.floor(centerOffset / itemSize);
      const itemsAfterCenter = Math.floor(centerOffset / itemSize);
      
      // Last index where indicator should still be at center
      const lastCenterIndex = totalItems - 1 - itemsAfterCenter;
      
      if (currentIndex <= itemsBeforeCenter) {
        // Beginning: items stay at top, indicator moves from top toward center
        itemsTranslate = 0;
        indicatorPos = currentIndex * itemSize;
      } else if (currentIndex > lastCenterIndex) {
        // End: items scrolled to max, indicator moves from center toward bottom
        itemsTranslate = -maxScroll;
        // Calculate indicator position relative to the visible area
        const visibleStartIndex = totalItems - Math.floor(containerSize / itemSize);
        const relativeIndex = currentIndex - visibleStartIndex;
        indicatorPos = relativeIndex * itemSize;
      } else {
        // Middle: indicator stays centered, items scroll
        itemsTranslate = centerOffset - itemPosition;
        indicatorPos = centerOffset;
      }
    }
    
    // Final clamp to ensure indicator never goes outside container
    const maxIndicatorPos = containerSize - indicatorSize;
    indicatorPos = Math.max(0, Math.min(indicatorPos, maxIndicatorPos));
    
    targetItemsTranslateRef.current = itemsTranslate;
    targetIndicatorTranslateRef.current = indicatorPos;
  }, [currentIndex, products.length, itemSize, containerSize]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const lerpFactor = 0.12;
      
      itemsTranslateRef.current = lerp(
        itemsTranslateRef.current, 
        targetItemsTranslateRef.current, 
        lerpFactor
      );
      
      indicatorTranslateRef.current = lerp(
        indicatorTranslateRef.current,
        targetIndicatorTranslateRef.current,
        lerpFactor
      );
      
      if (itemsRef.current) {
        const transform = isHorizontal
          ? `translateX(${itemsTranslateRef.current}px)`
          : `translateY(${itemsTranslateRef.current}px)`;
        itemsRef.current.style.transform = transform;
      }
      
      if (indicatorRef.current) {
        const transform = isHorizontal
          ? `translateX(${indicatorTranslateRef.current}px)`
          : `translateY(${indicatorTranslateRef.current}px)`;
        indicatorRef.current.style.transform = transform;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHorizontal]);

  // Update dimensions on mount and resize
  useEffect(() => {
    updateDimensions();
    
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize);
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateDimensions, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [updateDimensions]);

  // Recalculate when index or dimensions change
  useEffect(() => {
    calculatePositions();
  }, [calculatePositions]);

  // Handle item click
  const handleItemClick = useCallback((index) => {
    if (onNavigate) {
      onNavigate(index);
    }
  }, [onNavigate]);

  // Handle wheel scroll on minimap
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(currentIndex + delta, products.length - 1));
    
    if (newIndex !== currentIndex && onNavigate) {
      onNavigate(newIndex);
    }
  }, [currentIndex, products.length, onNavigate]);

  // Touch handling
  const touchStartRef = useRef(0);
  const lastTouchIndexRef = useRef(currentIndex);
  
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = isHorizontal ? e.touches[0].clientX : e.touches[0].clientY;
    lastTouchIndexRef.current = currentIndex;
  }, [isHorizontal, currentIndex]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    
    const touchPos = isHorizontal ? e.touches[0].clientX : e.touches[0].clientY;
    const delta = touchStartRef.current - touchPos;
    const indexDelta = Math.round(delta / (itemSize * 0.5));
    
    const newIndex = Math.max(0, Math.min(lastTouchIndexRef.current + indexDelta, products.length - 1));
    
    if (newIndex !== currentIndex && onNavigate) {
      onNavigate(newIndex);
    }
  }, [isHorizontal, itemSize, products.length, currentIndex, onNavigate]);

  if (products.length === 0) return null;

  return (
    <div 
      className={`minimap ${isHorizontal ? 'horizontal' : 'vertical'}`}
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="minimap-indicator" ref={indicatorRef} />
      <div className="minimap-items" ref={itemsRef}>
        {products.map((product, index) => (
          <div 
            key={product.id || product.name || index}
            className={`minimap-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
          >
            <img 
              src={product.image || product.main_image_url || `/products/product_${index + 1}.png`}
              alt={product.name}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Minimap;
