import type { Processing, StripConfig } from "../mixer/types";

const signed = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}`;
function FilterIcon({ high = false }: { high?: boolean }) {
  return (
    <svg viewBox="0 0 30 30" aria-hidden="true">
      <rect x="2" y="2" width="26" height="26" fill="none" />
      <path d={high ? "M6 8H19L25 23" : "M6 23L12 8H24"} fill="none" />
    </svg>
  );
}
export function InputEditor({
  channel,
  processing: p,
  onChange,
}: {
  channel: StripConfig;
  processing: Processing;
  onChange: (patch: Partial<Processing>) => void;
}) {
  const trimY = 50 - (p.trim / 36) * 100;
  const balanceX = 50 + (p.inputBalanceDb / 18) * 100;
  const hardwareInput =
    channel.kind === "input" && channel.source !== "UNASSIGNED";
  return (
    <div className="wing-input">
      <section className="wing-source">
        <h3>CHANNEL INPUT</h3>
        <div className="input-main-alt" aria-label="Fixed main input">
          <span>MAIN</span>
          <span>ALT</span>
        </div>
        <div className="input-source-columns">
          <div className="input-main-source">
            <div className="input-source-card">
              <div className="source-color" />
              <div className="source-symbols">
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <circle cx="20" cy="22" r="15" />
                  <path d="M16 7V3H24V7" />
                  {[
                    [13, 19],
                    [27, 19],
                    [20, 28],
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3" />
                  ))}
                </svg>
                <div>
                  <span className="source-ring">○</span>
                  <small className={p.phantom48V ? "phantom-lit" : ""}>
                    48V
                  </small>
                  <small>MUTE</small>
                </div>
              </div>
              <span className="input-source-name">{channel.source}</span>
            </div>
            <div className="input-preamp">
              {hardwareInput ? (
                <div className="preamp-fader">
                  <div className="preamp-slot" />
                  <div
                    className="preamp-yellow"
                    style={{ height: `${((p.inputGainDb + 10) / 70) * 100}%` }}
                  />
                  <output
                    style={{
                      bottom: `calc(${((p.inputGainDb + 10) / 70) * 100}% - 8px)`,
                    }}
                  >
                    {p.inputGainDb.toFixed(1)} dB
                  </output>
                  <input
                    aria-label="Input gain"
                    aria-valuetext={`${p.inputGainDb.toFixed(1)} dB`}
                    type="range"
                    min="-10"
                    max="60"
                    step="2.5"
                    value={p.inputGainDb}
                    onChange={(e) => onChange({ inputGainDb: +e.target.value })}
                  />
                </div>
              ) : (
                <span className="input-fixed-source">
                  {channel.kind.toUpperCase()}
                </span>
              )}
              {hardwareInput ? (
                <button
                  className={`input-phantom ${p.phantom48V ? "on" : ""}`}
                  aria-label="48V phantom power"
                  aria-pressed={p.phantom48V}
                  onClick={() => onChange({ phantom48V: !p.phantom48V })}
                >
                  <b>⏻</b>
                  <span>48V</span>
                </button>
              ) : (
                <div className="input-phantom fixed">
                  <b>⏻</b>
                  <span>48V</span>
                </div>
              )}
            </div>
          </div>
          <div className="input-alt-source">
            <div className="input-empty-card">
              <div />
              <span>⊕</span>
            </div>
            <div className="input-select-label">INPUT SELECT</div>
            <div className="input-scope">
              <span>INDIVIDUAL</span>
              <span>GLOBAL</span>
            </div>
          </div>
        </div>
      </section>
      <section className="wing-trim">
        <h3>TRIM &amp; BALANCE</h3>
        <div className="input-trim-body">
          <div className="input-trim-plot">
            <div className="input-trim-readouts">
              <output>TRIM: {signed(p.trim)} dB</output>
              <output>BAL: {signed(p.inputBalanceDb)} dB</output>
            </div>
            <div className="input-plot-area">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-label="Trim and balance response"
              >
                <defs>
                  <pattern
                    id="input-dots"
                    width="8"
                    height="8"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="1" cy="1" r=".25" fill="#414141" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#input-dots)" />
                <path d="M0 50H100" stroke="#555" strokeWidth=".5" />
                <path
                  data-testid="input-trim-response"
                  d={`M0 50 L0 ${trimY + (p.inputBalanceDb / 36) * 100} L100 ${trimY - (p.inputBalanceDb / 36) * 100} L100 50Z`}
                  fill="#aaa8"
                />
                <path
                  d={`M0 ${trimY + (p.inputBalanceDb / 36) * 100} L100 ${trimY - (p.inputBalanceDb / 36) * 100}`}
                  stroke="#eee"
                  strokeWidth=".6"
                />
              </svg>
              {[-18, -12, -6, 0, 6, 12, 18].map((db) => (
                <span
                  key={db}
                  className="input-trim-tick"
                  style={{ top: `${50 - (db / 36) * 100}%` }}
                >
                  {db === 0 ? "0 dB" : db}
                </span>
              ))}
              <div
                className="input-balance-line"
                style={{ left: `${balanceX}%` }}
              />
              <div className="input-trim-handle" style={{ top: `${trimY}%` }}>
                ≡
              </div>
              <input
                className="trim-slider"
                onDoubleClick={() => onChange({ trim: 0 })}
                aria-label="Trim"
                aria-valuetext={`${signed(p.trim)} dB`}
                type="range"
                min="-18"
                max="18"
                step="0.1"
                value={p.trim}
                onChange={(e) => onChange({ trim: +e.target.value })}
              />
            </div>
            <div className="input-balance-scale">
              <div className="input-balance-marks" />
              <div
                className="input-balance-handle"
                style={{ left: `${balanceX}%` }}
              >
                Ⅲ
              </div>
              <input
                onDoubleClick={() => onChange({ inputBalanceDb: 0 })}
                aria-label="Input balance"
                aria-valuetext={`${signed(p.inputBalanceDb)} dB`}
                type="range"
                min="-9"
                max="9"
                step="0.1"
                value={p.inputBalanceDb}
                onChange={(e) => onChange({ inputBalanceDb: +e.target.value })}
              />
              <div className="input-balance-labels">
                <span>-9 dB</span>
                <span>0 dB</span>
                <span>+9 dB</span>
              </div>
            </div>
          </div>
          <div className="input-meter-column">
            <div className="input-meter-scale">
              <span>CLIP</span>
              {[-6, -12, -24, -36, -48, -60].map((n) => (
                <span key={n}>{n}</span>
              ))}
              <span>IN</span>
            </div>
            <div className="input-idle-meter" />
            <div className="input-invert fixed" aria-label="Invert fixed off">
              <b>⊘</b>
              <span>INVERT</span>
            </div>
          </div>
        </div>
      </section>
      <section className="wing-input-right">
        <h3>FILTER</h3>
        <div className="input-filter-buttons">
          {(["lowCut", "highCut"] as const).map((key, i) => (
            <button
              key={key}
              className={p[key] ? "on" : ""}
              aria-label={i ? "High cut" : "Low cut"}
              aria-pressed={p[key]}
              onClick={() => onChange({ [key]: !p[key] })}
            >
              <FilterIcon high={i === 1} />
              <span>{i ? "HICUT" : "LOCUT"}</span>
            </button>
          ))}
          <div className="input-maxer fixed">
            <b>▨</b>
            <span>MAXER</span>
          </div>
        </div>
        <h3>DELAY (POST)</h3>
        <div className="input-delay fixed">
          <div className="input-delay-fader">
            <div className="delay-ticks">
              {[150, 120, 90, 60, 30].map((n) => (
                <span key={n}>{n}</span>
              ))}
              <span>0.1 m</span>
            </div>
            <div className="delay-slot" />
            <output>0.1 m</output>
          </div>
          <div className="input-delay-values">
            <div className="selected">
              METERS<small>0.1 m</small>
            </div>
            <div>
              FEET<small>0.3 ft</small>
            </div>
            <div>
              MS<small>0.3 ms</small>
            </div>
            <div>
              SAMPLES<small>16</small>
            </div>
            <div className="input-delay-off">
              <b>Δt</b>
              <span>DELAY</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
