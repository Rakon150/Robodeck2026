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

/**
 * Encodes a pixel grid as a 32bpp bottom-up BMP (BITMAPV4HEADER, BI_BITFIELDS)
 * with a true alpha channel, so transparent cells stay transparent in the
 * file. Built by hand because canvas.toBlob() has no "image/bmp" output type.
 *
 * Bottom-up (positive height) is required, not just conventional: some BMP
 * readers (e.g. the RoboDeck firmware's Texture::fromBMP) reject any file
 * with a negative/top-down height outright.
 */
export function gridToBmpBlob(grid: PixelGrid): Blob {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  const HEADER_SIZE = 108; // BITMAPV4HEADER
  const FILE_HEADER_SIZE = 14;
  const pixelDataSize = width * height * 4;
  const fileSize = FILE_HEADER_SIZE + HEADER_SIZE + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  let o = 0;

  // BITMAPFILEHEADER
  view.setUint8(o, 0x42); o += 1; // 'B'
  view.setUint8(o, 0x4d); o += 1; // 'M'
  view.setUint32(o, fileSize, true); o += 4;
  view.setUint32(o, 0, true); o += 4; // reserved
  view.setUint32(o, FILE_HEADER_SIZE + HEADER_SIZE, true); o += 4; // pixel data offset

  // BITMAPV4HEADER
  view.setUint32(o, HEADER_SIZE, true); o += 4;
  view.setInt32(o, width, true); o += 4;
  view.setInt32(o, height, true); o += 4; // positive height = bottom-up rows (some BMP readers reject negative/top-down heights)
  view.setUint16(o, 1, true); o += 2; // planes
  view.setUint16(o, 32, true); o += 2; // bits per pixel
  view.setUint32(o, 3, true); o += 4; // BI_BITFIELDS
  view.setUint32(o, pixelDataSize, true); o += 4;
  view.setInt32(o, 2835, true); o += 4; // ~72 DPI
  view.setInt32(o, 2835, true); o += 4;
  view.setUint32(o, 0, true); o += 4; // colors used
  view.setUint32(o, 0, true); o += 4; // important colors
  view.setUint32(o, 0x00ff0000, true); o += 4; // red mask
  view.setUint32(o, 0x0000ff00, true); o += 4; // green mask
  view.setUint32(o, 0x000000ff, true); o += 4; // blue mask
  view.setUint32(o, 0xff000000, true); o += 4; // alpha mask
  view.setUint32(o, 0x73524742, true); o += 4; // color space: LCS_sRGB
  o += 36; // CIEXYZTRIPLE endpoints (unused, zeroed)
  o += 12; // gamma red/green/blue (unused, zeroed)

  // Pixel data: bottom-up rows (file row 0 is grid's last row), each pixel
  // packed as B,G,R,A to match the masks above.
  for (let fileRow = 0; fileRow < height; fileRow++) {
    const y = height - 1 - fileRow;
    for (let x = 0; x < width; x++) {
      const color = grid[y]?.[x];
      let r = 0, g = 0, b = 0, a = 0;
      if (color && color !== "transparent") {
        const hex = color.replace("#", "");
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = 255;
      }
      view.setUint8(o, b); o += 1;
      view.setUint8(o, g); o += 1;
      view.setUint8(o, r); o += 1;
      view.setUint8(o, a); o += 1;
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}
