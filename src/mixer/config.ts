import type { Layer, StripConfig } from "./types";
export const colors = {
  vox: "#20bcee",
  speech: "#ffbf20",
  guitar: "#a435ef",
  keys: "#ec22e6",
  drums: "#e91d4b",
  fx: "#ff6333",
  iem: "#00c94e",
  blank: "#35487c",
};
const names = [
  "VOX 1",
  "VOX 2",
  "Ben",
  "VOX 4",
  "HH 1",
  "HH 2",
  "JUSTIN",
  "BASS",
  "AG",
  "EG 1",
  "EG 2",
  "BEN GTR",
  "KEYS",
  "AUX KEYS",
  "PAD",
  "KEYS TRA",
  "",
  "KICK",
  "KICK SAM",
  "SNARE",
  "SNARE SA",
  "TOM 1",
  "TOM 2",
  "TOM 3",
  "HIHAT",
  "OH",
  "Perc TRAX",
  "CLICK",
  "CUES",
  "",
  "",
  "",
];
const levels = [
  -15, -15, -15, -90, 1.4, 1.5, 3.5, -12.5, -13.2, -6.1, -9.6, -90, 0, -1.3,
  -14.7, -35.5, -90, 0.1, -7.6, 2.8, -6.1, -2.1, -2.6, -2.5, -21.5, -11.9,
  -35.4, -90, -90, -0.6, -90, -90,
];
const sources = [
  "MIC 1",
  "MIC 2",
  "MIC 3",
  "MIC 4",
  "HH1",
  "HH2",
  "HEADSET",
  "BASS",
  "AG",
  "A 3",
  "KEMPER",
  "A 1/2",
  "KEYS",
  "SYNTH",
  "PAD STEREO",
  "TRAX 1",
  "",
  "A 7",
  "KICK",
  "A 9",
  "SNARE",
  "TOM1",
  "TOM2",
  "TOM3",
  "A 14",
  "A 15/16",
  "TRAX 2",
  "CLICK",
  "CUES",
];
export const inputs: StripConfig[] = Array.from({ length: 40 }, (_, i) => ({
  id: `ch${i + 1}`,
  number: String(i + 1),
  name: names[i] || "",
  kind: "input",
  source: sources[i] || "UNASSIGNED",
  initialDb: levels[i] ?? -90,
  color:
    i < 4
      ? colors.vox
      : i < 7
        ? colors.speech
        : i < 12
          ? colors.guitar
          : i < 16
            ? colors.keys
            : i >= 17 && i <= 26
              ? colors.drums
              : i === 27 || i === 28
                ? colors.fx
                : colors.blank,
  muted: i < 6 || (i >= 7 && i <= 13),
}));
export const auxes: StripConfig[] = Array.from({ length: 8 }, (_, i) => ({
  id: `a${i + 1}`,
  number: `A${i + 1}`,
  name: ["PC", "2TR"][i] || "",
  kind: "aux",
  source: ["CRD 27/28", "PLAY 1/2"][i] || "UNASSIGNED",
  color: i === 0 ? colors.speech : i === 1 ? "#bc741e" : colors.blank,
  initialDb: i === 0 ? -3.9 : -90,
  muted: i === 0,
}));
const busNames = [
  "VOX",
  "GTRS",
  "KEYS",
  "DRUM",
  "DRUM CRUSH",
  "VOX VERB",
  "VOX DLY",
  "DRUM VERB",
  ...Array.from({ length: 8 }, (_, i) => `IEM ${i + 1}`),
];
export const buses: StripConfig[] = busNames.map((name, i) => ({
  id: `b${i + 1}`,
  number: `B${i + 1}`,
  name,
  kind: "bus",
  source: "BUS",
  color:
    i === 0
      ? colors.vox
      : i === 1
        ? colors.guitar
        : i === 2
          ? colors.keys
          : i === 3 || i === 4 || i === 7
            ? colors.drums
            : i < 8
              ? colors.fx
              : colors.iem,
  initialDb: [
    0, 0, 0, 0, -9.5, -8.2, -90, -29.8, 0, -18.6, 0.1, 0, 0, -0.6, 0, 0,
  ][i],
}));
// Explicit UI mute associations, independent of per-bus send levels.
// Full audio routing is a separate future concern.
export const busMuteMembers: Record<string, readonly string[]> = {
  b1: ["ch1", "ch2", "ch3", "ch4"],
  b2: ["ch8", "ch9", "ch10", "ch11", "ch12"],
  b3: ["ch13", "ch14", "ch15", "ch16"],
  b4: [
    "ch18",
    "ch19",
    "ch20",
    "ch21",
    "ch22",
    "ch23",
    "ch24",
    "ch25",
    "ch26",
    "ch27",
  ],
};
// Read-only membership transcribed from the DCA overview screenshot.
const memberships = [
  ["b1", "b6", "b7"],
  ["b2"],
  ["b3"],
  ["b4", "b5"],
  ["ch7"],
  ["a1"],
];
export const dcas: StripConfig[] = Array.from({ length: 16 }, (_, i) => ({
  id: `d${i + 1}`,
  number: `D${i + 1}`,
  name: ["VOX", "GTRS", "KEYS", "DRUMS", "JUSTIN", "PC"][i] || "",
  kind: "dca",
  source: "CONTROL GROUP",
  color: "#62676b",
  initialDb: [0, 0, -5.6, -5.1, -0.6, -6.6][i] ?? -90,
  members: memberships[i] || [],
  muted: i === 0 || i === 4,
}));
export const main: StripConfig = {
  id: "main",
  number: "M1",
  name: "MAIN LR",
  kind: "main",
  source: "BUS SUM",
  color: "#496ccf",
  initialDb: -1.6,
};
export const strips = [...inputs, ...auxes, ...buses, ...dcas, main];
export const byId = Object.fromEntries(strips.map((s) => [s.id, s]));
export const layers: Record<Layer, StripConfig[]> = {
  "CH 1–16": inputs.slice(0, 16),
  "CH 17–32": inputs.slice(16, 32),
  "CH 33–A8": [...inputs.slice(32), ...auxes],
  "CH 1–40": inputs,
  AUX: auxes,
  BUSES: buses,
  DCA: dcas,
};
export const iem1Levels = [
  -12.9, -1, -6.4, -10.4, -4.9, -21, -24, -0.3, -19, -12.5, -15.5, -41.1, 0.8,
  0.8, -18.6, -27.2,
];
