import { eqResponseDb, eqXFrequency } from "../mixer/eq";
import { byId, dcaDisplayMembers } from "../mixer/config";
import { dispatch } from "../mixer/store";
import type { MixerState, StripConfig } from "../mixer/types";
export function MixOverview({
  channels,
  state,
}: {
  channels: StripConfig[];
  state: MixerState;
}) {
  return (
    <div
      className="overview"
      style={{
        gridTemplateColumns: `repeat(${channels.length}, minmax(58px, 1fr))`,
      }}
    >
      {channels.map((c) => {
        const p = state.strips[c.id].processing;
        return (
          <div
            className={`overview-strip ${state.selectedId === c.id ? "selected" : ""}`}
            key={c.id}
          >
            {c.kind === "dca" ? (
              <div
                className="dca-members"
                aria-label={`${c.name || c.number} members`}
              >
                <span>MEMBERS</span>
                {c.members?.length ? (
                  dcaDisplayMembers(c).map((id) => (
                    <button
                      key={id}
                      title={`${byId[id].number} ${byId[id].name}`}
                      style={{ borderColor: byId[id].color }}
                      onClick={() => dispatch({ type: "select", id })}
                    >
                      {byId[id].name}
                      <small>{byId[id].number}</small>
                    </button>
                  ))
                ) : (
                  <small>Unassigned</small>
                )}
              </div>
            ) : (
              <>
                <button
                  className="source-block"
                  onClick={() =>
                    dispatch({ type: "editor", editor: "Input", id: c.id })
                  }
                >
                  <b style={{ background: c.color }}>{c.source}</b>
                  <span>
                    {c.kind === "input"
                      ? "INPUT"
                      : c.kind === "aux"
                        ? "AUX"
                        : "BUS"}
                  </span>
                  <small>TRIM {p.trim.toFixed(1)}</small>
                </button>
                <button
                  className={`mini-process ${p.gate.enabled ? "enabled" : ""}`}
                  onClick={() =>
                    dispatch({ type: "editor", editor: "Gate", id: c.id })
                  }
                >
                  GATE<small>S/C</small>
                </button>
                <button
                  className={`mini-eq ${p.eqEnabled || p.lowCut || p.highCut ? "enabled" : ""}`}
                  aria-label={`EQ ${c.number}`}
                  onClick={() =>
                    dispatch({ type: "editor", editor: "EQ", id: c.id })
                  }
                >
                  <svg viewBox="0 0 100 40">
                    <path
                      d={Array.from(
                        { length: 51 },
                        (_, i) =>
                          `${i ? "L" : "M"}${i * 2} ${Math.max(0, Math.min(40, 20 - eqResponseDb(p, eqXFrequency(i * 20))))}`,
                      ).join(" ")}
                    />
                  </svg>
                </button>
                <button
                  className={`mini-process ${p.compressor.enabled ? "enabled" : ""}`}
                  onClick={() =>
                    dispatch({ type: "editor", editor: "Compressor", id: c.id })
                  }
                >
                  COMP<small>S/C</small>
                </button>
                <div className="pan-display">
                  <span style={{ transform: `rotate(${p.pan * 0.8}deg)` }}>
                    │
                  </span>
                </div>
                <div className="idle-meter" aria-label="No audio signal" />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
