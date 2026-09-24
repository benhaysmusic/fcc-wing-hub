import { dbToPosition, formatDb, positionToDb } from "../mixer/state";
export function Fader({
  value,
  onChange,
  label,
  send = false,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  send?: boolean;
}) {
  const position = dbToPosition(value);
  return (
    <div className={`fader ${send ? "send-fader" : ""}`}>
      <div className="fader-scale" aria-hidden="true">
        {[10, 0, -10, -20, -40, -60].map((db) => (
          <span key={db} style={{ bottom: `${dbToPosition(db)}%` }}>
            {db}
          </span>
        ))}
      </div>
      <div className="fader-track">
        <div className="fader-fill" style={{ height: `${position}%` }} />
        <output style={{ bottom: `${position}%` }}>{formatDb(value)}</output>
      </div>
      <input
        aria-label={label}
        aria-valuetext={`${formatDb(value)} dB`}
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={position}
        onChange={(e) => onChange(positionToDb(+e.target.value))}
        onDoubleClick={() => onChange(0)}
      />
      <div className="silent-meter" aria-hidden="true" />
    </div>
  );
}
