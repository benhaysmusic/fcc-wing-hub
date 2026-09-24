import { expect, it } from "vitest";
import { compressorOutput } from "../src/mixer/compressor";
it("compresses only above a hard knee threshold at the selected ratio", () => {
  expect(compressorOutput(-30, -10, 3, 0)).toBe(-30);
  expect(compressorOutput(-10, -10, 3, 0)).toBe(-10);
  expect(compressorOutput(-4, -10, 3, 0)).toBe(-8);
  expect(compressorOutput(-4, -10, 1, 0)).toBe(-4);
});
it("rounds the knee continuously without reversing the transfer curve", () => {
  expect(compressorOutput(-10, -10, 3, 3)).toBeLessThan(-10);
  for (const x of [-16, -4])
    expect(
      Math.abs(
        compressorOutput(x - 0.001, -10, 3, 3) -
          compressorOutput(x + 0.001, -10, 3, 3),
      ),
    ).toBeLessThan(0.003);
  let previous = -100;
  for (let input = -60; input <= 0; input += 0.1) {
    const output = compressorOutput(input, -18, 4, 5);
    expect(output).toBeGreaterThanOrEqual(previous);
    previous = output;
  }
});
