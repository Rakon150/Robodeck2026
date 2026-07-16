import { useState, useCallback, useMemo } from "react";
import { usePixelStore } from "../store/pixelStore";
import { useTranslation } from "../i18n";

/* ── Catppuccin Mocha tokens ────────────────────────────────── */
const C = {
  base: "#1e1e2e",
  mantle: "#181825",
  surface0: "#313244",
  surface1: "#45475a",
  text: "#cdd6f4",
  subtext: "#a6adc8",
  blue: "#89b4fa",
  green: "#a6e3a1",
  red: "#f38ba8",
  overlay0: "#6c7086",
} as const;

/* ── Inline styles ──────────────────────────────────────────── */
const panel: React.CSSProperties = {
  width: "100%",
  background: C.base,
  borderBottom: `1px solid ${C.surface0}`,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  userSelect: "none",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: C.overlay0,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 8,
};

const section: React.CSSProperties = {
  padding: "16px",
  borderBottom: `1px solid ${C.surface0}`,
};

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
};

const label: React.CSSProperties = {
  fontSize: 12,
  color: C.subtext,
  width: 52,
  flexShrink: 0,
};

const input: React.CSSProperties = {
  flex: 1,
  height: 28,
  padding: "0 8px",
  border: `1px solid ${C.surface1}`,
  borderRadius: 6,
  background: C.mantle,
  color: C.text,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  fontVariantNumeric: "tabular-nums",
};

const btnApply: React.CSSProperties = {
  width: "100%",
  height: 30,
  border: "none",
  borderRadius: 6,
  background: C.blue,
  color: C.mantle,
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "background 120ms",
  lineHeight: 1,
};

const statRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
};

const statLabel: React.CSSProperties = {
  fontSize: 12,
  color: C.subtext,
};

const statValue: React.CSSProperties = {
  fontSize: 13,
  color: C.text,
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
};

const dimBadge: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 4,
  background: C.surface0,
  color: C.blue,
  fontSize: 12,
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
};

/* ── Helpers ────────────────────────────────────────────────── */
function countOpaquePixels(grid: string[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== "transparent") count++;
    }
  }
  return count;
}

function estimateMemory(width: number, height: number): string {
  // Each cell is a JS string: ~14 bytes for "#rrggbb", plus array overhead
  const bytesPerCell = 14;
  const arrayOverhead = 8; // per row pointer
  const total =
    width * height * bytesPerCell + height * arrayOverhead;

  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Component ──────────────────────────────────────────────── */
export function PropertiesPanel() {
  const { t } = useTranslation();
  const config = usePixelStore((s) => s.config);
  const layers = usePixelStore((s) => s.layers);
  const setGridSize = usePixelStore((s) => s.setGridSize);

  const [widthInput, setWidthInput] = useState(config.width);
  const [heightInput, setHeightInput] = useState(config.height);

  const pixelCount = useMemo(() => {
    let count = 0;
    const seen = new Set<string>();
    for (const layer of layers) {
      if (!layer.visible) continue;
      for (let y = 0; y < layer.grid.length; y++) {
        for (let x = 0; x < layer.grid[y]!.length; x++) {
          const color = layer.grid[y]?.[x];
          if (color && color !== "transparent") {
            const key = `${x},${y}`;
            if (!seen.has(key)) {
              seen.add(key);
              count++;
            }
          }
        }
      }
    }
    return count;
  }, [layers]);
  const memoryEstimate = useMemo(
    () => estimateMemory(config.width, config.height),
    [config.width, config.height],
  );

  const handleApply = useCallback(() => {
    const w = Math.max(1, Math.min(256, Math.round(widthInput)));
    const h = Math.max(1, Math.min(256, Math.round(heightInput)));
    setWidthInput(w);
    setHeightInput(h);
    setGridSize(w, h);
  }, [widthInput, heightInput, setGridSize]);

  return (
    <aside style={panel}>
      {/* ── Canvas Size ── */}
      <div style={section}>
        <div style={sectionTitle}>{t.canvasSize}</div>

        <div style={row}>
          <span style={label}>{t.width}</span>
          <input
            style={input}
            type="number"
            min={1}
            max={256}
            value={widthInput}
            onChange={(e) => setWidthInput(Number(e.target.value))}
          />
        </div>

        <div style={row}>
          <span style={label}>{t.height}</span>
          <input
            style={input}
            type="number"
            min={1}
            max={256}
            value={heightInput}
            onChange={(e) => setHeightInput(Number(e.target.value))}
          />
        </div>

        <button style={btnApply} onClick={handleApply}>
          {t.applySize}
        </button>
      </div>

      {/* ── Current Dimensions ── */}
      <div style={section}>
        <div style={sectionTitle}>{t.currentCanvas}</div>

        <div style={statRow}>
          <span style={statLabel}>{t.dimensions}</span>
          <span style={dimBadge}>
            {config.width} × {config.height}
          </span>
        </div>

        <div style={statRow}>
          <span style={statLabel}>{t.zoom}</span>
          <span style={statValue}>{Math.round(config.zoom * 100)}%</span>
        </div>

        <div style={statRow}>
          <span style={statLabel}>{t.gridLines}</span>
          <span style={{ ...statValue, color: config.showGrid ? C.green : C.overlay0 }}>
            {config.showGrid ? t.on : t.off}
          </span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={section}>
        <div style={sectionTitle}>{t.statistics}</div>

        <div style={statRow}>
          <span style={statLabel}>{t.totalPixels}</span>
          <span style={statValue}>
            {config.width * config.height}
          </span>
        </div>

        <div style={statRow}>
          <span style={statLabel}>{t.opaquePixels}</span>
          <span style={{ ...statValue, color: pixelCount > 0 ? C.green : C.overlay0 }}>
            {pixelCount}
          </span>
        </div>

        <div style={statRow}>
          <span style={statLabel}>{t.transparent}</span>
          <span style={statValue}>
            {config.width * config.height - pixelCount}
          </span>
        </div>

        <div style={statRow}>
          <span style={statLabel}>{t.estMemory}</span>
          <span style={statValue}>{memoryEstimate}</span>
        </div>
      </div>
    </aside>
  );
}
