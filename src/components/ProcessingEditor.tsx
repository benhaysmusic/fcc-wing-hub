import { CompressorEditor } from "./CompressorEditor";
import { InputEditor } from "./InputEditor";
import { GateEditor } from "./GateEditor";
import { EqEditor } from "./EqEditor";
import { byId, dcaDisplayMembers } from "../mixer/config";
import { dispatch } from "../mixer/store";
import { dcaMuteSources, formatDb } from "../mixer/state";
import type { MixerState, Processing } from "../mixer/types";
export function ProcessingEditor({ state }: { state: MixerState }) {
  const c = byId[state.selectedId],
    p = state.strips[c.id].processing,
    editor = state.editor;
  const patch = (patch: Partial<Processing>) =>
    dispatch({ type: "processing", id: c.id, patch });
  if (c.kind === "dca")
    return (
      <div className="dca-editor">
        <h2>{c.name || c.number} · DCA</h2>
        <p>Control group</p>
        <div className="member-cards">
          {c.members?.length ? (
            dcaDisplayMembers(c).map((id) => (
              <button key={id} onClick={() => dispatch({ type: "select", id })}>
                <b style={{ color: byId[id].color }}>{byId[id].name}</b>
                <span>
                  {byId[id].number} · Fader {formatDb(state.strips[id].faderDb)}{" "}
                  dB
                </span>
                <small>
                  {state.strips[id].muted || dcaMuteSources(state, id).length
                    ? "MUTED"
                    : "ACTIVE"}
                </small>
              </button>
            ))
          ) : (
            <p>No assigned members.</p>
          )}
        </div>
        <p>Member fader positions stay unchanged when this DCA moves.</p>
      </div>
    );
  return (
    <div className="processing-editor">
      {editor === "Gate" ? (
        <GateEditor gate={p.gate} onChange={(gate) => patch({ gate })} />
      ) : editor === "Input" ? (
        <InputEditor channel={c} processing={p} onChange={patch} />
      ) : editor === "EQ" ? (
        <EqEditor processing={p} onChange={patch} />
      ) : (
        <CompressorEditor
          compressor={p.compressor}
          onChange={(compressor) => patch({ compressor })}
        />
      )}
    </div>
  );
}
