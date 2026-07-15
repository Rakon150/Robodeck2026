import { createSaturn } from "saturn";
import * as colors from "colors";
import { log } from "gridui";

const saturn = createSaturn();
const display = saturn.display;

class Point {
    id: number;
    currX: number;
    currY: number;
    xSpd: number;
    ySpd: number;
    col: number;
    size: number;

    constructor() {
        this.id = currIdCntr;
        currIdCntr++;
        this.currY = Math.floor(Math.random() * 64);
        this.currX = Math.floor(Math.random() * 64);
        this.xSpd = 3;
        this.ySpd = 3;
        this.col = colors.rainbow(Math.floor(Math.random() * (360 + 1)));
        this.size = 2;
    }

    move () {
        var bounce = false;
        display.clear();
        if (this.id < balls) {
            this.currX += this.xSpd;
            this.currY += this.ySpd;
            if (this.currX >= (63 - this.size) || this.currX < 1) {
                this.xSpd = -this.xSpd + Math.random() - Math.random();
                bounce = true;
            }
            if (this.currY >= (63 - this.size) || this.currY < 1) {
                this.ySpd = -this.ySpd + Math.random() - Math.random();
                bounce = true;
            } 
            if (bounce) {
                this.currX = Math.max(0, Math.min(63 - this.size, this.currX));
                this.currY = Math.max(0, Math.min(63 - this.size, this.currY));
                if (bounceCounter == 2) {
                    this.size += 5;
                    bounceCounter = 0;
                } else {
                    bounceCounter++;
                }
            }
            this.draw(this.currX, this.currY, this.size, this.col);
        }
        
    }
   draw (x: number, y: number, size: number, color: number): void {
    for (let py = y; py < y + size; py++) {
        for (let px = x; px < x + size; px++) {
            display.setPixel(px, py, color);
        }
    }
}
}
var balls = 1;
var maxBalls = 1;
var currIdCntr = 0;
var bounceCounter = 0;
const points: Point[] = Array.from({ length: maxBalls }, () => new Point());   

while (true) {
    for (var i = 0; i < maxBalls; i++) {
        points[i].move();
    }
    if (balls == maxBalls) {
        balls = 1;
    }
    display.show();
    await sleep(10);
}