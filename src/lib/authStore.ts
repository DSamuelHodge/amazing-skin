import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authClient } from '@/lib/auth-client';
import type { UserProfile, UserRole } from '@/src/lib/auth-types';

export type { UserProfile, UserRole };

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalInitialTab: 'signin' | 'signup' | 'magic-link' | 'admin';
  isAdminDashboardOpen: boolean;

  openAuthModal: (tab?: 'signin' | 'signup' | 'magic-link' | 'admin') => void;
  closeAuthModal: () => void;
  openAdminDashboard: () => void;
  closeAdminDashboard: () => void;
  hydrateSession: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInAsCustomer: (email: string, password: string, name?: string) => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, skinType?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateSkinProfile: (skinType: string) => void;
  addLoyaltyPoints: (points: number) => void;
}

function profileFromSession(sessionUser: {
  id: string;
  email?: string;
  name: string;
  image?: string | null;
}): UserProfile {
  const [firstName, ...rest] = sessionUser.name.trim().split(/\s+/);
  const email = sessionUser.email ?? '';
  return {
    id: sessionUser.id,
    email,
    firstName: firstName || 'Lumina',
    lastName: rest.join(' ') || 'Member',
    role: email.toLowerCase() === 'hodge@agentmail.to' ? 'super_admin' : 'customer',
    loyaltyPoints: 0,
    loyaltyTier: 'Bronze',
    avatarUrl: sessionUser.image ?? undefined,
  };
}

async function applySession(
  set: (partial: Partial<AuthState>) => void,
): Promise<UserProfile | null> {
  const { data, error } = await authClient.getSession({ query: {} });
  if (error || !data?.user) {
    set({ user: null, isAuthenticated: false, isLoading: false });
    return null;
  }
  const profile = profileFromSession(data.user);
  set({ user: profile, isAuthenticated: true, isLoading: false, isAuthModalOpen: false });
  return profile;
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

      hydrateSession: async () => {
        set({ isLoading: true });
        await applySession(set);
      },

      signInWithPassword: async (email, password) => {
        set({ isLoading: true });
        const { error } = await authClient.signIn.email({ email, password });
        if (error) {
          set({ isLoading: false });
          throw new Error(error.message || 'Sign in failed');
        }
        await applySession(set);
      },

      signInAsCustomer: async (email, password) => {
        await get().signInWithPassword(email, password);
      },

      signInAsAdmin: async (email, password) => {
        await get().signInWithPassword(email, password);
        const role = get().user?.role;
        if (role === 'customer' || !role) {
          await get().signOut();
          throw new Error('This account is not staff. Use the customer sanctuary.');
        }
      },

      signUp: async (email, password, firstName, lastName, skinType = 'Sensitive') => {
        set({ isLoading: true });
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: `${firstName} ${lastName}`.trim(),
        });
        if (error) {
          set({ isLoading: false });
          throw new Error(error.message || 'Sign up failed');
        }
        const profile = await applySession(set);
        if (profile && skinType) {
          set({
            user: { ...profile, primarySkinType: skinType, loyaltyPoints: 50, loyaltyTier: 'Bronze Member' },
          });
        }
      },

      signOut: async () => {
        await authClient.signOut({});
        set({
          user: null,
          isAuthenticated: false,
          isAdminDashboardOpen: false,
        });
      },

      updateSkinProfile: (skinType: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, primarySkinType: skinType } });
        }
      },

      addLoyaltyPoints: (points: number) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, loyaltyPoints: currentUser.loyaltyPoints + points },
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
    },
  ),
);
