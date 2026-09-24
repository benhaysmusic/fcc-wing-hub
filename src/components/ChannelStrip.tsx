import type { CSSProperties } from "react";
import type { MixerState, StripConfig } from "../mixer/types";
import { dispatch } from "../mixer/store";
import {
  controllingDcas,
  displayedDb,
  effectiveMute,
  isSendMode,
} from "../mixer/state";
import { Fader } from "./Fader";
export function ChannelStrip({
  config,
  state,
}: {
  config: StripConfig;
  state: MixerState;
}) {
  const s = state.strips[config.id],
    send = isSendMode(state, config.id),
    muted = effectiveMute(state, config.id),
    selected = state.selectedId === config.id;
  return (
    <section
      data-testid={`strip-${config.id}`}
      className={`channel-strip ${selected ? "selected" : ""} ${send ? "sending" : ""}`}
      style={{ "--channel-color": config.color } as CSSProperties}
    >
      <button
        className="scribble"
        aria-label={`Select ${config.number} ${config.name}`}
        aria-pressed={selected}
        onClick={() => dispatch({ type: "select", id: config.id })}
      >
        <strong>{config.name || " "}</strong>
        <span>
          <b>{config.number}</b>
          <i>
            {config.kind === "dca"
              ? "DCA"
              : config.kind === "bus"
                ? "BUS"
                : config.kind === "main"
                  ? "LR"
                  : "◉"}
          </i>
        </span>
      </button>
      <button
        className={`solo ${s.solo ? "active" : ""}`}
        aria-label={`Solo ${config.number}`}
        aria-pressed={s.solo}
        onClick={() => dispatch({ type: "solo", id: config.id })}
      >
        SOLO
      </button>
      <div
        className="assignments"
        title={
          controllingDcas(config.id)
            .map((d) => d.name)
            .join(", ") || "No direct DCA assignment"
        }
      >
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={
              controllingDcas(config.id).some((d) => d.id === `d${i + 1}`)
                ? "assigned"
                : ""
            }
          >
            {i + 1}
          </span>
        ))}
      </div>
      <Fader
        value={displayedDb(state, config.id)}
        label={`${send ? "Send" : "Fader"} ${config.number}`}
        send={send}
        onChange={(value) => dispatch({ type: "fader", id: config.id, value })}
      />
      {send ? (
        <>
          <button
            className={`send-on ${state.sends[config.id][state.selectedBus].enabled ? "active" : ""}`}
            aria-label={`Send on ${config.number}`}
            aria-pressed={state.sends[config.id][state.selectedBus].enabled}
            onClick={() => dispatch({ type: "sendToggle", id: config.id })}
          >
            {state.sends[config.id][state.selectedBus].enabled ? "ON" : "OFF"}
          </button>
          <div className="strip-footer">
            SOF{" "}
            <small>
              {config.number} → {state.selectedBus.toUpperCase()}
            </small>
          </div>
        </>
      ) : (
        <>
          <div className="strip-footer">
            {muted && !s.muted
              ? "DCA MUTE"
              : config.kind === "dca"
                ? "CONTROL GROUP"
                : " "}
          </div>
          <button
            className={`mute ${s.muted ? "active" : muted ? "inherited" : ""}`}
            aria-label={`Mute ${config.number}`}
            aria-pressed={s.muted}
            title={
              muted && !s.muted
                ? "Muted by DCA; channel mute is off"
                : undefined
            }
            onClick={() => dispatch({ type: "mute", id: config.id })}
          >
            MUTE
          </button>
        </>
      )}
    </section>
  );
}
