"use client";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import "./preorders.css";

const STATUSES = [
  { value: "new", label: "Новый", color: "#1565c0" },
  { value: "searching", label: "Поиск", color: "#ff9800" },
  { value: "found", label: "Найдено", color: "#4caf50" },
  { value: "completed", label: "Завершён", color: "#9e9e9e" },
  { value: "cancelled", label: "Отменён", color: "#f44336" },
];

// Demo preorders
const demoPreorders = [
  {
    id: "1",
    client_name: "Anna K.",
    client_telegram: "@anna_k",
    client_phone: "+7 999 111 2233",
    item_name: "Chrome Hearts Fleur Knee Zip",
    item_description: "Size 32, black color, any condition",
    item_image_url: "/products/product_1.png",
    budget: "€2,000 - €3,000",
    status: "new",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    client_name: "Sergey M.",
    client_telegram: "@sergey_m",
    item_name: "Hermès Constance 24",
    item_description: "Black or brown, excellent condition",
    item_image_url: null,
    budget: "€15,000+",
    status: "searching",
    notes: "Checking with our suppliers",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "3",
    client_name: "Elena P.",
    client_email: "elena@example.com",
    item_name: "Loro Piana Summer Walk",
    item_description: "Size 39, any color",
    budget: "€800 - €1,200",
    status: "found",
    notes: "Found at partner store, waiting for client confirmation",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export default function PreordersPage() {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedPreorder, setSelectedPreorder] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchPreorders();
    } else {
      let filtered = demoPreorders;
      if (filter) {
        filtered = filtered.filter(p => p.status === filter);
      }
      setPreorders(filtered);
      setLoading(false);
    }
  }, [filter]);

  const fetchPreorders = async () => {
    try {
      let query = supabase
        .from("preorders")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter) {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPreorders(data || []);
    } catch (error) {
      console.error("Error fetching preorders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!isSupabaseConfigured()) {
      setPreorders(preorders.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from("preorders")
        .update({ status: newStatus, notes })
        .eq("id", id);

      if (error) throw error;
      
      setPreorders(preorders.map(p => 
        p.id === id ? { ...p, status: newStatus, notes } : p
      ));
      setSelectedPreorder(null);
    } catch (error) {
      console.error("Error updating preorder:", error);
    }
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

  const getStatusInfo = (status) => STATUSES.find(s => s.value === status) || STATUSES[0];

  // Count by status
  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s.value] = preorders.filter(p => p.status === s.value).length;
    return acc;
  }, {});

  return (
    <div className="preorders-page">
      <div className="preorders-header">
        <div>
          <h1>Предзаказы</h1>
          <p className="preorders-subtitle">Запросы клиентов на конкретные товары</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="preorders-filters">
        <button 
          className={`filter-btn ${!filter ? 'active' : ''}`}
          onClick={() => setFilter("")}
        >
          Все ({preorders.length})
        </button>
        {STATUSES.slice(0, 3).map(status => (
          <button
            key={status.value}
            className={`filter-btn ${filter === status.value ? 'active' : ''}`}
            onClick={() => setFilter(status.value)}
            style={{ '--status-color': status.color }}
          >
            {status.label} ({statusCounts[status.value] || 0})
          </button>
        ))}
      </div>

      {/* Preorders List */}
      {loading ? (
        <div className="admin-loading"><p>Загрузка...</p></div>
      ) : preorders.length > 0 ? (
        <div className="preorders-grid">
          {preorders.map(preorder => {
            const statusInfo = getStatusInfo(preorder.status);
            return (
              <div key={preorder.id} className="preorder-card">
                <div className="preorder-card-header">
                  <span 
                    className="preorder-status"
                    style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </span>
                  <span className="preorder-date">{formatDate(preorder.created_at)}</span>
                </div>

                <div className="preorder-card-content">
                  {preorder.item_image_url && (
                    <div className="preorder-image">
                      <img src={preorder.item_image_url} alt="" />
                    </div>
                  )}
                  
                  <div className="preorder-item-info">
                    <h3>{preorder.item_name}</h3>
                    {preorder.item_description && (
                      <p className="preorder-description">{preorder.item_description}</p>
                    )}
                    {preorder.budget && (
                      <span className="preorder-budget">Бюджет: {preorder.budget}</span>
                    )}
                  </div>
                </div>

                <div className="preorder-client">
                  <span className="client-name">{preorder.client_name}</span>
                  <div className="client-contacts">
                    {preorder.client_telegram && <span>💬 {preorder.client_telegram}</span>}
                    {preorder.client_phone && <span>📱 {preorder.client_phone}</span>}
                    {preorder.client_email && <span>✉️ {preorder.client_email}</span>}
                  </div>
                </div>

                {preorder.notes && (
                  <div className="preorder-notes">
                    <strong>Заметки:</strong> {preorder.notes}
                  </div>
                )}

                <div className="preorder-actions">
                  <select
                    value={preorder.status}
                    onChange={(e) => updateStatus(preorder.id, e.target.value)}
                    className="status-select"
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button 
                    className="action-btn"
                    onClick={() => {
                      setSelectedPreorder(preorder);
                      setNotes(preorder.notes || "");
                    }}
                  >
                    Добавить заметку
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="preorders-empty">
          <p>Предзаказов пока нет</p>
          <span>Поделитесь ссылкой /preorder с клиентами</span>
        </div>
      )}

      {/* Notes Modal */}
      {selectedPreorder && (
        <div className="modal-overlay" onClick={() => setSelectedPreorder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Добавить заметку</h3>
            <p className="modal-item">{selectedPreorder.item_name}</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Добавьте заметки к этому предзаказу..."
              rows={4}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setSelectedPreorder(null)}>
                Отмена
              </button>
              <button 
                className="save-btn"
                onClick={() => updateStatus(selectedPreorder.id, selectedPreorder.status)}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
