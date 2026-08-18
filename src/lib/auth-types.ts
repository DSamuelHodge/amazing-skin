export type UserRole = 'customer' | 'support' | 'manager' | 'admin' | 'super_admin';

export const STAFF_ROLES: UserRole[] = ['support', 'manager', 'admin', 'super_admin'];

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
