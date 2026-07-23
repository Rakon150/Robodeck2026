import { GameLoop } from "game-loop";
import { createSaturn } from "saturn";
import { Circle, LineSegment, Rectangle } from "shapes";
import * as colors from "colors";
import * as adc from "adc";
import { SaturnPins } from "saturn";
import { Font } from "renderer";
import { Button } from "button";
import { Collection } from "shapes";
import { Display } from "rphub75";
import { PIEZO, Effects, Volume, Tones } from "piezo";

const font = new Font();
const piezo = new PIEZO(SaturnPins.Pmod2.Pin1);
piezo.setVolume(Volume.ON);

function generateScene() {
	const scene = new Collection({ x: 0, y: 0, z: 0 });

	const rectangle_sg330 = new Rectangle({
		x: 4, y: 0,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 6, height: 1,
		fill: true
	});
	scene.add(rectangle_sg330);

	const rectangle_sg331 = new Rectangle({
		x: 2, y: 1,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_sg331);

	const rectangle_sg332 = new Rectangle({
		x: 4, y: 1,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 3, height: 1,
		fill: true
	});	
	scene.add(rectangle_sg332);

	const rectangle_sg333 = new Rectangle({
		x: 7, y: 1,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_sg333);

	const rectangle_sg334 = new Rectangle({
		x: 8, y: 1,
		color: colors.rgb(255, 255, 255),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_sg334);

	const rectangle_sg335 = new Rectangle({
		x: 10, y: 1,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 3,
		fill: true
	});
	scene.add(rectangle_sg335);

	const rectangle_sg336 = new Rectangle({
		x: 1, y: 2,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 3,
		fill: true
	});
	scene.add(rectangle_sg336);

	const rectangle_sg337 = new Rectangle({
		x: 2, y: 2,
		color: colors.rgb(255, 255, 255),
		z: 0,
		width: 2, height: 2,
		fill: true
	});
	scene.add(rectangle_sg337);

	const rectangle_sg338 = new Rectangle({
		x: 5, y: 2,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_sg338);

	const rectangle_sg339 = new Rectangle({
		x: 8, y: 2,
		color: colors.rgb(255, 255, 255),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_sg339);

	const rectangle_sg33a = new Rectangle({
		x: 9, y: 2,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 1, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33a);

	const rectangle_sg33b = new Rectangle({
		x: 4, y: 3,
		color: colors.rgb(255, 255, 255),
		z: 0,
		width: 1, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33b);

	const rectangle_sg33c = new Rectangle({
		x: 6, y: 3,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 1, height: 4,
		fill: true
	});
	scene.add(rectangle_sg33c);

	const rectangle_sg33d = new Rectangle({
		x: 9, y: 3,
		color: colors.rgb(255, 255, 255),
		z: 0,
		width: 1, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33d);

	const rectangle_sg33e = new Rectangle({
		x: 2, y: 4,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33e);

	const rectangle_sg33f = new Rectangle({
		x: 5, y: 4,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 1, height: 2,
		fill: true
	});
	scene.add(rectangle_sg33f);

	const rectangle_sg33g = new Rectangle({
		x: 7, y: 4,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 1, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33g);

	const rectangle_sg33h = new Rectangle({
		x: 8, y: 4,
		color: colors.rgb(255, 136, 0),
		z: 0,
		width: 4, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33h);

	const rectangle_sg33i = new Rectangle({
		x: 2, y: 5,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33i);

	const rectangle_sg33j = new Rectangle({
		x: 4, y: 5,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 1, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33j);

	const rectangle_sg33k = new Rectangle({
		x: 7, y: 5,
		color: colors.rgb(255, 136, 0),
		z: 0,
		width: 1, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33k);

	const rectangle_sg33l = new Rectangle({
		x: 8, y: 5,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 4, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33l);

	const rectangle_sg33m = new Rectangle({
		x: 12, y: 5,
		color: colors.rgb(255, 136, 0),
		z: 0,
		width: 1, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33m);

	const rectangle_sg33n = new Rectangle({
		x: 4, y: 6,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33n);

	const rectangle_sg33o = new Rectangle({
		x: 7, y: 6,
		color: colors.rgb(255, 255, 0),
		z: 0,
		width: 1, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33o);

	const rectangle_sg33p = new Rectangle({
		x: 8, y: 6,
		color: colors.rgb(255, 136, 0),
		z: 0,
		width: 4, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33p);

	const rectangle_sg33q = new Rectangle({
		x: 6, y: 7,
		color: colors.rgb(0, 0, 0),
		z: 0,
		width: 2, height: 1,
		fill: true
	});
	scene.add(rectangle_sg33q);

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
let pX = 8;
let pY = 30;
let pillarX = 100;
let pillarGapSize = 50;
let vsp = 0;
let jumpSpd = -0.6;
let grav = 0.02;
let pillarSpd = 1;
var canJump = true;
let started = false;

const playerWidth = 12;
const playerHeight = 8;
const pillarWidth = 10;
const pillarHeight = 50;
let colisionTolerance = -1;

let previousGapCenterY: number | null = null;
let gapVelocity = 0;
let previousGapSize = 30;
const minGapCenterY = 14;
const maxGapCenterY = 50;
const gapMomentum = 0.6;
const maxGapStep = 20;
const gapWallBounce = 0.5;
const sizeMomentum = 0.5;
const sizeCenter = 30;
const sizeJitter = 5;

function wrap(val: number, min: number, max: number): number {
	var range = max - min;
	if (range === 0) return min;
	return min + (((val - min) % range + range) % range);
}

const display = saturn.display;
function getPixelColor(x: number, y: number): number {
	var i = Math.round(y) + display.height * Math.round(x);
	var view = new Uint8Array(display.frame);
	var r = view[i * 3];
	var g = view[i * 3 + 1];
	var b = view[i * 3 + 2];
	return (r << 16) | (g << 8) | b;
}

async function resetPillar() {
	score += difficulty;
	piezo.playSong(Effects.jump);
	pillarSpd += 0.01;
	pillarX = 74;

	const targetSize = sizeCenter + (Math.random() * sizeJitter) - (Math.random() * sizeJitter);
	pillarGapSize = previousGapSize * sizeMomentum + targetSize * (1 - sizeMomentum);
	previousGapSize = pillarGapSize;

	let gapCenterY: number;
	if (previousGapCenterY === null) {
		gapCenterY = minGapCenterY + Math.random() * (maxGapCenterY - minGapCenterY);
	} else {
		const jitter = (Math.random() - 0.5) * maxGapStep;
		gapVelocity = gapVelocity * gapMomentum + jitter;
		gapCenterY = previousGapCenterY + gapVelocity;
		if (gapCenterY < minGapCenterY) {
			gapCenterY = minGapCenterY;
			gapVelocity = -gapVelocity * gapWallBounce;
		} else if (gapCenterY > maxGapCenterY) {
			gapCenterY = maxGapCenterY;
			gapVelocity = -gapVelocity * gapWallBounce;
		}
	}
	previousGapCenterY = gapCenterY;

	const gapHeight = pillarGapSize - 10;
	pillarBottom.setPosition(pillarX, gapCenterY - gapHeight / 2 - pillarHeight);
	pillarTop.setPosition(pillarX, gapCenterY + gapHeight / 2);
}

async function resetGame() {
	pY = 32;
	pillarX = 100;
	vsp = 0;
	pause = true;
	score = Math.floor(score);
	var hscbeat = false;
	if (score > highScore) {
		highScore = score;
	}
	loop.addShape(scoreBoardBg);
	const highScoreText = loop.drawText("Hsc:" + highScore, 20, 20, font, colors.white, false);
	const scoreText = loop.drawText("Sc: " + score, 20, 28, font, colors.white, false);
	await piezo.playSong(Effects.lose);
	while (!isPressed) {
		await sleep(1);	
	}
	await sleep(100);
	loop.removeShape(scoreBoardBg);
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
	color: colors.rgb(63, 117, 162),
	fill: true
});
loop.addShape(bg);
let player = generateScene();

let pillarBottom = generatePipeTop();
loop.addShape(pillarBottom);
let pillarTop = generatePipeBottom();
loop.addShape(player);
loop.addShape(pillarTop);
let scoreBoardBg = new Rectangle({
	x: 12,
	y: 17,
	width: 40,
	height: 20,
	color: colors.rgb(74, 30, 3),
	fill: true
})

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
		if (Math.abs(pillarX - pX) < (playerWidth + pillarWidth) / 2 + colisionTolerance && (pY < pillarBottom.getY() + pillarHeight + colisionTolerance || pY + playerHeight > pillarTop.getY() - colisionTolerance)) {
			resetGame();
		}

		//visual
		player.setRotationAngle(0 - (vsp * 20))
	} else if (!started) {
		player.setPosition(pX, pY);
		if (x > -jumpThresh && pY < 50) {
			pY += 0.5;
		} else if (x < jumpThresh && pY > 10) {
			pY -= 0.5;
		}
		difficulty = (pY - 12) / 40 * 2;
		if (difficulty < 0.5) {
			difficulty = 0.5;
		} else if (difficulty >= 1.9) {
			difficulty = 2;
		}
		console.log(difficulty)
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