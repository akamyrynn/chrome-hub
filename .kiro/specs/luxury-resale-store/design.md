# Design Document: Chrome Hub — Luxury Resale Store

## Overview

Переделка главной страницы NRMLSS в "Chrome Hub" — магазин эксклюзивных люксовых вещей. Главная страница будет иметь:
- Фиксированный DotMatrix фон
- Вертикальный слайдер карточек товаров в центре
- Minimap справа для навигации (desktop)
- Фильтры по брендам/категориям
- Заголовок "CHROME HUB"
- Корзина в хедере

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                                │
│  [CHROME HUB logo]              [Filters]        [Cart]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │              FIXED DOTMATRIX BACKGROUND              │    │
│  │                                                      │    │
│  │    ┌──────────────────────┐         ┌─────────┐     │    │
│  │    │                      │         │ ○       │     │    │
│  │    │    PRODUCT CARD      │         │ ○       │     │    │
│  │    │    (centered)        │         │ ●       │     │    │
│  │    │                      │         │ ○       │     │    │
│  │    │  [Photo]             │         │ ○       │     │    │
│  │    │  Price | Sizes       │         │         │     │    │
│  │    │  [Add to Cart]       │         │ MINIMAP │     │    │
│  │    │                      │         │         │     │    │
│  │    └──────────────────────┘         └─────────┘     │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. HomePage Component (Refactored)

```jsx
// src/app/page.js
export default function HomePage() {
  return (
    <>
      {/* Fixed background */}
      <DotMatrix fixed={true} />
      
      {/* Header with logo, filters, cart */}
      <Header />
      
      {/* Main content */}
      <main className="home-main">
        <VerticalSlider products={products} />
        <Minimap products={products} currentIndex={currentIndex} />
      </main>
    </>
  );
}
```

### 2. Header Component

```jsx
// src/components/Header/Header.jsx
const Header = () => {
  return (
    <header className="header">
      <div className="header-logo">
        <h1>CHROME HUB</h1>
      </div>
      <FilterBar />
      <CartButton />
    </header>
  );
};
```

**Стили:**
- Position: fixed, top: 0
- Z-index выше DotMatrix
- Прозрачный/полупрозрачный фон
- Flex layout: logo | filters | cart

### 3. VerticalSlider Component

```jsx
// src/components/VerticalSlider/VerticalSlider.jsx
const VerticalSlider = ({ products, onIndexChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  
  // GSAP ScrollTrigger для snap-эффекта
  useGSAP(() => {
    const cards = containerRef.current.querySelectorAll('.slider-card');
    
    cards.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'center center',
        end: 'center center',
        onEnter: () => setCurrentIndex(index),
        onEnterBack: () => setCurrentIndex(index),
      });
    });
  });
  
  return (
    <div className="vertical-slider" ref={containerRef}>
      {products.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product}
          isActive={index === currentIndex}
        />
      ))}
    </div>
  );
};
```

**Поведение:**
- Scroll-snap для плавной остановки на карточках
- GSAP анимации при переходе между карточками
- Callback для обновления Minimap
- Touch/swipe поддержка

### 4. ProductCard Component (Compact)

```jsx
// src/components/ProductCard/ProductCard.jsx
const ProductCard = ({ product, isActive }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  
  return (
    <div className={`product-card ${isActive ? 'active' : ''}`}>
      <Link href={`/product/${product.id}`} className="product-card-image">
        <img src={product.images[0]} alt={product.name} />
      </Link>
      
      <div className="product-card-info">
        <div className="product-card-price">
          <span className="price">€{product.price}</span>
        </div>
        
        <div className="product-card-sizes">
          {product.sizes.map(size => (
            <span key={size} className="size">{size}</span>
          ))}
        </div>
        
        <button 
          className="product-card-btn"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
```

**Стили карточки:**
```css
.product-card {
  width: 320px;
  height: auto; /* НЕ elongated */
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.product-card-image {
  aspect-ratio: 1 / 1; /* Квадратное фото */
  width: 100%;
}

.product-card-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-card-sizes {
  display: flex;
  gap: 0.5rem;
}

.product-card-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--base-700);
  color: var(--base-100);
}
```

### 5. Minimap Component

```jsx
// src/components/Minimap/Minimap.jsx
const Minimap = ({ products, currentIndex, onNavigate }) => {
  return (
    <div className="minimap">
      {products.map((product, index) => (
        <div 
          key={product.id}
          className={`minimap-dot ${index === currentIndex ? 'active' : ''}`}
          onClick={() => onNavigate(index)}
        >
          {/* Можно добавить превью изображения */}
        </div>
      ))}
    </div>
  );
};
```

**Стили:**
```css
.minimap {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.minimap-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--base-400);
  cursor: pointer;
  transition: all 0.3s ease;
}

.minimap-dot.active {
  background: var(--base-700);
  transform: scale(1.5);
}

/* Скрыть на мобильных */
@media (max-width: 768px) {
  .minimap {
    display: none;
  }
}
```

### 6. FilterBar Component

```jsx
// src/components/FilterBar/FilterBar.jsx
const FilterBar = ({ onFilterChange }) => {
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  
  const brands = ['Chrome Hearts', 'Loro Piana', 'Hermès', 'Balenciaga'];
  const categories = ['Clothing', 'Accessories', 'Jewelry', 'Shoes'];
  
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Brand</span>
        <div className="filter-options">
          {brands.map(brand => (
            <button
              key={brand}
              className={activeBrand === brand ? 'active' : ''}
              onClick={() => {
                setActiveBrand(activeBrand === brand ? null : brand);
                onFilterChange({ brand: activeBrand === brand ? null : brand });
              }}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 7. DotMatrix (Modified)

Модифицируем существующий DotMatrix для поддержки fixed позиционирования:

```jsx
// src/components/DotMatrix/DotMatrix.jsx
const DotMatrix = ({ fixed = false, ...props }) => {
  return (
    <div className={`dot-matrix ${fixed ? 'fixed' : ''}`}>
      {/* existing canvas logic */}
    </div>
  );
};
```

```css
.dot-matrix.fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
```

## Data Models

### Product (для Supabase)

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;        // 'Chrome Hearts' | 'Loro Piana' | etc.
  category: string;     // 'Clothing' | 'Accessories' | etc.
  sizes: string[];      // ['S', 'M', 'L']
  images: string[];     // URLs from Supabase Storage
  description: string;
  status: 'available' | 'sold';
  created_at: timestamp;
}
```

### Cart Item

```typescript
interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}
```

## File Structure

```
src/
├── app/
│   ├── page.js              # Главная (переделанная)
│   ├── product/
│   │   └── [id]/
│   │       └── page.js      # Динамическая страница товара
│   └── ...
├── components/
│   ├── Header/
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── VerticalSlider/
│   │   ├── VerticalSlider.jsx
│   │   └── VerticalSlider.css
│   ├── ProductCard/
│   │   ├── ProductCard.jsx
│   │   └── ProductCard.css
│   ├── Minimap/
│   │   ├── Minimap.jsx
│   │   └── Minimap.css
│   ├── FilterBar/
│   │   ├── FilterBar.jsx
│   │   └── FilterBar.css
│   └── ...
├── lib/
│   └── supabase.js          # Supabase client
└── store/
    └── cartStore.js         # Zustand (обновлённый)
```

## Error Handling

1. **Загрузка товаров**: Показывать skeleton/loader пока данные грузятся из Supabase
2. **Пустой каталог**: Показывать сообщение "No products found" с предложением сбросить фильтры
3. **Ошибка сети**: Показывать toast с возможностью retry
4. **Добавление в корзину**: Показывать confirmation toast

## Testing Strategy

### Unit Tests
- FilterBar: проверка применения/сброса фильтров
- CartStore: добавление/удаление товаров
- ProductCard: рендеринг с разными данными

### Integration Tests
- VerticalSlider + Minimap: синхронизация позиции
- FilterBar + VerticalSlider: фильтрация товаров

### E2E Tests
- Полный flow: просмотр → фильтрация → добавление в корзину
