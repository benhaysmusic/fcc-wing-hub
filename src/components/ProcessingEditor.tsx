import { InputEditor } from "./InputEditor";
import { GateEditor } from "./GateEditor";
import { EqEditor } from "./EqEditor";
import { byId, dcaDisplayMembers } from "../mixer/config";
import { dispatch } from "../mixer/store";
import { dcaMuteSources, formatDb } from "../mixer/state";
import type { MixerState, Processing } from "../mixer/types";
function Parameter({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="parameter">
      <span>
        {label}
        <output>
          {Number.isInteger(value) ? value : value.toFixed(1)} {unit}
        </output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  );
}
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
  const enabled =
    editor === "EQ"
      ? p.eqEnabled
      : editor === "Gate"
        ? p.gate.enabled
        : editor === "Compressor"
          ? p.compressor.enabled
          : true;
  function toggle() {
    if (editor === "EQ") patch({ eqEnabled: !enabled });
    else if (editor === "Gate")
      patch({ gate: { ...p.gate, enabled: !enabled } });
    else if (editor === "Compressor")
      patch({ compressor: { ...p.compressor, enabled: !enabled } });
  }
  const dyn = p.compressor;
  const changeDyn = (key: string, value: number) =>
    patch({ compressor: { ...p.compressor, [key]: value } });
  return (
    <div className="processing-editor">
      {editor === "Gate" ? (
        <GateEditor gate={p.gate} onChange={(gate) => patch({ gate })} />
      ) : editor === "Input" ? (
        <InputEditor channel={c} processing={p} onChange={patch} />
      ) : editor === "EQ" ? (
        <EqEditor processing={p} onChange={patch} />
      ) : (
        <>
          <div className="processor-bar">
            <button
              className={enabled ? "active" : ""}
              onClick={toggle}
              aria-pressed={enabled}
              aria-label={`${editor} enabled`}
            >
              {enabled ? "ON" : "OFF"}
            </button>
            <b>WING COMPRESSOR</b>
            <span>SELECTED CHANNEL</span>
            <small>
              {c.number} / {c.name}
            </small>
          </div>
          <div className="dynamics-editor">
            <div className="dynamics-plot">
              <svg
                viewBox="0 0 300 260"
                preserveAspectRatio="none"
                aria-label={`${editor} transfer curve`}
              >
                <path className="grid-line" d="M0 130 H300 M150 0 V260" />
                <path
                  className="transfer"
                  d={`M0 260 L${((dyn.threshold + 90) / 90) * 300} ${(-dyn.threshold / 90) * 260} L300 ${(-dyn.threshold / 90) * 260 * (1 - 1 / dyn.ratio)}`}
                />
              </svg>
              <span>−90 dB</span>
              <span>0 dB</span>
            </div>
            <div className="dynamics-controls">
              <div className="envelope">
                <svg viewBox="0 0 500 100" preserveAspectRatio="none">
                  <path
                    d={`M20 100 L${30 + dyn.attack * 0.5} 20 L${130 + dyn.hold * 0.2} 20 L${200 + dyn.release * 0.15} 100`}
                  />
                </svg>
              </div>
              <div className="parameter-grid">
                <Parameter
                  label="Threshold"
                  value={dyn.threshold}
                  min={-90}
                  max={0}
                  step={0.1}
                  unit="dB"
                  onChange={(v) => changeDyn("threshold", v)}
                />
                <Parameter
                  label="Ratio"
                  value={dyn.ratio}
                  min={1}
                  max={20}
                  step={0.1}
                  unit=":1"
                  onChange={(v) => changeDyn("ratio", v)}
                />
                <Parameter
                  label="Attack"
                  value={dyn.attack}
                  min={0}
                  max={200}
                  unit="ms"
                  onChange={(v) => changeDyn("attack", v)}
                />
                <Parameter
                  label="Release"
                  value={dyn.release}
                  min={10}
                  max={1500}
                  unit="ms"
                  onChange={(v) => changeDyn("release", v)}
                />
                <Parameter
                  label="Makeup"
                  value={dyn.makeup}
                  min={0}
                  max={24}
                  step={0.1}
                  unit="dB"
                  onChange={(v) => changeDyn("makeup", v)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
