import { lazy, Suspense, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from "@/src/components/blocks/Navbar";
import { HeroSection } from "@/src/components/blocks/HeroSection";
import { EveningRitualSection } from "@/src/components/blocks/EveningRitualSection";
import { StatsSection } from "@/src/components/blocks/StatsSection";
import { ShopSection } from "@/src/components/blocks/ShopSection";
import { CtaSection } from "@/src/components/blocks/CtaSection";
import { Footer } from "@/src/components/blocks/Footer";
import { CartDrawer } from "@/src/components/cart-drawer";
import { AuthModal } from "@/src/components/auth/AuthModal";
import { Toaster } from "sonner";
import { useAuthStore } from "@/src/lib/authStore";
import { navigate } from "@/src/lib/nav";

const CheckoutPage = lazy(() => import("@/src/routes/checkout"));
const OrderConfirmedPage = lazy(() => import("@/src/routes/order-confirmed"));
const AccountPage = lazy(() => import("@/src/routes/account"));
const AdminPage = lazy(() => import("@/src/routes/admin"));
const ProductDetailPage = lazy(() => import("@/src/routes/product/$slug"));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="w-10 h-10 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
  const isAccountPage = currentPath.startsWith('/account');
  const isAdminPage = currentPath.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-canvas-surface focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-stone-900 focus:shadow-lg"
        >
          Skip to content
        </a>
        {!isAdminPage && <Navbar />}
        <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
          <Suspense fallback={<RouteFallback />}>
            {isAdminPage ? (
              <AdminPage />
            ) : isProductPage ? (
              <ProductDetailPage key={currentPath} />
            ) : isCheckoutPage ? (
              <CheckoutPage />
            ) : isOrderConfirmedPage ? (
              <OrderConfirmedPage />
            ) : isAccountPage ? (
              <AccountPage />
            ) : (
              <>
                <HeroSection />
                <EveningRitualSection />
                <StatsSection />
                <ShopSection />
                <CtaSection />
              </>
            )}
          </Suspense>
        </main>
        {!isAdminPage && <Footer />}
        {!isAdminPage && <CartDrawer />}
        <AuthModal />
        <Toaster position="bottom-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
