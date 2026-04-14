export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

export const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '';

export function getBackendUrl(): string {
  return process.env.BACKEND_URL ?? 'http://localhost:8080';
}

export function getBackendHmacSecret(): string {
  const secret = process.env.NEXTAUTH_BACKEND_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_BACKEND_SECRET is not set');
  }
  return secret;
}
