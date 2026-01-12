"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    totalOrders: 0,
    newOrders: 0,
    totalClients: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchDashboardData();
    } else {
      // Demo data when Supabase is not configured
      setStats({
        totalProducts: 30,
        availableProducts: 24,
        totalOrders: 156,
        newOrders: 8,
        totalClients: 89,
        totalRevenue: 45680,
      });
      setRecentOrders([
        { id: 1, order_number: 1001, client_name: "John Doe", total: 1250, status: "new", created_at: new Date().toISOString() },
        { id: 2, order_number: 1002, client_name: "Jane Smith", total: 890, status: "in_progress", created_at: new Date().toISOString() },
        { id: 3, order_number: 1003, client_name: "Mike Johnson", total: 2100, status: "shipping", created_at: new Date().toISOString() },
      ]);
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products count
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: availableProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "available");

      // Fetch orders
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      const { count: newOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");

      // Fetch clients
      const { count: totalClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });

      // Fetch revenue
      const { data: revenueData } = await supabase
        .from("orders")
        .select("total")
        .eq("status", "delivered");

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      // Fetch recent orders
      const { data: orders } = await supabase
        .from("orders")
        .select(`
          *,
          clients (name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalProducts: totalProducts || 0,
        availableProducts: availableProducts || 0,
        totalOrders: totalOrders || 0,
        newOrders: newOrders || 0,
        totalClients: totalClients || 0,
        totalRevenue,
      });

      setRecentOrders(orders?.map(o => ({
        ...o,
        client_name: o.clients?.name || "Guest"
      })) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-header">
        <h1>Панель управления</h1>
        <div className="admin-header-actions">
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            + Добавить товар
          </Link>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <div className="admin-card" style={{ marginBottom: "1.5rem", background: "#fff3e0" }}>
          <p style={{ color: "#ef6c00", fontSize: "0.85rem" }}>
            ⚠️ Supabase не настроен. Показаны демо-данные. Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local
          </p>
        </div>
      )}

      <div className="admin-grid">
        <div className="admin-card">
          <span className="admin-card-title">Всего товаров</span>
          <div className="admin-card-value">{stats.totalProducts}</div>
          <span className="admin-card-subtitle">{stats.availableProducts} в наличии</span>
        </div>

        <div className="admin-card">
          <span className="admin-card-title">Всего заказов</span>
          <div className="admin-card-value">{stats.totalOrders}</div>
          <span className="admin-card-subtitle">{stats.newOrders} новых</span>
        </div>

        <div className="admin-card">
          <span className="admin-card-title">Всего клиентов</span>
          <div className="admin-card-value">{stats.totalClients}</div>
        </div>

        <div className="admin-card">
          <span className="admin-card-title">Выручка</span>
          <div className="admin-card-value">{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Последние заказы</span>
          <Link href="/admin/orders" className="admin-btn admin-btn-sm admin-btn-secondary">
            Все заказы
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="admin-table-container" style={{ border: "none", boxShadow: "none" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Заказ №</th>
                  <th>Клиент</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.order_number}</td>
                    <td>{order.client_name}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <p>Заказов пока нет</p>
          </div>
        )}
      </div>
    </>
  );
}
