"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import "./clients.css";

const CLIENT_TIERS = [
  { value: "new", label: "Новый", color: "#90a4ae" },
  { value: "regular", label: "Постоянный", color: "#42a5f5" },
  { value: "vip", label: "VIP", color: "#ab47bc" },
  { value: "vvip", label: "VVIP", color: "#ffd700" },
];

// Demo clients
const demoClients = [
  { id: "1", name: "Maria Sokolova", phone: "+7 999 234 5678", email: "maria@example.com", telegram_id: "@maria_s", tier: "vvip", ltv: 128500, orders_count: 28, last_message: "Отлично! Беру. Когда можно примерку?", last_message_at: new Date(Date.now() - 3600000).toISOString(), unread_count: 1 },
  { id: "2", name: "Alexander Kozlov", phone: "+7 999 123 4567", email: "alex@example.com", telegram_id: "@alex_k", tier: "vip", ltv: 45600, orders_count: 12, last_message: "Спасибо, получил!", last_message_at: new Date(Date.now() - 86400000).toISOString(), unread_count: 0 },
  { id: "3", name: "Dmitry Novikov", phone: "+7 999 567 8901", email: "dmitry@example.com", tier: "vip", ltv: 67800, orders_count: 15, last_message: null, last_message_at: null, unread_count: 0 },
  { id: "4", name: "Ivan Petrov", phone: "+7 999 345 6789", email: "ivan@example.com", tier: "regular", ltv: 8900, orders_count: 3, last_message: "Есть ли размер L?", last_message_at: new Date(Date.now() - 172800000).toISOString(), unread_count: 1 },
  { id: "5", name: "Elena Volkova", phone: "+7 999 456 7890", email: "elena@example.com", tier: "new", ltv: 2500, orders_count: 1, last_message: null, last_message_at: null, unread_count: 0 },
];

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ tier: "", search: "" });
  const [view, setView] = useState("cards"); // 'cards' or 'list'

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchClients();
    } else {
      let filtered = demoClients;
      if (filter.tier) {
        filtered = filtered.filter(c => c.tier === filter.tier);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.phone?.includes(search)
        );
      }
      setClients(filtered);
      setLoading(false);
    }
  }, [filter]);

  const fetchClients = async () => {
    try {
      let query = supabase
        .from("clients")
        .select("*")
        .order("ltv", { ascending: false });

      if (filter.tier) {
        query = query.eq("tier", filter.tier);
      }

      const { data, error } = await query;
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
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

  const formatTimeAgo = (dateString) => {
    if (!dateString) return null;
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "только что";
    if (hours < 24) return `${hours}ч назад`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}д назад`;
    return new Date(dateString).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
  };

  const getTierInfo = (tier) => CLIENT_TIERS.find(t => t.value === tier) || CLIENT_TIERS[0];

  // Stats
  const totalClients = clients.length;
  const totalLtv = clients.reduce((sum, c) => sum + (c.ltv || 0), 0);
  const unreadMessages = clients.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <div className="clients-page">
      <div className="clients-header">
        <div>
          <h1>Клиенты</h1>
          <p className="clients-subtitle">{totalClients} клиентов • {formatCurrency(totalLtv)} общий LTV</p>
        </div>
        <div className="clients-header-actions">
          <button className="admin-btn admin-btn-primary">+ Добавить клиента</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="clients-stats">
        {CLIENT_TIERS.map(tier => {
          const count = clients.filter(c => c.tier === tier.value).length;
          return (
            <button 
              key={tier.value}
              className={`stat-card ${filter.tier === tier.value ? 'active' : ''}`}
              onClick={() => setFilter({ ...filter, tier: filter.tier === tier.value ? "" : tier.value })}
              style={{ '--tier-color': tier.color }}
            >
              <span className="stat-count">{count}</span>
              <span className="stat-label">{tier.label}</span>
            </button>
          );
        })}
        {unreadMessages > 0 && (
          <div className="stat-card unread">
            <span className="stat-count">{unreadMessages}</span>
            <span className="stat-label">Непрочитано</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="clients-search">
        <input
          type="text"
          placeholder="Поиск по имени, email, телефону..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="admin-loading"><p>Загрузка...</p></div>
      ) : clients.length > 0 ? (
        <div className="clients-grid">
          {clients.map(client => {
            const tierInfo = getTierInfo(client.tier);
            return (
              <Link key={client.id} href={`/admin/clients/${client.id}`} className="client-card">
                <div className="client-card-top">
                  <div className="client-avatar" style={{ background: tierInfo.color }}>
                    {client.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="client-info">
                    <span className="client-name">{client.name}</span>
                    <span className="client-contact">{client.telegram_id || client.phone || client.email}</span>
                  </div>
                  <span className="client-tier-badge" style={{ background: `${tierInfo.color}20`, color: tierInfo.color }}>
                    {tierInfo.label}
                  </span>
                </div>
                
                <div className="client-card-stats">
                  <div className="mini-stat">
                    <span className="mini-stat-value">{formatCurrency(client.ltv || 0)}</span>
                    <span className="mini-stat-label">LTV</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-value">{client.orders_count || 0}</span>
                    <span className="mini-stat-label">Заказов</span>
                  </div>
                </div>

                {client.last_message && (
                  <div className="client-card-message">
                    <p>{client.last_message}</p>
                    <span className="message-time">{formatTimeAgo(client.last_message_at)}</span>
                    {client.unread_count > 0 && (
                      <span className="unread-badge">{client.unread_count}</span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="clients-empty">
          <p>Клиенты не найдены</p>
        </div>
      )}
    </div>
  );
}
