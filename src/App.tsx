import { useState } from "react";
import { buses, byId, layers, main } from "./mixer/config";
import { dispatch, useMixer } from "./mixer/store";
import type { Editor, Layer } from "./mixer/types";
import { ChannelStrip } from "./components/ChannelStrip";
import { MixOverview } from "./components/MixOverview";
import { ProcessingEditor } from "./components/ProcessingEditor";
export default function App() {
  const state = useMixer(),
    c = byId[state.selectedId],
    channels = layers[state.layer],
    bus = byId[state.selectedBus];
  const [dialog, setDialog] = useState<"help" | "reset" | null>(null);
  const editors: Editor[] = ["Input", "Gate", "EQ", "Compressor"];
  const soloCount = Object.values(state.strips).filter((s) => s.solo).length;
  return (
    <main className="console">
      <header className="console-header">
        <div className="brand">
          <b>FCC</b>
          <span>WING TRAINER</span>
        </div>
        <div className="selected-channel" style={{ background: c.color }}>
          <b>{c.number}</b>
          <span>{c.name || "UNASSIGNED"}</span>
          <small>{c.kind.toUpperCase()}</small>
        </div>
        <div className="practice-badge">
          <span /> CONSOLE PRACTICE <small>NO AUDIO</small>
        </div>
        <button
          onClick={() => setDialog("help")}
          aria-label="About this prototype"
        >
          ?
        </button>
        <button onClick={() => setDialog("reset")}>RESET</button>
      </header>
      <nav className="left-rail" aria-label="Console navigation">
        <div className="view-buttons">
          <button
            className={state.view === "editor" ? "active" : ""}
            onClick={() => dispatch({ type: "view", view: "editor" })}
          >
            ⌂ <span>HOME</span>
          </button>
          <button
            className={state.view === "mix" ? "active" : ""}
            onClick={() => dispatch({ type: "view", view: "mix" })}
          >
            ☷ <span>MIXVIEW</span>
          </button>
        </div>
        <div className="layer-buttons">
          <span className="rail-caption">SURFACE</span>
          <button
            className={`clear-solo ${soloCount ? "solo-lit" : ""}`}
            onClick={() => dispatch({ type: "clearSolo" })}
          >
            CLR SOLO{soloCount ? ` · ${soloCount}` : ""}
          </button>
          {(Object.keys(layers) as Layer[]).map((layer) => (
            <button
              key={layer}
              className={state.layer === layer ? "active" : ""}
              aria-pressed={state.layer === layer}
              onClick={() => dispatch({ type: "layer", layer })}
            >
              {layer}
            </button>
          ))}
        </div>
        <span className="rail-bottom">
          FIRST CHRISTIAN
          <br />
          CHURCH
        </span>
      </nav>
      <section className="surface">
        <div className={`mode-bar ${state.sof ? "sof-active" : ""}`}>
          <span>
            {state.sof
              ? `SENDS ON FADERS → ${bus.name}`
              : state.layer === "DCA"
                ? "DCA CONTROL GROUPS"
                : "FCC CONSOLE"}
          </span>
          <small>
            {state.sof
              ? "Input & AUX faders control sends"
              : "Input channels → buses → Main LR"}
          </small>
          {state.sof && (
            <button onClick={() => dispatch({ type: "sof" })}>
              EXIT SOF ×
            </button>
          )}
        </div>
        <div className="surface-scroll">
          <div
            className="surface-inner"
            style={{ minWidth: state.layer === "CH 1–40" ? 2400 : undefined }}
          >
            <div className="upper-surface">
              {state.view === "mix" ? (
                <MixOverview channels={channels} state={state} />
              ) : (
                <>
                  <nav
                    className="editor-nav"
                    aria-label="Selected channel processing"
                  >
                    {editors.map((editor) => (
                      <button
                        key={editor}
                        className={state.editor === editor ? "active" : ""}
                        onClick={() => dispatch({ type: "editor", editor })}
                      >
                        {editor === "Compressor"
                          ? "COMP"
                          : editor.toUpperCase()}
                      </button>
                    ))}
                  </nav>
                  <ProcessingEditor state={state} />
                </>
              )}
            </div>
            <div
              className="channel-bank"
              style={{
                gridTemplateColumns: `repeat(${channels.length}, minmax(58px, 1fr))`,
              }}
            >
              {channels.map((config) => (
                <ChannelStrip key={config.id} config={config} state={state} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <aside className="bus-panel">
        <div className="bus-panel-title">BUS SENDS</div>
        <button
          className={`sof-toggle ${state.sof ? "active" : ""}`}
          aria-pressed={state.sof}
          onClick={() => dispatch({ type: "sof" })}
        >
          SENDS ON
          <br />
          FADERS <span>{state.sof ? "ON" : "OFF"}</span>
        </button>
        <div className="bus-destination">
          <small>SELECTED BUS</small>
          <strong style={{ color: bus.color }}>{bus.name}</strong>
        </div>
        <div className="bus-grid">
          {buses.map((b) => (
            <button
              key={b.id}
              aria-label={`Select bus ${b.name}`}
              aria-pressed={state.selectedBus === b.id}
              className={state.selectedBus === b.id ? "selected-bus" : ""}
              style={
                {
                  borderColor: b.color,
                  "--bus-color": b.color,
                } as React.CSSProperties
              }
              onClick={() => dispatch({ type: "bus", id: b.id })}
            >
              {b.name}
            </button>
          ))}
        </div>
        <button
          className="edit-bus"
          onClick={() =>
            dispatch({ type: "editor", editor: state.editor, id: bus.id })
          }
        >
          EDIT {bus.number} →
        </button>
        <div className="right-master">
          <span>{state.sof ? "BUS MASTER" : "MAIN LR"}</span>
          <ChannelStrip config={state.sof ? bus : main} state={state} />
        </div>
      </aside>
      <footer>
        <span>
          FCC WING TRAINER <b>0.1</b>
        </span>
        <span>
          {state.view === "mix"
            ? "Click a processing tile to open its editor."
            : "HOME shows the selected channel. MIXVIEW returns to the overview."}
        </span>
        <span>Double-click a fader for 0 dB</span>
      </footer>
      {dialog && (
        <div className="modal-backdrop" onClick={() => setDialog(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setDialog(null);
            }}
          >
            <h2 id="dialog-title">
              {dialog === "reset"
                ? "Reset the console?"
                : "FCC console practice"}
            </h2>
            {dialog === "reset" ? (
              <p>
                This restores the starting faders, sends and processing
                settings. Your changes in this session will be cleared.
              </p>
            ) : (
              <>
                <p>
                  Practice layer selection, faders, mute/solo, processing
                  controls and Sends on Faders. This prototype produces no
                  sound. Changes last until you refresh or reset.
                </p>
                <p>
                  Channel names, colors, fader positions and DCA membership
                  follow your supplied screenshots. Processing starts flat or
                  bypassed; the compressor page and unshown IEM mixes are
                  provisional. Group and FX sends start at unity for their
                  associated channels.
                </p>
              </>
            )}
            <div>
              <button autoFocus onClick={() => setDialog(null)}>
                {dialog === "reset" ? "CANCEL" : "CLOSE"}
              </button>
              {dialog === "reset" && (
                <button
                  className="active"
                  onClick={() => {
                    dispatch({ type: "reset" });
                    setDialog(null);
                  }}
                >
                  RESET CONSOLE
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
