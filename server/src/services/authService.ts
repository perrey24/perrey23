import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createCipheriv, createDecipheriv } from 'node:crypto';
import { promisify } from 'node:util';
import { User, UserRole } from '../types';

const scrypt = promisify(scryptCallback);

interface SessionData {
  userId: string;
  csrf: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();
const loginAttempts = new Map<string, number[]>();

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString('base64url')}:${derived.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [encodedSalt, encodedHash] = String(stored).split(':');
  if (!encodedSalt || !encodedHash) return false;
  try {
    const salt = Buffer.from(encodedSalt, 'base64url');
    const expected = Buffer.from(encodedHash, 'base64url');
    const actual = (await scrypt(password, salt, 64)) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createSession(user: User): { token: string; csrf: string; expiresAt: number } {
  const token = randomBytes(32).toString('base64url');
  const csrf = randomBytes(24).toString('base64url');
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 horas
  sessions.set(token, { userId: user.id, csrf, expiresAt });
  return { token, csrf, expiresAt };
}

export function getSession(token: string): SessionData | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function destroySession(token: string): void {
  if (token) sessions.delete(token);
}

export function checkRateLimit(ip: string): boolean {
  const windowStart = Date.now() - 10 * 60 * 1000; // 10 minutos
  const attempts = (loginAttempts.get(ip) || []).filter(t => t > windowStart);
  loginAttempts.set(ip, attempts);
  return attempts.length < 10;
}

export function recordFailedAttempt(ip: string): void {
  const attempts = loginAttempts.get(ip) || [];
  attempts.push(Date.now());
  loginAttempts.set(ip, attempts);
}

export function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
