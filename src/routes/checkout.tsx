import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { trpc } from '@/src/lib/trpc';
import { useAuthStore } from '@/src/lib/authStore';
import { toast } from 'sonner';

import { CheckoutSteps } from '@/src/components/checkout/CheckoutSteps';
import { ShippingStep, ShippingFormData } from '@/src/components/checkout/ShippingStep';
import { ReviewStep } from '@/src/components/checkout/ReviewStep';
import { PaymentStep } from '@/src/components/checkout/PaymentStep';
import { OrderSummary } from '@/src/components/checkout/OrderSummary';

const defaultShippingForm: ShippingFormData = {
  email: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  phone: '',
  smsUpdates: true,
  sameAsShipping: true,
  saveAddress: true,
  deliveryNotes: '',
  shippingMethod: 'eco',
  giftPackaging: false,
  giftNote: '',
  giftRecipient: '',
};

export default function CheckoutPage() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { user, isAuthenticated, addLoyaltyPoints } = useAuthStore();

  const { data: cart, isLoading } = trpc.cart.get.useQuery();
  const summaryMutation = trpc.checkout.summary.useMutation();
  const createOrderMutation = trpc.checkout.createOrder.useMutation();

  const [formData, setFormData] = useState<ShippingFormData>(() => {
    if (user) {
      return {
        ...defaultShippingForm,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
    return defaultShippingForm;
  });

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [selectedSamples, setSelectedSamples] = useState<string[]>(['sample_tansy', 'sample_ceramide']);
  const [gwp, setGwp] = useState<{ name: string } | null>(null);

  // Financial summary state
  const [financials, setFinancials] = useState({
    subtotal: 0,
    discount: 0,
    pointsDiscount: 0,
    shipping: 0,
    packagingFee: 0,
    tax: 0,
    total: 0,
  });

  const items = cart?.items || [];

  // Update summary dynamically whenever items, shipping method, gift packaging, discounts, or points change
  useEffect(() => {
    if (items.length > 0) {
      summaryMutation.mutate({
        discountCode: appliedDiscount?.code,
        shippingMethod: formData.shippingMethod,
        giftPackaging: formData.giftPackaging,
        pointsRedeemed,
      }, {
        onSuccess: (data) => {
          setFinancials({
            subtotal: data.subtotal,
            discount: data.discount,
            pointsDiscount: data.pointsDiscount,
            shipping: data.shipping,
            packagingFee: data.packagingFee,
            tax: data.tax,
            total: data.total,
          });
          if (data.gwp) setGwp({ name: data.gwp.name });
          else setGwp(null);
        }
      });
    }
  }, [items, appliedDiscount, formData.shippingMethod, formData.giftPackaging, pointsRedeemed]);

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;

    summaryMutation.mutate({
      discountCode: discountCode.trim(),
      shippingMethod: formData.shippingMethod,
      giftPackaging: formData.giftPackaging,
      pointsRedeemed,
    }, {
      onSuccess: (data) => {
        setAppliedDiscount({ code: discountCode.trim().toUpperCase(), amount: data.discount });
        setFinancials({
          subtotal: data.subtotal,
          discount: data.discount,
          pointsDiscount: data.pointsDiscount,
          shipping: data.shipping,
          packagingFee: data.packagingFee,
          tax: data.tax,
          total: data.total,
        });
        toast.success(`Discount Applied`, {
          description: `Saved $${data.discount.toFixed(2)} on your ritual formulation.`
        });
        setDiscountCode('');
      },
      onError: (err: any) => {
        toast.error('Invalid Discount Code', {
          description: err.message || 'Try LUMINA10, GLOW20, or WELCOME50.'
        });
      }
    });
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    toast.info('Discount removed');
  };

  const handleStep1Complete = () => {
    setCompletedSteps(prev => [...new Set([...prev, 1])]);
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Complete = () => {
    setCompletedSteps(prev => [...new Set([...prev, 2])]);
    setActiveStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = (paymentDetails: any) => {
    const pointsEarned = Math.floor(financials.total);

    createOrderMutation.mutate({
      shippingAddress: formData,
      billingAddress: formData.sameAsShipping ? formData : {},
      shippingMethod: formData.shippingMethod,
      giftPackaging: formData.giftPackaging,
      giftNote: formData.giftNote,
      selectedSamples,
      paymentDetails,
      financials,
      items,
      pointsEarned,
      pointsRedeemed,
      timestamp: new Date().toISOString(),
    }, {
      onSuccess: (data) => {
        // Add loyalty points if customer
        if (isAuthenticated) {
          addLoyaltyPoints(pointsEarned);
        }
        toast.success('Ritual Order Authorized & Confirmed!');
        setTimeout(() => {
          window.location.href = `/order-confirmed?orderId=${data.orderId}`;
        }, 300);
      },
      onError: () => {
        toast.error('Authorization Failed', {
          description: 'Please double-check your payment information and try again.'
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-serif text-stone-600 tracking-wider">Preparing Lumina Sanctuary Checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !createOrderMutation.isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf7f2] p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-serif text-stone-900">Your Ritual Bag is Empty</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Select your customized cleansers, botanical barrier serums, or refill pods to begin your checkout ritual.
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3.5 bg-[#15281e] hover:bg-[#1e392b] text-white text-xs font-medium rounded-xl transition-colors shadow-sm"
            >
              Explore Formulations & Rituals
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Header bar on checkout */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <a 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Sanctuary Store</span>
        </a>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-900 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/70">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>256-Bit Encrypted Concierge</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Modern Interactive Step Bar */}
        <CheckoutSteps
          activeStep={activeStep}
          completedSteps={completedSteps}
          onStepClick={(step) => {
            setActiveStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Step Body */}
          <div className="lg:col-span-7 xl:col-span-8">
            <AnimatePresence mode="wait">
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShippingStep
                    formData={formData}
                    setFormData={setFormData}
                    onContinue={handleStep1Complete}
                    pointsEarned={Math.floor(financials.total)}
                  />
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReviewStep
                    items={items}
                    formData={formData}
                    gwp={gwp}
                    onBack={() => setActiveStep(1)}
                    onContinue={handleStep2Complete}
                    selectedSamples={selectedSamples}
                    setSelectedSamples={setSelectedSamples}
                  />
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PaymentStep
                    total={financials.total}
                    subtotal={financials.subtotal}
                    onBack={() => setActiveStep(2)}
                    onPlaceOrder={handlePlaceOrder}
                    isProcessing={createOrderMutation.isPending}
                    pointsRedeemed={pointsRedeemed}
                    setPointsRedeemed={setPointsRedeemed}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <OrderSummary
              items={items}
              subtotal={financials.subtotal}
              discount={financials.discount}
              pointsDiscount={financials.pointsDiscount}
              shipping={financials.shipping}
              packagingFee={financials.packagingFee}
              tax={financials.tax}
              total={financials.total}
              gwp={gwp}
              formData={formData}
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              appliedDiscount={appliedDiscount}
              onApplyDiscount={handleApplyDiscount}
              onRemoveDiscount={handleRemoveDiscount}
              pointsEarned={Math.floor(financials.total)}
              pointsRedeemed={pointsRedeemed}
              isApplyingDiscount={summaryMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
