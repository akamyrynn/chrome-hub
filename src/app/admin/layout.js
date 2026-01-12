import AdminSidebar from "@/components/Admin/AdminSidebar";
import "./admin.css";

export const metadata = {
  title: "Admin | Chrome Hub",
  description: "Chrome Hub Admin Panel",
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
