"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ORDER_STATUSES = [
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "fitting", label: "Fitting" },
  { value: "shipping", label: "Shipping" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
];

const FITTING_STATUSES = [
  { value: "", label: "No Fitting" },
  { value: "scheduled", label: "Scheduled" },
  { value: "with_courier", label: "With Courier" },
  { value: "on_fitting", label: "On Fitting" },
  { value: "partial_buyout", label: "Partial Buyout" },
  { value: "completed", label: "Completed" },
];

// Demo order
const demoOrder = {
  id: "1",
  order_number: 1001,
  status: "new",
  fitting_status: null,
  subtotal: 3250,
  discount: 0,
  total: 3250,
  delivery_address: "Moscow, Tverskaya st. 15, apt. 42",
  delivery_date: "2026-01-15",
  delivery_time_slot: "14:00 - 18:00",
  notes: "Client prefers contactless delivery",
  created_at: new Date().toISOString(),
  client: {
    id: "c1",
    name: "Alexander Kozlov",
    phone: "+7 999 123 4567",
    email: "alex@example.com",
    tier: "vip",
  },
  items: [
    { id: "i1", product_name: "Chrome Hearts Hoodie", size: "L", original_price: 1250, final_price: 1250, image: "/products/product_1.png" },
    { id: "i2", product_name: "Chrome Hearts Ring", size: "9", original_price: 2000, final_price: 2000, image: "/products/product_4.png" },
  ],
  status_history: [
    { status: "new", changed_by: "System", created_at: new Date().toISOString(), notes: "Order created" },
  ],
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchOrder();
    } else {
      setOrder(demoOrder);
      setLoading(false);
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select(`
          *,
          clients (*),
          order_items (*, products (name, main_image_url)),
          order_status_history (*)
        `)
        .eq("id", params.id)
        .single();

      if (error) throw error;

      setOrder({
        ...orderData,
        client: orderData.clients,
        items: orderData.order_items?.map(item => ({
          ...item,
          product_name: item.products?.name,
          image: item.products?.main_image_url,
        })),
        status_history: orderData.order_status_history?.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        ),
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Order not found");
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (updates) => {
    setSaving(true);

    if (!isSupabaseConfigured()) {
      setOrder({ ...order, ...updates });
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", params.id);

      if (error) throw error;

      // Add to status history if status changed
      if (updates.status && updates.status !== order.status) {
        await supabase.from("order_status_history").insert({
          order_id: params.id,
          status: updates.status,
          changed_by: "Admin",
          notes: newNote || null,
        });
      }

      setOrder({ ...order, ...updates });
      setNewNote("");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <div className="admin-header">
        <h1>Order #{order.order_number}</h1>
        <div className="admin-header-actions">
          <Link href="/admin/orders" className="admin-btn admin-btn-secondary">
            ← Back to Orders
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Main Content */}
        <div>
          {/* Order Items */}
          <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ 
              fontFamily: "var(--font-koulen)", 
              fontSize: "1.25rem", 
              marginBottom: "1rem",
              color: "var(--base-700)"
            }}>
              Items
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {order.items?.map((item) => (
                <div 
                  key={item.id}
                  style={{ 
                    display: "flex", 
                    gap: "1rem", 
                    padding: "1rem",
                    background: "var(--base-100)",
                    borderRadius: "8px"
                  }}
                >
                  <div style={{ 
                    width: "60px", 
                    height: "60px", 
                    borderRadius: "6px",
                    overflow: "hidden",
                    background: "var(--base-200)"
                  }}>
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.product_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
                      {item.product_name}
                    </div>
                    <div style={{ 
                      fontSize: "0.8rem", 
                      color: "var(--base-500)",
                      fontFamily: "var(--font-dm-mono)"
                    }}>
                      Size: {item.size}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 500 }}>{formatCurrency(item.final_price)}</div>
                    {item.original_price !== item.final_price && (
                      <div style={{ 
                        fontSize: "0.8rem", 
                        color: "var(--base-400)",
                        textDecoration: "line-through"
                      }}>
                        {formatCurrency(item.original_price)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ 
              marginTop: "1.5rem", 
              paddingTop: "1rem", 
              borderTop: "1px solid var(--base-200)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "var(--base-500)" }}>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "#2e7d32" }}>
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontWeight: 600,
                fontSize: "1.1rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid var(--base-200)"
              }}>
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="admin-card">
            <h3 style={{ 
              fontFamily: "var(--font-koulen)", 
              fontSize: "1.25rem", 
              marginBottom: "1rem",
              color: "var(--base-700)"
            }}>
              Status History
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {order.status_history?.map((entry, index) => (
                <div 
                  key={index}
                  style={{ 
                    display: "flex", 
                    gap: "1rem",
                    padding: "0.75rem",
                    background: index === 0 ? "var(--base-100)" : "transparent",
                    borderRadius: "6px"
                  }}
                >
                  <span className={`status-badge ${entry.status}`}>
                    {ORDER_STATUSES.find(s => s.value === entry.status)?.label || entry.status}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--base-500)" }}>
                      {entry.changed_by} • {formatDate(entry.created_at)}
                    </div>
                    {entry.notes && (
                      <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {entry.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Status Update */}
          <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ 
              fontFamily: "var(--font-koulen)", 
              fontSize: "1.25rem", 
              marginBottom: "1rem",
              color: "var(--base-700)"
            }}>
              Update Status
            </h3>
            <div className="admin-form">
              <div className="admin-form-group">
                <label className="admin-form-label">Order Status</label>
                <select
                  className="admin-form-select"
                  value={order.status}
                  onChange={(e) => updateOrder({ status: e.target.value })}
                  disabled={saving}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Fitting Status</label>
                <select
                  className="admin-form-select"
                  value={order.fitting_status || ""}
                  onChange={(e) => updateOrder({ fitting_status: e.target.value || null })}
                  disabled={saving}
                >
                  {FITTING_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Note (optional)</label>
                <textarea
                  className="admin-form-textarea"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note for this status change..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ 
              fontFamily: "var(--font-koulen)", 
              fontSize: "1.25rem", 
              marginBottom: "1rem",
              color: "var(--base-700)"
            }}>
              Client
            </h3>
            {order.client ? (
              <div>
                <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
                  {order.client.name}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--base-500)", marginBottom: "0.25rem" }}>
                  {order.client.email}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--base-500)", marginBottom: "0.75rem" }}>
                  {order.client.phone}
                </div>
                <span className={`status-badge ${order.client.tier}`}>
                  {order.client.tier?.toUpperCase()}
                </span>
                <Link
                  href={`/admin/clients/${order.client.id}`}
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                  style={{ marginTop: "1rem", display: "block", textAlign: "center" }}
                >
                  View Client
                </Link>
              </div>
            ) : (
              <p style={{ color: "var(--base-500)" }}>Guest order</p>
            )}
          </div>

          {/* Delivery Info */}
          <div className="admin-card">
            <h3 style={{ 
              fontFamily: "var(--font-koulen)", 
              fontSize: "1.25rem", 
              marginBottom: "1rem",
              color: "var(--base-700)"
            }}>
              Delivery
            </h3>
            <div style={{ fontSize: "0.9rem" }}>
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ 
                  fontSize: "0.75rem", 
                  color: "var(--base-500)",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                  fontFamily: "var(--font-dm-mono)"
                }}>
                  Address
                </div>
                <div>{order.delivery_address || "Not specified"}</div>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ 
                  fontSize: "0.75rem", 
                  color: "var(--base-500)",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                  fontFamily: "var(--font-dm-mono)"
                }}>
                  Date & Time
                </div>
                <div>
                  {order.delivery_date || "Not scheduled"}
                  {order.delivery_time_slot && ` • ${order.delivery_time_slot}`}
                </div>
              </div>
              {order.notes && (
                <div>
                  <div style={{ 
                    fontSize: "0.75rem", 
                    color: "var(--base-500)",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                    fontFamily: "var(--font-dm-mono)"
                  }}>
                    Notes
                  </div>
                  <div>{order.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
