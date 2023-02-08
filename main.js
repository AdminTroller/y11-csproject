const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
let overworld;

var playerX = 512;
var playerY = 288;

var bullets = [];
const BULLET_SPEED = 8;

function setup() { // Inital setup
    resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    noSmooth();
    noCursor();
    frameRate(60);
    imageMode(CORNER);
}

function preload() { // Load sprites
    PATH = "Sprites/";
    PLAYER = loadImage(PATH + "Player/player.png");
    BORDER = loadImage(PATH + "Background/border.png");
    CROSSHAIR = loadImage(PATH + "Player/crosshair.png");
    PLAYER_BULLET = loadImage(PATH + "Player/bullet.png");
    
    PATH = "Audio/";
    overworld = loadSound(PATH + 'Music/overworld.mp3');
}

musicTimer = 0;

function draw() { // Loop
    clear();
    if (windowWidth < CANVAS_WIDTH || windowHeight < CANVAS_HEIGHT) return; // Don't allow resolutions that are too small
    debug();
    playerMovement();
    drawCrosshair();

    for (i = 0; i < bullets.length; i++) {
        bullets[i].update();
        bullets[i].draw();
    }

    musicTimer += 1;
    if (musicTimer == 60) {
        overworld.loop();
    }

    imageMode(CORNER);
    drawImage(BORDER, 0, 0);
    imageMode(CENTER);
}

function drawImage(sprite, x, y) {
    image(sprite, x+x%2, y+y%2, sprite.width*2, sprite.height*2)
}

function drawCrosshair() {
    // if (focused) {
        imageMode(CENTER);
        drawImage(CROSSHAIR, mouseX, mouseY);
    // }
}

function playerMovement() {
    imageMode(CENTER);
    drawImage(PLAYER, playerX, playerY);
    if (keyIsDown(87)) playerY -= 6; // Up
    if (keyIsDown(83)) playerY += 6; // Down
    if (keyIsDown(65)) playerX -= 6; // Left
    if (keyIsDown(68)) playerX += 6; // Right
}

function debug() {
    imageMode(CENTER)
    background(240, 240, 240)

    textSize(32);
    text(mouseX, 10, 40)
    text(mouseY, 10, 70)
}

function mouseClicked() {
    var bullet = new PlayerBullet();
    bullets.push(bullet);
    console.log(bullet);
}

class PlayerBullet {
    constructor() {
        this.x = playerX;
        this.y = playerY;

        var deltaX = mouseX - this.x;
        var deltaY = mouseY - this.y;

        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / BULLET_SPEED;
        
        this.dx = deltaX / divider;
        this.dy = deltaY / divider;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        drawImage(PLAYER_BULLET, this.x, this.y);
    }
   
}