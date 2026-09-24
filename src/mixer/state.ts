import {
  auxes,
  buses,
  busMuteMembers,
  byId,
  dcas,
  iem1Levels,
  inputs,
  strips,
  unitySendMembers,
} from "./config";
import type { MixerAction, MixerState, Processing } from "./types";
export const MIN_DB = -90;
export const formatDb = (db: number) => (db <= MIN_DB ? "−∞" : db.toFixed(1));
export const clampDb = (db: number) =>
  Number.isFinite(db) ? Math.max(MIN_DB, Math.min(10, db)) : MIN_DB;
const taper = [
  [-90, 0],
  [-60, 5],
  [-40, 18],
  [-20, 40],
  [-10, 55],
  [0, 75],
  [10, 100],
];
function interpolate(value: number, from: 0 | 1, to: 0 | 1) {
  const v = Math.max(taper[0][from], Math.min(taper.at(-1)![from], value));
  const i = taper.findIndex((p, j) => j > 0 && v <= p[from]);
  const a = taper[Math.max(0, i - 1)],
    b = taper[Math.max(1, i)];
  return a[to] + ((v - a[from]) / (b[from] - a[from])) * (b[to] - a[to]);
}
export const dbToPosition = (db: number) => interpolate(db, 0, 1);
export const positionToDb = (p: number) =>
  Math.round(interpolate(p, 1, 0) * 10) / 10;
export function defaultProcessing(): Processing {
  return {
    trim: 0,
    pan: 0,
    invert: false,
    lowCut: false,
    lowCutHz: 125.3,
    gate: {
      enabled: false,
      threshold: -69.5,
      ratio: 3,
      attack: 10,
      hold: 266,
      release: 400,
      range: 40,
      makeup: 0,
    },
    compressor: {
      enabled: false,
      threshold: -18,
      ratio: 3,
      attack: 20,
      hold: 0,
      release: 150,
      range: 40,
      makeup: 0,
    },
    eqEnabled: false,
    bands: [54, 110, 450, 1600, 5700, 13000].map((frequency) => ({
      frequency,
      gain: 0,
      q: 1,
    })),
  };
}
export function createInitialState(): MixerState {
  return {
    layer: "CH 1–16",
    selectedId: "ch1",
    editor: "Input",
    view: "mix",
    selectedBus: "b9",
    sof: false,
    strips: Object.fromEntries(
      strips.map((s) => [
        s.id,
        {
          faderDb: s.initialDb,
          muted: !!s.muted,
          solo: false,
          processing: defaultProcessing(),
        },
      ]),
    ),
    sends: Object.fromEntries(
      [...inputs, ...auxes].map((s, i) => [
        s.id,
        Object.fromEntries(
          buses.map((b) => [
            b.id,
            {
              levelDb:
                b.id === "b9"
                  ? (iem1Levels[i] ?? MIN_DB)
                  : unitySendMembers[b.id]?.includes(s.id)
                    ? 0
                    : MIN_DB,
              enabled:
                b.id === "b9" || !!unitySendMembers[b.id]?.includes(s.id),
            },
          ]),
        ),
      ]),
    ),
  };
}
export const isSendMode = (state: MixerState, id: string) =>
  state.sof && !!state.sends[id];
export function displayedDb(state: MixerState, id: string) {
  return isSendMode(state, id)
    ? state.sends[id][state.selectedBus].levelDb
    : state.strips[id].faderDb;
}
export function controllingDcas(id: string) {
  return dcas.filter((d) => d.members?.includes(id));
}
export function effectiveMute(state: MixerState, id: string) {
  return (
    state.strips[id].muted ||
    controllingDcas(id).some((d) => state.strips[d.id].muted)
  );
}
// This is a console indication, not a global audio-channel mute: muting a
// destination bus must not silence unrelated sends (for example an IEM mix).
export function busMuteSources(state: MixerState, id: string) {
  return buses.filter(
    (bus) => busMuteMembers[bus.id]?.includes(id) && state.strips[bus.id].muted,
  );
}
export function effectiveDb(state: MixerState, id: string) {
  const gains = [
    state.strips[id].faderDb,
    ...controllingDcas(id).map((d) => state.strips[d.id].faderDb),
  ];
  return gains.some((g) => g <= MIN_DB)
    ? MIN_DB
    : gains.reduce((a, b) => a + b, 0);
}
export function reducer(state: MixerState, action: MixerAction): MixerState {
  switch (action.type) {
    case "reset":
      return createInitialState();
    case "layer":
      return { ...state, layer: action.layer };
    case "select":
      return byId[action.id] ? { ...state, selectedId: action.id } : state;
    case "editor":
      return {
        ...state,
        editor: action.editor,
        view: "editor",
        selectedId: action.id ?? state.selectedId,
      };
    case "view":
      return { ...state, view: action.view };
    case "bus":
      return byId[action.id]?.kind === "bus"
        ? { ...state, selectedBus: action.id }
        : state;
    case "sof":
      return { ...state, sof: !state.sof };
    case "clearSolo":
      return {
        ...state,
        strips: Object.fromEntries(
          Object.entries(state.strips).map(([id, s]) => [
            id,
            { ...s, solo: false },
          ]),
        ),
      };
    case "sendToggle": {
      if (!isSendMode(state, action.id)) return state;
      const sends = state.sends[action.id];
      const send = sends[state.selectedBus];
      return {
        ...state,
        sends: {
          ...state.sends,
          [action.id]: {
            ...sends,
            [state.selectedBus]: { ...send, enabled: !send.enabled },
          },
        },
      };
    }
    case "fader": {
      if (!state.strips[action.id]) return state;
      const value = clampDb(action.value);
      if (isSendMode(state, action.id)) {
        const sends = state.sends[action.id];
        return {
          ...state,
          sends: {
            ...state.sends,
            [action.id]: {
              ...sends,
              [state.selectedBus]: {
                ...sends[state.selectedBus],
                levelDb: value,
              },
            },
          },
        };
      }
      return {
        ...state,
        strips: {
          ...state.strips,
          [action.id]: { ...state.strips[action.id], faderDb: value },
        },
      };
    }
    case "mute":
    case "solo":
    case "processing": {
      const s = state.strips[action.id];
      if (!s) return state;
      const updated =
        action.type === "processing"
          ? { ...s, processing: { ...s.processing, ...action.patch } }
          : action.type === "mute"
            ? { ...s, muted: !s.muted }
            : { ...s, solo: !s.solo };
      return { ...state, strips: { ...state.strips, [action.id]: updated } };
    }
  }
}
