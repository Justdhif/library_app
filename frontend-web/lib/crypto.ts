import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.COOKIE_SECRET || 'default-secret-key-change-in-production-min-32-chars'
);

/**
 * Encrypt token to store in cookies
 */
export async function encryptToken(token: string): Promise<string> {
  try {
    const jwt = await new SignJWT({ token })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('3d') // 3 days
      .sign(SECRET_KEY);
    
    return jwt;
  } catch (error) {
    console.error('Error encrypting token:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt token from cookies
 */
export async function decryptToken(encryptedToken: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(encryptedToken, SECRET_KEY);
    return payload.token as string;
  } catch (error) {
    console.error('Error decrypting token:', error);
    return null;
  }
}
