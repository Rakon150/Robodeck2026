import { useState, useEffect, useCallback, useMemo } from "react";
import { usePixelStore } from "../store/pixelStore";
import { generateScene } from "../utils/codeGen";

const C = {
  mantle: "#181825",
  base: "#1e1e2e",
  surface0: "#313244",
  surface1: "#45475a",
  text: "#cdd6f4",
  subtext: "#a6adc8",
  blue: "#89b4fa",
  green: "#a6e3a1",
  red: "#f38ba8",
  yellow: "#f9e2af",
  mauve: "#cba6f7",
  peach: "#fab387",
  overlay0: "#6c7086",
} as const;

function highlightTS(code: string): string {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(
    /(\/\/.*)/g,
    `<span style="color:${C.overlay0};font-style:italic">$1</span>`,
  );

  html = html.replace(
    /(&quot;[^&]*?&quot;|"[^"]*?")/g,
    `<span style="color:${C.green}">$1</span>`,
  );

  const kwRe =
    /\b(import|from|const|let|var|function|return|export|default|if|else)\b/g;
  html = html.replace(
    kwRe,
    `<span style="color:${C.mauve}">$1</span>`,
  );

  html = html.replace(
    /\b(\d+)\b/g,
    `<span style="color:${C.peach}">$1</span>`,
  );

  return html;
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.65)",
  backdropFilter: "blur(4px)",
};

const modal: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "min(720px, 90vw)",
  maxHeight: "80vh",
  background: C.base,
  border: `1px solid ${C.surface0}`,
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: `1px solid ${C.surface0}`,
};

const headerTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: C.text,
};

const closeBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  border: "none",
  borderRadius: 6,
  background: C.surface0,
  color: C.subtext,
  fontSize: 16,
  cursor: "pointer",
  lineHeight: 1,
};

const codeWrap: React.CSSProperties = {
  flex: 1,
  overflow: "auto",
  padding: 16,
};

const pre: React.CSSProperties = {
  margin: 0,
  padding: 16,
  background: C.mantle,
  borderRadius: 8,
  overflow: "auto",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily:
    '"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", Menlo, monospace',
  color: C.text,
  tabSize: 2,
  whiteSpace: "pre",
};

const footer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  padding: "12px 16px",
  borderTop: `1px solid ${C.surface0}`,
};

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 32,
  padding: "0 14px",
  border: "none",
  borderRadius: 6,
  background: C.surface0,
  color: C.text,
  fontSize: 13,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "background 120ms",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: C.blue,
  color: C.mantle,
  fontWeight: 600,
};

const btnSuccess: React.CSSProperties = {
  ...btnBase,
  background: C.green,
  color: C.mantle,
  fontWeight: 600,
};

const inputRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 16px",
  borderBottom: `1px solid ${C.surface0}`,
};

const label: React.CSSProperties = {
  fontSize: 13,
  color: C.subtext,
  whiteSpace: "nowrap",
};

const input: React.CSSProperties = {
  flex: 1,
  height: 32,
  padding: "0 10px",
  background: C.mantle,
  border: `1px solid ${C.surface0}`,
  borderRadius: 6,
  color: C.text,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
};

const shapeHint: React.CSSProperties = {
  fontSize: 11,
  color: C.overlay0,
  padding: "4px 16px 0",
};

export interface CodeExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CodeExporter({ isOpen, onClose }: CodeExporterProps) {
  const layers = usePixelStore((s) => s.layers);
  const config = usePixelStore((s) => s.config);
  const shapes = usePixelStore((s) => s.shapes);
  const [copied, setCopied] = useState(false);
  const [shapeName, setShapeName] = useState("generateScene");

  const grid = useMemo(() => {
    if (layers.length === 0) return layers[0]?.grid ?? [];
    let merged: string[][] = [];
    for (const layer of layers) {
      if (!layer.visible) continue;
      if (merged.length === 0) {
        merged = layer.grid.map(row => [...row]);
      } else {
        for (let y = 0; y < merged.length; y++) {
          for (let x = 0; x < merged[y]!.length; x++) {
            const color = layer.grid[y]?.[x];
            if (color && color !== "transparent") {
              merged[y]![x] = color;
            }
          }
        }
      }
    }
    return merged;
  }, [layers]);

  const generatedCode = useMemo(() => {
    return generateScene(grid, config, shapes, shapeName);
  }, [grid, config, shapes, shapeName]);

  const highlightedCode = useMemo(
    () => highlightTS(generatedCode),
    [generatedCode],
  );

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setShapeName("generateScene");
    }
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = generatedCode;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
    }
  }, [generatedCode]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shapeName}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedCode, shapeName]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <span style={headerTitle}>Generated Code</span>
          <button style={closeBtn} onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div style={inputRow}>
          <span style={label}>Function name:</span>
          <input
            style={input}
            value={shapeName}
            onChange={(e) => setShapeName(e.target.value)}
            placeholder="generateScene"
          />
        </div>

        {shapes.length > 0 && (
          <div style={shapeHint}>
            Using {shapes.length} shape{shapes.length !== 1 ? "s" : ""} (exported as semantic shapes)
          </div>
        )}
        {shapes.length === 0 && (
          <div style={shapeHint}>
            No shapes drawn — exporting from pixel grid (use rectangle/circle/line tools for semantic export)
          </div>
        )}

        <div style={codeWrap}>
          <pre style={pre}>
            <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </pre>
        </div>

        <div style={footer}>
          <button style={btnBase} onClick={onClose}>
            Close
          </button>
          <button style={btnSuccess} onClick={handleDownload}>
            Download .ts
          </button>
          <button style={btnPrimary} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
