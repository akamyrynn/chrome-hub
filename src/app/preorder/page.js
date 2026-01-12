"use client";
import "./preorder.css";
import { useState, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import DotMatrix from "@/components/DotMatrix/DotMatrix";

export default function PreorderPage() {
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    client_telegram: "",
    item_name: "",
    item_description: "",
    budget: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.item_name || (!formData.client_phone && !formData.client_telegram)) {
      alert("Пожалуйста, заполните имя, название товара и хотя бы один способ связи");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (image && isSupabaseConfigured()) {
        const fileName = `preorder-${Date.now()}-${image.name}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, image);

        if (!error) {
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      // Create preorder
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from("preorders")
          .insert({
            ...formData,
            item_image_url: imageUrl,
            status: "new",
          });

        if (error) throw error;
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting preorder:", error);
      alert("Ошибка отправки. Попробуйте ещё раз или свяжитесь с нами напрямую.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <DotMatrix color="#969992" dotSize={2} spacing={5} opacity={0.9} fixed={true} />
        <div className="preorder-page">
          <div className="preorder-success">
            <div className="success-icon">✓</div>
            <h1>Заявка отправлена</h1>
            <p>Мы найдём ваш товар и свяжемся с вами в ближайшее время.</p>
            <a href="/" className="preorder-btn">Вернуться в магазин</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DotMatrix color="#969992" dotSize={2} spacing={5} opacity={0.9} fixed={true} />
      
      <div className="preorder-page">
        <div className="preorder-container">
          <div className="preorder-header">
            <a href="/" className="preorder-logo">Chrome Hub</a>
            <h1>Предзаказ</h1>
            <p>Не нашли то, что искали? Расскажите нам, и мы найдём это для вас.</p>
          </div>

          <form className="preorder-form" onSubmit={handleSubmit}>
            {/* Item Info */}
            <div className="form-section">
              <h3>Что вы ищете?</h3>
              
              <div className="form-group">
                <label>Название товара *</label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  placeholder="например: Chrome Hearts Hoodie, Hermès Birkin 25"
                  required
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  name="item_description"
                  value={formData.item_description}
                  onChange={handleChange}
                  placeholder="Размер, цвет, состояние, любые детали..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Референс</label>
                <div 
                  className="image-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>📷</span>
                      <p>Нажмите для загрузки фото</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Бюджет (опционально)</label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="например: 100 000 - 200 000 ₽"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="form-section">
              <h3>Контактные данные</h3>
              
              <div className="form-group">
                <label>Имя *</label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  placeholder="Ваше имя"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    name="client_phone"
                    value={formData.client_phone}
                    onChange={handleChange}
                    placeholder="+7 999 123 4567"
                  />
                </div>

                <div className="form-group">
                  <label>Telegram</label>
                  <input
                    type="text"
                    name="client_telegram"
                    value={formData.client_telegram}
                    onChange={handleChange}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="preorder-btn submit"
              disabled={submitting}
            >
              {submitting ? "Отправка..." : "Отправить заявку"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
