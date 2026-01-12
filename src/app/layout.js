import "./globals.css";

import ClientLayout from "@/client-layout";

import ConditionalMenu from "@/components/ConditionalMenu/ConditionalMenu";
import ShoppingCart from "@/components/ShoppingCart/ShoppingCart";
import TransitionProvider from "@/providers/TransitionProvider";

export const metadata = {
  title: "Chrome Hub | Luxury Resale",
  description: "Exclusive luxury items - Chrome Hearts, Loro Piana, Hermès",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <TransitionProvider>
          <ClientLayout>
            <ConditionalMenu />
            {children}
          </ClientLayout>
          <ShoppingCart />
        </TransitionProvider>
      </body>
    </html>
  );
}
