import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  KeyRound, 
  Building2,
  Leaf
} from 'lucide-react';
import { useAuthStore, UserRole } from '@/src/lib/authStore';
import { trpc } from '@/src/lib/trpc';
import { toast } from 'sonner';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalInitialTab, 
    signInAsCustomer, 
    signInAsAdmin, 
    signUp, 
    isLoading 
  } = useAuthStore();

  const mergeCartMutation = trpc.cart.mergeGuestCart.useMutation();

  const [activePortal, setActivePortal] = useState<'customer' | 'admin'>(
    authModalInitialTab === 'admin' ? 'admin' : 'customer'
  );
  const [customerTab, setCustomerTab] = useState<'signin' | 'signup' | 'magic-link'>(
    authModalInitialTab === 'signup' ? 'signup' : authModalInitialTab === 'magic-link' ? 'magic-link' : 'signin'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [skinType, setSkinType] = useState('Sensitive');
  const [adminRole, setAdminRole] = useState<UserRole>('admin');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleMergeGuestCart = () => {
    const guestCartId = localStorage.getItem('guestCartId');
    if (guestCartId) {
      mergeCartMutation.mutate(
        { anonymousCartId: guestCartId, userCartId: 'user_cart_123' },
        {
          onSuccess: () => {
            localStorage.removeItem('guestCartId');
          }
        }
      );
    }
  };

  const handleCustomerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    try {
      await signInAsCustomer(email, password);
      handleMergeGuestCart();
      toast.success('Welcome back to Lumina Skin Rituals', {
        description: 'Your saved rituals and cart have been synchronized.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  const handleQuickDemoCustomer = async () => {
    const demo = {
      email: 'clara.vance@example.com',
      password: 'LuminaRitual1!',
    };
    try {
      try {
        await signInAsCustomer(demo.email, demo.password);
      } catch {
        await signUp(demo.email, demo.password, 'Clara', 'Vance', 'sensitive');
      }
      handleMergeGuestCart();
      toast.success('Signed in as Clara Vance', {
        description: 'Demo account via Better Auth email/password.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Demo sign-in failed');
    }
  };

  const handleCustomerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await signUp(email, password, firstName, lastName, skinType);
      handleMergeGuestCart();
      toast.success('Welcome to Lumina!', {
        description: '50 welcome loyalty points have been added to your profile.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setMagicLinkSent(true);
    toast.success('Magic link is not enabled yet', {
      description: 'Use email and password for now. Passwordless ships with the email provider.',
    });
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Staff email and password required');
      return;
    }
    try {
      await signInAsAdmin(email, password);
      toast.success('Staff session verified', {
        description: `Signed in as ${useAuthStore.getState().user?.role ?? adminRole}.`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Staff sign-in failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-forest-bg/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg bg-canvas-surface text-stone-900 rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden z-10"
      >
        {/* Top Header Banner */}
        <div className="bg-brand-primary text-emerald-50 px-6 pt-6 pb-5 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-emerald-200/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
              <Leaf className="w-3 h-3 text-emerald-400" />
              Lumina Account
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
            {activePortal === 'admin' ? 'Staff Operations Console' : 'Your Personal Skin Sanctuary'}
          </h2>
          <p className="text-sm text-emerald-200/90 mt-1 max-w-sm">
            {activePortal === 'admin'
              ? 'Secured role-based access for catalog, inventory, and order fulfillment.'
              : 'Save your customized rituals, track active orders, and redeem reward points.'}
          </p>

          {/* Portal Switcher (Customer vs Admin) */}
          <div className="flex p-1 bg-forest-bg rounded-xl mt-4 border border-emerald-950/60">
            <button
              type="button"
              onClick={() => setActivePortal('customer')}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                activePortal === 'customer'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-300/70 hover:text-emerald-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Customer Sanctuary
            </button>
            <button
              type="button"
              onClick={() => setActivePortal('admin')}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                activePortal === 'admin'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-300/70 hover:text-emerald-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Staff & Admin Portal
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activePortal === 'customer' ? (
              <motion.div
                key="customer-portal"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18 }}
              >
                {/* Customer Tabs */}
                <div className="flex border-b border-stone-200 mb-6 gap-6 text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => { setCustomerTab('signin'); setMagicLinkSent(false); }}
                    className={`pb-3 transition-colors relative ${
                      customerTab === 'signin'
                        ? 'text-stone-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Sign In
                    {customerTab === 'signin' && (
                      <motion.div layoutId="auth-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCustomerTab('signup'); setMagicLinkSent(false); }}
                    className={`pb-3 transition-colors relative ${
                      customerTab === 'signup'
                        ? 'text-stone-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Create Account
                    {customerTab === 'signup' && (
                      <motion.div layoutId="auth-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCustomerTab('magic-link'); setMagicLinkSent(false); }}
                    className={`pb-3 transition-colors relative ${
                      customerTab === 'magic-link'
                        ? 'text-stone-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Passwordless Link
                    {customerTab === 'magic-link' && (
                      <motion.div layoutId="auth-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
                    )}
                  </button>
                </div>

                {/* SIGN IN TAB */}
                {customerTab === 'signin' && (
                  <form onSubmit={handleCustomerSignIn} className="space-y-4">
                    {/* Quick Demo Customer Pill */}
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                          CV
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-950">Quick One-Click Demo</p>
                          <p className="text-xs text-emerald-700">Clara Vance (180 Loyalty Points)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleQuickDemoCustomer}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl transition-colors shrink-0 shadow-sm"
                      >
                        Sign in as Clara
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="clara.vance@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Password</label>
                        <button
                          type="button"
                          onClick={() => setCustomerTab('magic-link')}
                          className="text-xs text-emerald-800 hover:underline font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600" />
                        <span className="text-xs text-stone-600">Keep me signed in</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-brand-primary hover:bg-forest-elevated text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading ? 'Authenticating...' : 'Sign In to My Sanctuary'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* CREATE ACCOUNT TAB */}
                {customerTab === 'signup' && (
                  <form onSubmit={handleCustomerSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Eleanor"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Vance"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                        required
                        minLength={8}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Primary Skin Type</label>
                      <select
                        value={skinType}
                        onChange={(e) => setSkinType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      >
                        <option value="Sensitive">Sensitive & Reactive</option>
                        <option value="Dry">Dry & Dehydrated</option>
                        <option value="Combination">Combination & Oily</option>
                        <option value="Normal">Normal & Balanced</option>
                      </select>
                    </div>

                    {/* Member Perks Box */}
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1.5 text-xs text-emerald-950">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Complimentary Member Privileges:
                      </div>
                      <p className="text-stone-600">• 50 Welcome Loyalty Points credited instantly</p>
                      <p className="text-stone-600">• Personalized morning & evening ritual trackers</p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-brand-primary hover:bg-forest-elevated text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account & Claim 50 Points'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* MAGIC LINK TAB */}
                {customerTab === 'magic-link' && (
                  <div className="space-y-4">
                    {magicLinkSent ? (
                      <div className="text-center py-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif text-xl font-medium text-stone-900">Check Your Email</h3>
                        <p className="text-sm text-stone-600 max-w-xs mx-auto">
                          We sent an instant login link to <span className="font-medium text-stone-900">{email}</span>. Click the link to access your rituals without a password.
                        </p>
                        <button
                          type="button"
                          onClick={() => setMagicLinkSent(false)}
                          className="text-xs text-emerald-800 hover:underline font-medium pt-2"
                        >
                          Use another email address
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                        <p className="text-xs text-stone-600 leading-relaxed">
                          No passwords to remember. Enter your email and we'll send an encrypted token to log you in securely.
                        </p>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Email Address</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 px-4 bg-brand-primary hover:bg-forest-elevated text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          Send Magic Link
                          <Mail className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              /* ADMIN & STAFF PORTAL */
              <motion.div
                key="admin-portal"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-5"
              >
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 space-y-1">
                    <p className="font-bold">Lumina Enterprise RBAC Security</p>
                    <p className="text-amber-800">
                      All administrative actions (inventory overrides, refunds, and promo code creations) are signed and recorded to the immutable audit log.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAdminSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Select Staff Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { role: 'admin' as UserRole, label: 'Store Admin', desc: 'Full System Control' },
                        { role: 'manager' as UserRole, label: 'Inventory Mgr', desc: 'Stock & Fulfill' },
                        { role: 'support' as UserRole, label: 'Support Rep', desc: 'Customer CRM' },
                      ].map((item) => (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setAdminRole(item.role)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            adminRole === item.role
                              ? 'border-emerald-800 bg-emerald-50/80 ring-1 ring-emerald-800'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="text-xs font-bold text-stone-900">{item.label}</div>
                          <div className="text-[10px] text-stone-500">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Staff Email</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hodge@agentmail.to"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">Password</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Staff password"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    {isLoading ? 'Verifying Credentials...' : `Enter Console as ${adminRole.toUpperCase()}`}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
