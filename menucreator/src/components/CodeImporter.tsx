import { useCallback, useEffect, useRef, useState } from "react";
import { usePixelStore } from "../store/pixelStore";
import { useToast } from "./Toast";
import {
  parseGeneratedCode,
  loadImageFile,
  imageDataToGrid,
  previewImageData,
  getPixelHex,
  MAX_IMAGE_DIMENSION,
} from "../utils/importGen";

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
  overlay0: "#6c7086",
} as const;

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
  width: "min(640px, 90vw)",
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

const tabs: React.CSSProperties = {
  display: "flex",
  gap: 4,
  padding: "10px 16px 0",
  borderBottom: `1px solid ${C.surface0}`,
};

const tabBtn: React.CSSProperties = {
  padding: "8px 14px",
  border: "none",
  background: "transparent",
  color: C.subtext,
  fontSize: 13,
  fontFamily: "inherit",
  cursor: "pointer",
  borderBottom: "2px solid transparent",
  marginBottom: -1,
};

const tabBtnActive: React.CSSProperties = {
  ...tabBtn,
  color: C.blue,
  borderBottom: `2px solid ${C.blue}`,
  fontWeight: 600,
};

const body: React.CSSProperties = {
  flex: 1,
  overflow: "auto",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 260,
  resize: "vertical",
  background: C.mantle,
  border: `1px solid ${C.surface0}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily:
    '"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", Menlo, monospace',
  padding: 12,
  outline: "none",
  boxSizing: "border-box",
};

const hintText: React.CSSProperties = {
  fontSize: 12,
  color: C.overlay0,
};

const errorText: React.CSSProperties = {
  fontSize: 12,
  color: C.red,
};

const dropZone: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  minHeight: 220,
  border: `2px dashed ${C.surface1}`,
  borderRadius: 10,
  padding: 24,
  textAlign: "center",
  color: C.subtext,
  fontSize: 13,
  cursor: "pointer",
  transition: "border-color 120ms, background 120ms",
};

const dropZoneActive: React.CSSProperties = {
  ...dropZone,
  borderColor: C.blue,
  background: "rgba(137,180,250,0.08)",
};

const previewCanvas: React.CSSProperties = {
  imageRendering: "pixelated",
  borderRadius: 6,
  border: `1px solid ${C.surface0}`,
  background: `repeating-conic-gradient(${C.surface1} 0% 25%, ${C.mantle} 0% 50%) 50% / 16px 16px`,
  cursor: "crosshair",
  display: "block",
};

const bgControls: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const checkboxLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  color: C.text,
  cursor: "pointer",
  userSelect: "none",
};

const colorSwatch: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 5,
  border: `1px solid ${C.surface1}`,
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
};

const toleranceLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: C.subtext,
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

const btnBaseDisabled: React.CSSProperties = {
  ...btnBase,
  opacity: 0.4,
  cursor: "not-allowed",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: C.blue,
  color: C.mantle,
  fontWeight: 600,
};

const btnPrimaryDisabled: React.CSSProperties = {
  ...btnPrimary,
  opacity: 0.4,
  cursor: "not-allowed",
};

type Tab = "code" | "bitmap";

export interface CodeImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CodeImporter({ isOpen, onClose }: CodeImporterProps) {
  const setGridSize = usePixelStore((s) => s.setGridSize);
  const loadGrid = usePixelStore((s) => s.loadGrid);
  const config = usePixelStore((s) => s.config);
  const { addToast } = useToast();

  const [tab, setTab] = useState<Tab>("code");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ imageData: ImageData; scaled: boolean } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [bgTolerance, setBgTolerance] = useState(24);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTab("code");
      setCode("");
      setCodeError(null);
      setIsDragging(false);
      setPendingImage(null);
      setImageError(null);
      setRemoveBg(true);
      setBgColor(null);
      setBgTolerance(24);
    }
  }, [isOpen]);

  // Render the preview canvas (checkerboard shows through wherever the
  // current background-key settings would make a pixel transparent).
  useEffect(() => {
    if (!pendingImage) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const key = removeBg && bgColor ? { color: bgColor, tolerance: bgTolerance } : null;
    const preview = previewImageData(pendingImage.imageData, key);
    canvas.width = preview.width;
    canvas.height = preview.height;
    ctx.putImageData(preview, 0, 0);
  }, [pendingImage, removeBg, bgColor, bgTolerance]);

  const handlePreviewClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!pendingImage) return;
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = Math.floor(((e.clientX - rect.left) / rect.width) * pendingImage.imageData.width);
      const ny = Math.floor(((e.clientY - rect.top) / rect.height) * pendingImage.imageData.height);
      if (nx < 0 || ny < 0 || nx >= pendingImage.imageData.width || ny >= pendingImage.imageData.height) return;
      setBgColor(getPixelHex(pendingImage.imageData, nx, ny));
      setRemoveBg(true);
    },
    [pendingImage],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleImportCode = useCallback(() => {
    const parsed = parseGeneratedCode(code);
    if (!parsed) {
      setCodeError("No Point or Rectangle shapes found — paste code generated by Export.");
      return;
    }
    setCodeError(null);
    if (parsed.width !== config.width || parsed.height !== config.height) {
      setGridSize(parsed.width, parsed.height);
    }
    loadGrid(parsed.grid);
    addToast(`Imported ${parsed.shapeCount} shape${parsed.shapeCount !== 1 ? "s" : ""} from code`, "success");
    onClose();
  }, [code, config.width, config.height, setGridSize, loadGrid, addToast, onClose]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.");
      return;
    }
    try {
      setImageError(null);
      const result = await loadImageFile(file);
      setPendingImage(result);
      // Guess the background as the top-left pixel's color — the most
      // common convention for flat-background sprites/icons.
      setBgColor(getPixelHex(result.imageData, 0, 0));
      setRemoveBg(true);
      setBgTolerance(24);
    } catch {
      setImageError("Failed to load that image.");
    }
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleImportBitmap = useCallback(() => {
    if (!pendingImage) return;
    const { imageData } = pendingImage;
    const key = removeBg && bgColor ? { color: bgColor, tolerance: bgTolerance } : null;
    const grid = imageDataToGrid(imageData, key);
    if (imageData.width !== config.width || imageData.height !== config.height) {
      setGridSize(imageData.width, imageData.height);
    }
    loadGrid(grid);
    addToast("Imported bitmap image", "success");
    onClose();
  }, [pendingImage, removeBg, bgColor, bgTolerance, config.width, config.height, setGridSize, loadGrid, addToast, onClose]);

  if (!isOpen) return null;

  const previewScale = pendingImage
    ? Math.max(1, Math.floor(260 / Math.max(pendingImage.imageData.width, pendingImage.imageData.height)))
    : 1;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <span style={headerTitle}>Import</span>
          <button style={closeBtn} onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div style={tabs}>
          <button
            style={tab === "code" ? tabBtnActive : tabBtn}
            onClick={() => setTab("code")}
          >
            Paste Code
          </button>
          <button
            style={tab === "bitmap" ? tabBtnActive : tabBtn}
            onClick={() => setTab("bitmap")}
          >
            Upload Bitmap
          </button>
        </div>

        {tab === "code" ? (
          <div style={body}>
            <div style={hintText}>
              Paste TypeScript generated by Export (Point / Rectangle shapes) to rebuild the canvas from it.
            </div>
            <textarea
              style={textarea}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError(null);
              }}
              placeholder="function generateScene() { ... }"
              spellCheck={false}
            />
            {codeError && <div style={errorText}>{codeError}</div>}
          </div>
        ) : (
          <div style={body}>
            <div style={hintText}>
              Upload a PNG, JPG, GIF, or BMP image. It will be converted pixel-for-pixel; images larger than{" "}
              {MAX_IMAGE_DIMENSION}px on either side are downscaled.
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
            />
            {pendingImage ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    ...previewCanvas,
                    width: pendingImage.imageData.width * previewScale,
                    height: pendingImage.imageData.height * previewScale,
                  }}
                  onClick={handlePreviewClick}
                  title="Click a pixel to pick it as the background color"
                />
              </div>
            ) : (
              <div
                style={isDragging ? dropZoneActive : dropZone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <span style={{ fontSize: 28 }}>🖼️</span>
                <span>Click to choose an image, or drag one here</span>
              </div>
            )}
            {pendingImage && (
              <>
                <div style={hintText}>
                  {pendingImage.imageData.width} × {pendingImage.imageData.height}px
                  {pendingImage.scaled ? " (downscaled to fit)" : ""} — click the preview to pick the background color
                </div>
                <div style={bgControls}>
                  <label style={checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={removeBg}
                      onChange={(e) => setRemoveBg(e.target.checked)}
                    />
                    Make background transparent
                  </label>
                  {bgColor && (
                    <div style={{ ...colorSwatch, background: bgColor }} title={bgColor} />
                  )}
                  <label style={toleranceLabel}>
                    Tolerance
                    <input
                      type="range"
                      min={0}
                      max={128}
                      value={bgTolerance}
                      disabled={!removeBg}
                      onChange={(e) => setBgTolerance(Number(e.target.value))}
                    />
                    {bgTolerance}
                  </label>
                  <button
                    style={btnBase}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose different image
                  </button>
                </div>
              </>
            )}
            {imageError && <div style={errorText}>{imageError}</div>}
          </div>
        )}

        <div style={footer}>
          <button style={btnBase} onClick={onClose}>
            Cancel
          </button>
          {tab === "code" ? (
            <button
              style={code.trim() ? btnPrimary : btnPrimaryDisabled}
              disabled={!code.trim()}
              onClick={handleImportCode}
            >
              Import Code
            </button>
          ) : (
            <button
              style={pendingImage ? btnPrimary : btnPrimaryDisabled}
              disabled={!pendingImage}
              onClick={handleImportBitmap}
            >
              Import Bitmap
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
