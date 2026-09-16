import { useRef, useEffect, useCallback, useState } from "react";
import { usePixelStore } from "../store/pixelStore";
import { useToast } from "./Toast";
import { useTranslation } from "../i18n";
import { getShapePixels, bresenhamLine } from "../utils/drawing";
import { TRANSPARENT, GRID_SIZE } from "../types";
import type { Point, ShapePreview, PixelGrid, CanvasConfig, SceneShape, ShapeRectangle, ShapeCircle, ShapeLine, Selection, Layer } from "../types";

// ─── Constants ───────────────────────────────────────────────────────────────
const CHECKER_A = "#ffffff";
const CHECKER_B = "#e0e0e0";
const GRID_COLOR = "rgba(0, 0, 0, 0.15)";
const SELECTION_COLOR = "#89b4fa";
const BASE_CELL = 8;

let shapeCounter = 0;
function nextShapeId(): string {
  return `shape_${Date.now().toString(36)}_${(shapeCounter++).toString(36)}`;
}

// ─── Coordinate Helpers ──────────────────────────────────────────────────────

function screenToGrid(
  cx: number,
  cy: number,
  canvas: HTMLCanvasElement,
  pan: Point,
  zoom: number,
  dpr: number,
): Point | null {
  const r = canvas.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  const offsetX = (cx - r.left) * dpr;
  const offsetY = (cy - r.top) * dpr;
  const cell = BASE_CELL * zoom * dpr;
  return {
    x: Math.floor((offsetX - pan.x * dpr) / cell),
    y: Math.floor((offsetY - pan.y * dpr) / cell),
  };
}

function clampToGrid(p: Point, w: number, h: number): Point | null {
  if (p.x < 0 || p.x >= w || p.y < 0 || p.y >= h) return null;
  return p;
}

function clampPointToGrid(p: Point, w: number, h: number): Point {
  return {
    x: Math.max(0, Math.min(w - 1, p.x)),
    y: Math.max(0, Math.min(h - 1, p.y)),
  };
}

function pointInBounds(
  p: Point,
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return p.x >= b.x && p.x < b.x + b.width && p.y >= b.y && p.y < b.y + b.height;
}

function constrainShapeEnd(
  tool: ShapePreview["tool"],
  start: Point,
  end: Point,
): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return end;
  if (tool === "line") {
    const len = Math.sqrt(dx * dx + dy * dy);
    const snapped = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
    return {
      x: start.x + Math.round(len * Math.cos(snapped)),
      y: start.y + Math.round(len * Math.sin(snapped)),
    };
  }
  const side = Math.max(Math.abs(dx), Math.abs(dy));
  return {
    x: start.x + (dx === 0 ? 0 : Math.sign(dx) * side),
    y: start.y + (dy === 0 ? 0 : Math.sign(dy) * side),
  };
}

// ─── Selection Helpers ────────────────────────────────────────────────────────

function getRectanglePoints(x1: number, y1: number, x2: number, y2: number): Point[] {
  const points: Point[] = [];
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      points.push({ x, y });
    }
  }
  return points;
}

function calculateBounds(points: Point[]): { x: number; y: number; width: number; height: number } | null {
  if (points.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

// ─── Canvas Renderer ─────────────────────────────────────────────────────────

function paint(
  ctx: CanvasRenderingContext2D,
  layers: Layer[],
  cfg: CanvasConfig,
  pan: Point,
  preview: ShapePreview | null,
  selection: Selection | null,
  dpr: number,
): void {
  const { width: W, height: H, showGrid, zoom } = cfg;
  const cell = BASE_CELL * zoom * dpr;
  const panX = pan.x * dpr;
  const panY = pan.y * dpr;
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;

  ctx.clearRect(0, 0, cw, ch);

  // 1. Checkerboard background
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? CHECKER_A : CHECKER_B;
      ctx.fillRect(panX + x * cell, panY + y * cell, cell, cell);
    }
  }

  // 2. Colored pixel data from all visible layers
  for (const layer of layers) {
    if (!layer.visible) continue;
    for (let y = 0; y < H; y++) {
      const row = layer.grid[y];
      if (!row) continue;
      for (let x = 0; x < W; x++) {
        const c = row[x];
        if (c && c !== TRANSPARENT) {
          ctx.fillStyle = c;
          ctx.fillRect(panX + x * cell, panY + y * cell, cell, cell);
        }
      }
    }
  }

  // 3. Shape preview overlay
  if (preview) {
    const pts = getShapePixels(
      preview.tool,
      preview.start.x,
      preview.start.y,
      preview.end.x,
      preview.end.y,
      preview.fill,
    );
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = preview.color;
    for (const p of pts) {
      ctx.fillRect(panX + p.x * cell, panY + p.y * cell, cell, cell);
    }
    ctx.globalAlpha = 1;
  }

  // 4. Selection overlay
  if (selection && selection.points.length > 0) {
    ctx.fillStyle = "rgba(137, 180, 250, 0.3)";
    for (const p of selection.points) {
      ctx.fillRect(panX + p.x * cell, panY + p.y * cell, cell, cell);
    }
    ctx.strokeStyle = SELECTION_COLOR;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    if (selection.bounds) {
      const b = selection.bounds;
      ctx.strokeRect(
        panX + b.x * cell - 1,
        panY + b.y * cell - 1,
        b.width * cell + 2,
        b.height * cell + 2,
      );
    }
    ctx.setLineDash([]);
  }

  // 5. Grid lines
  if (showGrid && cell >= 2) {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const px = panX + x * cell;
      ctx.moveTo(px, panY);
      ctx.lineTo(px, panY + H * cell);
    }
    for (let y = 0; y <= H; y++) {
      const py = panY + y * cell;
      ctx.moveTo(panX, py);
      ctx.lineTo(panX + W * cell, py);
    }
    ctx.stroke();
  }
}

// ─── Interaction State ───────────────────────────────────────────────────────

interface Drag {
  drawing: boolean;
  last: Point | null;
  shapeOrigin: Point | null;
  panning: boolean;
  panMouse: Point | null;
  panOrigin: Point | null;
  selectionStart: Point | null;
  selectionMode: "replace" | "add" | "remove";
  movingSelection: boolean;
  moveLast: Point | null;
  movedSelection: boolean;
}

interface PixelCanvasProps {
  isPanMode?: boolean;
}

export default function PixelCanvas({ isPanMode = false }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<Point>({ x: 0, y: 0 });
  const drag = useRef<Drag>({
    drawing: false,
    last: null,
    shapeOrigin: null,
    panning: false,
    panMouse: null,
    panOrigin: null,
    selectionStart: null,
    selectionMode: "replace",
    movingSelection: false,
    moveLast: null,
    movedSelection: false,
  });
  const initializedRef = useRef(false);
  const { addToast } = useToast();
  const { t } = useTranslation();
  const needsFitToView = usePixelStore((s) => s.needsFitToView);

  const redraw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const s = usePixelStore.getState();
    const dpr = window.devicePixelRatio || 1;
    paint(ctx, s.layers, s.config, panRef.current, s.shapePreview, s.selection, dpr);
  }, []);

  useEffect(() => {
    const unsub = usePixelStore.subscribe(() => redraw());
    redraw();
    return unsub;
  }, [redraw]);

  useEffect(() => {
    const ctr = containerRef.current;
    const cvs = canvasRef.current;
    if (!ctr || !cvs) return;

    const fit = () => {
      const w = Math.floor(ctr.getBoundingClientRect().width);
      if (w <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      cvs.width = w * dpr;
      cvs.height = w * dpr;
      cvs.style.width = `${w}px`;
      cvs.style.height = `${w}px`;
      const ctx = cvs.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      if (!initializedRef.current) {
        const z = usePixelStore.getState().config.zoom;
        const gridPx = GRID_SIZE * BASE_CELL * z;
        panRef.current = { x: (w - gridPx) / 2, y: (w - gridPx) / 2 };
        initializedRef.current = true;
      }

      redraw();
    };

    const obs = new ResizeObserver(fit);
    obs.observe(ctr);
    return () => obs.disconnect();
  }, [redraw]);

  useEffect(() => {
    const ctr = containerRef.current;
    if (!ctr) return;
    const s = usePixelStore.getState();
    if (s.needsFitToView === 0) return;

    const w = Math.floor(ctr.getBoundingClientRect().width);
    if (w <= 0) return;

    const { width: gridW, height: gridH } = s.config;
    const gridPxW = gridW * BASE_CELL;
    const gridPxH = gridH * BASE_CELL;
    const zoomX = w / gridPxW;
    const zoomY = w / gridPxH;
    const newZoom = Math.min(zoomX, zoomY);
    const clampedZoom = Math.max(0.5, Math.min(1, newZoom));

    const zoomedGridPxW = gridPxW * clampedZoom;
    const zoomedGridPxH = gridPxH * clampedZoom;
    panRef.current = {
      x: (w - zoomedGridPxW) / 2,
      y: (w - zoomedGridPxH) / 2,
    };

    s.setZoom(clampedZoom);
    redraw();
  }, [needsFitToView, redraw]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    const sync = () => {
      const d = drag.current;
      const tool = usePixelStore.getState().activeTool;
      let cursor = "crosshair";
      if (d.panning) {
        cursor = "grabbing";
        } else if (tool === "picker") {
        cursor = "crosshair";
      } else if (tool === "select") {
        cursor = d.movingSelection ? "move" : "crosshair";
      } else if (isPanMode) {
        cursor = "grab";
      }
      cvs.style.cursor = cursor;
    };

    const unsub = usePixelStore.subscribe(sync);
    sync();
    return unsub;
  }, [isPanMode]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = usePixelStore.getState();
      const oldZ = s.config.zoom;
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZ = Math.max(0.5, Math.min(8, oldZ * factor));

      const r = cvs.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;

      const p = panRef.current;
      const oldCell = BASE_CELL * oldZ;
      const newCell = BASE_CELL * newZ;
      panRef.current = {
        x: mx - ((mx - p.x) * newCell) / oldCell,
        y: my - ((my - p.y) * newCell) / oldCell,
      };

      s.setZoom(newZ);
    };

    cvs.addEventListener("wheel", onWheel, { passive: false });
    return () => cvs.removeEventListener("wheel", onWheel);
  }, []);

  const onMove = useCallback(
    (e: MouseEvent) => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const d = drag.current;
      const s = usePixelStore.getState();

      if (d.panning && d.panMouse && d.panOrigin) {
        panRef.current = {
          x: d.panOrigin.x + (e.clientX - d.panMouse.x),
          y: d.panOrigin.y + (e.clientY - d.panMouse.y),
        };
        redraw();
        return;
      }

      if (!d.drawing) return;

      const gp = screenToGrid(e.clientX, e.clientY, cvs, panRef.current, s.config.zoom, window.devicePixelRatio || 1);
      if (!gp) return;

      if (d.movingSelection && d.moveLast) {
        const target = clampPointToGrid(gp, s.config.width, s.config.height);
        const dx = target.x - d.moveLast.x;
        const dy = target.y - d.moveLast.y;
        if (dx !== 0 || dy !== 0) {
          s.moveSelection(dx, dy, false);
          d.moveLast = target;
          d.movedSelection = true;
        }
        return;
      }

      let clamped = clampToGrid(gp, s.config.width, s.config.height);
      if (!clamped) {
        if (s.activeTool !== "select") return;
        clamped = clampPointToGrid(gp, s.config.width, s.config.height);
      }

      switch (s.activeTool) {
        case "pencil": {
          const pts = d.last ? bresenhamLine(d.last.x, d.last.y, clamped.x, clamped.y) : [clamped];
          for (const p of pts) s.setPixel(p.x, p.y, s.currentColor);
          d.last = clamped;
          break;
        }
        case "eraser": {
          const pts = d.last ? bresenhamLine(d.last.x, d.last.y, clamped.x, clamped.y) : [clamped];
          for (const p of pts) s.setPixel(p.x, p.y, TRANSPARENT);
          d.last = clamped;
          break;
        }
        case "rectangle":
        case "circle":
        case "line":
          if (d.shapeOrigin) {
            const rawEnd = clamped;
            const tool = s.activeTool as ShapePreview["tool"];
            const end = e.shiftKey ? constrainShapeEnd(tool, d.shapeOrigin, rawEnd) : rawEnd;
            s.setShapePreview({
              tool,
              start: d.shapeOrigin,
              end,
              color: s.currentColor,
              fill: s.shapeFill,
            });
          }
          break;
        case "select":
          if (d.selectionStart) {
            const pts = getRectanglePoints(d.selectionStart.x, d.selectionStart.y, clamped.x, clamped.y);
            if (d.selectionMode === "replace") {
              const bounds = calculateBounds(pts);
              s.setSelection({ points: pts, bounds });
            } else if (d.selectionMode === "add") {
              s.addToSelection(pts);
            } else if (d.selectionMode === "remove") {
              const current = s.selection;
              if (current) {
                const removeSet = new Set(pts.map(p => `${p.x},${p.y}`));
                const remaining = current.points.filter(p => !removeSet.has(`${p.x},${p.y}`));
                const bounds = calculateBounds(remaining);
                s.setSelection({ points: remaining, bounds });
              }
            }
          }
          break;
      }
    },
    [redraw],
  );

  const onUp = useCallback(
    (e: MouseEvent) => {
      const d = drag.current;
      const s = usePixelStore.getState();

      if (d.panning) {
        d.panning = false;
        d.panMouse = null;
        d.panOrigin = null;
      } else if (d.movingSelection) {
        if (d.movedSelection) s.pushHistory();
        d.movingSelection = false;
        d.moveLast = null;
        d.movedSelection = false;
        d.drawing = false;
        d.selectionStart = null;
      } else if (d.drawing) {
        const tool = s.activeTool;

        if (tool === "rectangle" || tool === "circle" || tool === "line") {
          if (s.shapePreview) {
            const sp = s.shapePreview;
            const end = e.shiftKey ? constrainShapeEnd(sp.tool, sp.start, sp.end) : sp.end;
            const pts = getShapePixels(
              sp.tool,
              sp.start.x,
              sp.start.y,
              end.x,
              end.y,
              sp.fill,
            );
            s.setPixels(pts, sp.color);

            let shapeObj: SceneShape;
            const baseProps = {
              id: nextShapeId(),
              x: sp.start.x,
              y: sp.start.y,
              z: 0,
              color: sp.color,
              rotation: 0,
              pivotX: 0,
              pivotY: 0,
            };

            if (tool === "rectangle") {
              const x = Math.min(sp.start.x, end.x);
              const y = Math.min(sp.start.y, end.y);
              const w = Math.abs(end.x - sp.start.x) + 1;
              const h = Math.abs(end.y - sp.start.y) + 1;
              shapeObj = { ...baseProps, type: "rectangle", x, y, width: w, height: h, fill: sp.fill === "filled" } as ShapeRectangle;
            } else if (tool === "circle") {
              const dx = end.x - sp.start.x;
              const dy = end.y - sp.start.y;
              const r = Math.round(Math.sqrt(dx * dx + dy * dy));
              shapeObj = { ...baseProps, type: "circle", radius: r, fill: sp.fill === "filled" } as ShapeCircle;
            } else {
              shapeObj = { ...baseProps, type: "line", x2: end.x, y2: end.y } as ShapeLine;
            }

            s.addShape(shapeObj);
            s.pushHistory();
            s.setShapePreview(null);
          }
        } else if (tool === "pencil" || tool === "eraser") {
          s.pushHistory();
        }

        d.drawing = false;
        d.last = null;
        d.shapeOrigin = null;
        d.selectionStart = null;
      }

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    },
    [onMove],
  );

  const onDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const d = drag.current;
      const s = usePixelStore.getState();

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      if (e.button === 1 || (e.button === 0 && isPanMode)) {
        e.preventDefault();
        d.panning = true;
        d.panMouse = { x: e.clientX, y: e.clientY };
        d.panOrigin = { ...panRef.current };
        cvs.style.cursor = "grabbing";
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return;
      }

      if (e.button !== 0) return;

      const gp = screenToGrid(e.clientX, e.clientY, cvs, panRef.current, s.config.zoom, window.devicePixelRatio || 1);
      if (!gp) return;
      const clamped = clampToGrid(gp, s.config.width, s.config.height);
      if (!clamped) return;

      const { activeTool, currentColor, shapeFill } = s;

      switch (activeTool) {
        case "pencil":
          s.setPixel(clamped.x, clamped.y, currentColor);
          d.drawing = true;
          d.last = clamped;
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
          break;

        case "eraser":
          s.setPixel(clamped.x, clamped.y, TRANSPARENT);
          d.drawing = true;
          d.last = clamped;
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
          break;

        case "rectangle":
        case "circle":
        case "line":
          d.drawing = true;
          d.shapeOrigin = clamped;
          s.setShapePreview({
            tool: activeTool,
            start: clamped,
            end: clamped,
            color: currentColor,
            fill: shapeFill,
          });
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
          break;

        case "fill":
          s.fillArea(clamped.x, clamped.y, currentColor);
          s.pushHistory();
          break;

        case "picker": {
          const activeLayer = s.layers.find(l => l.id === s.activeLayerId);
          const hit = activeLayer?.grid[clamped.y]?.[clamped.x];
          if (hit && hit !== TRANSPARENT) {
            s.setCurrentColor(hit);
            addToast(`${t.colorPicked}: ${hit}`, "success");
          }
          break;
        }

        case "select": {
          const existing = s.selection;
          const additive = e.shiftKey || e.ctrlKey || e.metaKey;
          if (
            !additive &&
            existing &&
            existing.points.length > 0 &&
            existing.bounds &&
            pointInBounds(clamped, existing.bounds)
          ) {
            d.drawing = true;
            d.movingSelection = true;
            d.moveLast = clamped;
            d.movedSelection = false;
            cvs.style.cursor = "move";
          } else {
            d.drawing = true;
            d.selectionStart = clamped;
            if (e.shiftKey) d.selectionMode = "add";
            else if (e.ctrlKey || e.metaKey) d.selectionMode = "remove";
            else d.selectionMode = "replace";

            if (d.selectionMode === "replace") {
              s.setSelection({ points: [clamped], bounds: { x: clamped.x, y: clamped.y, width: 1, height: 1 } });
            }
          }
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
          break;
        }
      }
    },
    [onMove, onUp, isPanMode, addToast, t],
  );

  const onHover = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const d = drag.current;
      if (d.drawing || d.panning) return;
      const cvs = canvasRef.current;
      if (!cvs) return;
      const s = usePixelStore.getState();
      if (s.activeTool !== "select" || !s.selection?.bounds) return;
      const gp = screenToGrid(e.clientX, e.clientY, cvs, panRef.current, s.config.zoom, window.devicePixelRatio || 1);
      if (!gp) return;
      cvs.style.cursor = pointInBounds(gp, s.selection.bounds) ? "move" : "crosshair";
    },
    [],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onMove, onUp]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        onMouseDown={onDown}
        onMouseMove={onHover}
        onContextMenu={(e) => e.preventDefault()}
        style={{ display: "block" }}
      />
    </div>
  );
}
