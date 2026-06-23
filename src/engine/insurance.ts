import type { CountSystem } from '../types';

/**
 * Insurance becomes correctly +EV roughly when the true count clears a system
 * threshold. For balanced ten-counting-style systems that is ~+3 on a Hi-Lo
 * scale; we scale by the system's ten-card weight magnitude so higher-level
 * counts use a proportional threshold. This is guidance, not gospel.
 */
export function insuranceThreshold(system: CountSystem): number {
  const tenWeight = Math.abs(system.weights.T) || 1;
  return 3 * tenWeight;
}

export function shouldTakeInsurance(system: CountSystem, trueCount: number): boolean {
  return trueCount >= insuranceThreshold(system);
}
