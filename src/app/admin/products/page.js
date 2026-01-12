"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Demo products for when Supabase is not configured
const demoProducts = [
  { id: "1", name: "Chrome Hearts Hoodie", brand: "Chrome Hearts", price: 1250, category: "Clothing", status: "available", main_image_url: "/products/product_1.png" },
  { id: "2", name: "Loro Piana Cashmere Coat", brand: "Loro Piana", price: 3500, category: "Clothing", status: "available", main_image_url: "/products/product_2.png" },
  { id: "3", name: "Hermès Birkin 25", brand: "Hermès", price: 12000, category: "Bags", status: "sold", main_image_url: "/products/product_3.png" },
  { id: "4", name: "Chrome Hearts Ring", brand: "Chrome Hearts", price: 890, category: "Jewelry", status: "available", main_image_url: "/products/product_4.png" },
  { id: "5", name: "Loro Piana Sneakers", brand: "Loro Piana", price: 950, category: "Shoes", status: "reserved", main_image_url: "/products/product_5.png" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ brand: "", status: "" });

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchProducts();
    } else {
      setProducts(demoProducts);
      setLoading(false);
    }
  }, [filter]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter.brand) {
        query = query.eq("brand", filter.brand);
      }
      if (filter.status) {
        query = query.eq("status", filter.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

    if (!isSupabaseConfigured()) {
      setProducts(products.filter((p) => p.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Не удалось удалить товар");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="admin-header">
        <h1>Товары</h1>
        <div className="admin-header-actions">
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            + Добавить товар
          </Link>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <select
            className="admin-form-select"
            value={filter.brand}
            onChange={(e) => setFilter({ ...filter, brand: e.target.value })}
            style={{ minWidth: "150px" }}
          >
            <option value="">Все бренды</option>
            <option value="Chrome Hearts">Chrome Hearts</option>
            <option value="Loro Piana">Loro Piana</option>
            <option value="Hermès">Hermès</option>
            <option value="Balenciaga">Balenciaga</option>
          </select>

          <select
            className="admin-form-select"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            style={{ minWidth: "150px" }}
          >
            <option value="">Все статусы</option>
            <option value="available">В наличии</option>
            <option value="reserved">Зарезервировано</option>
            <option value="sold">Продано</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <p>Загрузка товаров...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Бренд</th>
                <th>Цена</th>
                <th>Категория</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        background: "var(--base-200)",
                      }}
                    >
                      {product.main_image_url && (
                        <img
                          src={product.main_image_url}
                          alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                  </td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.category}</td>
                  <td>
                    <span className={`status-badge ${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                      >
                        Изменить
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="admin-btn admin-btn-sm admin-btn-icon"
                        style={{ color: "#c62828" }}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-empty">
            <p>Товары не найдены</p>
            <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
              Добавить первый товар
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
