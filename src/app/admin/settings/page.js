"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "Chrome Hub",
    storeEmail: "hello@chromehub.store",
    storePhone: "+7 999 000 0000",
    currency: "EUR",
    telegramBotToken: "",
    telegramChatId: "",
    notifyNewOrder: true,
    notifyStatusChange: true,
    notifyLowStock: false,
    reservationTimeout: 15,
    enableFitting: true,
    enableWaitlist: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // In production, save to Supabase or localStorage
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="admin-header">
        <h1>Настройки</h1>
        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Сохранение..." : saved ? "✓ Сохранено" : "Сохранить"}
          </button>
        </div>
      </div>

      {/* Store Settings */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ 
          fontFamily: "var(--font-koulen)", 
          fontSize: "1.25rem", 
          marginBottom: "1.5rem",
          color: "var(--base-700)"
        }}>
          Информация о магазине
        </h3>
        <div className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Название магазина</label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                className="admin-form-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Валюта</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="admin-form-select"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="RUB">RUB (₽)</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Email для связи</label>
              <input
                type="email"
                name="storeEmail"
                value={settings.storeEmail}
                onChange={handleChange}
                className="admin-form-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Телефон для связи</label>
              <input
                type="tel"
                name="storePhone"
                value={settings.storePhone}
                onChange={handleChange}
                className="admin-form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Integration */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ 
          fontFamily: "var(--font-koulen)", 
          fontSize: "1.25rem", 
          marginBottom: "1.5rem",
          color: "var(--base-700)"
        }}>
          Интеграция с Telegram
        </h3>
        <div className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Токен бота</label>
              <input
                type="password"
                name="telegramBotToken"
                value={settings.telegramBotToken}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Введите токен Telegram бота"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Chat ID</label>
              <input
                type="text"
                name="telegramChatId"
                value={settings.telegramChatId}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Введите Chat ID для уведомлений"
              />
            </div>
          </div>
          <p style={{ 
            fontSize: "0.8rem", 
            color: "var(--base-500)",
            fontFamily: "var(--font-dm-mono)"
          }}>
            Создайте бота через @BotFather и получите Chat ID через @userinfobot
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ 
          fontFamily: "var(--font-koulen)", 
          fontSize: "1.25rem", 
          marginBottom: "1.5rem",
          color: "var(--base-700)"
        }}>
          Уведомления
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="notifyNewOrder"
              checked={settings.notifyNewOrder}
              onChange={handleChange}
              style={{ width: "18px", height: "18px" }}
            />
            <span style={{ fontFamily: "var(--font-host-grotesk)" }}>
              Уведомлять о новых заказах
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="notifyStatusChange"
              checked={settings.notifyStatusChange}
              onChange={handleChange}
              style={{ width: "18px", height: "18px" }}
            />
            <span style={{ fontFamily: "var(--font-host-grotesk)" }}>
              Уведомлять об изменении статуса заказа
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="notifyLowStock"
              checked={settings.notifyLowStock}
              onChange={handleChange}
              style={{ width: "18px", height: "18px" }}
            />
            <span style={{ fontFamily: "var(--font-host-grotesk)" }}>
              Уведомлять о заканчивающихся товарах
            </span>
          </label>
        </div>
      </div>

      {/* Business Rules */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ 
          fontFamily: "var(--font-koulen)", 
          fontSize: "1.25rem", 
          marginBottom: "1.5rem",
          color: "var(--base-700)"
        }}>
          Бизнес-правила
        </h3>
        <div className="admin-form">
          <div className="admin-form-group" style={{ maxWidth: "300px" }}>
            <label className="admin-form-label">Таймаут резерва корзины (минуты)</label>
            <input
              type="number"
              name="reservationTimeout"
              value={settings.reservationTimeout}
              onChange={handleChange}
              className="admin-form-input"
              min="5"
              max="60"
            />
            <p style={{ 
              fontSize: "0.75rem", 
              color: "var(--base-500)",
              marginTop: "0.5rem",
              fontFamily: "var(--font-dm-mono)"
            }}>
              Как долго товары остаются зарезервированными в корзине
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="enableFitting"
                checked={settings.enableFitting}
                onChange={handleChange}
                style={{ width: "18px", height: "18px" }}
              />
              <span style={{ fontFamily: "var(--font-host-grotesk)" }}>
                Включить услугу примерки на дому
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="enableWaitlist"
                checked={settings.enableWaitlist}
                onChange={handleChange}
                style={{ width: "18px", height: "18px" }}
              />
              <span style={{ fontFamily: "var(--font-host-grotesk)" }}>
                Включить лист ожидания для проданных товаров
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="admin-card" style={{ borderColor: "#ffcdd2" }}>
        <h3 style={{ 
          fontFamily: "var(--font-koulen)", 
          fontSize: "1.25rem", 
          marginBottom: "1rem",
          color: "#c62828"
        }}>
          Опасная зона
        </h3>
        <p style={{ 
          fontSize: "0.85rem", 
          color: "var(--base-600)",
          marginBottom: "1rem",
          fontFamily: "var(--font-host-grotesk)"
        }}>
          Эти действия необратимы. Будьте осторожны.
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            className="admin-btn admin-btn-secondary"
            style={{ borderColor: "#ffcdd2", color: "#c62828" }}
            onClick={() => alert("Экспорт всех данных")}
          >
            Экспорт данных
          </button>
          <button 
            className="admin-btn admin-btn-secondary"
            style={{ borderColor: "#ffcdd2", color: "#c62828" }}
            onClick={() => {
              if (confirm("Вы уверены, что хотите очистить все демо-данные?")) {
                alert("Демо-данные очищены");
              }
            }}
          >
            Очистить демо-данные
          </button>
        </div>
      </div>
    </>
  );
}
