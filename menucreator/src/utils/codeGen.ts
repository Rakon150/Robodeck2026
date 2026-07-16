import type { PixelGrid, CanvasConfig } from "../types";

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return [
    parseInt(result[1] ?? "0", 16),
    parseInt(result[2] ?? "0", 16),
    parseInt(result[3] ?? "0", 16),
  ];
}

function formatColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "colors.rgb(255, 255, 255)";
  return `colors.rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

let nameCounter = 0;
function uniqueName(type: string, usedNames: Set<string>): string {
  const base = type;
  let suffix = Date.now().toString(36).slice(-3) + (nameCounter++).toString(36);
  let name = `${base}_${suffix}`;
  while (usedNames.has(name)) {
    suffix = Date.now().toString(36).slice(-3) + (nameCounter++).toString(36);
    name = `${base}_${suffix}`;
  }
  usedNames.add(name);
  return name;
}

function optimizeRectangles(
  grid: PixelGrid,
): Array<{ x: number; y: number; width: number; height: number; color: string }> {
  const rects: Array<{ x: number; y: number; width: number; height: number; color: string }> = [];
  const rows = grid.length;
  if (rows === 0) return rects;
  const cols = grid[0]?.length ?? 0;

  const covered: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  for (let y = 0; y < rows; y++) {
    const row = grid[y];
    if (!row) continue;

    for (let x = 0; x < cols; x++) {
      if (covered[y]![x]) continue;
      const cell = row[x];
      if (!cell || cell === "transparent") continue;

      let width = 0;
      while (x + width < cols) {
        const nextCell = row[x + width];
        if (nextCell !== cell || covered[y]![x + width]) break;
        width++;
      }

      let height = 1;
      outer: while (y + height < rows) {
        const nextRow = grid[y + height];
        if (!nextRow) break;
        for (let dx = 0; dx < width; dx++) {
          if (nextRow[x + dx] !== cell || covered[y + height]![x + dx]) {
            break outer;
          }
        }
        height++;
      }

      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          covered[y + dy]![x + dx] = true;
        }
      }

      rects.push({ x, y, width, height, color: cell });
    }
  }

  return rects;
}

export function generateScene(
  grid: PixelGrid,
  config: CanvasConfig,
  _shapes: unknown[],
  shapeName = "generateScene",
): string {
  const safeName = shapeName.replace(/[^a-zA-Z0-9_$]/g, "_") || "generateScene";
  const usedNames = new Set<string>();
  const lines: string[] = [];

  lines.push(`function ${safeName}() {`);
  lines.push(`\tconst scene = new Collection({ x: 0, y: 0, z: 0 });`);
  lines.push("");

  const rects = optimizeRectangles(grid);

  for (const rect of rects) {
    const varName = uniqueName(
      rect.width === 1 && rect.height === 1 ? "point" : "rectangle",
      usedNames,
    );
    const colStr = formatColor(rect.color);

    if (rect.width === 1 && rect.height === 1) {
      lines.push(`\tconst ${varName} = new Point({`);
      lines.push(`\t\tx: ${rect.x}, y: ${rect.y},`);
      lines.push(`\t\tcolor: ${colStr}`);
      lines.push(`\t});`);
    } else {
      lines.push(`\tconst ${varName} = new Rectangle({`);
      lines.push(`\t\tx: ${rect.x}, y: ${rect.y},`);
      lines.push(`\t\tcolor: ${colStr},`);
      lines.push(`\t\tz: 0,`);
      lines.push(`\t\twidth: ${rect.width}, height: ${rect.height},`);
      lines.push(`\t\tfill: true`);
      lines.push(`\t});`);
    }
    lines.push(`\tscene.add(${varName});`);
    lines.push("");
  }

  lines.push(`\treturn scene;`);
  lines.push(`}`);
  lines.push("");

  return lines.join("\n");
}

export function generateTypeScript(
  grid: PixelGrid,
  config: CanvasConfig,
  shapeName = "generateScene",
): string {
  return generateScene(grid, config, [], shapeName);
}

export function generateTypeScriptOptimized(
  grid: PixelGrid,
  config: CanvasConfig,
  shapeName = "generateScene",
): string {
  return generateScene(grid, config, [], shapeName);
}
