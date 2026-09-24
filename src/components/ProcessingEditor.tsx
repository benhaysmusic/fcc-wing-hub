import { useState } from "react";
import { byId } from "../mixer/config";
import { dispatch } from "../mixer/store";
import { effectiveDb, effectiveMute, formatDb } from "../mixer/state";
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
  const [band, setBand] = useState(0);
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
            c.members.map((id) => (
              <button key={id} onClick={() => dispatch({ type: "select", id })}>
                <b style={{ color: byId[id].color }}>{byId[id].name}</b>
                <span>{formatDb(effectiveDb(state, id))} dB</span>
                <small>{effectiveMute(state, id) ? "MUTED" : "ACTIVE"}</small>
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
  const dyn = editor === "Gate" ? p.gate : p.compressor;
  const changeDyn = (key: string, value: number) =>
    patch(
      editor === "Gate"
        ? { gate: { ...dyn, [key]: value } }
        : { compressor: { ...dyn, [key]: value } },
    );
  const updateBand = (key: string, value: number) =>
    patch({
      bands: p.bands.map((b, i) => (i === band ? { ...b, [key]: value } : b)),
    });
  return (
    <div className="processing-editor">
      <div className="processor-bar">
        {editor !== "Input" && (
          <button
            className={enabled ? "active" : ""}
            onClick={toggle}
            aria-pressed={enabled}
            aria-label={`${editor} enabled`}
          >
            {enabled ? "ON" : "OFF"}
          </button>
        )}
        <b>
          {editor === "Input"
            ? "CHANNEL INPUT"
            : editor === "Compressor"
              ? "WING COMPRESSOR"
              : `WING ${editor.toUpperCase()}`}
        </b>
        <span>
          {editor === "Input" ? "TRIM & BALANCE" : "SELECTED CHANNEL"}
        </span>
        <small>
          {c.number} / {c.name}
        </small>
      </div>
      {editor === "Input" ? (
        <div className="input-editor">
          <div className="input-source">
            <h3>CHANNEL INPUT</h3>
            <div style={{ borderColor: c.color }}>
              <b style={{ background: c.color }}>{c.source}</b>
              <span>◉</span>
              <small>
                {c.number} · {c.name || "UNASSIGNED"}
              </small>
            </div>
            <p>Fixed FCC input</p>
          </div>
          <div className="trim-controls">
            <h3>TRIM & BALANCE</h3>
            <div className="trim-face">
              <div style={{ bottom: `${((p.trim + 18) / 36) * 100}%` }} />
              <strong>
                {p.trim.toFixed(1)} <small>dB</small>
              </strong>
            </div>
            <Parameter
              label="Trim"
              value={p.trim}
              min={-18}
              max={18}
              step={0.1}
              unit="dB"
              onChange={(trim) => patch({ trim })}
            />
            <Parameter
              label="Balance"
              value={p.pan}
              min={-100}
              max={100}
              unit="%"
              onChange={(pan) => patch({ pan })}
            />
          </div>
          <div className="filter-controls">
            <h3>FILTER</h3>
            <button
              className={p.lowCut ? "active" : ""}
              onClick={() => patch({ lowCut: !p.lowCut })}
              aria-pressed={p.lowCut}
            >
              LOW CUT
            </button>
            <Parameter
              label="Low cut frequency"
              value={p.lowCutHz}
              min={20}
              max={400}
              unit="Hz"
              onChange={(lowCutHz) => patch({ lowCutHz })}
            />
            <button
              className={p.invert ? "active" : ""}
              onClick={() => patch({ invert: !p.invert })}
              aria-pressed={p.invert}
            >
              Ø INVERT
            </button>
          </div>
        </div>
      ) : editor === "EQ" ? (
        <div className="eq-editor">
          <div className="eq-plot">
            <svg
              viewBox="0 0 800 280"
              preserveAspectRatio="none"
              aria-label="EQ control curve"
            >
              <path className="zero-line" d="M0 140 H800" />
              {Array.from({ length: 9 }, (_, i) => (
                <path key={i} className="grid-line" d={`M${i * 100} 0 V280`} />
              ))}
              <path
                className="eq-curve"
                opacity={enabled ? 1 : 0.4}
                d={
                  "M" +
                  Array.from({ length: 161 }, (_, i) => {
                    const freq = 20 * Math.pow(1000, i / 160);
                    const gain = p.bands.reduce(
                      (sum, b) =>
                        sum +
                        b.gain *
                          Math.exp(
                            -Math.pow(Math.log2(freq / b.frequency) * b.q, 2) /
                              2,
                          ),
                      0,
                    );
                    return `${i * 5},${140 - gain * 6}`;
                  }).join(" L")
                }
              />
              {p.bands.map((b, i) => (
                <circle
                  key={i}
                  className={i === band ? "chosen" : ""}
                  cx={(Math.log(b.frequency / 20) / Math.log(1000)) * 800}
                  cy={140 - b.gain * 6}
                  r="9"
                  onClick={() => setBand(i)}
                />
              ))}
            </svg>
            <div className="frequency-labels">
              {["20", "60", "200", "600", "2K", "6K", "20K"].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
          <div className="eq-controls">
            <div className="band-tabs">
              {["L", "1", "2", "3", "4", "H"].map((b, i) => (
                <button
                  className={band === i ? "active" : ""}
                  key={b}
                  aria-label={`EQ band ${b}`}
                  onClick={() => setBand(i)}
                >
                  {b}
                </button>
              ))}
            </div>
            <Parameter
              label="Frequency"
              value={p.bands[band].frequency}
              min={20}
              max={20000}
              unit="Hz"
              onChange={(v) => updateBand("frequency", v)}
            />
            <Parameter
              label="Gain"
              value={p.bands[band].gain}
              min={-15}
              max={15}
              step={0.1}
              unit="dB"
              onChange={(v) => updateBand("gain", v)}
            />
            <Parameter
              label="Q"
              value={p.bands[band].q}
              min={0.2}
              max={10}
              step={0.1}
              onChange={(v) => updateBand("q", v)}
            />
          </div>
        </div>
      ) : (
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
                d={
                  editor === "Gate"
                    ? `M0 260 L${((dyn.threshold + 90) / 90) * 300} ${(-dyn.threshold / 90) * 260} L300 0`
                    : `M0 260 L${((dyn.threshold + 90) / 90) * 300} ${(-dyn.threshold / 90) * 260} L300 ${(-dyn.threshold / 90) * 260 * (1 - 1 / dyn.ratio)}`
                }
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
              {editor === "Gate" ? (
                <>
                  <Parameter
                    label="Hold"
                    value={dyn.hold}
                    min={0}
                    max={1000}
                    unit="ms"
                    onChange={(v) => changeDyn("hold", v)}
                  />
                  <Parameter
                    label="Range"
                    value={dyn.range}
                    min={0}
                    max={80}
                    unit="dB"
                    onChange={(v) => changeDyn("range", v)}
                  />
                </>
              ) : (
                <Parameter
                  label="Makeup"
                  value={dyn.makeup}
                  min={0}
                  max={24}
                  step={0.1}
                  unit="dB"
                  onChange={(v) => changeDyn("makeup", v)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
