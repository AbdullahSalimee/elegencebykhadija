import "./globals.css";
// Loaded second so the storefront skin wins wherever the two overlap.
import "./ethnic.css";
import { CartProvider } from "@/lib/cart-context";
import CartDrawer from "@/components/CartDrawer";
import ProductModal from "@/components/ProductModal";
import CheckoutModal from "@/components/CheckoutModal";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata = {
  title: "Elegance by Khadija",
  description: "Unstitched luxury lawn & silk suits",
};
export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <ProductModal />
          <CartDrawer />
          <CheckoutModal />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
