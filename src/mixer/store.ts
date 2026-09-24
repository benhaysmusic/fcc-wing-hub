import { useSyncExternalStore } from "react";
import { createInitialState, reducer } from "./state";
import type { MixerAction, MixerState } from "./types";
let state = createInitialState();
const listeners = new Set<() => void>();
const observers = new Set<(action: MixerAction, state: MixerState) => void>();
export const mixerStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  observe: (listener: (action: MixerAction, state: MixerState) => void) => {
    observers.add(listener);
    return () => {
      observers.delete(listener);
    };
  },
  dispatch: (action: MixerAction) => {
    state = reducer(state, action);
    listeners.forEach((fn) => fn());
    observers.forEach((fn) => fn(action, state));
  },
};
export const dispatch = mixerStore.dispatch;
export const useMixer = () =>
  useSyncExternalStore(mixerStore.subscribe, mixerStore.getState);
