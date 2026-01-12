"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import "./client-detail.css";

const CLIENT_TIERS = [
  { value: "new", label: "New", color: "#90a4ae" },
  { value: "regular", label: "Regular", color: "#42a5f5" },
  { value: "vip", label: "VIP", color: "#ab47bc" },
  { value: "vvip", label: "VVIP", color: "#ffd700" },
];

const INTEREST_LEVELS = [
  { value: "interested", label: "Interested", color: "#42a5f5" },
  { value: "negotiating", label: "Negotiating", color: "#ff9800" },
  { value: "ready_to_buy", label: "Ready to Buy", color: "#4caf50" },
];

// Demo client
const demoClient = {
  id: "1",
  name: "Maria Sokolova",
  phone: "+7 999 234 5678",
  email: "maria@example.com",
  telegram_id: "@maria_s",
  tier: "vvip",
  ltv: 128500,
  notes: "Prefers Chrome Hearts and Hermès. Always pays on delivery. VIP client since 2023.",
  addresses: [
    { label: "Home", address: "Moscow, Patriarshie Prudy, 10" },
    { label: "Office", address: "Moscow, City, Tower A, 45th floor" },
  ],
  created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
};

const demoInterests = [
  { id: "i1", product_id: "p1", product_name: "Hermès Kelly 28", product_price: 18500, product_image: "/products/product_3.png", interest_level: "ready_to_buy", notes: "Wants black color" },
  { id: "i2", product_id: "p2", product_name: "Chrome Hearts Jacket", product_price: 4500, product_image: "/products/product_7.png", interest_level: "negotiating", notes: "Asking for 10% discount" },
];

const demoMessages = [
  { id: "m1", content: "Здравствуйте! Интересует сумка Hermès Kelly", direction: "in", source: "telegram", created_at: new Date(Date.now() - 86400000 * 2).toISOString(), sender_name: "Maria" },
  { id: "m2", content: "Добрый день! Да, она в наличии. Могу отправить дополнительные фото", direction: "out", source: "telegram", created_at: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString() },
  { id: "m3", content: "Да, пожалуйста! И какая финальная цена?", direction: "in", source: "telegram", created_at: new Date(Date.now() - 86400000).toISOString(), sender_name: "Maria" },
  { id: "m4", content: "Отправила фото в личку. Цена €18,500, для вас как VIP клиента могу сделать €17,500", direction: "out", source: "telegram", created_at: new Date(Date.now() - 86400000 + 1800000).toISOString() },
  { id: "m5", content: "Отлично! Беру. Когда можно примерку?", direction: "in", source: "telegram", created_at: new Date(Date.now() - 3600000).toISOString(), sender_name: "Maria" },
];

const demoOrders = [
  { id: "o1", order_number: 1002, total: 12500, status: "fitting", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "o2", order_number: 998, total: 8900, status: "delivered", created_at: new Date(Date.now() - 86400000 * 14).toISOString() },
  { id: "o3", order_number: 985, total: 45600, status: "delivered", created_at: new Date(Date.now() - 86400000 * 45).toISOString() },
];

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const chatEndRef = useRef(null);
  
  const [client, setClient] = useState(null);
  const [interests, setInterests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [newMessage, setNewMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchClientData();
    } else {
      setClient(demoClient);
      setFormData(demoClient);
      setInterests(demoInterests);
      setMessages(demoMessages);
      setOrders(demoOrders);
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const fetchClientData = async () => {
    try {
      // Fetch client
      const { data: clientData, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;

      // Fetch interests
      const { data: interestsData } = await supabase
        .from("client_interests")
        .select("*, products (name, price, main_image_url)")
        .eq("client_id", params.id);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", params.id)
        .order("created_at", { ascending: true });

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("client_id", params.id)
        .order("created_at", { ascending: false });

      setClient(clientData);
      setFormData(clientData);
      setInterests(interestsData?.map(i => ({
        ...i,
        product_name: i.products?.name,
        product_price: i.products?.price,
        product_image: i.products?.main_image_url,
      })) || []);
      setMessages(messagesData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching client:", error);
      router.push("/admin/clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isSupabaseConfigured()) {
      setClient({ ...client, ...formData });
      setEditing(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .update(formData)
        .eq("id", params.id);

      if (error) throw error;
      setClient({ ...client, ...formData });
      setEditing(false);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      client_id: params.id,
      content: newMessage,
      direction: "out",
      source: "manual",
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      setMessages([...messages, message]);
      setNewMessage("");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTierInfo = (tier) => CLIENT_TIERS.find(t => t.value === tier) || CLIENT_TIERS[0];

  if (loading) {
    return <div className="admin-loading"><p>Loading...</p></div>;
  }

  if (!client) return null;

  const tierInfo = getTierInfo(client.tier);

  return (
    <div className="client-detail">
      {/* Header */}
      <div className="client-detail-header">
        <Link href="/admin/clients" className="back-link">← Clients</Link>
        <div className="client-detail-actions">
          {!editing ? (
            <button className="admin-btn admin-btn-secondary" onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : (
            <>
              <button className="admin-btn admin-btn-secondary" onClick={() => { setFormData(client); setEditing(false); }}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <div className="client-detail-grid">
        {/* Left: Client Card */}
        <div className="client-card-section">
          <div className="client-card">
            {/* Avatar & Name */}
            <div className="client-card-header">
              <div className="client-avatar" style={{ background: tierInfo.color }}>
                {client.name?.charAt(0).toUpperCase()}
              </div>
              <div className="client-card-title">
                {editing ? (
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <h2>{client.name}</h2>
                )}
                <span className="client-tier" style={{ background: `${tierInfo.color}20`, color: tierInfo.color }}>
                  {tierInfo.label}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="client-stats">
              <div className="client-stat">
                <span className="stat-value">{formatCurrency(client.ltv || 0)}</span>
                <span className="stat-label">Lifetime Value</span>
              </div>
              <div className="client-stat">
                <span className="stat-value">{orders.length}</span>
                <span className="stat-label">Orders</span>
              </div>
              <div className="client-stat">
                <span className="stat-value">{interests.length}</span>
                <span className="stat-label">Interests</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="client-info-section">
              <h4>Contact</h4>
              {editing ? (
                <div className="client-edit-fields">
                  <input
                    type="tel"
                    className="admin-form-input"
                    placeholder="Phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <input
                    type="email"
                    className="admin-form-input"
                    placeholder="Email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Telegram"
                    value={formData.telegram_id || ""}
                    onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                  />
                </div>
              ) : (
                <div className="client-contacts">
                  {client.phone && <div className="contact-item"><span>📱</span> {client.phone}</div>}
                  {client.email && <div className="contact-item"><span>✉️</span> {client.email}</div>}
                  {client.telegram_id && <div className="contact-item"><span>💬</span> {client.telegram_id}</div>}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="client-info-section">
              <h4>Notes</h4>
              {editing ? (
                <textarea
                  className="admin-form-textarea"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="client-notes">{client.notes || "No notes"}</p>
              )}
            </div>

            {/* Tier Select */}
            {editing && (
              <div className="client-info-section">
                <h4>Tier</h4>
                <select
                  className="admin-form-select"
                  value={formData.tier || "new"}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                >
                  {CLIENT_TIERS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="client-interests">
            <h3>Interested In</h3>
            {interests.length > 0 ? (
              <div className="interests-list">
                {interests.map(interest => (
                  <div key={interest.id} className="interest-item">
                    <div className="interest-image">
                      <img src={interest.product_image || "/products/product_1.png"} alt="" />
                    </div>
                    <div className="interest-info">
                      <span className="interest-name">{interest.product_name}</span>
                      <span className="interest-price">{formatCurrency(interest.product_price)}</span>
                      {interest.notes && <span className="interest-notes">{interest.notes}</span>}
                    </div>
                    <span 
                      className="interest-level"
                      style={{ 
                        background: `${INTEREST_LEVELS.find(l => l.value === interest.interest_level)?.color}20`,
                        color: INTEREST_LEVELS.find(l => l.value === interest.interest_level)?.color
                      }}
                    >
                      {INTEREST_LEVELS.find(l => l.value === interest.interest_level)?.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No interests tracked</p>
            )}
          </div>
        </div>

        {/* Right: Tabs (Chat / Orders) */}
        <div className="client-activity-section">
          <div className="activity-tabs">
            <button 
              className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>
            <button 
              className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Orders ({orders.length})
            </button>
          </div>

          {activeTab === "chat" ? (
            <div className="chat-section">
              <div className="chat-messages">
                {messages.length > 0 ? (
                  <>
                    {messages.map(msg => (
                      <div key={msg.id} className={`chat-message ${msg.direction}`}>
                        <div className="message-content">
                          {msg.content}
                        </div>
                        <div className="message-meta">
                          <span className="message-source">{msg.source}</span>
                          <span className="message-time">{formatTime(msg.created_at)}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                ) : (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <span>Messages from Telegram/Avito will appear here</span>
                  </div>
                )}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          ) : (
            <div className="orders-section">
              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map(order => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`} className="order-item">
                      <div className="order-info">
                        <span className="order-number">#{order.order_number}</span>
                        <span className="order-date">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="order-right">
                        <span className="order-total">{formatCurrency(order.total)}</span>
                        <span className={`order-status ${order.status}`}>{order.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="no-orders">
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}