import type { Processing } from "./types";
/** Illustrative response for the silent trainer, not a firmware/DSP model. */
export function eqResponseDb(p: Processing, frequency: number): number {
  const bands = p.eqEnabled
    ? p.bands.reduce((sum, b, i) => {
        const octaves = Math.log2(frequency / b.frequency);
        const response =
          b.shape === "shelf"
            ? 1 / (1 + Math.pow(2, (i === 0 ? 1 : -1) * octaves * 3))
            : Math.exp(-Math.pow(octaves * b.q, 2) / 2);
        return sum + b.gain * response;
      }, 0)
    : 0;
  // The input cut filters are separate from EQ band bypass.
  const low = p.lowCut
    ? -10 * Math.log10(1 + Math.pow(p.lowCutHz / frequency, 4))
    : 0;
  const high = p.highCut
    ? -10 * Math.log10(1 + Math.pow(frequency / p.highCutHz, 4))
    : 0;
  return bands + low + high;
}
export const eqFrequencyX = (frequency: number) =>
  (Math.log(frequency / 20) / Math.log(1000)) * 1000;
export const eqXFrequency = (x: number) =>
  20 * Math.pow(1000, Math.max(0, Math.min(1000, x)) / 1000);
