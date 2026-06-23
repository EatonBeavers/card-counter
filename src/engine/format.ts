import type { DisplayPrecision } from '../types';

/**
 * Formats a (possibly real-valued) count for display. Internal state always
 * keeps full precision — this only affects what the user sees.
 */
export function formatCount(value: number, precision: DisplayPrecision): string {
  switch (precision) {
    case 'exact': {
      // Trim to at most 3 decimals without trailing-zero noise.
      const r = Math.round(value * 1000) / 1000;
      return formatSigned(r);
    }
    case 'oneDecimal':
      return formatSigned(Math.round(value * 10) / 10);
    case 'nearestHalf':
      return formatSigned(Math.round(value * 2) / 2);
    case 'nearestInteger':
      return formatSigned(Math.round(value));
  }
}

function formatSigned(n: number): string {
  if (Object.is(n, -0)) n = 0;
  const sign = n > 0 ? '+' : '';
  return `${sign}${n}`;
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}
