import { GameLoop } from "game-loop";
import { createSaturn } from "saturn";
import { Circle, LineSegment, Rectangle } from "shapes";
import * as colors from "colors";
import * as adc from "adc";
import { SaturnPins } from "saturn";
import { Font } from "renderer";
import { Button } from "button";

const font = new Font();

adc.configure(SaturnPins.Pmod1.Pin1);
adc.configure(SaturnPins.Pmod1.Pin2);

let x = 0;
let y = 0;
let jumpThresh = -100

let isPressed = false;
const btnStick = new Button(SaturnPins.Pmod1.Pin4);

setInterval(() => {
    x = adc.read(SaturnPins.Pmod1.Pin1);
    y = adc.read(SaturnPins.Pmod1.Pin2);
    x -= 475;
    y -= 475;
    //console.log(`X: ${x}, Y: ${y}`);
    isPressed = btnStick.isPressed();
}, 50);

let score = 0;
let highScore = 0;
let pause = false;
let saturn = createSaturn();
let loop = new GameLoop(saturn.display);
let difficulty = 1;
let pX = 16;
let pY = 32;
let pillarX = 100;
let pillarGapSize = 30;
let vsp = 0;
let jumpSpd = -0.6;
let grav = 0.02;
let pillarSpd = 1;
var canJump = true;
let started = false;

function wrap(val: number, min: number, max: number): number {
    var range = max - min;
    if (range === 0) return min;
    return min + (((val - min) % range + range) % range);
}

async function resetPillar() {
    score += difficulty;
    pillarSpd += 0.01;
    pillarX = 74;
    pillarGapSize = 30 + (Math.random() * 5) - (Math.random() * 5);
    pillarBottom.setPosition(pillarX, 0 - (Math.random() * 25));
    pillarTop.setPosition(pillarX, pillarBottom.getY() + pillarGapSize + 30);
}

async function resetGame() {
    pX = 16;
    pY = 32;
    pillarX = 100;
    vsp = 0;
    pause = true;
    score = Math.floor(score);
    var hscbeat = false;
    if (score > highScore) {
        highScore = score;
    }
    const highScoreText = loop.drawText("Hsc:" + highScore, 30, 3, font, colors.white, false);
    const scoreText = loop.drawText("Sc: " + score, 30, 13, font, colors.white, false);
    await sleep(1000);
    loop.removeText(scoreText);
    loop.removeText(highScoreText);
    score = 0;
    pause = false;
}

let player = new Circle({
    x: pX,
    y: pY,
    radius: 3,
    color: colors.yellow,
    fill: true
});

let pillarBottom = new Rectangle({
    x: pillarX,
    y: 0,
    width: 10,
    height: 30,
    color: colors.green,
    fill: true
});
loop.addShape(pillarBottom);
let pillarTop = new Rectangle({
    x: pillarX,
    y: pillarBottom.getX() + pillarGapSize + 30,
    width: 10,
    height: 50,
    color: colors.green,
    fill: true
});
loop.addShape(player);
loop.addShape(pillarTop);
//difficulty
let difficultyline = new LineSegment({
    x: 24,
    y: 12,
    x2: 24,
    y2: 52,
    color: colors.white,
});
let difficultySegment2 = new LineSegment({
    x: 20,
    y: 32,
    x2: 28,
    y2: 32,
    color: colors.orange,
});
let difficultySegment3 = new LineSegment({
    x: 20,
    y: 12,
    x2: 28,
    y2: 12,
    color: colors.green,
});
let difficultySegment1 = new LineSegment({
    x: 20,
    y: 52,
    x2: 28,
    y2: 52,
    color: colors.red,
});
loop.addShape(difficultyline);
loop.addShape(difficultySegment1);
loop.addShape(difficultySegment2);
loop.addShape(difficultySegment3);

resetPillar();

loop.on("tick", (delta) => {
    player.setPosition(pX, pY);
    if (!pause && started) {
        if (vsp < 1) {
            vsp += grav;
        }
        pY += vsp;
        pY = wrap(pY, 0, 64);
        if ((x < jumpThresh || isPressed) && canJump) {
            vsp = jumpSpd;
            canJump = false;
        } else if (vsp >= 0) {
            canJump = true;
        }
        pillarX -= pillarSpd;
        pillarBottom.setPosition(pillarX, pillarBottom.getY())
        pillarTop.setPosition(pillarX, pillarTop.getY());
        if (pillarX < -11) {
            resetPillar();
        }
    } else if (!started) {
        if (x > -jumpThresh && pY < 52) {
            pY += 0.5;
        } else if (x < jumpThresh && pY > 12) {
            pY -= 0.5;
        }
        difficulty = (pY - 12)/40 * 2;
        if (difficulty < 0.5) {
            difficulty = 0.5;
        }
        if (isPressed) {
            loop.removeShape(difficultyline);
            loop.removeShape(difficultySegment1);
            loop.removeShape(difficultySegment2);
            loop.removeShape(difficultySegment3);
            pillarSpd *= difficulty;
            started = true;
        }
    }
});

loop.on("collision", player, pillarBottom, () => {
    resetGame();
});

loop.on("collision", player, pillarTop, () => {
    resetGame();
});
