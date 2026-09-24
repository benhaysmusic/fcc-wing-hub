import type { CSSProperties } from "react";
export function DynamicsControl({
  label,
  caption = label.toUpperCase(),
  value,
  min,
  max,
  step = 1,
  text,
  color = "#eee",
  onChange,
}: {
  label: string;
  caption?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  text: string;
  color?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label
      className="gate-control"
      style={{ "--gate-color": color } as CSSProperties}
    >
      <span>
        {caption}
        <output>{text}</output>
      </span>
      <input
        aria-label={label}
        aria-valuetext={text}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  );
}
