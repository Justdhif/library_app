/**
 * Cookie names used in the application
 */
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'AuthToken',
  USER_DATA: 'UserData',
  USER_ROLE: 'UserRole',
} as const;

/**
 * Cookie options
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
