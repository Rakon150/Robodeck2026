import { createSaturn } from "saturn";
import * as colors from "colors";
import * as adc from "adc";


const sat = createSaturn();
const display = sat.display;

const JOYSTICK_PIN_X = sat.Pins.Pmod1.Pin1;
const JOYSTICK_PIN_Y = sat.Pins.Pmod1.Pin2;
const JOYSTICK_DEADZONE = 100;

const REEL_COUNT = 3;
const REEL_WIDTH = 18;
const REEL_GAP = 2;
const REEL_X_START = (64 - (REEL_COUNT * REEL_WIDTH + (REEL_COUNT - 1) * REEL_GAP)) / 2;
const REEL_Y_START = 14;
const REEL_HEIGHT = 36;
const SYMBOL_SIZE = 10;

const SYMBOLS = [
    { name: "cherry", color: colors.red },
    { name: "bar", color: colors.green },
    { name: "seven", color: colors.yellow },
    { name: "lemon", color: colors.orange },
    { name: "diamond", color: colors.light_blue },
    { name: "bell", color: colors.yellow },
    { name: "star", color: colors.yellow },
    { name: "clover", color: colors.green },
];
const SYMBOL_COUNT = SYMBOLS.length;

let reelPositions: number[] = [0, 0, 0];
let spinning = false;
let stopTimers: number[] = [0, 0, 0];
let spinSpeeds: number[] = [0, 0, 0];
let score = 0;
let joystickAtCenter = true;
let winReels: boolean[] = [false, false, false];

adc.configure(JOYSTICK_PIN_X, adc.Attenuation.Db11);
adc.configure(JOYSTICK_PIN_Y, adc.Attenuation.Db11);

const calibratedX = adc.read(JOYSTICK_PIN_X);
const calibratedY = adc.read(JOYSTICK_PIN_Y);

function drawPixel(x: number, y: number, color: Rgb): void {
    const fx = 63 - Math.floor(x);
    const fy = Math.floor(y);
    if (fx >= 0 && fx < 64 && fy >= 0 && fy < 64) {
        display.setPixel(fx, fy, color);
    }
}

function drawRect(x: number, y: number, w: number, h: number, color: Rgb): void {
    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            drawPixel(x + dx, y + dy, color);
        }
    }
}

function drawCircle(cx: number, cy: number, r: number, color: Rgb): void {
    for (let angle = 0; angle < 360; angle += 5) {
        const rad = angle * Math.PI / 180;
        const px = Math.floor(cx + Math.cos(rad) * r);
        const py = Math.floor(cy + Math.sin(rad) * r);
        drawPixel(px, py, color);
    }
}

function drawCherry(cx: number, cy: number): void {
    drawPixel(cx + 3, cy + 1, colors.green);
    drawPixel(cx + 4, cy + 0, colors.green);
    drawPixel(cx + 5, cy + 1, colors.green);
    drawPixel(cx + 2, cy + 4, colors.red);
    drawPixel(cx + 3, cy + 3, colors.red);
    drawPixel(cx + 4, cy + 4, colors.red);
    drawPixel(cx + 3, cy + 5, colors.red);
    drawPixel(cx + 5, cy + 5, colors.red);
    drawPixel(cx + 6, cy + 4, colors.red);
    drawPixel(cx + 7, cy + 5, colors.red);
    drawPixel(cx + 6, cy + 6, colors.red);
}

function drawBar(cx: number, cy: number): void {
    drawRect(cx + 1, cy + 3, 8, 4, colors.green);
    drawRect(cx + 2, cy + 4, 6, 2, colors.white);
}

function drawSeven(cx: number, cy: number): void {
    drawRect(cx + 2, cy + 2, 6, 2, colors.yellow);
    drawPixel(cx + 7, cy + 3, colors.yellow);
    drawPixel(cx + 6, cy + 4, colors.yellow);
    drawPixel(cx + 5, cy + 5, colors.yellow);
    drawPixel(cx + 4, cy + 6, colors.yellow);
    drawPixel(cx + 3, cy + 7, colors.yellow);
    drawPixel(cx + 2, cy + 8, colors.yellow);
}

function drawLemon(cx: number, cy: number): void {
    drawPixel(cx + 4, cy + 2, colors.yellow);
    drawRect(cx + 3, cy + 3, 4, 1, colors.yellow);
    drawRect(cx + 2, cy + 4, 6, 2, colors.yellow);
    drawRect(cx + 3, cy + 6, 4, 1, colors.yellow);
    drawPixel(cx + 4, cy + 7, colors.yellow);
}

function drawDiamond(cx: number, cy: number): void {
    drawPixel(cx + 4, cy + 1, colors.light_blue);
    drawRect(cx + 3, cy + 2, 3, 1, colors.light_blue);
    drawRect(cx + 2, cy + 3, 5, 1, colors.light_blue);
    drawRect(cx + 1, cy + 4, 7, 1, colors.light_blue);
    drawRect(cx + 2, cy + 5, 5, 1, colors.light_blue);
    drawRect(cx + 3, cy + 6, 3, 1, colors.light_blue);
    drawPixel(cx + 4, cy + 7, colors.light_blue);
}

function drawBell(cx: number, cy: number): void {
    drawPixel(cx + 4, cy + 1, colors.yellow);
    drawRect(cx + 3, cy + 2, 3, 1, colors.yellow);
    drawRect(cx + 2, cy + 3, 5, 2, colors.yellow);
    drawRect(cx + 1, cy + 5, 7, 2, colors.yellow);
    drawRect(cx + 1, cy + 7, 7, 1, colors.orange);
    drawPixel(cx + 4, cy + 8, colors.orange);
}

function drawStar(cx: number, cy: number): void {
    drawPixel(cx + 4, cy + 0, colors.yellow);
    drawRect(cx + 3, cy + 1, 3, 1, colors.yellow);
    drawRect(cx + 1, cy + 2, 7, 1, colors.yellow);
    drawRect(cx + 2, cy + 3, 5, 1, colors.yellow);
    drawPixel(cx + 1, cy + 4, colors.yellow);
    drawPixel(cx + 7, cy + 4, colors.yellow);
    drawPixel(cx + 2, cy + 5, colors.yellow);
    drawPixel(cx + 6, cy + 5, colors.yellow);
    drawPixel(cx + 3, cy + 6, colors.yellow);
    drawPixel(cx + 5, cy + 6, colors.yellow);
}

function drawClover(cx: number, cy: number): void {
    drawPixel(cx + 3, cy + 2, colors.green);
    drawPixel(cx + 5, cy + 2, colors.green);
    drawPixel(cx + 4, cy + 1, colors.green);
    drawRect(cx + 2, cy + 3, 2, 2, colors.green);
    drawRect(cx + 4, cy + 3, 2, 2, colors.green);
    drawRect(cx + 3, cy + 5, 2, 2, colors.green);
    drawPixel(cx + 4, cy + 7, colors.green);
    drawPixel(cx + 4, cy + 8, colors.green);
}

const drawFns = [drawCherry, drawBar, drawSeven, drawLemon, drawDiamond, drawBell, drawStar, drawClover];

function drawSymbol(x: number, y: number, idx: number): void {
    drawFns[idx](x, y);
}

function drawReel(reelIdx: number, offset: number): void {
    const reelX = REEL_X_START + reelIdx * (REEL_WIDTH + REEL_GAP);
    const baseSymbol = Math.floor(offset) % SYMBOL_COUNT;
    const frac = offset - Math.floor(offset);

    for (let slot = -1; slot <= Math.ceil(REEL_HEIGHT / SYMBOL_SIZE) + 1; slot++) {
        const symIdx = ((baseSymbol + slot) % SYMBOL_COUNT + SYMBOL_COUNT) % SYMBOL_COUNT;
        const sy = REEL_Y_START + slot * SYMBOL_SIZE - Math.floor(frac * SYMBOL_SIZE);
        if (sy + SYMBOL_SIZE > REEL_Y_START && sy < REEL_Y_START + REEL_HEIGHT) {
            drawSymbol(reelX + 4, sy + 1, symIdx);
        }
    }
}

function drawReelFrame(): void {
    for (let r = 0; r < REEL_COUNT; r++) {
        const rx = REEL_X_START + r * (REEL_WIDTH + REEL_GAP);
        for (let y = REEL_Y_START - 1; y <= REEL_Y_START + REEL_HEIGHT; y++) {
            drawPixel(rx - 1, y, colors.white);
            drawPixel(rx + REEL_WIDTH, y, colors.white);
        }
        for (let x = rx - 1; x <= rx + REEL_WIDTH; x++) {
            drawPixel(x, REEL_Y_START - 1, colors.white);
            drawPixel(x, REEL_Y_START + REEL_HEIGHT, colors.white);
        }
    }
}

const FONT: Record<string, number[]> = {
    "C": [0b111, 0b100, 0b100, 0b100, 0b111],
    "R": [0b110, 0b101, 0b110, 0b101, 0b101],
    "E": [0b111, 0b100, 0b110, 0b100, 0b111],
    "D": [0b110, 0b101, 0b101, 0b101, 0b110],
    "I": [0b111, 0b010, 0b010, 0b010, 0b111],
    "T": [0b111, 0b010, 0b010, 0b010, 0b010],
    "S": [0b111, 0b100, 0b111, 0b001, 0b111],
    ":": [0b000, 0b010, 0b000, 0b010, 0b000],
    "0": [0b111, 0b101, 0b101, 0b101, 0b111],
    "1": [0b010, 0b110, 0b010, 0b010, 0b111],
    "2": [0b111, 0b001, 0b111, 0b100, 0b111],
    "3": [0b111, 0b001, 0b111, 0b001, 0b111],
    "4": [0b101, 0b101, 0b111, 0b001, 0b001],
    "5": [0b111, 0b100, 0b111, 0b001, 0b111],
    "6": [0b111, 0b100, 0b111, 0b101, 0b111],
    "7": [0b111, 0b001, 0b001, 0b001, 0b001],
    "8": [0b111, 0b101, 0b111, 0b101, 0b111],
    "9": [0b111, 0b101, 0b111, 0b001, 0b111],
};

function drawChar(ch: string, x: number, y: number, color: Rgb): void {
    const glyph = FONT[ch];
    if (!glyph) return;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
            if (glyph[row] & (1 << (2 - col))) {
                drawPixel(x + col, y + row, color);
            }
        }
    }
}

function drawText(text: string, x: number, y: number, color: Rgb): void {
    for (let i = 0; i < text.length; i++) {
        drawChar(text[i], x + i * 4, y, color);
    }
}

function drawScore(): void {
    drawText("CREDITS:" + score, 2, 2, colors.yellow);
}

function drawPullText(): void {
    const y = 56;
    for (let x = 10; x < 54; x++) {
        drawPixel(x, y, colors.rainbow((x * 10) % 360));
    }
}

function isJoystickMoved(): boolean {
    const joyX = adc.read(JOYSTICK_PIN_X);
    const joyY = adc.read(JOYSTICK_PIN_Y);
    const dx = Math.abs(joyX - calibratedX);
    const dy = Math.abs(joyY - calibratedY);
    return dx > JOYSTICK_DEADZONE || dy > JOYSTICK_DEADZONE;
}

function checkWin(): number {
    const s0 = reelPositions[0] % SYMBOL_COUNT;
    const s1 = reelPositions[1] % SYMBOL_COUNT;
    const s2 = reelPositions[2] % SYMBOL_COUNT;
    winReels = [false, false, false];
    if (s0 === s1 && s1 === s2) {
        winReels = [true, true, true];
        return 3;
    }
    if (s0 === s1) {
        winReels = [true, true, false];
        return 2;
    }
    if (s1 === s2) {
        winReels = [false, true, true];
        return 2;
    }
    if (s0 === s2) {
        winReels = [true, false, true];
        return 2;
    }
    return 0;
}

function startSpin(): void {
    if (spinning) return;
    spinning = true;
    for (let i = 0; i < REEL_COUNT; i++) {
        spinSpeeds[i] = 2.0 + Math.random() * 1.0;
        stopTimers[i] = 30 + i * 20;
    }
}

function updateSpin(): void {
    if (!spinning) return;
    let allStopped = true;
    for (let i = 0; i < REEL_COUNT; i++) {
        if (stopTimers[i] > 0) {
            reelPositions[i] += spinSpeeds[i];
            stopTimers[i]--;
            allStopped = false;
        } else if (spinSpeeds[i] > 0) {
            spinSpeeds[i] -= 0.15;
            if (spinSpeeds[i] <= 0) {
                spinSpeeds[i] = 0;
                reelPositions[i] = Math.round(reelPositions[i]);
            } else {
                reelPositions[i] += spinSpeeds[i];
                allStopped = false;
            }
        }
    }
    if (allStopped) {
        spinning = false;
        const win = checkWin();
        if (win === 3) {
            score += 10;
        } else if (win === 2) {
            score += 3;
        }
    }
}

while (true) {
    display.clear();

    const moved = isJoystickMoved();
    if (!moved) {
        joystickAtCenter = true;
    }
    if (moved && joystickAtCenter && !spinning) {
        startSpin();
        joystickAtCenter = false;
    }

    updateSpin();

    drawReelFrame();
    for (let r = 0; r < REEL_COUNT; r++) {
        drawReel(r, reelPositions[r]);
    }
    drawScore();
    drawPullText();

    const win = spinning ? 0 : checkWin();
    if (win > 0) {
        for (let r = 0; r < REEL_COUNT; r++) {
            if (winReels[r]) {
                const rx = REEL_X_START + r * (REEL_WIDTH + REEL_GAP) + REEL_WIDTH / 2;
                const ry = REEL_Y_START + REEL_HEIGHT / 2;
                drawCircle(rx, ry, 12, colors.red);
            }
        }
    }

    display.show();
    await sleep(16);
}