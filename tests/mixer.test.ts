import { describe, it, expect } from "vitest";
import {
  createInitialState,
  reducer,
  displayedDb,
  effectiveDb,
  effectiveMute,
  dcaMuteSources,
  dbToPosition,
  positionToDb,
} from "../src/mixer/state";
import {
  layers,
  groupBusMembers,
  inputs,
  auxes,
  iem1Levels,
} from "../src/mixer/config";
describe("FCC mixer invariants", () => {
  it("starts all associated FX sends at unity without adding FX mute propagation", () => {
    let s = createInitialState();
    for (const channel of ["ch1", "ch2", "ch3", "ch4"]) {
      for (const bus of ["b6", "b7"])
        expect(s.sends[channel][bus]).toEqual({ levelDb: 0, enabled: true });
      expect(s.sends[channel].b8).toEqual({ levelDb: -90, enabled: false });
    }
    for (let n = 18; n <= 27; n++) {
      for (const bus of ["b5", "b8"])
        expect(s.sends[`ch${n}`][bus]).toEqual({ levelDb: 0, enabled: true });
      expect(s.sends[`ch${n}`].b6).toEqual({ levelDb: -90, enabled: false });
    }
    for (const bus of ["b5", "b6", "b7", "b8"])
      s = reducer(s, { type: "mute", id: bus });
    for (const channel of inputs)
      expect(dcaMuteSources(s, channel.id)).toEqual(
        dcaMuteSources(createInitialState(), channel.id),
      );
  });
  it("starts main group sends at unity and restores them on reset", () => {
    let s = createInitialState();
    for (const [channel, bus] of [
      ["ch1", "b1"],
      ["ch8", "b2"],
      ["ch13", "b3"],
      ["ch18", "b4"],
    ]) {
      expect(s.sends[channel][bus]).toEqual({ levelDb: 0, enabled: true });
    }
    expect(s.sends.ch1.b2).toEqual({ levelDb: -90, enabled: false });
    s = reducer(s, { type: "bus", id: "b1" });
    s = reducer(s, { type: "sof" });
    s = reducer(s, { type: "fader", id: "ch1", value: -12 });
    s = reducer(s, { type: "sendToggle", id: "ch1" });
    s = reducer(s, { type: "reset" });
    expect(s.sends.ch1.b1).toEqual({ levelDb: 0, enabled: true });
  });
  it("preserves every existing IEM send default", () => {
    const s = createInitialState();
    [...inputs, ...auxes].forEach((channel, i) => {
      expect(s.sends[channel.id].b9).toEqual({
        levelDb: iem1Levels[i] ?? -90,
        enabled: true,
      });
      for (let b = 10; b <= 16; b++)
        expect(s.sends[channel.id][`b${b}`]).toEqual({
          levelDb: -90,
          enabled: false,
        });
    });
  });
  it("bus mute changes never change DCA indicators or channel state", () => {
    let s = createInitialState();
    const before = s;
    for (let b = 1; b <= 16; b++) s = reducer(s, { type: "mute", id: `b${b}` });
    for (const channel of [...inputs, ...auxes]) {
      expect(dcaMuteSources(s, channel.id)).toEqual(
        dcaMuteSources(before, channel.id),
      );
      expect(s.strips[channel.id]).toBe(before.strips[channel.id]);
      expect(s.sends[channel.id]).toBe(before.sends[channel.id]);
    }
  });
  it("DCA indicators reach member buses and associated channels only", () => {
    let s = createInitialState();
    s = reducer(s, { type: "mute", id: "d1" });
    s = reducer(s, { type: "mute", id: "d5" });
    for (const [dca, members] of [
      ["d1", ["b1", "b6", "b7", "ch1", "ch2", "ch3", "ch4"]],
      ["d2", ["b2", "ch8", "ch9", "ch10", "ch11", "ch12"]],
      ["d3", ["b3", "ch13", "ch14", "ch15", "ch16"]],
      ["d4", ["b4", "b5", ...groupBusMembers.b4]],
      ["d5", ["ch7"]],
      ["d6", ["a1"]],
    ] as [string, string[]][]) {
      const muted = reducer(s, { type: "mute", id: dca });
      for (const id of Object.keys(s.strips)) {
        expect(dcaMuteSources(muted, id).map((d) => d.id)).toEqual(
          members.includes(id) ? [dca] : [],
        );
      }
    }
  });
  it("DCA release preserves direct mutes, levels and sends", () => {
    let s = createInitialState();
    const before = s;
    s = reducer(s, { type: "mute", id: "ch1" });
    expect(dcaMuteSources(s, "ch1").map((d) => d.id)).toEqual(["d1"]);
    s = reducer(s, { type: "mute", id: "ch1" });
    s = reducer(s, { type: "mute", id: "b1" });
    s = reducer(s, { type: "mute", id: "d1" });
    expect(dcaMuteSources(s, "ch1")).toEqual([]);
    expect(dcaMuteSources(s, "b1")).toEqual([]);
    expect(s.strips.ch1.muted).toBe(true);
    expect(s.strips.b1.muted).toBe(true);
    expect(s.strips.ch1.faderDb).toBe(before.strips.ch1.faderDb);
    expect(s.sends).toBe(before.sends);
  });
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
