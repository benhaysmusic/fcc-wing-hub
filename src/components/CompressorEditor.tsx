import { DynamicsControl } from "./DynamicsControl";
import type { PointerEvent } from "react";
import type { Processing } from "../mixer/types";
import { compressorOutput } from "../mixer/compressor";
type Compressor = Processing["compressor"];
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
export function CompressorEditor({
  compressor: g,
  onChange,
}: {
  compressor: Compressor;
  onChange: (compressor: Compressor) => void;
}) {
  const set = (patch: Partial<Compressor>) => onChange({ ...g, ...patch });
  const tx = (db: number) => 42 + ((db + 60) / 60) * 330;
  const ty = (db: number) => 12 - (db / 60) * 258;
  const thresholdY = ty(g.threshold);
  const curve = Array.from({ length: 241 }, (_, i) => {
    const input = -60 + i / 4;
    return `${i ? "L" : "M"}${tx(input)},${ty(compressorOutput(input, g.threshold, g.ratio, g.knee))}`;
  }).join(" ");
  const attackX = 190 - (Math.log1p(g.attack) / Math.log1p(200)) * 160;
  const holdX = 190 + (Math.log1p(g.hold) / Math.log1p(1000)) * 135;
  const releaseX =
    holdX + 15 + (Math.log1p(g.release) / Math.log1p(1500)) * 145;
  const drag = (
    e: PointerEvent<SVGElement>,
    field: "threshold" | "attack" | "hold" | "release",
  ) => {
    if (e.type === "pointerdown")
      e.currentTarget.setPointerCapture(e.pointerId);
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 500;
    if (field === "threshold")
      set({
        threshold:
          Math.round(
            clamp(
              (-(((e.clientY - box.top) / box.height) * 282 - 12) / 258) * 60,
              -60,
              0,
            ) * 2,
          ) / 2,
      });
    else {
      const normalized =
        field === "attack"
          ? (190 - x) / 160
          : field === "hold"
            ? (x - 190) / 135
            : (x - holdX - 15) / 145;
      const max = field === "attack" ? 200 : field === "hold" ? 1000 : 1500;
      set({
        [field]: Math.round(
          Math.expm1(clamp(normalized, 0, 1) * Math.log1p(max)),
        ),
      });
    }
  };
  const handle = (
    field: "attack" | "hold" | "release",
    x: number,
    y: number,
  ) => (
    <circle
      className="gate-handle"
      aria-label={`Drag ${field}`}
      cx={x}
      cy={y}
      r="10"
      onPointerDown={(e) => drag(e, field)}
      onPointerMove={(e) => drag(e, field)}
    />
  );
  return (
    <div className="gate-editor compressor-editor">
      <div className="gate-toolbar">
        <button
          aria-label="Compressor enabled"
          aria-pressed={g.enabled}
          className={g.enabled ? "gate-on" : ""}
          onClick={() => set({ enabled: !g.enabled })}
        >
          {g.enabled ? "ON" : "OFF"}
        </button>
        <div className="gate-model">
          <small>DYNAMICS MODEL</small>
          <span>WING COMPRESSOR</span>
        </div>
        <div className="compressor-mix">
          <span>
            MIX <b>100 %</b>
          </span>
          <i />
        </div>
        <DynamicsControl
          label="Makeup"
          caption="GAIN"
          value={g.makeup}
          min={0}
          max={24}
          step={0.5}
          text={`${g.makeup.toFixed(1)} dB`}
          onChange={(makeup) => set({ makeup })}
        />
        <div className="gate-key">
          <small>KEY SOURCE</small>
          <span>SELF</span>
        </div>
        <span className="compressor-fixed">SOLO</span>
        <div className="gate-filter">
          <small>XOVER MODE</small>
          <span>FLAT</span>
        </div>
        <span className="compressor-fixed">SOLO</span>
        <div className="gate-filter">
          <small>KEY FILTER</small>
          <span>FLAT</span>
        </div>
      </div>
      <div className="gate-body">
        <div className="gate-transfer">
          <svg
            viewBox="0 0 420 282"
            preserveAspectRatio="none"
            aria-label="Compressor transfer curve"
          >
            <defs>
              <pattern
                id="compressor-dots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r=".7" fill="#3c3c3c" />
              </pattern>
              <clipPath id="compressor-clip">
                <rect x="40" y="10" width="338" height="260" />
              </clipPath>
            </defs>
            <rect
              x="40"
              y="10"
              width="338"
              height="260"
              fill="url(#compressor-dots)"
            />
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i}>
                <text x="29" y={ty(-i * 10) + 3} textAnchor="end">
                  {i === 0 ? "0" : -i * 10}
                </text>
                <path
                  d={`M34 ${ty(-i * 10)}h5 M382 ${ty(-i * 10)}h8`}
                  stroke="#555"
                />
              </g>
            ))}
            <path
              data-testid="compressor-curve"
              d={curve}
              clipPath="url(#compressor-clip)"
              fill="none"
              stroke="#7d8ddb"
              strokeWidth="2.5"
            />
            <path d={`M40 ${thresholdY}H406`} stroke="#888" strokeWidth="2" />
            <g
              className="gate-threshold-handle"
              aria-label="Drag compressor threshold"
              onPointerDown={(e) => drag(e, "threshold")}
              onPointerMove={(e) => drag(e, "threshold")}
            >
              <circle cx="402" cy={thresholdY} r="14" fill="#eee" />
              <path
                d={`M395 ${thresholdY - 4}h14 M395 ${thresholdY}h14 M395 ${thresholdY + 4}h14`}
                stroke="#111"
                strokeWidth="1.7"
              />
            </g>
          </svg>
        </div>
        <div className="gate-right">
          <div className="compressor-envelope-options">
            <span>DETECTOR</span>
            <span>PEAK</span>
            <b>RMS</b>
            <span>ENVELOPE</span>
            <span>LIN</span>
            <b>LOG</b>
            <span>AUTO ENV</span>
            <b>OFF</b>
            <span>ON</span>
          </div>
          <svg
            className="gate-envelope"
            viewBox="0 0 500 160"
            preserveAspectRatio="none"
            aria-label="Compressor envelope"
          >
            <rect width="500" height="160" fill="url(#compressor-dots)" />
            <path
              d={`M190 0V160 M${holdX} 0V160`}
              stroke="#555"
              strokeWidth="2"
            />
            <path
              d={`M${attackX} 159 L190 32 H${holdX} L${releaseX} 159Z`}
              fill="#8acb6633"
              stroke="#8acb66"
              strokeWidth="3"
            />
            {handle("attack", attackX, 132)}
            {handle("hold", holdX, 32)}
            {handle("release", releaseX, 132)}
          </svg>
          <div className="gate-row gate-timing">
            {(["attack", "hold", "release"] as const).map((key) => (
              <DynamicsControl
                key={key}
                label={key[0].toUpperCase() + key.slice(1)}
                value={g[key]}
                min={0}
                max={key === "attack" ? 200 : key === "hold" ? 1000 : 1500}
                text={`${g[key]} ms`}
                color="#8acb66"
                onChange={(v) => set({ [key]: v })}
              />
            ))}
          </div>
          <div className="gate-row">
            <DynamicsControl
              label="Threshold"
              caption="THR"
              value={g.threshold}
              min={-60}
              max={0}
              step={0.5}
              text={`${g.threshold.toFixed(1)} dB`}
              onChange={(threshold) => set({ threshold })}
            />
            <DynamicsControl
              label="Ratio"
              value={g.ratio}
              min={1}
              max={20}
              step={0.1}
              text={`${g.ratio}:1`}
              color="#e0cb58"
              onChange={(ratio) => set({ ratio })}
            />
            <DynamicsControl
              label="Knee"
              value={g.knee}
              min={0}
              max={5}
              text={`${g.knee}`}
              color="#e0cb58"
              onChange={(knee) => set({ knee })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
