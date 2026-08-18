import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Sparkles, 
  ShieldCheck, 
  LogOut, 
  Package, 
  Heart, 
  ChevronDown, 
  Settings,
  Sparkle
} from 'lucide-react';
import { useAuthStore } from '@/src/lib/authStore';
import { toast } from 'sonner';

export function CustomerMenu() {
  const { user, isAuthenticated, openAuthModal, signOut, openAdminDashboard } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openAuthModal('signin')}
          className="text-xs sm:text-sm font-medium text-emerald-200 hover:text-emerald-50 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => openAuthModal('signup')}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-800/80 hover:bg-emerald-700 text-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-600/40 transition-colors shadow-xs"
        >
          <Sparkle className="w-3 h-3 text-emerald-300" />
          Join Rituals
        </button>
      </div>
    );
  }

  const isAdminOrStaff = ['admin', 'manager', 'support', 'super_admin'].includes(user.role);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-50 transition-all shadow-xs"
        aria-label="User profile menu"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-600 border border-emerald-400/50 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
          ) : (
            `${user.firstName[0]}${user.lastName[0] || ''}`
          )}
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-medium leading-tight">{user.firstName}</span>
          <span className="text-[10px] text-emerald-300 flex items-center gap-1 font-semibold">
            {isAdminOrStaff ? (
              <span className="text-amber-300 uppercase tracking-wider">{user.role}</span>
            ) : (
              <span>✦ {user.loyaltyPoints} pts</span>
            )}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#faf7f3] text-stone-900 shadow-2xl border border-stone-200/90 py-2 z-50 overflow-hidden"
          >
            {/* Header info */}
            <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/50">
              <p className="text-xs font-bold text-stone-900">{user.firstName} {user.lastName}</p>
              <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
              
              {!isAdminOrStaff && (
                <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-medium">{user.loyaltyTier}</span>
                  <span className="font-bold text-emerald-700">{user.loyaltyPoints} Points</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-1 text-xs">
              {isAdminOrStaff && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openAdminDashboard();
                  }}
                  className="w-full px-4 py-2.5 text-left font-medium text-emerald-900 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors bg-emerald-50/40"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Open Operations Console</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  toast.info('Orders & Rituals: 1 Active Order (ORD-88219)');
                }}
                className="w-full px-4 py-2 text-left text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 transition-colors"
              >
                <Package className="w-4 h-4 text-stone-400" />
                <span>My Orders & Ritual History</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  toast.info(`Skin Profile: ${user.primarySkinType || 'Sensitive'}`);
                }}
                className="w-full px-4 py-2 text-left text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-stone-400" />
                <span>Skin Quiz & Daily Checklist</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  openAuthModal('admin');
                }}
                className="w-full px-4 py-2 text-left text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 transition-colors"
              >
                <Settings className="w-4 h-4 text-stone-400" />
                <span>Switch Role / Portal</span>
              </button>
            </div>

            <div className="border-t border-stone-200/80 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                  toast.success('Signed out successfully');
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
