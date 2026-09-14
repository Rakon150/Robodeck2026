import { GameLoop } from "game-loop";
import { createSaturn } from "saturn";
import { Circle, LineSegment, Rectangle } from "shapes";
import * as colors from "colors";
import * as adc from "adc";
import { SaturnPins } from "saturn";
import { Font, Texture } from "renderer";
import { Button } from "button";
import { Collection } from "shapes";
import { Display } from "rphub75";
import { PIEZO, Effects, Volume, Tones } from "piezo";

const font = new Font();

const piezo = new PIEZO(SaturnPins.Pmod3.Pin1);
piezo.setVolume(Volume.ON);

adc.configure(SaturnPins.Pmod1.Pin1);
adc.configure(SaturnPins.Pmod1.Pin2);

let x = 0;
let y = 0;
let jumpThresh = -100

let isPressed = false;
const btnStick = new Button(SaturnPins.Pmod1.Pin4);

const btnDpad1 = new Button(SaturnPins.Pmod2.Pin1);
const btnDpad2 = new Button(SaturnPins.Pmod2.Pin2);
const btnDpad3 = new Button(SaturnPins.Pmod2.Pin3);
const btnDpad4 = new Button(SaturnPins.Pmod2.Pin4);

setInterval(() => {
	x = adc.read(SaturnPins.Pmod1.Pin1);
	y = adc.read(SaturnPins.Pmod1.Pin2);
	x -= 475;
	y -= 475;
	//console.log(`X: ${x}, Y: ${y}`); //joystick debug
	isPressed = btnStick.isPressed() || btnDpad1.isPressed() ||  btnDpad2.isPressed() ||  btnDpad3.isPressed() ||  btnDpad4.isPressed(); //vrchol inzenyrstvi fr
}, 50);

let score = 0;
let highScore = 0;
let pause = false;
let saturn = createSaturn();
let loop = new GameLoop(saturn.display);
let difficulty = 1;
let pX = 8;
let pY = 30;
let pillarX = 150;
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
let previousGapSize = 50;
const minGapCenterY = 25;
const maxGapCenterY = 60;
const gapMomentum = 0.6;
const maxGapStep = 20;
const gapWallBounce = 0.5;
const sizeMomentum = 0.5;
const sizeCenter = 30;
const sizeJitter = 5;

let birdBmp = new Texture();
let birdOk = birdBmp.load("/data/code/assets/bird.bmp")
if (!birdOk) console.error("birdBmp not loaded");

let pipeTopBmp = new Texture();
let pipeTopOk = pipeTopBmp.load("/data/code/assets/pipeTop.bmp")
if (!pipeTopOk) console.error("pipeTopBmp not loaded");

let pipeBottomBmp = new Texture();
let pipeBottomOk = pipeBottomBmp.load("/data/code/assets/pipeBottom.bmp")
if (!pipeBottomOk) console.error("pipeBottomBpm not loaded");

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
	score = Math.round(score);
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

let player = new Rectangle({
	x: pX, y: pY,
	width: 17, height: 12,
	color: 0xffffff,
	fill: true
});
player.setTexture(birdBmp);
player.setFixTexture(true);

let pillarBottom = new Rectangle({
	x: 0, y: 0,
	width: pillarWidth, height: pillarHeight,
	color: 0xffffff,
	fill: true
});
pillarBottom.setTexture(pipeTopBmp);
pillarBottom.setFixTexture(true);
loop.addShape(pillarBottom);

let pillarTop = new Rectangle({
	x: 0, y: 0,
	width: pillarWidth, height: pillarHeight,
	color: 0xffffff,
	fill: true
});
pillarTop.setTexture(pipeBottomBmp);
pillarTop.setFixTexture(true);
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
			console.log(score)
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