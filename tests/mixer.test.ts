import { describe, it, expect } from "vitest";
import {
  createInitialState,
  reducer,
  displayedDb,
  effectiveDb,
  effectiveMute,
  dbToPosition,
  positionToDb,
} from "../src/mixer/state";
import { layers } from "../src/mixer/config";
describe("FCC mixer invariants", () => {
  it("preserves normal faders and other buses during SOF edits", () => {
    let s = createInitialState();
    const original = s.strips.ch1.faderDb;
    s = reducer(s, { type: "sof" });
    expect(displayedDb(s, "ch1")).toBe(-12.9);
    s = reducer(s, { type: "fader", id: "ch1", value: -4 });
    s = reducer(s, { type: "sendToggle", id: "ch1" });
    expect(s.sends.ch1.b9.enabled).toBe(false);
    s = reducer(s, { type: "bus", id: "b10" });
    expect(displayedDb(s, "ch1")).toBe(-90);
    s = reducer(s, { type: "fader", id: "ch1", value: -8 });
    expect(s.sends.ch1.b9.levelDb).toBe(-4);
    s = reducer(s, { type: "sof" });
    expect(displayedDb(s, "ch1")).toBe(original);
  });
  it("keeps bus and DCA faders independent of active SOF", () => {
    let s = reducer(createInitialState(), { type: "sof" });
    s = reducer(s, { type: "fader", id: "b9", value: -7 });
    s = reducer(s, { type: "fader", id: "d2", value: -4 });
    expect(s.strips.b9.faderDb).toBe(-7);
    expect(s.strips.d2.faderDb).toBe(-4);
    expect(s.sends.ch1.b9.levelDb).toBe(-12.9);
  });
  it("applies DCA control without moving member faders", () => {
    let s = createInitialState();
    const member = s.strips.b2.faderDb;
    s = reducer(s, { type: "fader", id: "d2", value: -12 });
    expect(effectiveDb(s, "b2")).toBe(member - 12);
    expect(s.strips.b2.faderDb).toBe(member);
    s = reducer(s, { type: "mute", id: "d2" });
    expect(effectiveMute(s, "b2")).toBe(true);
    expect(s.strips.b2.muted).toBe(false);
    s = reducer(s, { type: "mute", id: "b2" });
    s = reducer(s, { type: "mute", id: "d2" });
    expect(effectiveMute(s, "b2")).toBe(true);
  });
  it("preserves selection and channel processing across layers", () => {
    let s = createInitialState();
    s = reducer(s, { type: "processing", id: "ch1", patch: { trim: 4 } });
    s = reducer(s, { type: "layer", layer: "BUSES" });
    expect(s.selectedId).toBe("ch1");
    s = reducer(s, { type: "select", id: "b1" });
    expect(s.strips.b1.processing.trim).toBe(0);
    expect(s.strips.ch1.processing.trim).toBe(4);
    expect(layers["CH 33–A8"].map((c) => c.id)).toEqual([
      "ch33",
      "ch34",
      "ch35",
      "ch36",
      "ch37",
      "ch38",
      "ch39",
      "ch40",
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
      "a6",
      "a7",
      "a8",
    ]);
  });
  it("clears solo across hidden layers and resets without retaining changes", () => {
    let s = createInitialState();
    for (const id of ["ch1", "a1", "b2", "d4", "main"])
      s = reducer(s, { type: "solo", id });
    s = reducer(s, { type: "clearSolo" });
    expect(Object.values(s.strips).some((c) => c.solo)).toBe(false);
    s = reducer(s, { type: "fader", id: "ch1", value: 999 });
    expect(s.strips.ch1.faderDb).toBe(10);
    expect(reducer(s, { type: "reset" })).toEqual(createInitialState());
  });
  it("round trips fader taper and represents silence", () => {
    for (const db of [-90, -60, -40, -20, -15, -10, 0, 5, 10])
      expect(positionToDb(dbToPosition(db))).toBeCloseTo(db, 1);
    let s = createInitialState();
    s = reducer(s, { type: "fader", id: "d2", value: -90 });
    expect(effectiveDb(s, "b2")).toBe(-90);
  });
});
