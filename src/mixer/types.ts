export type StripKind = "input" | "aux" | "bus" | "dca" | "main";
export type Editor = "Input" | "Gate" | "EQ" | "Compressor";
export type Layer =
  "CH 1–16" | "CH 17–32" | "CH 33–A8" | "CH 1–40" | "AUX" | "BUSES" | "DCA";
export interface StripConfig {
  id: string;
  number: string;
  name: string;
  color: string;
  kind: StripKind;
  source: string;
  initialDb: number;
  muted?: boolean;
  members?: string[];
}
export interface Dynamics {
  enabled: boolean;
  threshold: number;
  ratio: number;
  attack: number;
  hold: number;
  release: number;
  range: number;
  makeup: number;
}
export interface EqBand {
  frequency: number;
  gain: number;
  q: number;
}
export interface Processing {
  trim: number;
  pan: number;
  invert: boolean;
  lowCut: boolean;
  lowCutHz: number;
  gate: Dynamics & { accent: number; hardGate: boolean; keySolo: boolean };
  compressor: Dynamics;
  eqEnabled: boolean;
  bands: EqBand[];
}
export interface StripState {
  faderDb: number;
  muted: boolean;
  solo: boolean;
  processing: Processing;
}
export interface Send {
  levelDb: number;
  enabled: boolean;
}
export interface MixerState {
  layer: Layer;
  selectedId: string;
  editor: Editor;
  view: "mix" | "editor";
  selectedBus: string;
  sof: boolean;
  strips: Record<string, StripState>;
  sends: Record<string, Record<string, Send>>;
}
export type MixerAction =
  | { type: "layer"; layer: Layer }
  | { type: "select"; id: string }
  | { type: "editor"; editor: Editor; id?: string }
  | { type: "view"; view: MixerState["view"] }
  | { type: "bus"; id: string }
  | { type: "sof" }
  | { type: "fader"; id: string; value: number }
  | { type: "mute" | "solo"; id: string }
  | { type: "sendToggle"; id: string }
  | { type: "processing"; id: string; patch: Partial<Processing> }
  | { type: "clearSolo" | "reset" };
