"use client";
import { useState, useRef } from "react";
import "./ProductForm.css";

const CATEGORIES = {
  Clothing: ["Jackets", "Pants", "Shirts", "Hoodies", "T-Shirts", "Dresses", "Coats"],
  Accessories: ["Belts", "Wallets", "Scarves", "Hats", "Sunglasses", "Keychains"],
  Jewelry: ["Rings", "Necklaces", "Bracelets", "Earrings", "Pendants", "Brooches"],
  Shoes: ["Sneakers", "Boots", "Loafers", "Sandals", "Heels"],
  Bags: ["Handbags", "Backpacks", "Clutches", "Totes", "Crossbody"],
  Watches: ["Automatic", "Quartz", "Smart", "Vintage"],
};

const BRANDS = ["Chrome Hearts", "Loro Piana", "Hermès", "Balenciaga", "Rick Owens", "Gucci", "Louis Vuitton", "Chanel", "Dior", "Prada", "Other"];

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];

const CONDITIONS = [
  { value: "new", label: "Новое с бирками" },
  { value: "like_new", label: "Как новое" },
  { value: "excellent", label: "Отличное" },
  { value: "good", label: "Хорошее" },
];

const MEDIA_SECTIONS = [
  { value: "gallery", label: "Галерея (фото товара)" },
  { value: "description", label: "Раздел описания" },
  { value: "care", label: "Раздел ухода" },
  { value: "brand", label: "Раздел о бренде" },
  { value: "sizing", label: "Размерная сетка" },
];

const ProductForm = ({ product, onSubmit, saving }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    brand: product?.brand || "",
    price: product?.price || "",
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    sizes: product?.sizes || [],
    description: product?.description || "",
    care_info: product?.care_info || "",
    brand_story: product?.brand_story || "",
    condition: product?.condition || "excellent",
    status: product?.status || "available",
  });

  const [images, setImages] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const fileInputRef = useRef(null);
  const [currentSection, setCurrentSection] = useState("gallery");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subcategory: "" } : {}),
    }));
  };

  const handleAddSize = (size) => {
    if (size && !formData.sizes.includes(size)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, size],
      }));
    }
    setSizeInput("");
  };

  const handleRemoveSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => {
      const isVideo = file.type.startsWith('video/');
      return {
        id: Date.now() + index,
        file,
        preview: isVideo ? null : URL.createObjectURL(file),
        isMain: currentSection === 'gallery' && images.filter(i => i.section === 'gallery').length === 0 && index === 0,
        section: currentSection,
        mediaType: isVideo ? 'video' : 'image',
        fileName: file.name,
      };
    });
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleSetMainImage = (id) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    );
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      const galleryImages = filtered.filter(img => img.section === 'gallery');
      if (galleryImages.length > 0 && !galleryImages.some((img) => img.isMain)) {
        galleryImages[0].isMain = true;
      }
      return filtered;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.price || !formData.category) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    onSubmit(formData, images);
  };

  const subcategories = formData.category ? CATEGORIES[formData.category] || [] : [];
  
  // Group images by section
  const imagesBySection = MEDIA_SECTIONS.reduce((acc, section) => {
    acc[section.value] = images.filter(img => img.section === section.value);
    return acc;
  }, {});

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {/* Media Upload Section */}
      <div className="admin-form-group">
        <label className="admin-form-label">Медиа товара</label>
        
        {/* Section Tabs */}
        <div className="admin-media-tabs">
          {MEDIA_SECTIONS.map((section) => (
            <button
              key={section.value}
              type="button"
              className={`admin-media-tab ${currentSection === section.value ? 'active' : ''}`}
              onClick={() => setCurrentSection(section.value)}
            >
              {section.label}
              {imagesBySection[section.value]?.length > 0 && (
                <span className="tab-count">{imagesBySection[section.value].length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Upload Area */}
        <div
          className="admin-image-upload"
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="admin-image-upload-text">
            {currentSection === 'gallery' 
              ? 'Нажмите для загрузки фото товара (изображения/видео)'
              : `Нажмите для загрузки медиа для раздела "${MEDIA_SECTIONS.find(s => s.value === currentSection)?.label}"`
            }
          </p>
          <p className="admin-image-upload-hint">
            Поддерживаются: JPG, PNG, WebP, MP4, MOV
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>

        {/* Current Section Images */}
        {imagesBySection[currentSection]?.length > 0 && (
          <div className="admin-image-grid">
            {imagesBySection[currentSection].map((image) => (
              <div
                key={image.id}
                className={`admin-image-item ${image.isMain ? "main" : ""} ${image.mediaType === 'video' ? 'video' : ''}`}
              >
                {image.mediaType === 'video' ? (
                  <div className="video-placeholder">
                    <span>🎬</span>
                    <p>{image.fileName}</p>
                  </div>
                ) : (
                  <img src={image.preview} alt="Product" />
                )}
                <div className="admin-image-item-actions">
                  {currentSection === 'gallery' && !image.isMain && image.mediaType !== 'video' && (
                    <button
                      type="button"
                      className="admin-image-item-btn"
                      onClick={() => handleSetMainImage(image.id)}
                      title="Сделать главным"
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-image-item-btn delete"
                    onClick={() => handleRemoveImage(image.id)}
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
                {image.isMain && <span className="main-badge">Главное</span>}
              </div>
            ))}
          </div>
        )}

        {imagesBySection[currentSection]?.length === 0 && (
          <p className="admin-no-media">Медиа для этого раздела не загружено</p>
        )}
      </div>

      {/* Basic Info */}
      <div className="admin-form-row">
        <div className="admin-form-group">
          <label className="admin-form-label">Название товара *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="admin-form-input"
            placeholder="например: Chrome Hearts Hoodie"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Бренд *</label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="admin-form-select"
            required
          >
            <option value="">Выберите бренд</option>
            {BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label className="admin-form-label">Цена (₽) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="admin-form-input"
            placeholder="0"
            min="0"
            step="1"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Состояние</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="admin-form-select"
          >
            {CONDITIONS.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label className="admin-form-label">Категория *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="admin-form-select"
            required
          >
            <option value="">Выберите категорию</option>
            {Object.keys(CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Подкатегория</label>
          <select
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            className="admin-form-select"
            disabled={!formData.category}
          >
            <option value="">Выберите подкатегорию</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sizes */}
      <div className="admin-form-group">
        <label className="admin-form-label">Доступные размеры</label>
        <div className="admin-sizes-container">
          <div className="admin-sizes-buttons">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={`admin-size-btn ${formData.sizes.includes(size) ? "active" : ""}`}
                onClick={() =>
                  formData.sizes.includes(size)
                    ? handleRemoveSize(size)
                    : handleAddSize(size)
                }
              >
                {size}
              </button>
            ))}
          </div>
          <div className="admin-custom-size">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
              placeholder="Свой размер"
              className="admin-form-input"
              style={{ width: "120px" }}
            />
            <button
              type="button"
              className="admin-btn admin-btn-sm admin-btn-secondary"
              onClick={() => handleAddSize(sizeInput)}
            >
              Добавить
            </button>
          </div>
        </div>
        {formData.sizes.length > 0 && (
          <div className="admin-sizes-input" style={{ marginTop: "0.75rem" }}>
            {formData.sizes.map((size) => (
              <span key={size} className="admin-size-tag">
                {size}
                <button type="button" onClick={() => handleRemoveSize(size)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="admin-form-group">
        <label className="admin-form-label">Описание</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="admin-form-textarea"
          placeholder="Описание товара..."
          rows={4}
        />
      </div>

      {/* Care Info */}
      <div className="admin-form-group">
        <label className="admin-form-label">Инструкции по уходу</label>
        <textarea
          name="care_info"
          value={formData.care_info}
          onChange={handleChange}
          className="admin-form-textarea"
          placeholder="Как ухаживать за этим товаром..."
          rows={3}
        />
      </div>

      {/* Brand Story */}
      <div className="admin-form-group">
        <label className="admin-form-label">История бренда / товара</label>
        <textarea
          name="brand_story"
          value={formData.brand_story}
          onChange={handleChange}
          className="admin-form-textarea"
          placeholder="Расскажите историю этой вещи..."
          rows={4}
        />
      </div>

      {/* Status */}
      <div className="admin-form-group">
        <label className="admin-form-label">Статус</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="admin-form-select"
          style={{ maxWidth: "200px" }}
        >
          <option value="available">В наличии</option>
          <option value="reserved">Зарезервировано</option>
          <option value="sold">Продано</option>
        </select>
      </div>

      {/* Submit */}
      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={saving}
        >
          {saving ? "Сохранение..." : product ? "Обновить товар" : "Создать товар"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
