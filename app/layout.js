import { Cormorant_Garamond, Lora, Jost } from "next/font/google";
import "./globals.css";
// Loaded second so the storefront skin wins wherever the two overlap.
import "./ethnic.css";
import { CartProvider } from "@/lib/cart-context";
import ModalHost from "@/components/ModalHost";
import WhatsAppFloat from "@/components/WhatsAppFloat";

// Self-hosted at build time and preloaded, rather than the CSS @import these
// replace. That @import forced the browser to fetch globals.css, discover the
// Google stylesheet, fetch that, and only then fetch the font files — three
// serialised round trips, all of them blocking first paint.
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
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata = {
  title: "Elegance by Khadija",
  description: "Unstitched luxury lawn & silk suits",
};
export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lora.variable} ${jost.variable}`}
    >
      <body>
        <CartProvider>
          {children}
          <WhatsAppFloat />
          <ModalHost />
        </CartProvider>
      </body>
    </html>
  );
}
