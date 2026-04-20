/**
 * Time Utilities
 */

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}分${remainingSeconds}秒`
      : `${minutes}分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}小时${remainingMinutes}分钟`
    : `${hours}小时`;
}

/**
 * Format date to ISO string
 */
export function toISODate(date: Date): string {
  return date.toISOString();
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date, format: 'full' | 'short' = 'full'): string {
  if (format === 'full') {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

/**
 * Get current date
 */
export function currentDate(): Date {
  return new Date();
}

/**
 * Add seconds to date
 */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

/**
 * Add minutes to date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Calculate difference in seconds between two dates
 */
export function diffSeconds(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / 1000);
}

/**
 * Check if date is expired
 */
export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if date is within TTL seconds from now
 */
export function isWithinTTL(date: Date, ttl: number): boolean {
  const expiry = new Date(date.getTime() + ttl * 1000);
  return expiry.getTime() > Date.now();
}
