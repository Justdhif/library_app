'use server';

import { cookies } from 'next/headers';
import { encryptToken, decryptToken } from '@/lib/crypto';
import { COOKIE_OPTIONS } from './constants';

/**
 * Set an encrypted cookie (server-side only)
 * @param name - Cookie name
 * @param value - Cookie value to encrypt
 * @param shouldEncrypt - Whether to encrypt the value (default: true)
 */
export async function setCookie(
  name: string,
  value: string,
  shouldEncrypt: boolean = true
): Promise<void> {
  const cookieStore = await cookies();
  const finalValue = shouldEncrypt ? await encryptToken(value) : value;
  
  cookieStore.set(name, finalValue, COOKIE_OPTIONS);
}

/**
 * Get and decrypt a cookie value (server-side only)
 * @param name - Cookie name
 * @param shouldDecrypt - Whether to decrypt the value (default: true)
 * @returns Decrypted cookie value or null if not found
 */
export async function getCookie(
  name: string,
  shouldDecrypt: boolean = true
): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  
  if (!cookie?.value) {
    return null;
  }
  
  if (!shouldDecrypt) {
    return cookie.value;
  }
  
  try {
    return await decryptToken(cookie.value);
  } catch (error) {
    console.error(`Error decrypting cookie ${name}:`, error);
    return null;
  }
}

/**
 * Delete a cookie (server-side only)
 * @param name - Cookie name
 */
export async function deleteCookie(name: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

/**
 * Check if a cookie exists (server-side only)
 * @param name - Cookie name
 * @returns True if cookie exists
 */
export async function hasCookie(name: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(name);
}

/**
 * Clear all authentication cookies
 */
export async function clearAuthCookies(): Promise<void> {
  const { COOKIE_NAMES } = await import('./constants');
  await deleteCookie(COOKIE_NAMES.AUTH_TOKEN);
  await deleteCookie(COOKIE_NAMES.USER_DATA);
  await deleteCookie(COOKIE_NAMES.USER_ROLE);
}
