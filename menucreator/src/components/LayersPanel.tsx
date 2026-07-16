import { useState } from "react";
import { usePixelStore } from "../store/pixelStore";
import { useTranslation } from "../i18n";
import { useToast } from "./Toast";

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UnlockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const MergeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 6 4-4 4 4"/>
    <path d="m8 18 4 4 4-4"/>
    <path d="M16 4l-4 4-4-4"/>
    <path d="M16 20l-4-4-4 4"/>
  </svg>
);

export function LayersPanel() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const layers = usePixelStore((s) => s.layers);
  const activeLayerId = usePixelStore((s) => s.activeLayerId);
  const addLayer = usePixelStore((s) => s.addLayer);
  const removeLayer = usePixelStore((s) => s.removeLayer);
  const setActiveLayer = usePixelStore((s) => s.setActiveLayer);
  const toggleLayerVisibility = usePixelStore((s) => s.toggleLayerVisibility);
  const toggleLayerLock = usePixelStore((s) => s.toggleLayerLock);
  const mergeLayers = usePixelStore((s) => s.mergeLayers);
  const renameLayer = usePixelStore((s) => s.renameLayer);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleDoubleClick = (layer: { id: string; name: string }) => {
    setEditingId(layer.id);
    setEditValue(layer.name);
  };

  const handleRenameSubmit = (id: string) => {
    if (editValue.trim()) {
      renameLayer(id, editValue.trim());
      addToast(t.layerRenamed, "success");
    }
    setEditingId(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>{t.layers}</span>
        <div style={styles.actions}>
          <button
            style={styles.actionBtn}
            onClick={() => {
              addLayer();
              addToast(t.layerAdded, "success");
            }}
            title={t.addLayer}
          >
            <PlusIcon />
          </button>
          <button
            style={styles.actionBtn}
            onClick={mergeLayers}
            title={t.mergeLayers}
          >
            <MergeIcon />
          </button>
        </div>
      </div>

      <div style={styles.layerList}>
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            style={{
              ...styles.layerItem,
              ...(layer.id === activeLayerId ? styles.layerItemActive : {}),
            }}
            onClick={() => setActiveLayer(layer.id)}
          >
            <button
              style={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility(layer.id);
              }}
              title={layer.visible ? t.hideLayer : t.showLayer}
            >
              {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
            </button>

            <button
              style={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerLock(layer.id);
              }}
              title={layer.locked ? t.unlockLayer : t.lockLayer}
            >
              {layer.locked ? <LockIcon /> : <UnlockIcon />}
            </button>

            {editingId === layer.id ? (
              <input
                style={styles.renameInput}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleRenameSubmit(layer.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(layer.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                style={styles.layerName}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClick(layer);
                }}
              >
                {layer.name}
              </span>
            )}

            {layers.length > 1 && (
              <button
                style={styles.iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(layer.id);
                  addToast(t.layerDeleted, "info");
                }}
                title={t.deleteLayer}
              >
                <TrashIcon />
              </button>
            )}
          </div>
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 4px",
  },
  title: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--text-dim)",
  },
  actions: {
    display: "flex",
    gap: 4,
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 4,
    background: "var(--surface-hover)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "background var(--transition-fast)",
  },
  layerList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  layerItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "background var(--transition-fast)",
  },
  layerItemActive: {
    background: "var(--accent)",
    color: "var(--bg)",
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    borderRadius: 3,
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    flexShrink: 0,
  },
  layerName: {
    flex: 1,
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  renameInput: {
    flex: 1,
    fontSize: 13,
    padding: "2px 4px",
    borderRadius: 3,
    border: "1px solid var(--accent)",
    background: "var(--bg)",
    color: "var(--text)",
    outline: "none",
    minWidth: 0,
  },
};
