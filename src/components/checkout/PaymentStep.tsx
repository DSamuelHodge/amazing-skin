import React, { useState } from 'react';
import { 
  Lock, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Building, 
  Info, 
  Eye, 
  EyeOff,
  Coins,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/src/lib/authStore';
import { toast } from 'sonner';

interface PaymentStepProps {
  total: number;
  subtotal: number;
  onBack: () => void;
  onPlaceOrder: (paymentDetails: any) => void;
  isProcessing: boolean;
  pointsRedeemed: number;
  setPointsRedeemed: React.Dispatch<React.SetStateAction<number>>;
}

export function PaymentStep({
  total,
  subtotal,
  onBack,
  onPlaceOrder,
  isProcessing,
  pointsRedeemed,
  setPointsRedeemed
}: PaymentStepProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'express' | 'installments'>('card');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Detect card brand
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return { brand: 'VISA', color: 'from-[#1a365d] to-[#0f172a]' };
    if (clean.startsWith('5') || clean.startsWith('2')) return { brand: 'MASTERCARD', color: 'from-[#7c2d12] to-[#1c1917]' };
    if (clean.startsWith('3')) return { brand: 'AMEX', color: 'from-[#065f46] to-[#064e3b]' };
    return { brand: 'LUMINA SECURE', color: 'from-[#12221a] to-[#0a120e]' };
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiry(val);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    setCvc(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 15 || !expiry || cvc.length < 3 || !cardName) {
        toast.error('Please enter valid credit card payment details');
        return;
      }
    }
    onPlaceOrder({
      method: paymentMethod,
      cardLast4: cardNumber ? cardNumber.slice(-4) : '4242',
      pointsRedeemed,
    });
  };

  const handleAutofillDemoCard = () => {
    setCardNumber('4532 8892 4102 7741');
    setCardName(user ? `${user.firstName} ${user.lastName}` : 'Clara Vance');
    setExpiry('08/29');
    setCvc('882');
    toast.success('Test Card Credentials Loaded', {
      description: 'Stripe 3DS Test Card applied safely.'
    });
  };

  const installmentAmount = (total / 4).toFixed(2);
  const cardBrandInfo = getCardBrand(cardNumber);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-stone-200/90 text-stone-900 space-y-8">
      {/* Header */}
      <div className="pb-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Step 03 of 03</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight mt-0.5">
            Encrypted Payment
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Bank-grade 256-bit encryption. Your payment credentials are never stored in plain text.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>PCI-DSS Level 1 Compliant</span>
        </div>
      </div>

      {/* Member Points Redemption Bar (if authenticated & has points) */}
      {isAuthenticated && user && user.loyaltyPoints > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-950 text-emerald-50 border border-emerald-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Redeem Lumina Member Points
              </span>
            </div>
            <span className="text-xs font-medium text-emerald-300">
              Available: <strong>{user.loyaltyPoints} pts</strong> (${(user.loyaltyPoints / 10).toFixed(2)} value)
            </span>
          </div>

          <p className="text-xs text-emerald-200/90 leading-relaxed">
            Apply your earned loyalty points directly toward this order balance. Every 10 points equals $1.00 USD.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[
              { label: 'Do not use points', points: 0 },
              { label: 'Use 50 pts (-$5.00)', points: 50 },
              { label: 'Use 100 pts (-$10.00)', points: 100 },
              { label: `Use all ${user.loyaltyPoints} pts (-$${(user.loyaltyPoints / 10).toFixed(2)})`, points: user.loyaltyPoints },
            ].map((opt) => (
              <button
                key={opt.points}
                type="button"
                onClick={() => {
                  setPointsRedeemed(opt.points);
                  if (opt.points > 0) {
                    toast.success(`Applied ${opt.points} loyalty points discount (-$${(opt.points / 10).toFixed(2)})`);
                  } else {
                    toast.info('Removed loyalty points discount');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  pointsRedeemed === opt.points
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'bg-emerald-900/70 text-emerald-200 hover:bg-emerald-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
            paymentMethod === 'card'
              ? 'border-emerald-800 bg-emerald-50/60 ring-1 ring-emerald-800 shadow-xs'
              : 'border-stone-200 bg-white hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <CreditCard className="w-5 h-5 text-emerald-800" />
            {paymentMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">Credit / Debit Card</p>
            <p className="text-[11px] text-stone-500">Visa, Mastercard, Amex, Discover</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('express')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
            paymentMethod === 'express'
              ? 'border-emerald-800 bg-emerald-50/60 ring-1 ring-emerald-800 shadow-xs'
              : 'border-stone-200 bg-white hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Zap className="w-5 h-5 text-amber-600" />
            {paymentMethod === 'express' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">Digital Wallet</p>
            <p className="text-[11px] text-stone-500">Pay, GPay, or Shop Pay</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('installments')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
            paymentMethod === 'installments'
              ? 'border-emerald-800 bg-emerald-50/60 ring-1 ring-emerald-800 shadow-xs'
              : 'border-stone-200 bg-white hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Sparkles className="w-5 h-5 text-purple-600" />
            {paymentMethod === 'installments' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">Pay in 4 Installments</p>
            <p className="text-[11px] text-stone-500">4 &times; ${installmentAmount} with 0% APR</p>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* METHOD 1: CREDIT CARD */}
        {paymentMethod === 'card' && (
          <div className="space-y-6">
            {/* Interactive Luxury Card Canvas Preview */}
            <div className="relative w-full max-w-md mx-auto aspect-[1.586] rounded-3xl p-6 sm:p-7 text-white shadow-xl overflow-hidden bg-gradient-to-tr from-forest-surface via-forest-elevated to-forest-bg border border-emerald-700/40">
              {/* Subtle botanical glow background */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <span className="font-serif text-sm tracking-wider text-emerald-200 uppercase">
                      Lumina Ritual Card
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold tracking-widest text-emerald-300 uppercase">
                    {cardBrandInfo.brand}
                  </span>
                </div>

                <div className="my-auto">
                  <div className="font-mono text-lg sm:text-xl tracking-widest text-emerald-50 drop-shadow-sm">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-800/60">
                  <div>
                    <span className="text-[10px] text-emerald-400/80 block uppercase tracking-wider">Cardholder</span>
                    <span className="font-medium text-emerald-100 uppercase tracking-wide">
                      {cardName || 'YOUR NAME'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400/80 block uppercase tracking-wider">Expires</span>
                    <span className="font-mono font-medium text-emerald-100">
                      {expiry || 'MM/YY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAutofillDemoCard}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-medium underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Fill Safe Test Card (4532...)
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 tracking-wide">
                  Card Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4532 •••• •••• ••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 tracking-wide">
                  Cardholder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Clara Vance"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 tracking-wide">
                    Expiration (MM/YY) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="08/28"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-stone-700 tracking-wide">
                      CVC / CVV <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400">3 or 4 digits</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cvc}
                      onChange={handleCvcChange}
                      placeholder="882"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                />
                <span className="text-xs text-stone-600">
                  Save card securely for effortless 1-click ritual refills
                </span>
              </label>
            </div>
          </div>
        )}

        {/* METHOD 2: DIGITAL WALLET */}
        {paymentMethod === 'express' && (
          <div className="p-6 rounded-2xl bg-canvas-surface border border-stone-200/80 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-md">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              One-Touch Biometric Authorization
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              Click the button below to authorize payment of <strong className="text-stone-900">${total.toFixed(2)}</strong> via Apple Pay, Google Pay, or Shop Pay with FaceID.
            </p>

            <div className="pt-2 max-w-xs mx-auto space-y-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full h-12 bg-black hover:bg-stone-900 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
              >
                <span> Pay with Passkey</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full h-12 bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
              >
                <span className="font-bold">G</span> Pay with Biometrics
              </button>
            </div>
          </div>
        )}

        {/* METHOD 3: INSTALLMENTS */}
        {paymentMethod === 'installments' && (
          <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Klarna / Afterpay 0% APR Plan
              </span>
              <span className="text-xs font-bold text-purple-700 font-mono">No Hidden Fees</span>
            </div>

            <p className="text-xs text-purple-950 leading-relaxed">
              Split your purchase of <strong>${total.toFixed(2)}</strong> into 4 interest-free fortnightly installments:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                { step: 'Due Today', amount: `$${installmentAmount}`, date: 'Now' },
                { step: 'Payment 2', amount: `$${installmentAmount}`, date: 'In 2 Weeks' },
                { step: 'Payment 3', amount: `$${installmentAmount}`, date: 'In 4 Weeks' },
                { step: 'Payment 4', amount: `$${installmentAmount}`, date: 'In 6 Weeks' },
              ].map((inst, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-purple-200 text-center shadow-xs">
                  <span className="text-[10px] text-stone-500 uppercase block font-semibold">{inst.step}</span>
                  <span className="text-sm font-bold text-purple-950 font-serif block my-0.5">{inst.amount}</span>
                  <span className="text-[10px] text-purple-700 font-medium">{inst.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security & Guarantees Trust Badges */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Dermatologist Formulated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>30-Day Ritual Guarantee</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Review</span>
          </button>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full sm:w-auto px-10 py-4 bg-brand-primary hover:bg-forest-elevated text-white font-medium rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4 text-emerald-300" />
            <span>
              {isProcessing ? 'Processing Ritual Authorization...' : `Authorize & Pay $${total.toFixed(2)}`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
