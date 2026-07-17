import { useCallback, useEffect, useRef, useState } from "react";
import { usePixelStore } from "./store/pixelStore";
import { useToast } from "./components/Toast";
import type { Tool } from "./types";
import { TopBar } from "./components/TopBar";
import Toolbar from "./components/Toolbar";
import PixelCanvas from "./components/PixelCanvas";
import ColorPicker from "./components/ColorPicker";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { CodeExporter } from "./components/CodeExporter";
import { LayersPanel } from "./components/LayersPanel";
import { ShortcutsHelp } from "./components/ShortcutsHelp";
import { MobileWarning } from "./components/MobileWarning";
import { ToolOptionsPanel } from "./components/ToolOptionsPanel";

const TOOL_SHORTCUTS: Record<string, Tool> = {
  b: "pencil",
  p: "pencil",
  e: "eraser",
  r: "rectangle",
  c: "circle",
  l: "line",
  g: "fill",
  i: "picker",
  s: "select",
};

export function App() {
  const [showCodeExporter, setShowCodeExporter] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const panModeRef = useRef(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const sidebarDragRef = useRef<{ startX: number; startW: number } | null>(null);

  const undo = usePixelStore((s) => s.undo);
  const redo = usePixelStore((s) => s.redo);
  const setActiveTool = usePixelStore((s) => s.setActiveTool);
  const setZoom = usePixelStore((s) => s.setZoom);
  const config = usePixelStore((s) => s.config);
  const deleteSelection = usePixelStore((s) => s.deleteSelection);
  const moveSelection = usePixelStore((s) => s.moveSelection);
  const copySelection = usePixelStore((s) => s.copySelection);
  const cutSelection = usePixelStore((s) => s.cutSelection);
  const pasteClipboard = usePixelStore((s) => s.pasteClipboard);
  const selection = usePixelStore((s) => s.selection);
  const clipboard = usePixelStore((s) => s.clipboard);
  const { addToast } = useToast();

  // Keep ref in sync for keyboard handler
  useEffect(() => {
    panModeRef.current = isPanMode;
  }, [isPanMode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // --- Undo / Redo ---
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        if (selection && selection.points.length > 0) {
          e.preventDefault();
          copySelection();
          addToast("Selection copied", "success");
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "x") {
        if (selection && selection.points.length > 0) {
          e.preventDefault();
          cutSelection();
          addToast("Selection cut", "success");
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (clipboard) {
          e.preventDefault();
          pasteClipboard();
          addToast("Pasted from clipboard", "success");
          return;
        }
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (selection && selection.points.length > 0) {
            e.preventDefault();
            deleteSelection();
            return;
          }
        }

        if (selection && selection.points.length > 0) {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            moveSelection(0, -1);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            moveSelection(0, 1);
            return;
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            moveSelection(-1, 0);
            return;
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            moveSelection(1, 0);
            return;
          }
        }

        const tool = TOOL_SHORTCUTS[e.key.toLowerCase()];
        if (tool) {
          setActiveTool(tool);
          return;
        }

        // --- Zoom ---
        if (e.key === "[") {
          setZoom(config.zoom - 0.5);
          return;
        }
        if (e.key === "]") {
          setZoom(config.zoom + 0.5);
          return;
        }
      }

      // --- Pan mode (hold Space) ---
      if (e.code === "Space" && !panModeRef.current) {
        e.preventDefault();
        setIsPanMode(true);
      }
    },
    [undo, redo, setActiveTool, setZoom, config.zoom, deleteSelection, moveSelection, copySelection, cutSelection, pasteClipboard, selection, clipboard, addToast],
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space") {
      setIsPanMode(false);
    }
  }, []);

  const MIN_SIDEBAR = 160;
  const MAX_SIDEBAR = 400;

  const onSidebarDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    sidebarDragRef.current = { startX: e.clientX, startW: sidebarWidth };
    const onMouseMove = (ev: MouseEvent) => {
      if (!sidebarDragRef.current) return;
      const dx = ev.clientX - sidebarDragRef.current.startX;
      const newW = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, sidebarDragRef.current.startW + dx));
      setSidebarWidth(newW);
    };
    const onMouseUp = () => {
      sidebarDragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [sidebarWidth]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div style={styles.root}>
      {/* TopBar — full width */}
      <div style={styles.topbar}>
        <TopBar onExport={() => setShowCodeExporter(true)} />
      </div>

      {/* Body: left sidebar + canvas + right sidebar */}
      <div style={styles.body}>
        {/* Left sidebar: Toolbar + ColorPicker + Layers (bottom) */}
        <div style={{ display: "flex", flexShrink: 0, height: "100%" }}>
          <aside style={{ ...styles.leftSidebar, width: sidebarWidth }}>
            <Toolbar />
            <ColorPicker />
          </aside>
          <div
            onMouseDown={onSidebarDragStart}
            style={{
              width: 5,
              cursor: "col-resize",
              background: "var(--surface-active)",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--surface-active)"; }}
          />
        </div>

        {/* Center canvas — fills remaining space */}
        <main style={styles.canvasArea}>
          <PixelCanvas isPanMode={isPanMode} />
        </main>

        {/* Right sidebar: Properties */}
        <aside style={styles.rightSidebar}>
          <PropertiesPanel />
          <LayersPanel />
        </aside>
      </div>

      {/* Code Exporter Modal */}
      {showCodeExporter && (
        <div
          className="modal-overlay"
          onClick={() => setShowCodeExporter(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <CodeExporter isOpen={showCodeExporter} onClose={() => setShowCodeExporter(false)} />
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <ShortcutsHelp />

      {/* Mobile device warning */}
      <MobileWarning />

      {/* Tool Options Panel */}
      <ToolOptionsPanel sidebarWidth={sidebarWidth} />
    </div>
  );
}

/* ---- Inline layout styles (structural only, theming via CSS vars) ---- */

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    background: "var(--bg)",
    color: "var(--text)",
  },
  topbar: {
    flexShrink: 0,
    height: 48,
    borderBottom: "1px solid var(--surface-active)",
    background: "var(--surface)",
  },
  body: {
    display: "flex",
    flex: 1,
    minHeight: 0,
  },
  leftSidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    background: "var(--surface)",
    borderRight: "1px solid var(--surface-active)",
    overflowY: "auto",
    overflowX: "hidden",
  },
  canvasArea: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  rightSidebar: {
    flexShrink: 0,
    width: 240,
    background: "var(--surface)",
    borderLeft: "1px solid var(--surface-active)",
    overflowY: "auto",
  },
};
