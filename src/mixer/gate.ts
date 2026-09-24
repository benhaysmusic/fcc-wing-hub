/** Display-only expansion curve; no audio processing. */
export function gateOutput(
  input: number,
  threshold: number,
  ratio: number,
  range: number,
  hardGate = false,
) {
  const reduction =
    input < threshold
      ? hardGate
        ? range
        : Math.min(range, (threshold - input) * (ratio - 1))
      : 0;
  return input - reduction;
}
