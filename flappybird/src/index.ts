import { GameLoop } from "game-loop";
import { createSaturn } from "saturn";
import { LineSegment, Rectangle } from "shapes";
import * as colors from "colors";
import * as adc from "adc";
import { SaturnPins } from "saturn";
import { Font } from "renderer";
import { Button } from "button";
import { Collection } from "shapes";

const font = new Font();

function generateScene() {
	const scene = new Collection({ x: 0, y: 0, z: 0 });

	const rectangle_8nx32 = new Rectangle({
		x: 6, y: 1,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 6, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx32);

	const rectangle_8nx33 = new Rectangle({
		x: 4, y: 2,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx33);

	const rectangle_8nx34 = new Rectangle({
		x: 6, y: 2,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 4, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx34);

	const point_8nx35 = new Rectangle({
		x: 10, y: 2,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx35);

	const rectangle_8nx36 = new Rectangle({
		x: 11, y: 2,
		color: colors.rgb(204, 204, 204),
		z: 0,
		width: 1, height: 5,
		fill: true
	});
	scene.add(rectangle_8nx36);

	const point_8nx37 = new Rectangle({
		x: 12, y: 2,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx37);

	const rectangle_8nx38 = new Rectangle({
		x: 3, y: 3,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_8nx38);

	const rectangle_8nx39 = new Rectangle({
		x: 4, y: 3,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 5, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx39);

	const rectangle_8nx3a = new Rectangle({
		x: 9, y: 3,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 3,
		fill: true
	});
	scene.add(rectangle_8nx3a);

	const rectangle_8nx3b = new Rectangle({
		x: 10, y: 3,
		color: colors.rgb(204, 204, 204),
		z: 0,
		width: 1, height: 3,
		fill: true
	});
	scene.add(rectangle_8nx3b);

	const point_8nx3c = new Rectangle({
		x: 12, y: 3,
		color: colors.rgb(204, 204, 204),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3c);

	const point_8nx3d = new Rectangle({
		x: 13, y: 3,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3d);

	const rectangle_8nx3e = new Rectangle({
		x: 1, y: 4,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx3e);

	const point_8nx3f = new Rectangle({
		x: 4, y: 4,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3f);

	const rectangle_8nx3g = new Rectangle({
		x: 5, y: 4,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 4, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx3g);

	const rectangle_8nx3h = new Rectangle({
		x: 12, y: 4,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_8nx3h);

	const rectangle_8nx3i = new Rectangle({
		x: 13, y: 4,
		color: colors.rgb(204, 204, 204),
		z: 0,
		width: 1, height: 3,
		fill: true
	});
	scene.add(rectangle_8nx3i);

	const rectangle_8nx3j = new Rectangle({
		x: 14, y: 4,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 4,
		fill: true
	});
	scene.add(rectangle_8nx3j);

	const rectangle_8nx3k = new Rectangle({
		x: 0, y: 5,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 3,
		fill: true
	});
	scene.add(rectangle_8nx3k);

	const rectangle_8nx3l = new Rectangle({
		x: 1, y: 5,
		color: colors.rgb(204, 204, 204),
		z: 0,
		width: 4, height: 2,
		fill: true
	});
	scene.add(rectangle_8nx3l);

	const point_8nx3m = new Rectangle({
		x: 5, y: 5,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3m);

	const rectangle_8nx3n = new Rectangle({
		x: 6, y: 5,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 3, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx3n);

	const point_8nx3o = new Rectangle({
		x: 5, y: 6,
		color: colors.rgb(204, 204, 204),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3o);

	const rectangle_8nx3p = new Rectangle({
		x: 6, y: 6,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_8nx3p);

	const rectangle_8nx3q = new Rectangle({
		x: 7, y: 6,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 3, height: 3,
		fill: true
	});
	scene.add(rectangle_8nx3q);

	const point_8nx3r = new Rectangle({
		x: 10, y: 6,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3r);

	const point_8nx3s = new Rectangle({
		x: 12, y: 6,
		color: colors.rgb(204, 204, 204),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3s);

	const point_8nx3t = new Rectangle({
		x: 1, y: 7,
		color: colors.rgb(255, 255, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3t);

	const rectangle_8nx3u = new Rectangle({
		x: 2, y: 7,
		color: colors.rgb(204, 204, 204),
		z: 0,
		width: 3, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx3u);

	const point_8nx3v = new Rectangle({
		x: 5, y: 7,
		color: colors.rgb(255, 255, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3v);

	const point_8nx3w = new Rectangle({
		x: 10, y: 7,
		color: colors.rgb(255, 255, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3w);

	const rectangle_8nx3x = new Rectangle({
		x: 11, y: 7,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 3, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx3x);

	const point_8nx3y = new Rectangle({
		x: 15, y: 7,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3y);

	const point_8nx3z = new Rectangle({
		x: 1, y: 8,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx3z);

	const rectangle_8nx40 = new Rectangle({
		x: 2, y: 8,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 3, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx40);

	const point_8nx41 = new Rectangle({
		x: 5, y: 8,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx41);

	const rectangle_8nx42 = new Rectangle({
		x: 6, y: 8,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 1, height: 3,
		fill: true
	});
	scene.add(rectangle_8nx42);

	const point_8nx43 = new Rectangle({
		x: 10, y: 8,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx43);

	const rectangle_8nx44 = new Rectangle({
		x: 11, y: 8,
		color: colors.rgb(255, 136, 0),
		z: 0,
		width: 5, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx44);

	const point_8nx45 = new Rectangle({
		x: 16, y: 8,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx45);

	const rectangle_8nx46 = new Rectangle({
		x: 2, y: 9,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 3, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx46);

	const rectangle_8nx47 = new Rectangle({
		x: 5, y: 9,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_8nx47);

	const rectangle_8nx48 = new Rectangle({
		x: 7, y: 9,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 2, height: 3,
		fill: true
	});
	scene.add(rectangle_8nx48);

	const point_8nx49 = new Rectangle({
		x: 9, y: 9,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx49);

	const point_8nx4a = new Rectangle({
		x: 10, y: 9,
		color: colors.rgb(255, 136, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx4a);

	const rectangle_8nx4b = new Rectangle({
		x: 11, y: 9,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 5, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx4b);

	const point_8nx4c = new Rectangle({
		x: 4, y: 10,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx4c);

	const rectangle_8nx4d = new Rectangle({
		x: 9, y: 10,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_8nx4d);

	const point_8nx4e = new Rectangle({
		x: 10, y: 10,
		color: colors.rgb(0, 0, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx4e);

	const rectangle_8nx4f = new Rectangle({
		x: 11, y: 10,
		color: colors.rgb(255, 136, 0),
		z: 0,
		width: 4, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx4f);

	const rectangle_8nx4g = new Rectangle({
		x: 15, y: 10,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_8nx4g);

	const rectangle_8nx4h = new Rectangle({
		x: 5, y: 11,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx4h);

	const point_8nx4i = new Rectangle({
		x: 10, y: 11,
		color: colors.rgb(255, 255, 0),
		width: 1, height: 1,
		fill: true
	});
	scene.add(point_8nx4i);

	const rectangle_8nx4j = new Rectangle({
		x: 11, y: 11,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 4, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx4j);

	const rectangle_8nx4k = new Rectangle({
		x: 7, y: 12,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 4, height: 1,
		fill: true
	});
	scene.add(rectangle_8nx4k);

	return scene;
}

function generatePipeBottom() {
	const scene = new Collection({ x: 0, y: 0, z: 0 });

	const rectangle_fdq0 = new Rectangle({
		x: 0, y: 0,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 10, height: 1,
		fill: true
	});
	scene.add(rectangle_fdq0);

	const rectangle_fdq1 = new Rectangle({
		x: 0, y: 1,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 4,
		fill: true
	});
	scene.add(rectangle_fdq1);

	const rectangle_fdq2 = new Rectangle({
		x: 1, y: 1,
		color: colors.rgb(85, 255, 85),
		z: 0,
		width: 4, height: 3,
		fill: true
	});
	scene.add(rectangle_fdq2);

	const rectangle_fdq3 = new Rectangle({
		x: 5, y: 1,
		color: colors.rgb(0, 255, 0),
		z: 0,
		width: 4, height: 3,
		fill: true
	});
	scene.add(rectangle_fdq3);

	const rectangle_fdq4 = new Rectangle({
		x: 9, y: 1,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 4,
		fill: true
	});
	scene.add(rectangle_fdq4);

	const rectangle_fdq5 = new Rectangle({
		x: 1, y: 4,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 8, height: 1,
		fill: true
	});
	scene.add(rectangle_fdq5);

	const rectangle_fdq6 = new Rectangle({
		x: 1, y: 5,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 45,
		fill: true
	});
	scene.add(rectangle_fdq6);

	const rectangle_fdq7 = new Rectangle({
		x: 2, y: 5,
		color: colors.rgb(85, 255, 85),
		z: 0,
		width: 3, height: 44,
		fill: true
	});
	scene.add(rectangle_fdq7);

	const rectangle_fdq8 = new Rectangle({
		x: 5, y: 5,
		color: colors.rgb(0, 255, 0),
		z: 0,
		width: 3, height: 44,
		fill: true
	});
	scene.add(rectangle_fdq8);

	const rectangle_fdq9 = new Rectangle({
		x: 8, y: 5,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 45,
		fill: true
	});
	scene.add(rectangle_fdq9);

	const rectangle_fdqa = new Rectangle({
		x: 2, y: 49,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 6, height: 1,
		fill: true
	});
	scene.add(rectangle_fdqa);

	return scene;
}

function generatePipeTop() {
	const scene = new Collection({ x: 0, y: 0, z: 0 });

	const rectangle_m4lm = new Rectangle({
		x: 1, y: 0,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 8, height: 1,
		fill: true
	});
	scene.add(rectangle_m4lm);

	const rectangle_m4ln = new Rectangle({
		x: 1, y: 1,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 45,
		fill: true
	});
	scene.add(rectangle_m4ln);

	const rectangle_m4lo = new Rectangle({
		x: 2, y: 1,
		color: colors.rgb(85, 255, 85),
		z: 0,
		width: 3, height: 44,
		fill: true
	});
	scene.add(rectangle_m4lo);

	const rectangle_m4lp = new Rectangle({
		x: 5, y: 1,
		color: colors.rgb(0, 255, 0),
		z: 0,
		width: 3, height: 44,
		fill: true
	});
	scene.add(rectangle_m4lp);

	const rectangle_m4lq = new Rectangle({
		x: 8, y: 1,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 45,
		fill: true
	});
	scene.add(rectangle_m4lq);

	const rectangle_m4lr = new Rectangle({
		x: 0, y: 45,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 5,
		fill: true
	});
	scene.add(rectangle_m4lr);

	const rectangle_m4ls = new Rectangle({
		x: 2, y: 45,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 6, height: 1,
		fill: true
	});
	scene.add(rectangle_m4ls);

	const rectangle_m4lt = new Rectangle({
		x: 9, y: 45,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 5,
		fill: true
	});
	scene.add(rectangle_m4lt);

	const rectangle_m4lu = new Rectangle({
		x: 1, y: 46,
		color: colors.rgb(85, 255, 85),
		z: 0,
		width: 4, height: 3,
		fill: true
	});
	scene.add(rectangle_m4lu);

	const rectangle_m4lv = new Rectangle({
		x: 5, y: 46,
		color: colors.rgb(0, 255, 0),
		z: 0,
		width: 4, height: 3,
		fill: true
	});
	scene.add(rectangle_m4lv);

	const rectangle_m4lw = new Rectangle({
		x: 1, y: 49,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 8, height: 1,
		fill: true
	});
	scene.add(rectangle_m4lw);

	return scene;
}


adc.configure(SaturnPins.Pmod1.Pin1);
adc.configure(SaturnPins.Pmod1.Pin2);

let x = 0;
let y = 0;
let jumpThresh = -100;

let isPressed = false;
const btnStick = new Button(SaturnPins.Pmod1.Pin4);

setInterval(() => {
    x = adc.read(SaturnPins.Pmod3.Pin1);
    y = adc.read(SaturnPins.Pmod3.Pin2);
    x -= 475;
    y -= 475;
    isPressed = btnStick.isPressed();
}, 50);

let score = 0;
let highScore = 0;
let pause = false;
let saturn = createSaturn();
let loop = new GameLoop(saturn.display);
let difficulty = 1;
let pX = 8;
let pY = 30;
let pillarX = 100;
let pillarGapSize = 30;
let vsp = 0;
let jumpSpd = -0.6;
let grav = 0.02;
let pillarSpd = 1;
let canJump = true;
let started = false;

function wrap(val: number, min: number, max: number): number {
    const range = max - min;
    if (range === 0) return min;
    return min + (((val - min) % range + range) % range);
}

const display = saturn.display;
function getPixelColor(x: number, y: number): number {
    const i = Math.round(y) + display.height * Math.round(x);
    const view = new Uint8Array(display.frame);
    const r = view[i * 3];
    const g = view[i * 3 + 1];
    const b = view[i * 3 + 2];
    return (r << 16) | (g << 8) | b;
}

function resetPillar() {
    score += difficulty;
    pillarSpd += 0.01;
    pillarX = 74;
    pillarGapSize = 30 + (Math.random() * 5) - (Math.random() * 5);
    pillarBottom.setPosition(pillarX, 0 - (Math.random() * 25));
    pillarTop.setPosition(pillarX, pillarBottom.getY() + pillarGapSize + 40);
}

async function resetGame() {
    pY = 32;
    pillarX = 100;
    vsp = 0;
    pause = true;
    score = Math.floor(score);
    if (score > highScore) {
        highScore = score;
    }
    const highScoreText = loop.drawText("Hsc:" + highScore, 30, 3, font, colors.red, false);
    const scoreText = loop.drawText("Sc: " + score, 30, 13, font, colors.red, false);
    while (!isPressed) {
        await sleep(1);
        isPressed = btnStick.isPressed();
    }
    await sleep(100);
    loop.removeText(scoreText);
    loop.removeText(highScoreText);
    score = 0;
    pause = false;
}

let bg = new Rectangle({
    x: 0,
    y: 0,
    width: 100,
    height: 300,
    color: colors.rgb(70, 130, 180),
    fill: true
});
loop.addShape(bg);
let player = generateScene();
player.setScale(0.667, 0.667);

let pillarBottom = generatePipeTop();
loop.addShape(pillarBottom);
let pillarTop = generatePipeBottom();
loop.addShape(player);
loop.addShape(pillarTop);
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
    if (!pause && started) {
        player.setPosition(pX, pY);
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
        player.setRotationAngle(0 - (vsp * 20))
    } else if (!started) {
        player.setPosition(pX, pY);
        if (x > -jumpThresh && pY < 50) {
            pY += 0.5;
        } else if (x < jumpThresh && pY > 10) {
            pY -= 0.5;
        }
        difficulty = (pY - 12)/40 * 2;
        if (difficulty < 0.5) {
            difficulty = 0.5;
        } else if (difficulty >= 1.9) {
            difficulty = 2;
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

loop.on("collision", player, pillarTop, () => {
    resetGame();
});