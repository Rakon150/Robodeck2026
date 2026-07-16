import { create } from "zustand";
import type {
  Tool,
  ShapeFill,
  Point,
  PixelGrid,
  CanvasConfig,
  HistoryEntry,
  ShapePreview,
  SceneShape,
  Selection,
  Layer,
} from "../types";
import { createEmptyGrid, cloneGrid, GRID_SIZE, TRANSPARENT } from "../types";

function calculateBounds(points: Point[]): { x: number; y: number; width: number; height: number } | null {
  if (points.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

let layerCounter = 0;
function nextLayerId(): string {
  return `layer_${Date.now().toString(36)}_${(layerCounter++).toString(36)}`;
}

interface PixelStore {
  layers: Layer[];
  activeLayerId: string;
  config: CanvasConfig;
  shapes: SceneShape[];

  activeTool: Tool;
  currentColor: string;
  shapeFill: ShapeFill;

  selection: Selection | null;
  shapePreview: ShapePreview | null;

  history: HistoryEntry[];
  historyIndex: number;

  // Layer operations
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  moveLayer: (fromIndex: number, toIndex: number) => void;
  renameLayer: (id: string, name: string) => void;
  getActiveGrid: () => PixelGrid;
  mergeLayers: () => void;

  setPixel: (x: number, y: number, color: string) => void;
  setPixels: (pixels: Point[], color: string) => void;
  fillArea: (x: number, y: number, color: string) => void;
  loadGrid: (grid: PixelGrid) => void;
  clearGrid: () => void;

  addShape: (shape: SceneShape) => void;
  removeShape: (id: string) => void;
  clearShapes: () => void;

  setActiveTool: (tool: Tool) => void;
  setCurrentColor: (color: string) => void;
  setShapeFill: (fill: ShapeFill) => void;
  setShapePreview: (preview: ShapePreview | null) => void;

  setSelection: (selection: Selection | null) => void;
  addToSelection: (points: Point[]) => void;
  clearSelection: () => void;
  deleteSelection: () => void;
  moveSelection: (dx: number, dy: number) => void;
  fillSelection: (color: string) => void;

  setGridSize: (width: number, height: number) => void;
  toggleGrid: () => void;
  setZoom: (zoom: number) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function createDefaultLayer(): Layer {
  return {
    id: nextLayerId(),
    name: "Layer 1",
    visible: true,
    locked: false,
    grid: createEmptyGrid(),
  };
}

export const usePixelStore = create<PixelStore>((set, get) => {
  const defaultLayer = createDefaultLayer();

  return {
    layers: [defaultLayer],
    activeLayerId: defaultLayer.id,
    config: {
      width: GRID_SIZE,
      height: GRID_SIZE,
      showGrid: true,
      zoom: 1,
    },
    shapes: [],

    activeTool: "pencil",
    currentColor: "#ff0000",
    shapeFill: "filled",

    selection: null,
    shapePreview: null,

    history: [{ grid: createEmptyGrid(), shapes: [], timestamp: Date.now() }],
    historyIndex: 0,

    addLayer: (name) => {
      const { layers, config } = get();
      const newLayer: Layer = {
        id: nextLayerId(),
        name: name || `Layer ${layers.length + 1}`,
        visible: true,
        locked: false,
        grid: createEmptyGrid(config.width, config.height),
      };
      set({ layers: [...layers, newLayer], activeLayerId: newLayer.id });
    },
    removeLayer: (id) => {
      const { layers } = get();
      if (layers.length <= 1) return;
      const newLayers = layers.filter(l => l.id !== id);
      const { activeLayerId } = get();
      set({
        layers: newLayers,
        activeLayerId: activeLayerId === id ? newLayers[0]!.id : activeLayerId,
      });
    },
    setActiveLayer: (id) => set({ activeLayerId: id, selection: null }),
    toggleLayerVisibility: (id) => {
      set(s => ({
        layers: s.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l),
      }));
    },
    toggleLayerLock: (id) => {
      set(s => ({
        layers: s.layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l),
      }));
    },
    moveLayer: (fromIndex, toIndex) => {
      const { layers } = get();
      const newLayers = [...layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      if (removed) {
        newLayers.splice(toIndex, 0, removed);
      }
      set({ layers: newLayers });
    },
    renameLayer: (id, name) => {
      set(s => ({
        layers: s.layers.map(l => l.id === id ? { ...l, name } : l),
      }));
    },
    getActiveGrid: () => {
      const { layers, activeLayerId } = get();
      const layer = layers.find(l => l.id === activeLayerId);
      return layer?.grid ?? createEmptyGrid();
    },
    mergeLayers: () => {
      const { layers, config } = get();
      const mergedGrid = createEmptyGrid(config.width, config.height);
      for (const layer of layers) {
        if (!layer.visible) continue;
        for (let y = 0; y < config.height; y++) {
          for (let x = 0; x < config.width; x++) {
            const color = layer.grid[y]?.[x];
            if (color && color !== TRANSPARENT) {
              mergedGrid[y]![x] = color;
            }
          }
        }
      }
      const newLayer: Layer = {
        id: nextLayerId(),
        name: "Merged",
        visible: true,
        locked: false,
        grid: mergedGrid,
      };
      set({ layers: [newLayer], activeLayerId: newLayer.id });
    },

    setPixel: (x, y, color) => {
      const { layers, activeLayerId, config } = get();
      if (x < 0 || x >= config.width || y < 0 || y >= config.height) return;
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const layer = layers[layerIndex]!;
      if (layer.locked) return;
      const newGrid = cloneGrid(layer.grid);
      newGrid[y]![x] = color;
      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layer, grid: newGrid };
      set({ layers: newLayers });
    },

    setPixels: (pixels, color) => {
      const { layers, activeLayerId, config } = get();
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const layer = layers[layerIndex]!;
      if (layer.locked) return;
      const newGrid = cloneGrid(layer.grid);
      for (const p of pixels) {
        if (p.x >= 0 && p.x < config.width && p.y >= 0 && p.y < config.height) {
          newGrid[p.y]![p.x] = color;
        }
      }
      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layer, grid: newGrid };
      set({ layers: newLayers });
    },

    fillArea: (startX, startY, color) => {
      const { layers, activeLayerId, config } = get();
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const layer = layers[layerIndex]!;
      if (layer.locked) return;
      const targetColor = layer.grid[startY]?.[startX];
      if (targetColor === color) return;

      const newGrid = cloneGrid(layer.grid);
      const stack: Point[] = [{ x: startX, y: startY }];
      const visited = new Set<string>();

      while (stack.length > 0) {
        const p = stack.pop()!;
        const key = `${p.x},${p.y}`;
        if (visited.has(key)) continue;
        if (p.x < 0 || p.x >= config.width || p.y < 0 || p.y >= config.height) continue;
        if (newGrid[p.y]![p.x] !== targetColor) continue;

        visited.add(key);
        newGrid[p.y]![p.x] = color;

        stack.push({ x: p.x + 1, y: p.y });
        stack.push({ x: p.x - 1, y: p.y });
        stack.push({ x: p.x, y: p.y + 1 });
        stack.push({ x: p.x, y: p.y - 1 });
      }

      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layer, grid: newGrid };
      set({ layers: newLayers });
    },

    loadGrid: (grid) => {
      const { layers, activeLayerId } = get();
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layers[layerIndex]!, grid: cloneGrid(grid) };
      set({ layers: newLayers });
      get().pushHistory();
    },

    clearGrid: () => {
      const { layers, activeLayerId, config } = get();
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const newLayers = [...layers];
      newLayers[layerIndex] = {
        ...layers[layerIndex]!,
        grid: createEmptyGrid(config.width, config.height),
      };
      set({ layers: newLayers, shapes: [] });
      get().pushHistory();
    },

    setActiveTool: (tool) => set({ activeTool: tool, shapePreview: null, selection: null }),
    setCurrentColor: (color) => set({ currentColor: color }),
    setShapeFill: (fill) => set({ shapeFill: fill }),
    setShapePreview: (preview) => set({ shapePreview: preview }),

    addShape: (shape) => set(s => ({ shapes: [...s.shapes, shape] })),
    removeShape: (id) => set(s => ({ shapes: s.shapes.filter(sh => sh.id !== id) })),
    clearShapes: () => set({ shapes: [] }),

    setGridSize: (width, height) => {
      const { layers, config } = get();
      const newLayers = layers.map(layer => {
        const newGrid = createEmptyGrid(width, height);
        const copyW = Math.min(width, layer.grid[0]?.length ?? 0);
        const copyH = Math.min(height, layer.grid.length);
        for (let y = 0; y < copyH; y++) {
          for (let x = 0; x < copyW; x++) {
            newGrid[y]![x] = layer.grid[y]![x] ?? TRANSPARENT;
          }
        }
        return { ...layer, grid: newGrid };
      });
      set({
        config: { ...config, width, height },
        layers: newLayers,
      });
      get().pushHistory();
    },

    toggleGrid: () =>
      set(s => ({ config: { ...s.config, showGrid: !s.config.showGrid } })),

    setZoom: (zoom) =>
      set(s => ({ config: { ...s.config, zoom: Math.max(0.5, Math.min(8, zoom)) } })),

    setSelection: (selection) => set({ selection }),
    addToSelection: (points) => {
      const { selection } = get();
      if (!selection) {
        const bounds = calculateBounds(points);
        set({ selection: { points, bounds } });
      } else {
        const newPoints = [...selection.points];
        const pointSet = new Set(newPoints.map(p => `${p.x},${p.y}`));
        for (const p of points) {
          if (!pointSet.has(`${p.x},${p.y}`)) {
            newPoints.push(p);
          }
        }
        const bounds = calculateBounds(newPoints);
        set({ selection: { points: newPoints, bounds } });
      }
    },
    clearSelection: () => set({ selection: null }),
    deleteSelection: () => {
      const { selection, layers, activeLayerId, config } = get();
      if (!selection) return;
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const layer = layers[layerIndex]!;
      if (layer.locked) return;
      const newGrid = cloneGrid(layer.grid);
      for (const p of selection.points) {
        if (p.x >= 0 && p.x < config.width && p.y >= 0 && p.y < config.height) {
          newGrid[p.y]![p.x] = TRANSPARENT;
        }
      }
      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layer, grid: newGrid };
      set({ layers: newLayers, selection: null });
      get().pushHistory();
    },
    moveSelection: (dx, dy) => {
      const { selection, layers, activeLayerId, config } = get();
      if (!selection) return;
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const layer = layers[layerIndex]!;
      if (layer.locked) return;
      const newGrid = cloneGrid(layer.grid);
      const oldPoints = new Map(selection.points.map(p => [`${p.x},${p.y}`, layer.grid[p.y]?.[p.x] ?? TRANSPARENT]));
      for (const p of selection.points) {
        if (p.x >= 0 && p.x < config.width && p.y >= 0 && p.y < config.height) {
          newGrid[p.y]![p.x] = TRANSPARENT;
        }
      }
      const newPoints: Point[] = [];
      for (const p of selection.points) {
        const nx = p.x + dx;
        const ny = p.y + dy;
        if (nx >= 0 && nx < config.width && ny >= 0 && ny < config.height) {
          const color = oldPoints.get(`${p.x},${p.y}`);
          if (color) {
            newGrid[ny]![nx] = color;
            newPoints.push({ x: nx, y: ny });
          }
        }
      }
      const bounds = calculateBounds(newPoints);
      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layer, grid: newGrid };
      set({ layers: newLayers, selection: { points: newPoints, bounds } });
    },
    fillSelection: (color) => {
      const { selection, layers, activeLayerId, config } = get();
      if (!selection) return;
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const layer = layers[layerIndex]!;
      if (layer.locked) return;
      const newGrid = cloneGrid(layer.grid);
      for (const p of selection.points) {
        if (p.x >= 0 && p.x < config.width && p.y >= 0 && p.y < config.height) {
          newGrid[p.y]![p.x] = color;
        }
      }
      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layer, grid: newGrid };
      set({ layers: newLayers });
      get().pushHistory();
    },

    pushHistory: () => {
      const { layers, shapes, history, historyIndex, activeLayerId } = get();
      const activeLayer = layers.find(l => l.id === activeLayerId);
      const activeGrid = activeLayer?.grid ?? createEmptyGrid();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ grid: cloneGrid(activeGrid), shapes: structuredClone(shapes), timestamp: Date.now() });
      if (newHistory.length > 100) newHistory.shift();
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },

    undo: () => {
      const { historyIndex, history, layers, activeLayerId } = get();
      if (historyIndex <= 0) return;
      const newIndex = historyIndex - 1;
      const entry = history[newIndex]!;
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layers[layerIndex]!, grid: cloneGrid(entry.grid) };
      set({
        layers: newLayers,
        shapes: structuredClone(entry.shapes),
        historyIndex: newIndex,
      });
    },

    redo: () => {
      const { historyIndex, history, layers, activeLayerId } = get();
      if (historyIndex >= history.length - 1) return;
      const newIndex = historyIndex + 1;
      const entry = history[newIndex]!;
      const layerIndex = layers.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1) return;
      const newLayers = [...layers];
      newLayers[layerIndex] = { ...layers[layerIndex]!, grid: cloneGrid(entry.grid) };
      set({
        layers: newLayers,
        shapes: structuredClone(entry.shapes),
        historyIndex: newIndex,
      });
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
  };
});
