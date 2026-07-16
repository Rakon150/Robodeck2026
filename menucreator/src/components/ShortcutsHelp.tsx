import { useState } from "react";
import { useTranslation } from "../i18n";

interface ShortcutItem {
  keys: string;
  action: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

export function ShortcutsHelp() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const categories: ShortcutCategory[] = [
    {
      title: t.tools,
      shortcuts: [
        { keys: "B / P", action: t.pencil },
        { keys: "E", action: t.eraser },
        { keys: "R", action: t.rectangle },
        { keys: "C", action: t.circle },
        { keys: "L", action: t.line },
        { keys: "G", action: t.fill },
        { keys: "I", action: t.colorPicker },
        { keys: "S", action: t.select },
        { keys: "Del / Bksp", action: t.deleteSelection || "Delete selection" },
      ],
    },
    {
      title: "Selection",
      shortcuts: [
        { keys: "Arrow Keys", action: "Move selection" },
        { keys: "Ctrl+C", action: "Copy" },
        { keys: "Ctrl+X", action: "Cut" },
        { keys: "Ctrl+V", action: "Paste" },
        { keys: "Shift + Drag", action: "Add to selection" },
        { keys: "Ctrl + Drag", action: "Remove from selection" },
      ],
    },
    {
      title: t.currentCanvas,
      shortcuts: [
        { keys: "[", action: "Zoom Out" },
        { keys: "]", action: "Zoom In" },
        { keys: "Space + Drag", action: "Pan Canvas" },
        { keys: "Ctrl+Z", action: t.undo },
        { keys: "Ctrl+Y / Ctrl+Shift+Z", action: t.redo },
      ],
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={helpBtnStyle}
        title="Keyboard Shortcuts"
      >
        ?
      </button>

      {isOpen && (
        <div style={overlayStyle} onClick={() => setIsOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={headerStyle}>
              <h2 style={titleStyle}>Keyboard Shortcuts</h2>
              <button onClick={() => setIsOpen(false)} style={closeBtnStyle}>
                ×
              </button>
            </div>

            <div style={contentStyle}>
              {categories.map((cat) => (
                <div key={cat.title} style={categoryStyle}>
                  <h3 style={categoryTitleStyle}>{cat.title}</h3>
                  <table style={tableStyle}>
                    <tbody>
                      {cat.shortcuts.map((s) => (
                        <tr key={s.keys} style={trStyle}>
                          <td style={keyTdStyle}>
                            {s.keys.split("/").map((key, i) => (
                              <span key={i}>
                                <kbd style={kbdStyle}>{key.trim()}</kbd>
                                {i < s.keys.split("/").length - 1 && " / "}
                              </span>
                            ))}
                          </td>
                          <td style={actionTdStyle}>{s.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const helpBtnStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 16,
  right: 16,
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "var(--surface-hover)",
  color: "var(--text)",
  border: "none",
  fontSize: 18,
  fontWeight: 700,
  cursor: "pointer",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "var(--overlay)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--surface-active)",
  borderRadius: 8,
  padding: 24,
  minWidth: 480,
  maxWidth: 560,
  maxHeight: "80vh",
  overflow: "auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--text-dim)",
  fontSize: 24,
  cursor: "pointer",
  padding: 0,
  lineHeight: 1,
};

const contentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const categoryStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const categoryTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: 0,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const trStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--surface-active)",
};

const keyTdStyle: React.CSSProperties = {
  padding: "6px 0",
  width: 120,
};

const actionTdStyle: React.CSSProperties = {
  padding: "6px 0",
  color: "var(--text)",
};

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  background: "var(--surface-hover)",
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  color: "var(--accent)",
};
