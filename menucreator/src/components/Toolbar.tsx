import { usePixelStore } from "../store/pixelStore";
import type { Tool } from "../types";
import { useTranslation } from "../i18n";

interface ToolDef {
  id: Tool;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const EraserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
    <path d="M22 21H7"/>
    <path d="m5 11 9 9"/>
  </svg>
);

const RectangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);

const CircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

const LineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="19" x2="19" y2="5"/>
  </svg>
);

const FillIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/>
    <path d="m5 2 5 5"/>
    <path d="M2 13h15"/>
    <path d="M22 20a2 2 0 1 1-4 0c0-1.6 2-3 2-3s2 1.4 2 3Z"/>
  </svg>
);

const PickerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 22 1-1h3l9-9"/>
    <path d="M3 21v-3l9-9"/>
    <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>
  </svg>
);

const SelectIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5c0-1.7 1.3-3 3-3h1c1.7 0 3 1.3 3 3v1c0 1.7-1.3 3-3 3H6c-1.7 0-3-1.3-3-3V5Z"/>
    <path d="M10 14c0-1.7 1.3-3 3-3h1c1.7 0 3 1.3 3 3v1c0 1.7-1.3 3-3 3h-1c-1.7 0-3-1.3-3-3v-1Z"/>
    <path d="M17 2c1.7 0 3 1.3 3 3v1c0 1.7-1.3 3-3 3h-1c-1.7 0-3-1.3-3-3V5c0-1.7 1.3-3 3-3h1Z"/>
    <path d="M17 12c1.7 0 3 1.3 3 3v1c0 1.7-1.3 3-3 3h-1c-1.7 0-3-1.3-3-3v-1c0-1.7 1.3-3 3-3h1Z"/>
  </svg>
);

export default function Toolbar() {
  const { t } = useTranslation();
  const activeTool = usePixelStore((s) => s.activeTool);
  const setActiveTool = usePixelStore((s) => s.setActiveTool);

  const tools: ToolDef[] = [
    { id: "pencil", label: t.pencil, shortcut: "B", icon: <PencilIcon /> },
    { id: "eraser", label: t.eraser, shortcut: "E", icon: <EraserIcon /> },
    { id: "rectangle", label: t.rectangle, shortcut: "R", icon: <RectangleIcon /> },
    { id: "circle", label: t.circle, shortcut: "C", icon: <CircleIcon /> },
    { id: "line", label: t.line, shortcut: "L", icon: <LineIcon /> },
    { id: "fill", label: t.fill, shortcut: "G", icon: <FillIcon /> },
    { id: "picker", label: t.colorPicker, shortcut: "I", icon: <PickerIcon /> },
    { id: "select", label: t.select, shortcut: "S", icon: <SelectIcon /> },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.label}>{t.tools}</div>
      <div style={styles.toolGrid}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            data-tooltip={`${tool.label} (${tool.shortcut})`}
            style={{
              ...styles.toolBtn,
              ...(activeTool === tool.id ? styles.toolBtnActive : {}),
            }}
            onClick={() => setActiveTool(tool.id)}
          >
            <span style={styles.toolIcon}>{tool.icon}</span>
            <span style={styles.toolLabel}>{tool.label}</span>
            <span style={styles.shortcutHint}>({tool.shortcut})</span>
          </button>
        ))}
      </div>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--text-dim)",
    padding: "0 4px",
  },
  toolGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  toolBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    transition: "background var(--transition-fast)",
    textAlign: "left",
  },
  toolBtnActive: {
    background: "var(--accent)",
    color: "var(--bg)",
  },
  toolIcon: {
    width: 20,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  toolLabel: {
    flex: 1,
  },
  shortcutHint: {
    fontSize: 11,
    color: "var(--text-dim)",
    fontFamily: "var(--font-mono)",
  },
  section: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid var(--surface-active)",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "4px 4px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    cursor: "pointer",
  },
  radio: {
    accentColor: "var(--accent)",
  },
};
