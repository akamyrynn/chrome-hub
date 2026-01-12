"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ORDER_STATUSES = [
  { value: "new", label: "Новый", color: "#1565c0" },
  { value: "confirmed", label: "Подтверждён", color: "#2e7d32" },
  { value: "preparing", label: "Подготовка", color: "#ef6c00" },
  { value: "fitting", label: "Примерка", color: "#7b1fa2" },
  { value: "shipping", label: "Доставка", color: "#00838f" },
  { value: "delivered", label: "Доставлен", color: "#388e3c" },
  { value: "returned", label: "Возврат", color: "#c62828" },
];

const FITTING_STATUSES = [
  { value: "scheduled", label: "Запланировано" },
  { value: "with_courier", label: "У курьера" },
  { value: "on_fitting", label: "На примерке" },
  { value: "partial_buyout", label: "Частичный выкуп" },
  { value: "completed", label: "Завершено" },
];

// Demo orders
const demoOrders = [
  { id: "1", order_number: 1001, client_name: "Alexander K.", total: 3250, status: "new", fitting_status: null, created_at: new Date().toISOString(), items_count: 2 },
  { id: "2", order_number: 1002, client_name: "Maria S.", total: 12500, status: "fitting", fitting_status: "on_fitting", created_at: new Date(Date.now() - 86400000).toISOString(), items_count: 1 },
  { id: "3", order_number: 1003, client_name: "Ivan P.", total: 890, status: "shipping", fitting_status: null, created_at: new Date(Date.now() - 172800000).toISOString(), items_count: 1 },
  { id: "4", order_number: 1004, client_name: "Elena V.", total: 5600, status: "delivered", fitting_status: null, created_at: new Date(Date.now() - 259200000).toISOString(), items_count: 3 },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchOrders();
    } else {
      let filtered = demoOrders;
      if (filter.status) {
        filtered = demoOrders.filter(o => o.status === filter.status);
      }
      setOrders(filtered);
      setLoading(false);
    }
  }, [filter]);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from("orders")
        .select(`*, clients (name)`)
        .order("created_at", { ascending: false });

      if (filter.status) {
        query = query.eq("status", filter.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setOrders(data?.map(o => ({
        ...o,
        client_name: o.clients?.name || "Guest"
      })) || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!isSupabaseConfigured()) {
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Add to status history
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: newStatus,
        changed_by: "Admin",
      });

      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Не удалось обновить статус заказа");
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Count orders by status
  const statusCounts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s.value] = orders.filter(o => o.status === s.value).length;
    return acc;
  }, {});

  return (
    <>
      <div className="admin-header">
        <h1>Заказы</h1>
      </div>

      {/* Status Tabs */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            className={`admin-btn admin-btn-sm ${!filter.status ? "admin-btn-primary" : "admin-btn-secondary"}`}
            onClick={() => setFilter({ status: "" })}
          >
            Все ({orders.length})
          </button>
          {ORDER_STATUSES.map((status) => (
            <button
              key={status.value}
              className={`admin-btn admin-btn-sm ${filter.status === status.value ? "admin-btn-primary" : "admin-btn-secondary"}`}
              onClick={() => setFilter({ status: status.value })}
            >
              {status.label} ({statusCounts[status.value] || 0})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <p>Загрузка заказов...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Заказ №</th>
                <th>Клиент</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Примерка</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.order_number}</td>
                  <td>{order.client_name}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <select
                      className="admin-form-select"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{ 
                        padding: "0.35rem 0.5rem", 
                        fontSize: "0.75rem",
                        minWidth: "120px"
                      }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {order.fitting_status ? (
                      <span className={`status-badge ${order.fitting_status}`}>
                        {FITTING_STATUSES.find(f => f.value === order.fitting_status)?.label || order.fitting_status}
                      </span>
                    ) : (
                      <span style={{ color: "var(--base-400)" }}>—</span>
                    )}
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-empty">
            <p>Заказы не найдены</p>
          </div>
        </div>
      )}
    </>
  );
}
