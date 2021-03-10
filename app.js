const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

let ship;
let keys = [37, 38, 39, 32, 40];
let lives = 3;
let shots = [];

let score = 0;
let asteroids = [];
// Load canvasSetup() On DOM Load
document.addEventListener("DOMContentLoaded", canvasSetup);
// CanvasSetup launches Game
function canvasSetup() {
  canvas.height = 600;
  canvas.width = 600;
  // create new ship
  ship = new Ship();
  // create new astroids
  for (let i = 0; i < 8; i++) {
    asteroids.push(new Asteroid());
  }

  document.body.addEventListener("keydown", handleKeyDown);
  document.body.addEventListener("keyup", handleKeyUp);
  // start rendering
  Render();
}

function handleKeyDown(e) {
  keys[e.keyCode] = true;
}

function handleKeyUp(e) {
  keys[e.keyCode] = false;
  // if space is pressed fire shot
  if (e.keyCode === 32) {
    shots.push(new Bullet(ship.angle));
  }
}
// Construct New Ship
class Ship {
  constructor() {
    this.alive = true;
    this.movingForward = false;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.acceleration = 0.1;
    this.speed = 0;
    this.rotateSpeed = 0.0008;
    this.radius = 15;
    this.angle = 0;
    this.fillColor = "white";
    // gun location
    this.noseX = canvas.width / 2 + 15;
    this.noseY = canvas.height / 2;
  }
  Update() {
    let radians = (this.angle / Math.PI) * 180;

    // input handling
    // forward thrust
    if (keys[38]) {
      let newX = this.x + this.speed * Math.cos(radians);
      let newY = this.y + this.speed * Math.sin(radians);
      if ((this.movingForward = true)) {
        this.speed += this.acceleration;
        this.x = newX;
        this.y = newY;
      }
    }
    // left and right rotation
    if (keys[37]) this.angle -= this.rotateSpeed;
    if (keys[39]) this.angle += this.rotateSpeed;
    // never leave canvas
    if (this.x < this.radius) {
      this.x = canvas.width;
    }
    if (this.x > canvas.width) {
      this.x = this.radius;
    }
    if (this.y < this.radius) {
      this.y = canvas.height;
    }
    if (this.y > canvas.height) {
      this.y = this.radius;
    }
    this.x += this.speed * Math.cos(radians);
    this.y += this.speed * Math.sin(radians);
    this.speed *= 0.99; // slow to stop if key released
  }
  // draw to canvas
  Draw() {
    let vertAngle = (Math.PI * 2) / 3;
    let radians = (this.angle / Math.PI) * 180;

    context.beginPath();
    // where to fire bullet from
    this.noseX = this.x - this.radius * Math.cos(radians);
    this.noseY = this.y - this.radius * Math.sin(radians);

    for (let i = 0; i < 3; i++) {
      context.lineTo(
        this.x + this.radius * Math.cos(vertAngle * i + radians),
        this.y + this.radius * Math.sin(vertAngle * i + radians)
      );
    }

    context.closePath();
    context.fillStyle = this.fillColor;
    context.fill();
  }
}
// Construct New Bullets
class Bullet {
  constructor(angle) {
    this.visible = true;
    this.x = ship.noseX;
    this.y = ship.noseY;
    this.angle = angle;
    this.height = 4;
    this.width = 4;
    this.speed = 10;
    this.velX = 0;
    this.velY = 0;
  }
  // trajectory
  Update() {
    let radians = (this.angle / Math.PI) * 180;
    this.x += Math.cos(radians) * this.speed;
    this.y += Math.sin(radians) * this.speed;
  }
  // draw to canvas
  Draw() {
    context.fillStyle = "white";
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
// Construct Astroids
class Asteroid {
  constructor(x, y, radius, level, collisionRadius) {
    this.visible = true;
    this.x = x || Math.floor(Math.random() * canvas.width);
    this.y = y || Math.floor(Math.random() * canvas.height);
    this.speed = 1;
    this.radius = radius || 50;
    this.angle = Math.floor(Math.random() * 359);
    this.strokeColor1 = "magenta";
    this.strokeColor2 = "cyan";
    this.strokeColor3 = "yellow";
    this.collisionRadius = collisionRadius || 46;
    // used to decide if this asteroid can be broken into smaller pieces
    this.level = level || 1;
  }
  Update() {
    // astroid trajectory and speed
    let radians = (this.angle / Math.PI) * 180;
    this.x += Math.cos(radians) * this.speed;
    this.y += Math.sin(radians) * this.speed;
    // never leave canvas
    if (this.x < this.radius) {
      this.x = canvas.width;
    }
    if (this.x > canvas.width) {
      this.x = this.radius;
    }
    if (this.y < this.radius) {
      this.y = canvas.height;
    }
    if (this.y > canvas.height) {
      this.y = this.radius;
    }
  }
  // draw astroid to canvas
  Draw() {
    context.beginPath();
    context.strokeStyle = this.strokeColor1;
    let vertAngle = (Math.PI * 2) / 6;
    var radians = (this.angle / Math.PI) * 180;
    for (let i = 0; i < 6; i++) {
      context.lineTo(
        this.x - this.radius * Math.cos(vertAngle * i + radians),
        this.y - this.radius * Math.sin(vertAngle * i + radians)
      );
    }
    context.closePath();
    context.stroke();
  }
}
// Collision Detection
function CircleCollision(p1x, p1y, r1, p2x, p2y, r2) {
  let radiusSum;
  let xDiff;
  let yDiff;

  radiusSum = r1 + r2;
  xDiff = p1x - p2x;
  yDiff = p1y - p2y;

  if (radiusSum > Math.sqrt(xDiff * xDiff + yDiff * yDiff)) {
    return true;
  } else {
    return false;
  }
}
// Life Counter
function lifeCount() {
  let pointX = 570;
  let pointY = 20;
  let points = [
    [10, 18],
    [-10, 18],
  ];
  // draw life ships to canvas
  context.strokeStyle = "white";
  for (let i = 0; i < lives; i++) {
    context.beginPath();
    context.moveTo(pointX, pointY);
    for (let a = 0; a < points.length; a++) {
      context.lineTo(pointX + points[a][0], pointY + points[a][1]);
    }
    context.closePath();
    context.stroke();
    pointX -= 30;
  }
}
// Reset Game Button
function resetGame() {
  location.reload();
}

function Render() {
  // refresh canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  // display score
  context.fillStyle = "white";
  context.font = "21px Arial";
  context.fillText("SCORE : " + score.toString(), 20, 40);

  lifeCount(); // life counter
  // render player if alive
  if (lives > 0) {
    ship.Update();
    ship.Draw();
  }
  // check for collision of ship with asteroid
  if (asteroids.length !== 0) {
    for (let k = 0; k < asteroids.length; k++) {
      if (
        CircleCollision(
          ship.x,
          ship.y,
          11,
          asteroids[k].x,
          asteroids[k].y,
          asteroids[k].collisionRadius
        )
      ) {
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;
        ship.velX = 0;
        ship.velY = 0;
        lives -= 1; // lose life on astroid collision
      }
    }
  }
  // check for collision of bullet and asteroid
  if (asteroids.length !== 0 && shots.length != 0) {
    loopmain: for (let l = 0; l < asteroids.length; l++) {
      for (let m = 0; m < shots.length; m++) {
        if (
          CircleCollision(
            shots[m].x,
            shots[m].y,
            3,
            asteroids[l].x,
            asteroids[l].y,
            asteroids[l].collisionRadius
          )
        ) {
          // check if asteroid can be broken into smaller pieces
          if (asteroids[l].level === 1) {
            asteroids.push(
              new Asteroid(asteroids[l].x - 5, asteroids[l].y - 5, 25, 2, 22)
            );
            asteroids.push(
              new Asteroid(asteroids[l].x + 5, asteroids[l].y + 5, 25, 2, 22)
            );
          } else if (asteroids[l].level === 2) {
            asteroids.push(
              new Asteroid(asteroids[l].x - 5, asteroids[l].y - 5, 15, 3, 12)
            );
            asteroids.push(
              new Asteroid(asteroids[l].x + 5, asteroids[l].y + 5, 15, 3, 12)
            );
          }
          asteroids.splice(l, 1);
          shots.splice(m, 1);
          score += 20; // score increment on successful shot

          break loopmain;
        }
      }
    }
  }
  // render shots
  if (shots.length !== 0) {
    for (let i = 0; i < shots.length; i++) {
      shots[i].Update();
      shots[i].Draw();
    }
  }

  // render astroids
  if (asteroids.length !== 0) {
    for (let j = 0; j < asteroids.length; j++) {
      asteroids[j].Update();
      asteroids[j].Draw(j);
    }
  }
  // check if player loses
  if (lives == 0) {
    let gameOver = document.getElementById("gameoverlay");
    gameOver = gameOver.classList.add("visible");
    document.getElementById("gameovertitle").innerHTML = "GAME OVER";
    document.getElementById("score").innerHTML = "SCORE: " + score;
  }
  // check if player wins
  if (asteroids.length == 0) {
    let gameOver = document.getElementById("gameoverlay");
    gameOver = gameOver.classList.add("visible");
    document.getElementById("gameovertitle").innerHTML = "YOU WIN!";
    document.getElementById("score").innerHTML = "SCORE: " + score;
  }
  requestAnimationFrame(Render);
}
