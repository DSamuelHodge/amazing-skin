import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Truck, 
  Gift, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  Clock,
  Edit2
} from 'lucide-react';
import { CartItem } from '@/src/types';
import { ShippingFormData } from './ShippingStep';
import { trpc } from '@/src/lib/trpc';
import { toast } from 'sonner';

interface ReviewStepProps {
  items: CartItem[];
  formData: ShippingFormData;
  gwp: { name: string } | null;
  onBack: () => void;
  onContinue: () => void;
  selectedSamples: string[];
  setSelectedSamples: React.Dispatch<React.SetStateAction<string[]>>;
}

const availableSamples = [
  {
    id: 'sample_tansy',
    name: 'Blue Tansy Calming Night Elixir (2ml)',
    benefit: 'Soothes redness & repairs lipid matrix overnight',
    image: 'https://images.unsplash.com/photo-1608248597359-00120194883d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample_ceramide',
    name: 'Velvet Lock Multi-Ceramide Barrier Balm (3ml)',
    benefit: 'Intensive peptide hydration for compromised barriers',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample_hyaluronic',
    name: 'Hydra-Plump 5D Hyaluronic Droplet (2ml)',
    benefit: 'Multi-depth molecular plumping & dew infusion',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample_polish',
    name: 'Botanical Resurfacing Enzyme Polish (5g)',
    benefit: 'Micro-exfoliating fermented papaya & white tea',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&auto=format&fit=crop&q=80'
  }
];

export function ReviewStep({
  items,
  formData,
  gwp,
  onBack,
  onContinue,
  selectedSamples,
  setSelectedSamples
}: ReviewStepProps) {
  const updateItemMutation = trpc.cart.updateItem.useMutation();
  const removeItemMutation = trpc.cart.removeItem.useMutation();

  const toggleSample = (sampleId: string) => {
    if (selectedSamples.includes(sampleId)) {
      setSelectedSamples(prev => prev.filter(id => id !== sampleId));
    } else {
      if (selectedSamples.length >= 2) {
        toast.info('Maximum 2 complimentary samples per ritual', {
          description: 'Deselect a sample to choose a different formulation.'
        });
        return;
      }
      setSelectedSamples(prev => [...prev, sampleId]);
      toast.success('Sample added to your package');
    }
  };

  const getEstimatedArrival = () => {
    if (formData.shippingMethod === 'chilled') return 'Tomorrow (Chilled Courier)';
    if (formData.shippingMethod === 'express') return '1–2 Business Days (Priority Air)';
    return '3–5 Business Days (Eco Carbon-Neutral)';
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-stone-200/90 text-stone-900 space-y-8">
      {/* Header */}
      <div className="pb-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Step 02 of 03</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight mt-0.5">
            Review Your Skin Ritual
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Confirm your artisan formulations, complimentary lab samples, and verified delivery destination.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Edit Destination
        </button>
      </div>

      {/* Destination & Courier Dispatch Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shipping Address Card */}
        <div className="p-4 rounded-2xl bg-canvas-surface border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Shipping Destination
              </span>
              <button
                type="button"
                onClick={onBack}
                className="text-emerald-800 hover:underline flex items-center gap-1 lowercase font-normal"
              >
                <Edit2 className="w-3 h-3" /> edit
              </button>
            </div>
            <p className="text-sm font-bold text-stone-900">
              {formData.firstName} {formData.lastName}
            </p>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              {formData.address1} {formData.address2 && `• ${formData.address2}`}
              <br />
              {formData.city}, {formData.state} {formData.postalCode}, {formData.country}
            </p>
            <p className="text-xs text-stone-500 mt-1 font-mono">{formData.email}</p>
          </div>
          {formData.deliveryNotes && (
            <div className="mt-3 pt-2 border-t border-stone-200/60 text-[11px] text-stone-600 italic">
              Note: "{formData.deliveryNotes}"
            </div>
          )}
        </div>

        {/* Courier Dispatch Speed Card */}
        <div className="p-4 rounded-2xl bg-canvas-surface border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                Courier & Transit
              </span>
              <button
                type="button"
                onClick={onBack}
                className="text-emerald-800 hover:underline flex items-center gap-1 lowercase font-normal"
              >
                <Edit2 className="w-3 h-3" /> change
              </button>
            </div>
            <p className="text-sm font-bold text-stone-900">
              {formData.shippingMethod === 'chilled'
                ? 'White-Glove Chilled Delivery ($24.00)'
                : formData.shippingMethod === 'express'
                  ? 'Botanical Express Air ($12.00)'
                  : 'Eco-Botanical Ground (Complimentary)'}
            </p>
            <p className="text-xs text-emerald-800 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Estimated Arrival: {getEstimatedArrival()}
            </p>
          </div>
          
          <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1 text-[11px]">
              <Leaf className="w-3 h-3 text-emerald-600" /> 100% Carbon-Neutral Transit
            </span>
            <span className="text-[11px] text-stone-500 font-medium">Batch Dispensed</span>
          </div>
        </div>
      </div>

      {/* Cart Ritual Items Line Items */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Selected Formulations ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
        </h3>

        <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200/80 overflow-hidden bg-white">
          {items.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-stone-50/50 transition-colors">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                <img
                  src={item.image.imageUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {item.product.primaryCategory} Ritual
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-medium text-stone-900 mt-1 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      Variant: {item.variant.name} {item.variant.sku && `(${item.variant.sku})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-stone-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                    <span className="block text-[11px] text-stone-500">
                      ${item.unitPrice.toFixed(2)} each
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateItemMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                        } else {
                          removeItemMutation.mutate({ itemId: item.id });
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-white text-stone-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-stone-900 px-2">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItemMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      className="p-1 rounded-lg hover:bg-white text-stone-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemMutation.mutate({ itemId: item.id })}
                    className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Free Gift with Purchase Line (GWP) */}
          {gwp && (
            <div className="p-4 sm:p-5 bg-emerald-50/40 flex items-center gap-4 border-t border-emerald-100">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
                <Sparkles className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white uppercase tracking-wider">
                  Complimentary Gift
                </span>
                <h4 className="font-serif text-sm font-semibold text-emerald-950 mt-1">{gwp.name}</h4>
                <p className="text-xs text-emerald-800/80">Unlocked with orders over $80</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 font-mono">FREE</span>
            </div>
          )}

          {/* Luxury Gift Packaging Summary (if selected) */}
          {formData.giftPackaging && (
            <div className="p-4 sm:p-5 bg-amber-50/40 flex items-center gap-4 border-t border-amber-100">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-800">
                <Gift className="w-6 h-6 text-amber-700" />
              </div>
              <div className="flex-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-700 text-white uppercase tracking-wider">
                  Gift Presentation
                </span>
                <h4 className="font-serif text-sm font-semibold text-amber-950 mt-1">
                  Rigid Keepsake Box & Wax-Sealed Gold Note
                </h4>
                {formData.giftRecipient && (
                  <p className="text-xs text-amber-900/80 mt-0.5">
                    For: <strong>{formData.giftRecipient}</strong> — "{formData.giftNote || 'With love and radiant wishes.'}"
                  </p>
                )}
              </div>
              <span className="text-xs font-bold text-amber-900 font-mono">+$5.00</span>
            </div>
          )}
        </div>
      </div>

      {/* Complimentary Deluxe Lab Samples (Choose 2) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Select 2 Complimentary Lab Samples
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Hand-poured travel trials included complimentary with your ritual order. ({selectedSamples.length}/2 selected)
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            COMPLIMENTARY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableSamples.map((sample) => {
            const isSelected = selectedSamples.includes(sample.id);
            return (
              <div
                key={sample.id}
                onClick={() => toggleSample(sample.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-emerald-800 bg-emerald-50/60 ring-1 ring-emerald-800 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img src={sample.image} alt={sample.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{sample.name}</p>
                  <p className="text-[11px] text-stone-500 line-clamp-1">{sample.benefit}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 border-emerald-700 text-white'
                      : 'border-stone-300 bg-stone-50 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sustainability & Satisfaction Pledge */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>30-Day Ritual Satisfaction Guarantee — Free exchanges & returns.</span>
        </div>
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>100% Recyclable Glassware & Clean Vegan Formulations.</span>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shipping</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-forest-elevated text-white font-medium rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base group"
        >
          <span>Continue to Secure Payment</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
