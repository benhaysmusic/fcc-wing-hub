/** Static transfer visualization, independent of bypass and makeup gain. */
export function compressorOutput(
  input: number,
  threshold: number,
  ratio: number,
  knee: number,
): number {
  const width = knee * 4;
  const above = input - threshold;
  if (width > 0 && Math.abs(above) < width / 2) {
    return (
      input + ((1 / ratio - 1) * Math.pow(above + width / 2, 2)) / (2 * width)
    );
  }
  return above <= -width / 2 ? input : threshold + above / ratio;
}
