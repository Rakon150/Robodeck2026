import * as adc from "adc";
import * as utils from "utils";
import { SaturnPins } from "saturn";
import { createSaturn } from "saturn";
import * as colors from "colors";
import { end } from "simpleradio";

adc.configure(SaturnPins.Pmod1.Pin1);
adc.configure(SaturnPins.Pmod1.Pin2);
const saturn = createSaturn();
const display = saturn.display;

function createApple(): void {
    appleExists = true;
    appleX = Math.floor(Math.random() * 64);
    appleY = Math.floor(Math.random() * 64);
}

function getPixelColor(x: number, y: number): number {
    var i = Math.round(y) + display.height * Math.round(x);
    var view = new Uint8Array(display.frame);
    var r = view[i * 3];
    var g = view[i * 3 + 1];
    var b = view[i * 3 + 2];
    return (r << 16) | (g << 8) | b;
}

function wrap(val: number, min: number, max: number): number {
    var range = max - min;
    if (range === 0) return min;
    return min + (((val - min) % range + range) % range);
}

while (true) {
    var maxSize = 100;
    var size = 64;
    var pixelsX: number[] = new Array(maxSize).fill(32);
    var pixelsY: number[] = new Array(maxSize).fill(32);
    var appleExists = false;
    var appleX = 32;
    var appleY = 32;
    var xDir = 1;
    var yDir = 0;
    while (true) {
        if (!appleExists) {
            createApple();
        }
        var x = adc.read(SaturnPins.Pmod1.Pin2);
        var y = adc.read(SaturnPins.Pmod1.Pin1);
        var sx = utils.map(x, 0, 1023, 0, 63);
        var sy = utils.map(y, 0, 1023, 0, 63);
        if (sy > 29) {
            var temp = sy - 29;
            sy = 29 - temp;
        } else {
            var temp = 29 - sy;
            sy = 29 + temp;
        }
        sx -= 29;
        sy -= 29;
        if (Math.abs(sx) > 2 || Math.abs(sy) > 2) {
            var tempXDir = xDir;
            var tempYDir = yDir;
            if (Math.abs(sx) > Math.abs(sy)) {
                tempXDir = Math.sign(sx);
                tempYDir = 0;
            } else {
                tempYDir = Math.sign(sy);
                tempXDir = 0;
            }
            if (getPixelColor(pixelsX[0] + tempXDir, pixelsY[0] + tempYDir) == colors.off) {
                xDir = tempXDir;
                yDir = tempYDir;
            }
        }
        for (var i = size - 1; i > 0; i--) {
            pixelsX[i] = pixelsX[i - 1];
            pixelsY[i] = pixelsY[i - 1];
        }
        pixelsX[0] += xDir;
        pixelsY[0] += yDir;
        pixelsX[0] = wrap(pixelsX[0], 0, 64)
        pixelsY[0] = wrap(pixelsY[0], 0, 64)
        if (getPixelColor(pixelsX[0], pixelsY[0]) != colors.off && getPixelColor(pixelsX[0], pixelsY[0]) != colors.purple) {
            break;
        }
        display.clear();
        for (var i = 0; i < size; i++) {
            display.setPixel(pixelsX[i], pixelsY[i], colors.rainbow(i * (360 / size)));
            if (i == 0) {
                display.setPixel(appleX, appleY, colors.purple);
            }
            if (getPixelColor(pixelsX[0], pixelsY[0]) == colors.purple) {
                size++;
                appleExists = false;
                break
            }
        }
        display.show();
        await sleep(50);
    }
}