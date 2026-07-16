import { useState, useCallback, useRef, useEffect } from "react";
import { usePixelStore } from "../store/pixelStore";
import { useTranslation } from "../i18n";
import { useToast } from "./Toast";

// 4×5 grid = 20 colors
const PRESET_COLORS = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#00ffff", "#ff00ff", "#ff8800", "#8800ff",
  "#ff5555", "#55ff55", "#5555ff", "#ffff55", "#55ffff",
  "#ff55ff", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4",
];

// HSV to RGB conversion
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = h % 360;
  if (h < 0) h += 360;
  s = Math.max(0, Math.min(1, s));
  v = Math.max(0, Math.min(1, v));

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// RGB to HSV conversion
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }

  return { h, s, v };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: result ? parseInt(result[1] ?? "0", 16) : 0,
    g: result ? parseInt(result[2] ?? "0", 16) : 0,
    b: result ? parseInt(result[3] ?? "0", 16) : 0,
  };
}

// Color Wheel Component
function ColorWheel({
  hue,
  saturation,
  value,
  onHueChange,
  onSVChange,
}: {
  hue: number;
  saturation: number;
  value: number;
  onHueChange: (h: number) => void;
  onSVChange: (s: number, v: number) => void;
}) {
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const squareRef = useRef<HTMLCanvasElement>(null);
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);
  const [isDraggingSquare, setIsDraggingSquare] = useState(false);

  const WHEEL_SIZE = 100;
  const WHEEL_RADIUS = WHEEL_SIZE / 2;
  const WHEEL_CENTER = WHEEL_RADIUS;
  const SQUARE_SIZE = 100;

  // Draw the hue wheel
  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = WHEEL_SIZE * dpr;
    canvas.height = WHEEL_SIZE * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    // Draw hue wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(WHEEL_CENTER, WHEEL_CENTER);
      ctx.arc(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS - 2, startAngle, endAngle);
      ctx.closePath();

      const rgb = hsvToRgb(angle, 1, 1);
      ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
      ctx.fill();
    }

    // Draw center cutout
    ctx.beginPath();
    ctx.arc(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = "#1e1e2e";
    ctx.fill();

    // Draw selector
    const selectorAngle = hue * Math.PI / 180;
    const selectorRadius = (WHEEL_RADIUS - 8);
    const sx = WHEEL_CENTER + selectorRadius * Math.cos(selectorAngle);
    const sy = WHEEL_CENTER + selectorRadius * Math.sin(selectorAngle);

    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue},100%,50%)`;
    ctx.fill();
  }, [hue]);

  // Draw the SV square
  useEffect(() => {
    const canvas = squareRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SQUARE_SIZE * dpr;
    canvas.height = SQUARE_SIZE * dpr;
    ctx.scale(dpr, dpr);

    // Draw SV gradient square
    // White to hue (left to right)
    const hueRgb = hsvToRgb(hue, 1, 1);
    const gradH = ctx.createLinearGradient(0, 0, SQUARE_SIZE, 0);
    gradH.addColorStop(0, "#fff");
    gradH.addColorStop(1, `rgb(${hueRgb.r},${hueRgb.g},${hueRgb.b})`);

    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, SQUARE_SIZE, SQUARE_SIZE);

    // Black overlay (top to bottom)
    const gradV = ctx.createLinearGradient(0, 0, 0, SQUARE_SIZE);
    gradV.addColorStop(0, "rgba(0,0,0,0)");
    gradV.addColorStop(1, "#000");

    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, SQUARE_SIZE, SQUARE_SIZE);

    // Draw selector
    const sx = saturation * SQUARE_SIZE;
    const sy = (1 - value) * SQUARE_SIZE;

    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fillStyle = (() => {
      const rgb = hsvToRgb(hue, saturation, value);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    })();
    ctx.fill();
  }, [hue, saturation, value]);

  const handleWheelMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - WHEEL_CENTER;
    const y = e.clientY - rect.top - WHEEL_CENTER;

    const dist = Math.sqrt(x * x + y * y);
    if (dist < WHEEL_RADIUS * 0.35 || dist > WHEEL_RADIUS - 2) return;

    const angle = Math.atan2(y, x) * 180 / Math.PI;
    onHueChange((angle + 360) % 360);
    setIsDraggingWheel(true);
  }, [onHueChange]);

  const handleSquareMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = squareRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = Math.max(0, Math.min(1, x / SQUARE_SIZE));
    const v = Math.max(0, Math.min(1, 1 - y / SQUARE_SIZE));
    onSVChange(s, v);
    setIsDraggingSquare(true);
  }, [onSVChange]);

  useEffect(() => {
    if (!isDraggingWheel && !isDraggingSquare) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingWheel) {
        const canvas = wheelRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - WHEEL_CENTER;
        const y = e.clientY - rect.top - WHEEL_CENTER;
        const angle = Math.atan2(y, x) * 180 / Math.PI;
        onHueChange((angle + 360) % 360);
      } else if (isDraggingSquare) {
        const canvas = squareRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const s = Math.max(0, Math.min(1, x / SQUARE_SIZE));
        const v = Math.max(0, Math.min(1, 1 - y / SQUARE_SIZE));
        onSVChange(s, v);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingWheel(false);
      setIsDraggingSquare(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingWheel, isDraggingSquare, onHueChange, onSVChange]);

  return (
    <div style={styles.wheelContainer}>
      <canvas
        ref={wheelRef}
        style={styles.wheelCanvas}
        onMouseDown={handleWheelMouseDown}
      />
      <canvas
        ref={squareRef}
        style={styles.squareCanvas}
        onMouseDown={handleSquareMouseDown}
      />
    </div>
  );
}

export default function ColorPicker() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const currentColor = usePixelStore((s) => s.currentColor);
  const setCurrentColor = usePixelStore((s) => s.setCurrentColor);

  const rgb = hexToRgb(currentColor);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const [hexInput, setHexInput] = useState(currentColor);
  const [hue, setHue] = useState(hsv.h);
  const [saturation, setSaturation] = useState(hsv.s);
  const [value, setValue] = useState(hsv.v);

  useEffect(() => {
    const rgb = hexToRgb(currentColor);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setValue(hsv.v);
    setHexInput(currentColor);
  }, [currentColor]);

  const applyHSV = useCallback((h: number, s: number, v: number) => {
    setHue(h);
    setSaturation(s);
    setValue(v);
    const newRgb = hsvToRgb(h, s, v);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(hex);
    setCurrentColor(hex);
  }, [setCurrentColor]);

  const handleHueChange = useCallback((h: number) => {
    const newRgb = hsvToRgb(h, saturation, value);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHue(h);
    setHexInput(hex);
    setCurrentColor(hex);
  }, [saturation, value, setCurrentColor]);

  const handleSVChange = useCallback((s: number, v: number) => {
    setSaturation(s);
    setValue(v);
    const newRgb = hsvToRgb(hue, s, v);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(hex);
    setCurrentColor(hex);
  }, [hue, setCurrentColor]);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-f]{6}$/i.test(val)) {
      const c = hexToRgb(val);
      const hsv = rgbToHsv(c.r, c.g, c.b);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setValue(hsv.v);
      setCurrentColor(val);
    }
  };

  const handlePresetClick = (color: string) => {
    setCurrentColor(color);
    const c = hexToRgb(color);
    const hsv = rgbToHsv(c.r, c.g, c.b);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setValue(hsv.v);
    setHexInput(color);
    addToast(`${t.colorPicked}: ${color}`, "success");
  };

  return (
    <div style={styles.container}>
      <div style={styles.label}>{t.color}</div>

      <div style={styles.previewRow}>
        <div style={{ ...styles.previewSwatch, background: currentColor }} />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          style={styles.hexInput}
          maxLength={7}
        />
      </div>

      {/* Color Wheel */}
      <ColorWheel
        hue={hue}
        saturation={saturation}
        value={value}
        onHueChange={handleHueChange}
        onSVChange={handleSVChange}
      />

      {/* HSV Values Display */}
      <div style={styles.hsvRow}>
        <div style={styles.hsvGroup}>
          <span style={styles.hsvLabel}>H:</span>
          <span style={styles.hsvValue}>{Math.round(hue)}°</span>
        </div>
        <div style={styles.hsvGroup}>
          <span style={styles.hsvLabel}>S:</span>
          <span style={styles.hsvValue}>{Math.round(saturation * 100)}%</span>
        </div>
        <div style={styles.hsvGroup}>
          <span style={styles.hsvLabel}>V:</span>
          <span style={styles.hsvValue}>{Math.round(value * 100)}%</span>
        </div>
      </div>

      {/* Color Palette - 5×4 grid */}
      <div style={styles.palette}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            data-tooltip={c}
            style={{
              ...styles.swatch,
              background: c,
              outline: currentColor === c ? "2px solid var(--accent)" : "none",
              outlineOffset: 1,
            }}
            onClick={() => handlePresetClick(c)}
          />
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
    gap: 10,
    borderTop: "1px solid var(--surface-active)",
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--text-dim)",
    padding: "0 4px",
  },
  previewRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 4px",
  },
  previewSwatch: {
    width: 32,
    height: 32,
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--surface-active)",
    flexShrink: 0,
  },
  hexInput: {
    flex: 1,
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    padding: "4px 8px",
    width: 0,
  },
  wheelContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "8px 4px",
  },
  wheelCanvas: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    cursor: "crosshair",
  },
  squareCanvas: {
    width: 100,
    height: 100,
    borderRadius: 4,
    cursor: "crosshair",
    border: "1px solid var(--surface-active)",
  },
  hsvRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 4px",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
  },
  hsvGroup: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  hsvLabel: {
    color: "var(--text-dim)",
    fontWeight: 600,
  },
  hsvValue: {
    color: "var(--text)",
    minWidth: 32,
  },
  palette: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 3,
    padding: "0 4px",
  },
  swatch: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: 3,
    border: "1px solid rgba(0,0,0,0.3)",
    cursor: "pointer",
    padding: 0,
    transition: "transform var(--transition-fast)",
  },
};
