import { describe, it, expect } from "vitest";
import { defaultProcessing } from "../src/mixer/state";
import { eqResponseDb, eqFrequencyX, eqXFrequency } from "../src/mixer/eq";
describe("silent EQ response display", () => {
  it("links cut settings to low/high attenuation independently of band bypass", () => {
    const p = defaultProcessing();
    expect(eqResponseDb(p, 20)).toBe(0);
    p.lowCut = true;
    p.lowCutHz = 200;
    expect(eqResponseDb(p, 20)).toBeLessThan(-30);
    expect(eqResponseDb(p, 2000)).toBeGreaterThan(-0.01);
    p.highCut = true;
    p.highCutHz = 4000;
    expect(eqResponseDb(p, 16000)).toBeLessThan(-20);
    p.lowCut = false;
    expect(eqResponseDb(p, 20)).toBeGreaterThan(-0.01);
    expect(eqResponseDb(p, 16000)).toBeLessThan(-20);
  });
  it("distinguishes shelving from parametric and narrows a band with Q", () => {
    const p = defaultProcessing();
    p.eqEnabled = true;
    p.bands[0] = { frequency: 100, gain: 6, q: 1, shape: "shelf" };
    expect(eqResponseDb(p, 20)).toBeGreaterThan(5);
    expect(eqResponseDb(p, 10000)).toBeLessThan(0.01);
    p.bands[0].shape = "bell";
    expect(eqResponseDb(p, 100)).toBe(6);
    expect(eqResponseDb(p, 20)).toBeLessThan(1);
    const broad = eqResponseDb(p, 150);
    p.bands[0].q = 8;
    expect(eqResponseDb(p, 150)).toBeLessThan(broad);
    p.eqEnabled = false;
    expect(eqResponseDb(p, 100)).toBe(0);
  });
  it("maps graph frequency positions logarithmically without losing endpoints", () => {
    for (const f of [20, 125.3, 1000, 11910, 20000])
      expect(eqXFrequency(eqFrequencyX(f))).toBeCloseTo(f, 6);
  });
});

it("can preview configured hills while preserving the bypassed response", () => {
  const p = defaultProcessing();
  p.bands[2].gain = 9;
  expect(eqResponseDb(p, p.bands[2].frequency)).toBe(0);
  expect(eqResponseDb(p, p.bands[2].frequency, true)).toBe(9);
  p.bands[2].gain = -9;
  expect(eqResponseDb(p, p.bands[2].frequency, true)).toBe(-9);
  expect(p.eqEnabled).toBe(false);
});
