import { mockData } from "@/src/data/mockData";
import { Button } from "@/src/components/ui/Button";
import { ArrowRight, Star, Plus } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { MouseEvent } from "react";
import { trpc, useCartStore } from "@/src/lib/trpc";
import { navigate, shopProductPath, shopVariantId } from "@/src/lib/nav";

type ShopItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  size: string | null;
  tag: string;
  image: string;
  rating: number | null;
  reviews: string | null;
  collection: string;
  variantId: string | null;
  note: string;
};

function formatPrice(value: number | string) {
  const amount = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, '')) || 0;
  return `$${amount.toFixed(0)}`;
}

export function ShopSection() {
  const { shop } = mockData;
  const addItem = trpc.cart.addItem.useMutation();
  const { openDrawer } = useCartStore();
  const catalogQuery = trpc.catalog.getProducts.useQuery({ limit: 24 });

  const dbItems = (catalogQuery.data?.items ?? []) as ShopItem[];
  const arrivals = dbItems.filter((item) => item.collection === 'new');
  const favorites = dbItems.filter((item) => item.collection === 'top' || item.collection === 'featured');

  const newArrivals: ShopItem[] =
    arrivals.length > 0
      ? arrivals
      : shop.newArrivals.map((product) => ({
          id: product.title,
          name: product.title,
          slug: shopProductPath(product.title).replace('/product/', ''),
          description: product.description,
          price: Number(String(product.price).replace(/[^0-9.]/g, '')) || 0,
          size: product.size,
          tag: product.tag,
          image: product.image,
          rating: null,
          reviews: null,
          collection: 'new',
          variantId: shopVariantId(product.title),
          note: product.note,
        }));

  const topProducts: ShopItem[] =
    favorites.length > 0
      ? favorites
      : shop.topProducts.map((product) => ({
          id: product.title,
          name: product.title,
          slug: shopProductPath(product.title).replace('/product/', ''),
          description: product.description,
          price: Number(String(product.price).replace(/[^0-9.]/g, '')) || 0,
          size: product.size,
          tag: product.tag,
          image: product.image,
          rating: product.rating,
          reviews: product.reviews,
          collection: 'top',
          variantId: shopVariantId(product.title),
          note: product.quote,
        }));

  const handleAdd = (product: ShopItem, event?: MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const variantId = product.variantId || shopVariantId(product.name);
    addItem.mutate(
      { variantId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(`${product.name} added to bag`);
          openDrawer();
        },
        onError: () => {
          toast.error(`Could not add ${product.name}`);
        },
      },
    );
  };

  return (
    <section id="shop-section" className="text-stone-900 bg-canvas-bg w-full border-stone-200/80 border-t scroll-mt-24">
      <div className="sm:px-6 lg:px-8 lg:py-20 max-w-6xl mx-auto pt-14 px-4 pb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-stone-600 mb-3">
              {shop.tag}
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight tracking-tight text-stone-900">
              {shop.title} <span className="italic text-stone-700">{shop.titleItalic}</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-stone-700 max-w-xl">
              {shop.description}
            </p>
          </motion.div>
          <motion.div 
            className="flex flex-wrap gap-3 text-xs sm:text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button variant="light" onClick={() => navigate('#shop-section')}>
              All products
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="lightOutline" onClick={() => navigate('#cta-section')}>
              Routine quiz
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        <div className="space-y-10 lg:space-y-14">
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center text-[0.7rem] font-medium text-stone-700 bg-white/70 w-6 h-6 border-stone-300 border rounded-full">
                  New
                </span>
                <h3 className="text-base sm:text-lg font-medium tracking-tight text-stone-900">
                  Fresh arrivals
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => navigate('#shop-section')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors"
                aria-label="View all new arrivals"
              >
                View all new
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {newArrivals.map((product, i) => (
                <motion.article 
                  key={product.id}
                  className="group rounded-3xl border border-stone-200 bg-canvas-surface overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent pointer-events-none"></div>
                    <a href={`/product/${product.slug}`}>
                      <img src={product.image} alt={product.name} className="sm:h-56 w-full h-48 object-cover" />
                    </a>
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.68rem] font-medium bg-stone-900 text-forest-text shadow-sm">
                        {product.tag}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col px-5 py-5 sm:px-6 sm:py-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-playfair text-lg font-semibold tracking-tight text-stone-900">
                          <a href={`/product/${product.slug}`} className="hover:underline underline-offset-4">
                            {product.name}
                          </a>
                        </h4>
                        <p className="mt-1 text-xs sm:text-sm text-stone-700">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end text-xs text-stone-700">
                        <span className="font-semibold">{formatPrice(product.price)}</span>
                        <span className="text-stone-600 mt-0.5">{product.size}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-[0.72rem] sm:text-xs">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-900"></span>
                        <span>{product.note || 'Clinical calm'}</span>
                      </div>
                      <Button
                        type="button"
                        variant={i === 0 ? "light" : "lightOutline"}
                        size="sm"
                        onClick={(event) => handleAdd(product, event)}
                        disabled={addItem.isPending}
                      >
                        Add
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 border border-stone-300 text-[0.7rem] font-medium text-stone-800">
                  ★
                </span>
                <h3 className="text-base sm:text-lg font-medium tracking-tight text-stone-900">
                  Community favorites
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => navigate('#shop-section')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors"
                aria-label="View all top rated products"
              >
                View all top rated
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5">
              {topProducts.map((product, i) => (
                <motion.article 
                  key={product.id}
                  className="group rounded-3xl border border-stone-200 bg-canvas-surface px-5 py-5 sm:px-6 sm:py-6 flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <a href={`/product/${product.slug}`} className="relative mb-4 rounded-2xl overflow-hidden block">
                    <img src={product.image} alt={product.name} className="sm:h-40 w-full h-32 object-cover" />
                  </a>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-stone-700 mb-1.5">
                        {product.tag}
                      </p>
                      <h4 className="font-playfair text-lg font-semibold tracking-tight text-stone-900">
                        <a href={`/product/${product.slug}`} className="hover:underline underline-offset-4">
                          {product.name}
                        </a>
                      </h4>
                      <p className="mt-1 text-xs sm:text-sm text-stone-700">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end text-xs text-stone-700">
                      <span className="font-semibold">{formatPrice(product.price)}</span>
                      <span className="mt-0.5 text-stone-600">{product.size}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-[0.72rem] sm:text-xs">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="ml-0.5">{product.rating ?? '—'}</span>
                      </div>
                      <span className="text-stone-600">• {product.reviews ?? '0'} reviews</span>
                    </div>
                    <Button
                      type="button"
                      variant={i === 0 ? "light" : "lightOutline"}
                      size="sm"
                      onClick={(event) => handleAdd(product, event)}
                      disabled={addItem.isPending}
                    >
                      Add
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
