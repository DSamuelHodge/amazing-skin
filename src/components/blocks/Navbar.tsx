import { mockData } from "@/src/data/mockData";
import { Button } from "@/src/components/ui/Button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore, trpc } from "@/src/lib/trpc";
import { CustomerMenu } from "@/src/components/customer/CustomerMenu";

export function Navbar() {
  const { openDrawer } = useCartStore();
  const { data: cart } = trpc.cart.get.useQuery();
  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="border-b border-emerald-900/50 bg-[#1b2320]/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <a 
          href="/"
          aria-label="Lumina Skin Rituals Home"
          className="flex bg-center w-[100px] h-[36px] bg-cover invert gap-x-2 gap-y-2 items-center shrink-0"
          style={{ backgroundImage: `url(${mockData.nav.logo})` }}
        />
        <nav className="hidden md:flex items-center gap-7 text-sm text-emerald-200">
          {mockData.nav.links.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-emerald-50 transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <CustomerMenu />
          
          <button 
            onClick={openDrawer}
            className="relative p-2 text-emerald-200 hover:text-emerald-50 transition-colors rounded-full hover:bg-white/5"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-xs">
                {itemCount}
              </span>
            )}
          </button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => {
              const shopEl = document.getElementById('shop-section') || document.querySelector('section');
              if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
              else window.location.href = '/product/lumina-glow-serum';
            }}
          >
            Shop ritual
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

