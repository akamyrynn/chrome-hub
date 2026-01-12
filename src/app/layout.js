import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

import ClientLayout from "@/client-layout";

import ConditionalMenu from "@/components/ConditionalMenu/ConditionalMenu";
import ShoppingCart from "@/components/ShoppingCart/ShoppingCart";
import TransitionProvider from "@/providers/TransitionProvider";

// Inter поддерживает кириллицу - для заголовков
const inter = Inter({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-koulen",
});

// Inter также для body text
const hostGrotesk = Inter({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-host-grotesk",
});

// JetBrains Mono поддерживает кириллицу - для моноширинного текста
const jetbrainsMono = JetBrains_Mono({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-dm-mono",
});

export const metadata = {
  title: "Chrome Hub | Luxury Resale",
  description: "Exclusive luxury items - Chrome Hearts, Loro Piana, Hermès",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body
        className={`${inter.variable} ${hostGrotesk.variable} ${jetbrainsMono.variable}`}
      >
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
