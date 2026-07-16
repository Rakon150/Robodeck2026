export const GRID_SIZE = 64;
export const DEFAULT_COLOR = "#000000";
export const TRANSPARENT = "transparent";

export type Tool =
  | "pencil"
  | "eraser"
  | "rectangle"
  | "circle"
  | "line"
  | "fill"
  | "picker"
  | "select";

export type ShapeFill = "filled" | "outline";

export interface Selection {
  points: Point[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface Point {
  x: number;
  y: number;
}

export interface ShapePreview {
  tool: "rectangle" | "circle" | "line";
  start: Point;
  end: Point;
  color: string;
  fill: ShapeFill;
}

export type PixelGrid = string[][];

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  grid: PixelGrid;
}

export interface HistoryEntry {
  grid: PixelGrid;
  shapes: SceneShape[];
  timestamp: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  showGrid: boolean;
  zoom: number;
}

export function createEmptyGrid(width: number = GRID_SIZE, height: number = GRID_SIZE): PixelGrid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TRANSPARENT)
  );
}

export function cloneGrid(grid: PixelGrid): PixelGrid {
  return grid.map((row) => [...row]);
}

export interface ShapeBase {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  color: string;
  rotation: number;
  pivotX: number;
  pivotY: number;
}

export interface ShapeRectangle extends ShapeBase {
  type: "rectangle";
  width: number;
  height: number;
  fill: boolean;
}

export interface ShapeCircle extends ShapeBase {
  type: "circle";
  radius: number;
  fill: boolean;
}

export interface ShapeLine extends ShapeBase {
  type: "line";
  x2: number;
  y2: number;
}

export interface ShapePoint extends ShapeBase {
  type: "point";
}

export interface ShapePolygon extends ShapeBase {
  type: "polygon";
  vertices: [number, number][];
  fill: boolean;
}

export interface ShapeRegularPolygon extends ShapeBase {
  type: "regularPolygon";
  sides: number;
  radius: number;
  fill: boolean;
}

export interface ShapeCollection extends ShapeBase {
  type: "collection";
  children: SceneShape[];
}

export type SceneShape =
  | ShapeRectangle
  | ShapeCircle
  | ShapeLine
  | ShapePoint
  | ShapePolygon
  | ShapeRegularPolygon
  | ShapeCollection;
