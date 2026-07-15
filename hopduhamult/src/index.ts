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

    constructor() {
        this.id = currIdCntr;
        currIdCntr++;
        this.currY = Math.floor(Math.random() * (63 + 1));
        this.currX = Math.floor(Math.random() * (63 + 1));
        this.xSpd = 1;
        this.ySpd = 1;
        this.col = colors.rainbow(Math.floor(Math.random() * (360 + 1)));
    }

    move () {
        var bounce = false;
        display.setPixel(this.currX, this.currY, colors.off);
        if (this.id < balls) {
            this.currX += this.xSpd;
            this.currY += this.ySpd;
            if (this.currX  >= (64) || this.currX < (0)) {
                this.xSpd *= -1 + Math.random() - Math.random();
                bounce = true;
                console.log("hop");
            }
            if (this.currY >= (64) || this.currY < (0)) {
                this.ySpd *= -1 + Math.random() - Math.random();
                bounce = true;
                console.log("hop");
            } 
            if (bounce && balls < maxBalls) {
                if (bounceCounter == 5) {
                    balls++;
                    bounceCounter = 0;
                } else {
                    bounceCounter++;
                }
                this.currX += this.xSpd;
                this.currY += this.ySpd;
            }
            this.currX = Math.max(0, Math.min(63, this.currX));
            this.currY = Math.max(0, Math.min(63, this.currY));
            display.setPixel(this.currX, this.currY, this.col);
        }
        
    }
}
var balls = 1;
var maxBalls = 50;
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
    //console.log("balls" + balls);
}