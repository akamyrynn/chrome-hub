"use client";
import "./AdminSidebar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Панель", icon: "◉" },
    { href: "/admin/products", label: "Товары", icon: "◈" },
    { href: "/admin/orders", label: "Заказы", icon: "◇" },
    { href: "/admin/preorders", label: "Предзаказы", icon: "◆" },
    { href: "/admin/clients", label: "Клиенты", icon: "◎" },
    { href: "/admin/analytics", label: "Аналитика", icon: "◐" },
    { href: "/admin/settings", label: "Настройки", icon: "◑" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <Link href="/admin" className="admin-logo">
          <h2>Chrome Hub</h2>
          <span>Admin</span>
        </Link>
      </div>

      <nav className="admin-nav">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${pathname === item.href ? "active" : ""}`}
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span className="admin-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <Link href="/" className="admin-nav-item">
          <span className="admin-nav-icon">←</span>
          <span className="admin-nav-label">В магазин</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
