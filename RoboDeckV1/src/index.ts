import * as adc from "adc";
import * as utils from "utils";
import * as colors from "colors";
import { Button } from "button";
import { createSaturn } from "saturn";
import { SaturnPins } from "saturn";
import { Circle, Rectangle, Collection, LineSegment } from "shapes";
import { GameLoop } from "game-loop";

const saturn = createSaturn();
const display = saturn.display;

const game_loop = new GameLoop(saturn.display)

const btnStick = new Button(SaturnPins.Pmod3.Pin4);

const btn1 = new Button(SaturnPins.Pmod1.Pin1);
const btn2 = new Button(SaturnPins.Pmod1.Pin2);
const btn3 = new Button(SaturnPins.Pmod1.Pin3);
const btn4 = new Button(SaturnPins.Pmod1.Pin4);

adc.configure(SaturnPins.Pmod3.Pin1);
adc.configure(SaturnPins.Pmod3.Pin2);

const x = adc.read(SaturnPins.Pmod3.Pin1);
const y = adc.read(SaturnPins.Pmod3.Pin2);
const sx = utils.map(x, 0, 1023, 0, 63);
const sy = utils.map(y, 0, 1023, 0, 63);

let state = "menu"

let gamerunning = 0;

let xpos = 32;
let ypos = 32;

let xapple = 0;
let yapple = 0;
let ham = 0;

let xdir = 1;
let ydir = 0;

let trail: { x: number; y: number }[] = [];
let snakeLength = 3;

function apple(): void {
  xapple = Math.floor(Math.random() * 64);
  yapple = Math.floor(Math.random() * 64);
}

function reset(): void {
  xpos = 32;
  ypos = 32;
  xdir = 1;
  ydir = 0;
  trail = [];
  snakeLength = 3;
  apple();
}

function menuSnake() {
  const scene = new Collection({ x: 0, y: 0, z: 0 });

  const rectangle_qew = new Rectangle({
    x: 16, y: 16,
    color: colors.rgb(255, 255, 255),
    z: 0,
    width: 32, height: 32,
    fill: false
  });
  scene.add(rectangle_qew);

  const line_dzg = new LineSegment({
    x: 21, y: 26,
    color: colors.rgb(0, 255, 0),
    z: 0,
    x2: 30, y2: 26
  });
  scene.add(line_dzg);

  const line_udq = new LineSegment({
    x: 29, y: 37,
    color: colors.rgb(0, 255, 0),
    z: 0,
    x2: 29, y2: 27
  });
  scene.add(line_udq);

  const line_kn5 = new LineSegment({
    x: 28, y: 38,
    color: colors.rgb(0, 255, 0),
    z: 0,
    x2: 37, y2: 38
  });
  scene.add(line_kn5);

  const rectangle_jcp = new Rectangle({
    x: 39, y: 36,
    color: colors.rgb(255, 0, 0),
    z: 0,
    width: 4, height: 4,
    fill: true
  });
  scene.add(rectangle_jcp);

  return scene;
}

const snakeSelect = menuSnake();

game_loop.addShape(snakeSelect);
display.show();
reset();

setInterval(() => {
  if (state == "menu" && btnStick.isPressed()) {
    state = "snake"
    game_loop.removeShape(snakeSelect);
    
  } else if (state == "snake" && btnStick.isPressed()) {
    state = "menu"
    reset();
    game_loop.addShape(snakeSelect);
    display.clear();
  }

  if (state == "snake") {
    if ((sx < 20 || btn2.isPressed())&& xdir != -1) {
      ydir = 0;
      xdir = 1;
    } else if ((sx > 40 || btn3.isPressed()) && xdir != 1) {
      ydir = 0;
      xdir = -1;
    } else if ((sy < 20 || btn4.isPressed()) && ydir != 1) {
      xdir = 0;
      ydir = -1;
    } else if ((sy > 40 || btn1.isPressed()) && ydir != -1) {
      xdir = 0;
      ydir = 1;
    }

    if (xdir == -1) {
      xpos -= 1;
    }
    if (xdir == 1) {
      xpos += 1;
    }
    if (ydir == 1) {
      ypos += 1;
    }
    if (ydir == -1) {
      ypos -= 1;
    }
    
    if (xpos < 0) {
      xpos = 63;
    } else if (xpos > 63) {
      xpos = 0;
    }

    if (ypos < 0) {
      ypos = 63;
    } else if (ypos > 63) {
      ypos = 0;
    }

    trail.push({ x: xpos, y: ypos });

    if (xpos == xapple && ypos == yapple) {
      snakeLength++;
      apple();
    }

    while (trail.length > snakeLength) {
      trail.shift();
    }

    let colission = false;
    for (let i = 0; i < trail.length - 1; i++) {
      if (trail[i].x === xpos && trail[i].y === ypos) {
        colission = true;
        break;
      }
    }

    if (colission) {
      reset();
      return;
    }

    display.clear();
    display.setPixel(xapple, yapple, colors.red);

    for (let i = 0; i < trail.length; i++) {
      display.setPixel(trail[i].x, trail[i].y, colors.green);
    }

    display.show();
  }
}, 150);
