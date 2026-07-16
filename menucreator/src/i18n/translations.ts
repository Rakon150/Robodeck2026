export type Language = "en" | "cs";

export interface Translations {
  // App
  appTitle: string;

  // Toolbar
  tools: string;
  fillMode: string;
  filled: string;
  outline: string;

  // Tools
  pencil: string;
  eraser: string;
  rectangle: string;
  circle: string;
  line: string;
  fill: string;
  colorPicker: string;
  select: string;

  // Color
  color: string;

  // Layers
  layers: string;
  addLayer: string;
  mergeLayers: string;
  deleteLayer: string;
  hideLayer: string;
  showLayer: string;
  lockLayer: string;
  unlockLayer: string;
  renameLayer: string;

  // Properties
  canvasSize: string;
  width: string;
  height: string;
  applySize: string;
  currentCanvas: string;
  dimensions: string;
  zoom: string;
  gridLines: string;
  on: string;
  off: string;
  statistics: string;
  totalPixels: string;
  opaquePixels: string;
  transparent: string;
  estMemory: string;

  // TopBar
  undo: string;
  redo: string;
  grid: string;
  clear: string;
  export: string;
  import: string;
  clearCanvasConfirm: string;

  // Toasts
  layerRenamed: string;
  colorPicked: string;
  selectionDeleted: string;
  layerAdded: string;
  layerDeleted: string;
  deleteSelection: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Scene Builder",

    tools: "Tools",
    fillMode: "Fill Mode",
    filled: "Filled",
    outline: "Outline",

    pencil: "Pencil",
    eraser: "Eraser",
    rectangle: "Rectangle",
    circle: "Circle",
    line: "Line",
    fill: "Fill",
    colorPicker: "Color Picker",
    select: "Select",

    color: "Color",

    layers: "Layers",
    addLayer: "Add Layer",
    mergeLayers: "Merge All Layers",
    deleteLayer: "Delete Layer",
    hideLayer: "Hide Layer",
    showLayer: "Show Layer",
    lockLayer: "Lock Layer",
    unlockLayer: "Unlock Layer",
    renameLayer: "Rename Layer",

    canvasSize: "Canvas Size",
    width: "Width",
    height: "Height",
    applySize: "Apply Size",
    currentCanvas: "Current Canvas",
    dimensions: "Dimensions",
    zoom: "Zoom",
    gridLines: "Grid lines",
    on: "On",
    off: "Off",
    statistics: "Statistics",
    totalPixels: "Total pixels",
    opaquePixels: "Opaque pixels",
    transparent: "Transparent",
    estMemory: "Est. memory",

    undo: "Undo",
    redo: "Redo",
    grid: "Grid",
    clear: "Clear",
    export: "Export",
    import: "Import",
    clearCanvasConfirm: "Clear the entire canvas?",
    layerRenamed: "Layer renamed",
    colorPicked: "Color picked",
    selectionDeleted: "Selection deleted",
    layerAdded: "Layer added",
    layerDeleted: "Layer deleted",
    deleteSelection: "Delete selection",
  },

  cs: {
    appTitle: "Tvůrce scén",

    tools: "Nástroje",
    fillMode: "Režim výplně",
    filled: "Vyplněné",
    outline: "Obrys",

    pencil: "Tužka",
    eraser: "Gumma",
    rectangle: "Obdélník",
    circle: "Kruh",
    line: "Čára",
    fill: "Výplň",
    colorPicker: "Výběr barvy",
    select: "Výběr",

    color: "Barva",

    layers: "Vrstvy",
    addLayer: "Přidat vrstvu",
    mergeLayers: "Sloučit všechny vrstvy",
    deleteLayer: "Smazat vrstvu",
    hideLayer: "Skrýt vrstvu",
    showLayer: "Zobrazit vrstvu",
    lockLayer: "Zamknout vrstvu",
    unlockLayer: "Odemknout vrstvu",
    renameLayer: "Přejmenovat vrstvu",

    canvasSize: "Velikost plátna",
    width: "Šířka",
    height: "Výška",
    applySize: "Použít velikost",
    currentCanvas: "Aktuální plátno",
    dimensions: "Rozměry",
    zoom: "Přiblížení",
    gridLines: "Mřížka",
    on: "Zapnuto",
    off: "Vypnuto",
    statistics: "Statistiky",
    totalPixels: "Celkem pixelů",
    opaquePixels: "Neprůhledné pixely",
    transparent: "Průhledné",
    estMemory: "Odhad paměti",

    undo: "Zpět",
    redo: "Znovu",
    grid: "Mřížka",
    clear: "Vymazat",
    export: "Exportovat",
    import: "Importovat",
    clearCanvasConfirm: "Vymazat celé plátno?",
    layerRenamed: "Vrstva přejmenována",
    colorPicked: "Barva vybrána",
    selectionDeleted: "Výběr smazán",
    layerAdded: "Vrstva přidána",
    layerDeleted: "Vrstva smazána",
    deleteSelection: "Smazat výběr",
  },
};
