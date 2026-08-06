import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import ModalHost from "@/components/ModalHost";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata = {
  title: "Elegance by Khadija",
  description: "Unstitched luxury lawn & silk suits",
};
export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lora.variable}`}>
      <body>
        <CartProvider>
          {children}
          <ModalHost />
        </CartProvider>
      </body>
    </html>
  );
}
