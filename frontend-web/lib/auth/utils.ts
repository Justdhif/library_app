import type { User } from '@/lib/types/api';

/**
 * Get dashboard path for all roles (unified dashboard)
 * All users go to /dashboard regardless of role
 */
export function getDashboardPath(user: User | null): string {
  return '/dashboard';
}

/**
 * Check if user has specific role
 */
export function hasRole(
  user: User | null,
  role: 'super-admin' | 'admin' | 'librarian' | 'member'
): boolean {
  return user?.profile?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  user: User | null,
  roles: Array<'super-admin' | 'admin' | 'librarian' | 'member'>
): boolean {
  return user?.profile ? roles.includes(user.profile.role) : false;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, 'super-admin');
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is librarian
 */
export function isLibrarian(user: User | null): boolean {
  return hasRole(user, 'librarian');
}

/**
 * Check if user is member
 */
export function isMember(user: User | null): boolean {
  return hasRole(user, 'member');
}

/**
 * Check if user can access admin features
 * (super-admin or admin)
 */
export function canAccessAdmin(user: User | null): boolean {
  return hasAnyRole(user, ['super-admin', 'admin']);
}

/**
 * Check if user can access librarian features
 * (super-admin, admin, or librarian)
 */
export function canAccessLibrarian(user: User | null): boolean {
  return hasAnyRole(user, ['super-admin', 'admin', 'librarian']);
}
