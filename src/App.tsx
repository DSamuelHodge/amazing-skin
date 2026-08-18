/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from "@/src/components/blocks/Navbar";
import { HeroSection } from "@/src/components/blocks/HeroSection";
import { EveningRitualSection } from "@/src/components/blocks/EveningRitualSection";
import { StatsSection } from "@/src/components/blocks/StatsSection";
import { ShopSection } from "@/src/components/blocks/ShopSection";
import { CtaSection } from "@/src/components/blocks/CtaSection";
import { Footer } from "@/src/components/blocks/Footer";
import ProductDetailPage from "@/src/routes/product/$slug";
import { CartDrawer } from "@/src/components/cart-drawer";
import CheckoutPage from "@/src/routes/checkout";
import OrderConfirmedPage from "@/src/routes/order-confirmed";
import { AuthModal } from "@/src/components/auth/AuthModal";
import { AdminDashboardModal } from "@/src/components/admin/AdminDashboardModal";
import { Toaster } from "sonner";
import { useAuthStore } from "@/src/lib/authStore";
import { navigate } from "@/src/lib/nav";

const queryClient = new QueryClient();

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (href.startsWith('#')) {
        event.preventDefault();
        navigate(href);
        return;
      }
      if (href.startsWith('/') && !href.startsWith('//')) {
        event.preventDefault();
        navigate(href);
      }
    };

    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    void useAuthStore.getState().hydrateSession();
  }, []);

  const isProductPage = currentPath.startsWith('/product/');
  const isCheckoutPage = currentPath === '/checkout';
  const isOrderConfirmedPage = currentPath.startsWith('/order-confirmed');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full">
          {isProductPage ? (
            <ProductDetailPage key={currentPath} />
          ) : isCheckoutPage ? (
            <CheckoutPage />
          ) : isOrderConfirmedPage ? (
            <OrderConfirmedPage />
          ) : (
            <>
              <HeroSection />
              <EveningRitualSection />
              <StatsSection />
              <ShopSection />
              <CtaSection />
            </>
          )}
        </main>
        <Footer />
        <CartDrawer />
        <AuthModal />
        <AdminDashboardModal />
        <Toaster position="bottom-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
