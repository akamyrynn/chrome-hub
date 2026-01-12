"use client";
import { usePathname } from "next/navigation";
import Menu from "@/components/Menu/Menu";

const ConditionalMenu = () => {
  const pathname = usePathname();
  
  // Не показываем Menu на главной и в админке
  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }
  
  return <Menu />;
};

export default ConditionalMenu;
