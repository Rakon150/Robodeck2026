import type { Point, ShapeFill } from "../types";

/**
 * Bresenham's line algorithm - returns all pixels on the line
 */
export function bresenhamLine(x0: number, y0: number, x1: number, y1: number): Point[] {
  const points: Point[] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;

  while (true) {
    points.push({ x: cx, y: cy });
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }

  return points;
}

/**
 * Get all pixels for a rectangle (outline or filled)
 */
export function getRectanglePixels(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  fill: ShapeFill
): Point[] {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);

  if (fill === "filled") {
    const points: Point[] = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        points.push({ x, y });
      }
    }
    return points;
  }

  // Outline only
  const points: Point[] = [];
  for (let x = minX; x <= maxX; x++) {
    points.push({ x, y: minY });
    points.push({ x, y: maxY });
  }
  for (let y = minY + 1; y < maxY; y++) {
    points.push({ x: minX, y });
    points.push({ x: maxX, y });
  }
  return points;
}

/**
 * Midpoint circle algorithm - returns all pixels on the circle
 */
export function getCirclePixels(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: ShapeFill
): Point[] {
  const points: Point[] = [];

  if (fill === "filled") {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1.0) {
          points.push({ x: cx + x, y: cy + y });
        }
      }
    }
    return points;
  }

  // Outline using parametric approach
  const steps = Math.max(rx, ry) * 8 + 16;
  for (let i = 0; i < steps; i++) {
    const angle = (2 * Math.PI * i) / steps;
    const px = Math.round(cx + rx * Math.cos(angle));
    const py = Math.round(cy + ry * Math.sin(angle));
    points.push({ x: px, y: py });
  }
  return points;
}

/**
 * Get line pixels between two points
 */
export function getLinePixels(x0: number, y0: number, x1: number, y1: number): Point[] {
  return bresenhamLine(x0, y0, x1, y1);
}

/**
 * Get rectangle pixels from two corner points
 */
export function getShapePixels(
  tool: "rectangle" | "circle" | "line",
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  fill: ShapeFill
): Point[] {
  switch (tool) {
    case "rectangle":
      return getRectanglePixels(x0, y0, x1, y1, fill);
    case "circle": {
      const cx = Math.round((x0 + x1) / 2);
      const cy = Math.round((y0 + y1) / 2);
      const rx = Math.abs(x1 - x0) / 2;
      const ry = Math.abs(y1 - y0) / 2;
      return getCirclePixels(cx, cy, Math.round(rx), Math.round(ry), fill);
    }
    case "line":
      return getLinePixels(x0, y0, x1, y1);
  }
}
