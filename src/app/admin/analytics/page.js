"use client";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Demo analytics data
const demoAnalytics = {
  revenue: {
    total: 245680,
    thisMonth: 45200,
    lastMonth: 38900,
    growth: 16.2,
  },
  orders: {
    total: 156,
    thisMonth: 28,
    avgOrderValue: 1575,
    conversionRate: 3.2,
  },
  clients: {
    total: 89,
    new: 12,
    returning: 77,
    avgLtv: 2760,
  },
  products: {
    total: 30,
    sold: 156,
    avgDaysToSell: 14,
    topBrand: "Chrome Hearts",
  },
  topProducts: [
    { name: "Chrome Hearts Hoodie", views: 1250, wishlists: 89, sold: 12 },
    { name: "Hermès Birkin 25", views: 980, wishlists: 156, sold: 3 },
    { name: "Loro Piana Coat", views: 756, wishlists: 45, sold: 8 },
    { name: "Chrome Hearts Ring", views: 654, wishlists: 78, sold: 15 },
    { name: "Balenciaga Sneakers", views: 543, wishlists: 34, sold: 6 },
  ],
  topClients: [
    { name: "Maria S.", ltv: 128500, orders: 28, tier: "vvip" },
    { name: "Dmitry N.", ltv: 67800, orders: 15, tier: "vip" },
    { name: "Alexander K.", ltv: 45600, orders: 12, tier: "vip" },
    { name: "Elena V.", ltv: 34200, orders: 9, tier: "vip" },
    { name: "Ivan P.", ltv: 21500, orders: 7, tier: "regular" },
  ],
  categoryPerformance: [
    { category: "Clothing", revenue: 89500, orders: 45, avgPrice: 1989 },
    { category: "Bags", revenue: 78200, orders: 12, avgPrice: 6517 },
    { category: "Jewelry", revenue: 45600, orders: 38, avgPrice: 1200 },
    { category: "Shoes", revenue: 23400, orders: 18, avgPrice: 1300 },
    { category: "Accessories", revenue: 8980, orders: 15, avgPrice: 599 },
  ],
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(demoAnalytics);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [period]);

  const fetchAnalytics = async () => {
    // In production, fetch real analytics from Supabase
    // For now, use demo data
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Загрузка аналитики...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-header">
        <h1>Аналитика</h1>
        <div className="admin-header-actions">
          <select
            className="admin-form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            <option value="week">Эта неделя</option>
            <option value="month">Этот месяц</option>
            <option value="quarter">Этот квартал</option>
            <option value="year">Этот год</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="admin-grid">
        <div className="admin-card">
          <span className="admin-card-title">Общая выручка</span>
          <div className="admin-card-value">{formatCurrency(analytics.revenue.total)}</div>
          <span className="admin-card-subtitle" style={{ color: analytics.revenue.growth > 0 ? "#2e7d32" : "#c62828" }}>
            {formatPercent(analytics.revenue.growth)} к прошлому периоду
          </span>
        </div>

        <div className="admin-card">
          <span className="admin-card-title">Средний чек</span>
          <div className="admin-card-value">{formatCurrency(analytics.orders.avgOrderValue)}</div>
          <span className="admin-card-subtitle">{analytics.orders.total} заказов всего</span>
        </div>

        <div className="admin-card">
          <span className="admin-card-title">Средний LTV клиента</span>
          <div className="admin-card-value">{formatCurrency(analytics.clients.avgLtv)}</div>
          <span className="admin-card-subtitle">{analytics.clients.total} клиентов</span>
        </div>

        <div className="admin-card">
          <span className="admin-card-title">Среднее время продажи</span>
          <div className="admin-card-value">{analytics.products.avgDaysToSell} дн.</div>
          <span className="admin-card-subtitle">Топ: {analytics.products.topBrand}</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        {/* Top Products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Топ товаров</span>
          </div>
          <div className="admin-table-container" style={{ border: "none", boxShadow: "none" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Просмотры</th>
                  <th>В избранном</th>
                  <th>Продано</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.views}</td>
                    <td>{product.wishlists}</td>
                    <td>{product.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Clients */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Топ клиентов по LTV</span>
          </div>
          <div className="admin-table-container" style={{ border: "none", boxShadow: "none" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>LTV</th>
                  <th>Заказов</th>
                  <th>Уровень</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topClients.map((client, index) => (
                  <tr key={index}>
                    <td>{client.name}</td>
                    <td>{formatCurrency(client.ltv)}</td>
                    <td>{client.orders}</td>
                    <td>
                      <span className={`status-badge ${client.tier}`}>
                        {client.tier.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <div className="admin-card-header">
          <span className="admin-card-title">Эффективность категорий</span>
        </div>
        <div className="admin-table-container" style={{ border: "none", boxShadow: "none" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Выручка</th>
                <th>Заказов</th>
                <th>Средняя цена</th>
                <th>Доля</th>
              </tr>
            </thead>
            <tbody>
              {analytics.categoryPerformance.map((cat, index) => {
                const totalRevenue = analytics.categoryPerformance.reduce((sum, c) => sum + c.revenue, 0);
                const share = ((cat.revenue / totalRevenue) * 100).toFixed(1);
                return (
                  <tr key={index}>
                    <td style={{ fontWeight: 500 }}>{cat.category}</td>
                    <td>{formatCurrency(cat.revenue)}</td>
                    <td>{cat.orders}</td>
                    <td>{formatCurrency(cat.avgPrice)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ 
                          width: "60px", 
                          height: "6px", 
                          background: "var(--base-200)", 
                          borderRadius: "3px",
                          overflow: "hidden"
                        }}>
                          <div style={{ 
                            width: `${share}%`, 
                            height: "100%", 
                            background: "var(--base-700)",
                            borderRadius: "3px"
                          }} />
                        </div>
                        <span>{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
