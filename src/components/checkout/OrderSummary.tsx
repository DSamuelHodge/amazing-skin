import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Leaf, 
  Tag, 
  Gift, 
  ShieldCheck, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Truck,
  Coins
} from 'lucide-react';
import { CartItem } from '@/src/types';
import { ShippingFormData } from './ShippingStep';
import { toast } from 'sonner';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  pointsDiscount: number;
  shipping: number;
  packagingFee: number;
  tax: number;
  total: number;
  gwp: { name: string } | null;
  formData: ShippingFormData;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  appliedDiscount: { code: string; amount: number } | null;
  onApplyDiscount: (e: React.FormEvent) => void;
  onRemoveDiscount: () => void;
  pointsEarned: number;
  pointsRedeemed: number;
  isApplyingDiscount: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  discount,
  pointsDiscount,
  shipping,
  packagingFee,
  tax,
  total,
  gwp,
  formData,
  discountCode,
  setDiscountCode,
  appliedDiscount,
  onApplyDiscount,
  onRemoveDiscount,
  pointsEarned,
  pointsRedeemed,
  isApplyingDiscount
}: OrderSummaryProps) {
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);
  const [carbonPledge, setCarbonPledge] = useState(true);

  const quickCodes = [
    { code: 'LUMINA10', label: '$10 Off' },
    { code: 'GLOW20', label: '20% Off' },
    { code: 'WELCOME50', label: '$15 Welcome' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/90 text-stone-900 sticky top-24 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <h3 className="font-serif text-xl font-medium text-stone-900">Ritual Summary</h3>
        <span className="text-xs font-mono text-stone-500">
          {items.reduce((acc, i) => acc + i.quantity, 0)} Items
        </span>
      </div>

      {/* Expandable Line Items Preview */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsItemsExpanded(!isItemsExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-stone-600 hover:text-stone-900 uppercase tracking-wider transition-colors"
        >
          <span className="flex items-center gap-1.5">
            {isItemsExpanded ? 'Hide Bag Contents' : 'View Bag Contents'}
          </span>
          {isItemsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isItemsExpanded && (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 text-xs">
                <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-stone-300/60">
                  <img src={item.image.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 truncate">{item.product.name}</p>
                  <p className="text-[11px] text-stone-500">Qty: {item.quantity} • {item.variant.name}</p>
                </div>
                <span className="font-bold text-stone-900 font-mono">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            {gwp && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-emerald-50 text-xs border border-emerald-200/60">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-emerald-950 truncate">{gwp.name}</p>
                  <p className="text-[10px] text-emerald-700">Free Gift with Purchase</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 font-mono">FREE</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Financial Line Items */}
      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Formulations Subtotal</span>
          <span className="font-medium text-stone-900 font-mono">${subtotal.toFixed(2)}</span>
        </div>

        {appliedDiscount && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Promo Code ({appliedDiscount.code})
            </span>
            <span className="font-mono">-${appliedDiscount.amount.toFixed(2)}</span>
          </div>
        )}

        {pointsDiscount > 0 && (
          <div className="flex justify-between text-amber-700 font-medium">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              Loyalty Points Credit ({pointsRedeemed} pts)
            </span>
            <span className="font-mono">-${pointsDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-stone-600">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-stone-400" />
            Courier Delivery
          </span>
          <span className="font-medium text-stone-900 font-mono">
            {shipping === 0 ? (
              <span className="text-emerald-700 font-bold">COMPLIMENTARY</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {packagingFee > 0 && (
          <div className="flex justify-between text-stone-600">
            <span className="flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              Luxury Keepsake Gift Box
            </span>
            <span className="font-medium text-stone-900 font-mono">${packagingFee.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-stone-600">
          <span>Estimated Sales Tax</span>
          <span className="font-medium text-stone-900 font-mono">${tax.toFixed(2)}</span>
        </div>

        <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
          <div>
            <span className="font-serif text-lg sm:text-xl font-medium text-stone-900 block">Total Due</span>
            <span className="text-[11px] text-stone-500">Includes all duties and taxes</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-500 block">USD</span>
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Promotional Code Entry Form */}
      <div className="pt-4 border-t border-stone-100 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Promotional Code or Gift Voucher
        </span>

        {appliedDiscount ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-emerald-900">{appliedDiscount.code} applied (-${appliedDiscount.amount.toFixed(2)})</span>
            </div>
            <button
              type="button"
              onClick={onRemoveDiscount}
              className="p-1 rounded-lg text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 transition-colors"
              aria-label="Remove code"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={onApplyDiscount} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. LUMINA10"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
            <button
              type="submit"
              disabled={!discountCode.trim() || isApplyingDiscount}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors"
            >
              {isApplyingDiscount ? '...' : 'Apply'}
            </button>
          </form>
        )}

        {/* Quick Promo Pills */}
        {!appliedDiscount && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-stone-400 font-medium">Try:</span>
            {quickCodes.map((qc) => (
              <button
                key={qc.code}
                type="button"
                onClick={() => {
                  setDiscountCode(qc.code);
                  toast.info(`Entered ${qc.code}`, { description: 'Click Apply to redeem.' });
                }}
                className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] font-mono text-stone-600 transition-colors border border-stone-200"
              >
                {qc.code} ({qc.label})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carbon Offset Guarantee */}
      <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-stone-200/80 space-y-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={carbonPledge}
            onChange={(e) => setCarbonPledge(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
          />
          <span className="font-semibold text-stone-900 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-700" />
            100% Carbon-Neutral Transit
          </span>
        </label>
        <p className="text-[11px] text-stone-500 pl-6 leading-relaxed">
          We plant 1 indigenous tree for every Lumina ritual order through Eden Reforestation Projects.
        </p>
      </div>

      {/* Member Points Reward Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center text-xs">
        <p className="text-emerald-950 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          You will earn <strong className="text-emerald-800 font-bold">{pointsEarned} loyalty points</strong>
        </p>
        <p className="text-[11px] text-emerald-700/80 mt-0.5">
          Redeemable on all future botanical serums & refills.
        </p>
      </div>
    </div>
  );
}
