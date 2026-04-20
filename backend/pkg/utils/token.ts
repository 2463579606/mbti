/**
 * Token Generation Utilities
 */

import { randomBytes } from 'crypto';

/**
 * Generate a random session token
 * Format: sess_{random_16_chars}
 */
export function generateSessionToken(): string {
  const random = randomBytes(8).toString('hex'); // 16 hex chars
  return `sess_${random}`;
}

/**
 * Generate a random share token
 * Format: rpt_{random_16_chars}
 */
export function generateShareToken(): string {
  const random = randomBytes(8).toString('hex'); // 16 hex chars
  return `rpt_${random}`;
}

/**
 * Generate an anonymous user ID (UUID v4)
 */
export function generateAnonymousId(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variant

  const hex = bytes.toString('hex');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
}

/**
 * Validate token format
 */
export function isValidSessionToken(token: string): boolean {
  return /^sess_[a-f0-9]{16}$/.test(token);
}

export function isValidShareToken(token: string): boolean {
  return /^rpt_[a-f0-9]{16}$/.test(token);
}
