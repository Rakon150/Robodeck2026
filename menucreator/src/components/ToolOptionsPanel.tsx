import { useState } from "react";
import { usePixelStore } from "../store/pixelStore";
import { useTranslation } from "../i18n";

interface ToolOptionsPanelProps {
  sidebarWidth: number;
}

export function ToolOptionsPanel({ sidebarWidth }: ToolOptionsPanelProps) {
  const { t } = useTranslation();
  const activeTool = usePixelStore((s) => s.activeTool);
  const shapeFill = usePixelStore((s) => s.shapeFill);
  const brushSize = usePixelStore((s) => s.brushSize);
  const strokeWidth = usePixelStore((s) => s.strokeWidth);
  const setShapeFill = usePixelStore((s) => s.setShapeFill);
  const setBrushSize = usePixelStore((s) => s.setBrushSize);
  const setStrokeWidth = usePixelStore((s) => s.setStrokeWidth);

  const [isMinimized, setIsMinimized] = useState(false);

  const hasOptions = activeTool === "pencil" || activeTool === "eraser" || 
                     activeTool === "rectangle" || activeTool === "circle" || activeTool === "line";

  if (!hasOptions) return null;

  const toolName = t[activeTool] || activeTool;

  const panelX = sidebarWidth + 12;
  const panelY = 56;

  return (
    <div
      style={{
        ...styles.panel,
        left: panelX,
        top: panelY,
        width: sidebarWidth,
      }}
    >
      <div style={styles.header}>
        <span style={styles.title}>{toolName}</span>
        <button
          style={styles.minimizeBtn}
          onClick={() => setIsMinimized(!isMinimized)}
          title={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? "+" : "−"}
        </button>
      </div>

      {!isMinimized && (
        <div style={styles.content}>
          {(activeTool === "pencil" || activeTool === "eraser") && (
            <div style={styles.option}>
              <label style={styles.label}>Brush Size</label>
              <div style={styles.inputRow}>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  style={styles.numberInput}
                />
                <span style={styles.unit}>px</span>
              </div>
            </div>
          )}

          {(activeTool === "rectangle" || activeTool === "circle") && (
            <>
              <div style={styles.option}>
                <label style={styles.label}>Fill Mode</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="toolFill"
                      value="filled"
                      checked={shapeFill === "filled"}
                      onChange={() => setShapeFill("filled")}
                      style={styles.radio}
                    />
                    {t.filled}
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="toolFill"
                      value="outline"
                      checked={shapeFill === "outline"}
                      onChange={() => setShapeFill("outline")}
                      style={styles.radio}
                    />
                    {t.outline}
                  </label>
                </div>
              </div>
              <div style={styles.option}>
                <label style={styles.label}>Stroke Width</label>
                <div style={styles.inputRow}>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    style={styles.numberInput}
                  />
                  <span style={styles.unit}>px</span>
                </div>
              </div>
            </>
          )}

          {activeTool === "line" && (
            <div style={styles.option}>
              <label style={styles.label}>Stroke Width</label>
              <div style={styles.inputRow}>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  style={styles.numberInput}
                />
                <span style={styles.unit}>px</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: "fixed",
    width: 180,
    background: "var(--surface)",
    border: "1px solid var(--surface-active)",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    zIndex: 50,
    userSelect: "none",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 10px",
    background: "var(--surface-hover)",
    cursor: "grab",
    borderBottom: "1px solid var(--surface-active)",
  },
  title: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
  },
  minimizeBtn: {
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    background: "transparent",
    color: "var(--text-dim)",
    fontSize: 14,
    cursor: "pointer",
    transition: "background var(--transition-fast)",
  },
  content: {
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  option: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  numberInput: {
    width: 60,
    height: 28,
    padding: "0 8px",
    border: "1px solid var(--surface-active)",
    borderRadius: 6,
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    fontVariantNumeric: "tabular-nums",
  },
  unit: {
    fontSize: 12,
    color: "var(--text-dim)",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--text)",
    cursor: "pointer",
  },
  radio: {
    accentColor: "var(--accent)",
  },
};
