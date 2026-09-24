import { useState, type CSSProperties, type PointerEvent } from "react";
import type { EqBand, Processing } from "../mixer/types";
import { eqResponseDb, eqFrequencyX, eqXFrequency } from "../mixer/eq";
const labels = ["L", "1", "2", "3", "4", "H"];
const frequencies = [
  20, 40, 60, 100, 200, 300, 400, 600, 1000, 2000, 3000, 4000, 6000, 10000,
  20000,
];
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const hz = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(2)}k Hz` : `${v.toFixed(1)} Hz`;
function Slider({
  label,
  caption,
  value,
  min,
  max,
  step = 0.1,
  color,
  text,
  change,
  log = false,
}: {
  label: string;
  caption: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  color: string;
  text: string;
  change: (v: number) => void;
  log?: boolean;
}) {
  const position = log
    ? (Math.log(value / min) / Math.log(max / min)) * 1000
    : value;
  return (
    <label
      className="wing-eq-slider"
      style={{ "--eq-control-color": color } as CSSProperties}
    >
      <span>
        {caption}
        <output>{text}</output>
      </span>
      <input
        aria-label={label}
        aria-valuetext={text}
        type="range"
        min={log ? 0 : min}
        max={log ? 1000 : max}
        step={log ? 1 : step}
        value={position}
        onChange={(e) =>
          change(
            log
              ? Math.round(
                  min * Math.pow(max / min, +e.target.value / 1000) * 10,
                ) / 10
              : +e.target.value,
          )
        }
      />
    </label>
  );
}
export function EqEditor({
  processing: p,
  onChange,
}: {
  processing: Processing;
  onChange: (patch: Partial<Processing>) => void;
}) {
  const [selected, setSelected] = useState(0);
  const band = p.bands[selected];
  const updateBand = (index: number, patch: Partial<EqBand>) =>
    onChange({
      bands: p.bands.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    });
  const y = (gain: number) => 150 - (gain / 18) * 130;
  const points = Array.from(
    { length: 501 },
    (_, i) =>
      `${i ? "L" : "M"}${i * 2} ${clamp(y(eqResponseDb(p, eqXFrequency(i * 2), true)), 0, 300)}`,
  ).join(" ");
  const drag = (event: PointerEvent<SVGCircleElement>, index: number) => {
    if (event.type === "pointerdown") {
      event.currentTarget.setPointerCapture(event.pointerId);
      setSelected(index);
      return;
    }
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = event.currentTarget.ownerSVGElement!.getBoundingClientRect();
    updateBand(index, {
      frequency:
        Math.round(
          eqXFrequency(((event.clientX - rect.left) / rect.width) * 1000) * 10,
        ) / 10,
      gain:
        Math.round(
          clamp(
            ((150 - ((event.clientY - rect.top) / rect.height) * 300) / 130) *
              18,
            -15,
            15,
          ) * 10,
        ) / 10,
    });
  };
  return (
    <div className="wing-eq">
      <div className="wing-eq-toolbar">
        <button
          className={p.eqEnabled ? "on" : ""}
          aria-label="EQ enabled"
          aria-pressed={p.eqEnabled}
          onClick={() => onChange({ eqEnabled: !p.eqEnabled })}
        >
          {p.eqEnabled ? "ON" : "OFF"}
        </button>
        <div className="wing-eq-model">
          <small>EQ MODEL</small>
          <span>WING EQ</span>
        </div>
        <div className="wing-eq-mix">
          <span>
            MIX <b>100 %</b>
          </span>
          <div />
        </div>
        <span className="wing-eq-fixed freeze">FREEZE</span>
        <div className="wing-eq-filter-label">
          <small>FILTER</small>
          <span>LC/HC/MAX</span>
        </div>
        <span className="wing-eq-fixed">↻ RESET</span>
      </div>
      <div className="wing-eq-body">
        <div className="wing-eq-graph">
          {!p.eqEnabled && (
            <span className="eq-bypass-label">
              EQ BYPASSED · SETTINGS PREVIEW
            </span>
          )}
          <svg
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
            aria-label="EQ control curve"
          >
            {frequencies.map((f) => (
              <path
                key={f}
                d={`M${eqFrequencyX(f)} 0V300`}
                stroke="#363636"
                strokeWidth="1"
              />
            ))}
            {[0, 50, 100, 150, 200, 250, 300].map((v) => (
              <path
                key={v}
                d={`M0 ${v}H1000`}
                stroke={v === 150 ? "#999" : "#333"}
                strokeWidth="1"
              />
            ))}
            <path d={`${points}L1000 150L0 150Z`} fill="#c5a95055" />
            <path
              data-testid="eq-response"
              d={points}
              fill="none"
              stroke="#dfc56b"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
            {p.bands.map((b, i) => (
              <g key={i}>
                <path
                  d={`M${eqFrequencyX(b.frequency)} 28V270`}
                  stroke={i === selected ? "#8994e0" : "#666"}
                  strokeWidth="1.5"
                />
                <text
                  x={eqFrequencyX(b.frequency)}
                  y="17"
                  textAnchor="middle"
                  fill="#ddd"
                  fontSize="15"
                >
                  {labels[i]}
                </text>
                <circle
                  className="wing-eq-handle"
                  aria-label={`Drag EQ band ${labels[i]}`}
                  cx={eqFrequencyX(b.frequency)}
                  cy={y(b.gain)}
                  r="9"
                  fill="transparent"
                  stroke={i === selected ? "#eee" : "#aaa"}
                  strokeWidth="1.5"
                  onPointerDown={(e) => drag(e, i)}
                  onPointerMove={(e) => drag(e, i)}
                  onDoubleClick={() => updateBand(i, { gain: 0 })}
                />
              </g>
            ))}
          </svg>
          <div className="wing-eq-frequency-labels">
            {frequencies.map((f) => (
              <span key={f} style={{ left: `${eqFrequencyX(f) / 10}%` }}>
                {f >= 1000 ? `${f / 1000}K` : f}
              </span>
            ))}
          </div>
        </div>
        <div className="wing-eq-side">
          <div className="wing-eq-bands">
            {labels.map((label, i) => (
              <button
                key={label}
                aria-label={`EQ band ${label}`}
                aria-pressed={selected === i}
                className={selected === i ? "chosen" : ""}
                onClick={() => setSelected(i)}
              >
                <span>{p.bands[i].shape === "shelf" ? "⑂" : label}</span>
                {p.bands[i].shape === "shelf" ? "SHV" : "PEQ"}
              </button>
            ))}
            <div className="wing-eq-cuts">
              {(["lowCut", "highCut"] as const).map((key, i) => (
                <button
                  key={key}
                  className={p[key] ? "on" : ""}
                  aria-label={i ? "High cut" : "Low cut"}
                  aria-pressed={p[key]}
                  onClick={() => onChange({ [key]: !p[key] })}
                >
                  <svg viewBox="0 0 30 30" aria-hidden="true">
                    <rect x="2" y="2" width="26" height="26" fill="none" />
                    <path
                      d={i ? "M6 8H19L25 23" : "M6 23L12 8H24"}
                      fill="none"
                    />
                  </svg>
                  <span>{i ? "HICUT" : "LOCUT"}</span>
                </button>
              ))}
            </div>
            <span className="wing-eq-fixed band-solo">BAND SOLO</span>
          </div>
          <div className="wing-eq-parameters">
            <button
              className="wing-eq-mode"
              aria-label="Low band mode"
              onClick={() => {
                setSelected(0);
                updateBand(0, {
                  shape: p.bands[0].shape === "shelf" ? "bell" : "shelf",
                });
              }}
            >
              <small>LO BAND</small>
              <span>
                {p.bands[0].shape === "shelf" ? "SHELVING" : "PARAMETRIC"}{" "}
                <b>⋮</b>
              </span>
            </button>
            <Slider
              label="Gain"
              caption={`GAIN ${labels[selected]}`}
              value={band.gain}
              min={-15}
              max={15}
              color="#eee"
              text={`${band.gain > 0 ? "+" : ""}${band.gain.toFixed(1)} dB`}
              change={(gain) => updateBand(selected, { gain })}
            />
            <div className="wing-eq-q">
              {band.shape === "bell" && (
                <Slider
                  label="Q"
                  caption={`Q ${labels[selected]}`}
                  value={band.q}
                  min={0.2}
                  max={10}
                  step={0.01}
                  color="#8acb66"
                  text={band.q.toFixed(2)}
                  change={(q) => updateBand(selected, { q })}
                />
              )}
            </div>
            <Slider
              label="Frequency"
              caption={`FREQ ${labels[selected]}`}
              value={band.frequency}
              min={20}
              max={20000}
              log
              color="#8994e0"
              text={hz(band.frequency)}
              change={(frequency) => updateBand(selected, { frequency })}
            />
            <button
              className="wing-eq-mode"
              aria-label="High band mode"
              onClick={() => {
                setSelected(5);
                updateBand(5, {
                  shape: p.bands[5].shape === "shelf" ? "bell" : "shelf",
                });
              }}
            >
              <small>HI BAND</small>
              <span>
                {p.bands[5].shape === "shelf" ? "SHELVING" : "PARAMETRIC"}{" "}
                <b>⋮</b>
              </span>
            </button>
            <Slider
              label="Low cut frequency"
              caption="LC FREQ"
              value={p.lowCutHz}
              min={20}
              max={2000}
              log
              color="#8994e0"
              text={hz(p.lowCutHz)}
              change={(lowCutHz) => onChange({ lowCutHz })}
            />
            <Slider
              label="High cut frequency"
              caption="HC FREQ"
              value={p.highCutHz}
              min={1000}
              max={20000}
              log
              color="#8994e0"
              text={hz(p.highCutHz)}
              change={(highCutHz) => onChange({ highCutHz })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
