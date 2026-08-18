import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'customer' | 'support' | 'manager' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  loyaltyPoints: number;
  loyaltyTier: string;
  primarySkinType?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalInitialTab: 'signin' | 'signup' | 'magic-link' | 'admin';
  isAdminDashboardOpen: boolean;
  
  // Actions
  openAuthModal: (tab?: 'signin' | 'signup' | 'magic-link' | 'admin') => void;
  closeAuthModal: () => void;
  openAdminDashboard: () => void;
  closeAdminDashboard: () => void;
  signInAsCustomer: (email: string, name?: string) => Promise<void>;
  signInAsAdmin: (role?: UserRole) => Promise<void>;
  signUp: (email: string, firstName: string, lastName: string, skinType?: string) => Promise<void>;
  signOut: () => void;
  updateSkinProfile: (skinType: string) => void;
  addLoyaltyPoints: (points: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAuthModalOpen: false,
      authModalInitialTab: 'signin',
      isAdminDashboardOpen: false,

      openAuthModal: (tab = 'signin') => set({ isAuthModalOpen: true, authModalInitialTab: tab }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      openAdminDashboard: () => set({ isAdminDashboardOpen: true }),
      closeAdminDashboard: () => set({ isAdminDashboardOpen: false }),

      signInAsCustomer: async (email: string, name = 'Clara Vance') => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));
        const [firstName, lastName] = name.split(' ');
        set({
          user: {
            id: 'usr_cust_8821',
            email,
            firstName: firstName || 'Clara',
            lastName: lastName || 'Vance',
            role: 'customer',
            loyaltyPoints: 180,
            loyaltyTier: 'Silver Member',
            primarySkinType: 'Sensitive & Combination',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
          isAuthenticated: true,
          isLoading: false,
          isAuthModalOpen: false,
        });
      },

      signInAsAdmin: async (role: UserRole = 'admin') => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));
        set({
          user: {
            id: 'usr_adm_001',
            email: 'eleanor.ross@luminaskin.com',
            firstName: 'Eleanor',
            lastName: 'Ross',
            role,
            loyaltyPoints: 500,
            loyaltyTier: 'Brand Specialist',
            avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
          },
          isAuthenticated: true,
          isLoading: false,
          isAuthModalOpen: false,
        });
      },

      signUp: async (email: string, firstName: string, lastName: string, skinType = 'Sensitive') => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 700));
        set({
          user: {
            id: `usr_${Math.random().toString(36).substring(2, 9)}`,
            email,
            firstName,
            lastName,
            role: 'customer',
            loyaltyPoints: 50, // Welcome bonus
            loyaltyTier: 'Bronze Member',
            primarySkinType: skinType,
          },
          isAuthenticated: true,
          isLoading: false,
          isAuthModalOpen: false,
        });
      },

      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdminDashboardOpen: false,
        });
      },

      updateSkinProfile: (skinType: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              primarySkinType: skinType,
            },
          });
        }
      },

      addLoyaltyPoints: (points: number) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              loyaltyPoints: currentUser.loyaltyPoints + points,
            },
          });
        }
      },
    }),
    {
      name: 'lumina_auth_session',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
