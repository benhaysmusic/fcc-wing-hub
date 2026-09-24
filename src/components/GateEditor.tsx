import { DynamicsControl } from "./DynamicsControl";
import type { PointerEvent } from "react";
import type { Processing } from "../mixer/types";
import { gateOutput } from "../mixer/gate";
type Gate = Processing["gate"];
const ratios = [1, 1.5, 2, 3, 4, 8, 20];
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
export function GateEditor({
  gate: g,
  onChange,
}: {
  gate: Gate;
  onChange: (gate: Gate) => void;
}) {
  const set = (patch: Partial<Gate>) => onChange({ ...g, ...patch });
  const tx = (db: number) => 42 + ((db + 90) / 90) * 330;
  const ty = (db: number) => 12 - (db / 90) * 258;
  const thresholdY = ty(g.threshold);
  const curve = Array.from({ length: 361 }, (_, i) => {
    const input = -90 + i / 4;
    return `${i ? "L" : "M"}${tx(input)},${ty(gateOutput(input, g.threshold, g.ratio, g.range, g.hardGate))}`;
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
              (-(((e.clientY - box.top) / box.height) * 282 - 12) / 258) * 90,
              -90,
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
    <div className="gate-editor">
      <div className="gate-toolbar">
        <button
          aria-label="Gate enabled"
          aria-pressed={g.enabled}
          className={g.enabled ? "gate-on" : ""}
          onClick={() => set({ enabled: !g.enabled })}
        >
          {g.enabled ? "ON" : "OFF"}
        </button>
        <div className="gate-model">
          <small>GATE MODEL</small>
          <span>GATE/EXPANDER</span>
        </div>
        <DynamicsControl
          label="Accent"
          value={g.accent}
          min={0}
          max={100}
          text={`${g.accent} %`}
          onChange={(accent) => set({ accent })}
        />
        <div className="gate-key">
          <small>KEY SOURCE</small>
          <span>SELF</span>
        </div>
        <button
          aria-pressed={g.keySolo}
          onClick={() => set({ keySolo: !g.keySolo })}
        >
          KEY SOLO
        </button>
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
            aria-label="Gate expansion curve"
          >
            <defs>
              <pattern
                id="gate-dots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r=".7" fill="#3c3c3c" />
              </pattern>
              <clipPath id="gate-clip">
                <rect x="40" y="10" width="338" height="260" />
              </clipPath>
            </defs>
            <rect
              x="40"
              y="10"
              width="338"
              height="260"
              fill="url(#gate-dots)"
            />
            {Array.from({ length: 9 }, (_, i) => (
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
              data-testid="gate-curve"
              d={curve}
              clipPath="url(#gate-clip)"
              fill="none"
              stroke="#7d8ddb"
              strokeWidth="2.5"
            />
            <path d={`M40 ${thresholdY}H406`} stroke="#888" strokeWidth="2" />
            <g
              className="gate-threshold-handle"
              aria-label="Drag gate threshold"
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
          <h3>ENVELOPE</h3>
          <svg
            className="gate-envelope"
            viewBox="0 0 500 160"
            preserveAspectRatio="none"
            aria-label="Gate envelope"
          >
            <rect width="500" height="160" fill="url(#gate-dots)" />
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
              min={-90}
              max={0}
              step={0.5}
              text={`${g.threshold.toFixed(1)} dB`}
              onChange={(threshold) => set({ threshold })}
            />
            <DynamicsControl
              label="Ratio"
              value={
                g.hardGate
                  ? ratios.length
                  : Math.max(0, ratios.indexOf(g.ratio))
              }
              min={0}
              max={ratios.length}
              text={g.hardGate ? "gate" : `1:${g.ratio}`}
              color="#e0cb58"
              onChange={(i) =>
                set({
                  hardGate: i === ratios.length,
                  ratio: ratios[Math.min(i, ratios.length - 1)],
                })
              }
            />
            <DynamicsControl
              label="Range"
              value={g.range}
              min={0}
              max={80}
              step={0.5}
              text={`${g.range.toFixed(1)} dB`}
              color="#7d8ddb"
              onChange={(range) => set({ range })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
