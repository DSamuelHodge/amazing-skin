import React from 'react';
import { 
  Truck, 
  Sparkles, 
  UserCheck, 
  Leaf, 
  Zap, 
  Snowflake, 
  Gift, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  MapPin, 
  Smartphone,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/src/lib/authStore';
import { toast } from 'sonner';

export interface ShippingFormData {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  smsUpdates: boolean;
  sameAsShipping: boolean;
  saveAddress: boolean;
  deliveryNotes: string;
  shippingMethod: 'eco' | 'express' | 'chilled';
  giftPackaging: boolean;
  giftNote: string;
  giftRecipient: string;
}

interface ShippingStepProps {
  formData: ShippingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ShippingFormData>>;
  onContinue: () => void;
  pointsEarned: number;
}

const shippingOptions = [
  {
    id: 'eco' as const,
    name: 'Eco-Botanical Ground',
    duration: '3–5 Business Days',
    price: 0,
    priceLabel: 'FREE',
    icon: Leaf,
    badge: '100% Carbon Neutral',
    desc: 'Dispatched via electric zero-emission fleet in recyclable mycelium cushioning.'
  },
  {
    id: 'express' as const,
    name: 'Botanical Express Air',
    duration: '1–2 Business Days',
    price: 12.00,
    priceLabel: '$12.00',
    icon: Zap,
    badge: 'Priority Lab Dispense',
    desc: 'Packaged in priority fresh batch. Dispatched within 2 hours of formulation.'
  },
  {
    id: 'chilled' as const,
    name: 'White-Glove Chilled Delivery',
    duration: 'Next Business Day',
    price: 24.00,
    priceLabel: '$24.00',
    icon: Snowflake,
    badge: 'Temp-Controlled 4°C',
    desc: 'Thermal-lined amber case to preserve live botanical antioxidants and active peptides.'
  },
];

export function ShippingStep({ formData, setFormData, onContinue, pointsEarned }: ShippingStepProps) {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();

  const handleInputChange = (field: keyof ShippingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrefillDemo = () => {
    setFormData((prev) => ({
      ...prev,
      email: user?.email || 'clara.vance@example.com',
      firstName: user?.firstName || 'Clara',
      lastName: user?.lastName || 'Vance',
      address1: '450 Sutter Street, Suite 1200',
      address2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94108',
      country: 'US',
      phone: '(415) 890-3321',
      smsUpdates: true,
      deliveryNotes: 'Please ring bell 4B or leave with door concierge.'
    }));
    toast.success('Concierge address autofilled', {
      description: 'Loaded verified San Francisco botanical delivery destination.'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address1 || !formData.city || !formData.state || !formData.postalCode) {
      toast.error('Please complete all required shipping fields');
      return;
    }
    onContinue();
  };

  const handleExpressCheckout = (service: string) => {
    handlePrefillDemo();
    toast.success(`${service} Verified`, {
      description: 'Contact and destination tokens synchronized. Proceeding to Ritual Review...'
    });
    setTimeout(() => {
      onContinue();
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-stone-200/90 text-stone-900">
      {/* Express Checkout Accelerated Bar */}
      <div className="mb-8 p-5 bg-canvas-surface border border-stone-200/80 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            Express 1-Click Checkout
          </span>
          <span className="text-[11px] text-stone-400">Encrypted instant authorization</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleExpressCheckout('Apple Pay')}
            className="h-11 bg-black hover:bg-stone-900 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.99]"
          >
            <span>Pay</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleExpressCheckout('Google Pay')}
            className="h-11 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.99]"
          >
            <span className="font-bold">G</span> Pay
          </button>

          <button
            type="button"
            onClick={() => handleExpressCheckout('Shop Pay')}
            className="h-11 bg-[#5a31f4] hover:bg-[#4b27d4] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1 transition-all shadow-xs active:scale-[0.99]"
          >
            <span className="font-bold tracking-tight">shop</span>
            <span className="font-light">pay</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-canvas-surface px-3 text-stone-400 font-semibold tracking-wider text-[10px]">
              Or continue with Lumina sanctuary delivery
            </span>
          </div>
        </div>
      </div>

      {/* Member Loyalty Recognition Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-stone-100">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight">Shipping Destination</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Where should our botanical artisans dispatch your customized formulations?
          </p>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>
              Signed in as <strong className="text-emerald-950">{user.firstName}</strong> ({user.loyaltyTier})
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50/70 hover:bg-emerald-100/70 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Sign in to earn {pointsEarned} loyalty points
          </button>
        )}
      </div>

      {/* Demo Autofill Helper Bar */}
      <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200/80 mb-6 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Need rapid checkout testing?</span>
        </div>
        <button
          type="button"
          onClick={handlePrefillDemo}
          className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-lg transition-colors shadow-xs"
        >
          Prefill Demo Address
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">01. Contact Details</h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 tracking-wide">
              Email Address for Order Tracking <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="clara.vance@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 tracking-wide">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Clara"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 tracking-wide">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Vance"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-stone-700 tracking-wide">Mobile Phone (Optional)</label>
              <span className="text-[11px] text-stone-400">For courier delivery text updates</span>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(415) 890-3321"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.smsUpdates}
              onChange={(e) => handleInputChange('smsUpdates', e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
            />
            <span className="text-xs text-stone-600">
              Receive SMS status alerts when your fresh batch is formulated and out for delivery
            </span>
          </label>
        </div>

        {/* Physical Address */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">02. Destination Address</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 tracking-wide">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              placeholder="450 Sutter Street, Suite 1200"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 tracking-wide">Apartment, Suite, Unit (Optional)</label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              placeholder="Apt 4B"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-stone-700 tracking-wide">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="San Francisco"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 tracking-wide">
                State / Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="CA"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 tracking-wide">
                ZIP / Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="94108"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 tracking-wide">Country</label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
            >
              <option value="US">United States (Domestic Concierge)</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="AU">Australia</option>
            </select>
          </div>
        </div>

        {/* Courier Speed & Shipping Method Selector */}
        <div className="space-y-3.5 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">03. Courier & Dispatch Speed</h3>
            <span className="text-[11px] text-emerald-800 font-medium">Guaranteed Fresh Delivery</span>
          </div>

          <div className="space-y-2.5">
            {shippingOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = formData.shippingMethod === opt.id;
              return (
                <label
                  key={opt.id}
                  onClick={() => handleInputChange('shippingMethod', opt.id)}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-800 bg-emerald-50/50 ring-1 ring-emerald-800/80 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => handleInputChange('shippingMethod', opt.id)}
                    className="mt-1 text-emerald-800 focus:ring-emerald-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900">{opt.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/90 text-emerald-800">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-stone-900">{opt.priceLabel}</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{opt.duration}</p>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Sustainable Gift Packaging & Personal Note */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.giftPackaging}
              onChange={(e) => handleInputChange('giftPackaging', e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-amber-400 text-amber-800 focus:ring-amber-700 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  Luxury Rigid Gift Box & Handwritten Calligraphy Card
                </span>
                <span className="text-xs font-bold text-amber-900">+$5.00</span>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                Hand-wrapped in organic linen with real dried botanical sprigs and custom gold wax seal.
              </p>
            </div>
          </label>

          {formData.giftPackaging && (
            <div className="pt-3 border-t border-amber-200/80 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Recipient Name (e.g. Sophia)"
                  value={formData.giftRecipient}
                  onChange={(e) => handleInputChange('giftRecipient', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
                <input
                  type="text"
                  placeholder="Handwritten Message on Card"
                  value={formData.giftNote}
                  onChange={(e) => handleInputChange('giftNote', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Concierge Delivery Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 tracking-wide">
            Concierge Doorstep Instructions (Optional)
          </label>
          <input
            type="text"
            value={formData.deliveryNotes}
            onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
            placeholder="e.g. Leave under shaded porch, or gate code #1234"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
          />
        </div>

        {/* Toggles: Same as billing & Save address */}
        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sameAsShipping}
              onChange={(e) => handleInputChange('sameAsShipping', e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
            />
            <span className="text-xs text-stone-700 font-medium">Billing address is identical to shipping destination</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.saveAddress}
              onChange={(e) => handleInputChange('saveAddress', e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
            />
            <span className="text-xs text-stone-700">Save address to my Lumina profile for effortless future replenishment</span>
          </label>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 px-6 bg-brand-primary hover:bg-forest-elevated text-white font-medium rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base group"
          >
            <span>Continue to Ritual Review</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
