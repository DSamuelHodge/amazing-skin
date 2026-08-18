import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Trash2, Minus, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/src/components/ui/sheet';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Separator } from '@/src/components/ui/separator';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';
import { trpc, useCartStore } from '@/src/lib/trpc';
import { useAuthStore } from '@/src/lib/authStore';

export const CartDrawer = () => {
  const { isDrawerOpen, closeDrawer } = useCartStore();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const { data: cart, isLoading } = trpc.cart.get.useQuery();
  const updateItem = trpc.cart.updateItem.useMutation();
  const removeItem = trpc.cart.removeItem.useMutation();
  const summaryMutation = trpc.checkout.summary.useMutation();

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [gwp, setGwp] = useState<{ name: string } | null>(null);

  const items = cart?.items || [];
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  useEffect(() => {
    if (items.length > 0) {
      summaryMutation.mutate({ discountCode: appliedDiscount?.code }, {
        onSuccess: (data) => {
          if (data.gwp) {
            setGwp({ name: data.gwp.name });
          } else {
            setGwp(null);
          }
        }
      });
    }
  }, [items, appliedDiscount]);

  const handleUpdateQuantity = (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    updateItem.mutate({ itemId, quantity: newQty });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem.mutate({ itemId });
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;

    summaryMutation.mutate({ discountCode }, {
      onSuccess: (data) => {
        setAppliedDiscount({ code: discountCode, amount: data.discount });
        toast.success(`$${data.discount} discount applied`);
        setDiscountCode('');
      },
      onError: () => {
        toast.error('Invalid discount code');
      }
    });
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    summaryMutation.mutate({});
  };

  const total = subtotal - (appliedDiscount?.amount || 0);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-[#f4eadf] border-l-stone-300">
        <SheetHeader className="p-6 border-b border-stone-200/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl text-stone-900">
              Your Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </SheetTitle>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-stone-500 font-medium">Loading bag...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="w-16 h-16 text-stone-300 mb-4" strokeWidth={1} />
            <h3 className="text-lg font-medium text-stone-900 mb-2">Your bag is empty</h3>
            <p className="text-stone-500 mb-8">Looks like you haven't added anything yet.</p>
            <Button 
              onClick={() => {
                closeDrawer();
                window.location.href = '/';
              }}
              className="w-full max-w-[200px]"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="flex flex-col gap-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0 border border-stone-200">
                      <img 
                        src={item.image.imageUrl} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col flex-1 justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-medium text-stone-900 line-clamp-2 leading-tight">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-stone-500 mt-1">{item.variant.name}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-stone-400 hover:text-stone-900 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-300 rounded-full bg-white">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || updateItem.isPending}
                            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={updateItem.isPending}
                            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-medium text-stone-900">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GWP Banner */}
              {gwp && (
                <div className="mt-6 p-3 bg-teal-50 border border-teal-100 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <span className="text-teal-700 text-xs font-bold">GIFT</span>
                  </div>
                  <p className="text-sm text-teal-800 font-medium">
                    Free gift added: {gwp.name}
                  </p>
                </div>
              )}

              {/* Discount Code */}
              <div className="mt-8">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium text-sm">Code: {appliedDiscount.code}</span>
                      <span className="text-green-600 text-sm">(-${appliedDiscount.amount.toFixed(2)})</span>
                    </div>
                    <button 
                      onClick={handleRemoveDiscount}
                      className="text-green-700 hover:text-green-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyDiscount} className="flex gap-2">
                    <Input 
                      placeholder="Discount code" 
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="bg-white border-stone-300 focus-visible:ring-stone-400"
                    />
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="shrink-0 border-stone-300 hover:bg-stone-100"
                      disabled={!discountCode.trim() || summaryMutation.isPending}
                    >
                      Apply
                    </Button>
                  </form>
                )}
              </div>
            </ScrollArea>

            <div className="p-6 bg-white border-t border-stone-200">
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${appliedDiscount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-sm">Calculated at checkout</span>
                </div>
                <Separator className="my-1 bg-stone-200" />
                <div className="flex justify-between items-center">
                  <span className="font-serif text-lg font-medium text-stone-900">Total</span>
                  <span className="font-serif text-xl font-medium text-stone-900">${total.toFixed(2)}</span>
                </div>

                <div className="mt-1 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-950">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Earn <strong className="text-emerald-800">{Math.floor(total)} pts</strong> on this ritual</span>
                  </div>
                  {!isAuthenticated && (
                    <button
                      onClick={() => {
                        closeDrawer();
                        openAuthModal('signin');
                      }}
                      className="text-[11px] text-emerald-800 hover:underline font-semibold"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full h-12 text-base"
                  onClick={() => {
                    closeDrawer();
                    window.location.href = '/checkout';
                  }}
                >
                  Checkout
                </Button>
                <button 
                  onClick={closeDrawer}
                  className="text-sm text-stone-500 hover:text-stone-900 font-medium transition-colors text-center py-2"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
