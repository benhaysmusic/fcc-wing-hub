import { describe, expect, it } from "vitest";
import { gateOutput } from "../src/mixer/gate";
describe("gate display transfer", () => {
  it("leaves values above threshold unchanged and limits expansion to range", () => {
    expect(gateOutput(-20, -34, 4, 14.5)).toBe(-20);
    expect(gateOutput(-36, -34, 4, 14.5)).toBe(-42);
    expect(gateOutput(-60, -34, 4, 14.5)).toBe(-74.5);
  });
  it("supports hard gate and zero-range without moving the threshold", () => {
    expect(gateOutput(-34, -34, 4, 22, true)).toBe(-34);
    expect(gateOutput(-34.5, -34, 4, 22, true)).toBe(-56.5);
    expect(gateOutput(-70, -34, 4, 0, true)).toBe(-70);
  });
});
