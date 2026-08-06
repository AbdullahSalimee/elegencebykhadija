'use client';
import dynamic from 'next/dynamic';

// None of these are needed for a page's initial paint — they only render
// once a user opens a product, the cart, or checkout — so they're split into
// their own chunks instead of shipping in the main bundle every page loads.
const ProductModal = dynamic(() => import('./ProductModal'), { ssr: false });
const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });
const CheckoutModal = dynamic(() => import('./CheckoutModal'), { ssr: false });

export default function ModalHost() {
  return (
    <>
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
    </>
  );
}
