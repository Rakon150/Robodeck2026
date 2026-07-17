import { useCallback } from "react";
import { usePixelStore } from "../store/pixelStore";
import { useTranslation } from "../i18n";
import { useTheme } from "./ThemeProvider";

/* ── Catppuccin Mocha tokens ────────────────────────────────── */
const C = {
  mantle: "#181825",
  surface0: "#313244",
  surface1: "#45475a",
  text: "#cdd6f4",
  subtext: "#a6adc8",
  blue: "#89b4fa",
  red: "#f38ba8",
  green: "#a6e3a1",
  yellow: "#f9e2af",
  overlay0: "#6c7086",
} as const;

/* ── Reusable inline style objects ──────────────────────────── */
const bar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: 48,
  padding: "0 16px",
  background: "var(--surface)",
  borderBottom: "1px solid var(--surface-active)",
  boxSizing: "border-box",
  userSelect: "none",
  gap: 8,
};

const section: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 30,
  padding: "0 10px",
  border: "none",
  borderRadius: 6,
  background: "var(--surface-hover)",
  color: "var(--text)",
  fontSize: 13,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "background 120ms",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const btnDisabled: React.CSSProperties = {
  ...btnBase,
  opacity: 0.35,
  cursor: "not-allowed",
};

const btnAccent: React.CSSProperties = {
  ...btnBase,
  background: "var(--accent)",
  color: "var(--bg)",
  fontWeight: 600,
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: "var(--error)",
  border: "1px solid rgba(243, 139, 168, 0.25)",
};

const hint: React.CSSProperties = {
  fontSize: 10,
  color: "var(--text-dim)",
  marginLeft: 4,
  fontWeight: 400,
};

const title: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--accent)",
  letterSpacing: "-0.01em",
  whiteSpace: "nowrap",
};

const zoomValue: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-dim)",
  minWidth: 44,
  textAlign: "center" as const,
  fontVariantNumeric: "tabular-nums",
};

const divider: React.CSSProperties = {
  width: 1,
  height: 20,
  background: "var(--surface-active)",
  margin: "0 4px",
};

const langSelect: React.CSSProperties = {
  height: 24,
  padding: "0 8px",
  borderRadius: 4,
  background: "var(--surface-hover)",
  color: "var(--text)",
  border: "none",
  fontSize: 12,
  cursor: "pointer",
  marginLeft: 8,
};

/* ── Component ──────────────────────────────────────────────── */
export interface TopBarProps {
  onExport?: () => void;
  onImport?: () => void;
}

export function TopBar({ onExport, onImport }: TopBarProps) {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const undo = usePixelStore((s) => s.undo);
  const redo = usePixelStore((s) => s.redo);
  const canUndoVal = usePixelStore((s) => s.historyIndex > 0);
  const canRedoVal = usePixelStore(
    (s) => s.historyIndex < s.history.length - 1,
  );
  const showGrid = usePixelStore((s) => s.config.showGrid);
  const zoom = usePixelStore((s) => s.config.zoom);
  const toggleGrid = usePixelStore((s) => s.toggleGrid);
  const setZoom = usePixelStore((s) => s.setZoom);
  const clearGrid = usePixelStore((s) => s.clearGrid);

  const handleClear = useCallback(() => {
    if (window.confirm(t.clearCanvasConfirm)) {
      clearGrid();
    }
  }, [clearGrid, t.clearCanvasConfirm]);

  const handleZoomIn = useCallback(() => {
    setZoom(Math.round((zoom + 0.25) * 100) / 100);
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.round((zoom - 0.25) * 100) / 100);
  }, [zoom, setZoom]);

  return (
    <header style={bar}>
      {/* ── Left: title + language selector + theme toggle ── */}
      <div style={section}>
        <span style={title}>{t.appTitle}</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "cs")}
          style={langSelect}
        >
          <option value="en">English</option>
          <option value="cs">Čeština</option>
        </select>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
          style={langSelect}
          title="Theme"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* ── Center: undo / redo ── */}
      <div style={section}>
        <button
          style={canUndoVal ? btnBase : btnDisabled}
          disabled={!canUndoVal}
          onClick={undo}
          title={t.undo}
        >
          {t.undo}
          <span style={hint}>Ctrl+Z</span>
        </button>
        <button
          style={canRedoVal ? btnBase : btnDisabled}
          disabled={!canRedoVal}
          onClick={redo}
          title={t.redo}
        >
          {t.redo}
          <span style={hint}>Ctrl+Y</span>
        </button>
      </div>

      {/* ── Right: grid, zoom, clear, export, import ── */}
      <div style={section}>
        {/* Grid toggle */}
        <button
          style={{
            ...btnBase,
            background: showGrid ? "var(--surface-active)" : "var(--surface-hover)",
            color: showGrid ? "var(--success)" : "var(--text-dim)",
          }}
          onClick={toggleGrid}
          title={showGrid ? t.gridLines : t.grid}
        >
          {t.grid}
        </button>

        <div style={divider} />

        {/* Zoom controls */}
        <button
          style={btnBase}
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          title="Zoom out"
        >
          −
        </button>
        <span style={zoomValue}>{Math.round(zoom * 100)}%</span>
        <button
          style={btnBase}
          onClick={handleZoomIn}
          disabled={zoom >= 8}
          title="Zoom in"
        >
          +
        </button>

        <div style={divider} />

        {/* Clear */}
        <button style={btnDanger} onClick={handleClear} title={t.clear}>
          {t.clear}
        </button>

        {/* Export */}
        <button style={btnAccent} onClick={onExport} title={t.export}>
          {t.export}
        </button>

        {/* Import */}
        <button
          style={{ ...btnBase, opacity: 0.5, cursor: "not-allowed" }}
          onClick={() => window.alert("Not implemented yet")}
          title="Not implemented yet"
        >
          {t.import}
        </button>
      </div>
    </header>
  );
}
