import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import CartDrawer from '@/components/CartDrawer';
import ProductModal from '@/components/ProductModal';
import CheckoutModal from '@/components/CheckoutModal';

export const metadata = { title: 'Elegance by Khadija', description: 'Unstitched luxury lawn & silk suits' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <ProductModal />
          <CartDrawer />
          <CheckoutModal />
        </CartProvider>
      </body>
    </html>
  );
}
