const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
var state = "menu"; // Game state. click, menu, playing
var overworld;

var playerX = 512;
var playerY = 288;
var playerSpeed = 6;

var bullets = [];
const BULLET_SPEED = 12;

function setup() { // Inital setup
    resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    noSmooth();
    frameRate(60);
}

function preload() { // Load sprites
    PATH = "Sprites/";
    PLAYER = loadImage(PATH + "Player/player.png");
    BORDER = loadImage(PATH + "Background/border.png");
    CROSSHAIR = loadImage(PATH + "UI/crosshair.png");
    PLAYER_BULLET = loadImage(PATH + "Player/bullet.png");
    ENEMY = loadImage(PATH + "Enemy/enemy.png");
    
    PATH = "Audio/";
    overworld = loadSound(PATH + 'Music/overworld.mp3');
}

musicTimer = 0;

function draw() { // Loop
    clear();
    if (windowWidth < CANVAS_WIDTH || windowHeight < CANVAS_HEIGHT) return; // Don't allow resolutions that are too small
    background(240, 240, 240)

    if (state != "click") {
        debug();
        for (i = 0; i < bullets.length; i++) { // Player Bullet Movement
            var bullet = bullets[i];
            bullet.update();
            bullet.draw();
    
            if (bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50 || bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50) bullets.splice(i, 1); // Remove bullet
        }
    
        player();
        drawCrosshair();
    
        musicTimer += 1;
        if (musicTimer == 60) {
            overworld.loop();
        }
        noCursor();
    
    }

    imageMode(CORNER);
    drawImage(BORDER, 0, 0);
    imageMode(CENTER);
}

function drawImage(sprite, x, y) {
    image(sprite, x+x%2, y+y%2, sprite.width*2, sprite.height*2);
}

function drawImageSmooth(sprite, x, y) {
    image(sprite, x, y, sprite.width*2, sprite.height*2);
}

function drawCrosshair() {
    // if (focused) {
        imageMode(CENTER);
        drawImage(CROSSHAIR, mouseX, mouseY);
    // }
}

function player() {
    playerMovement();

    imageMode(CENTER);
    drawImage(PLAYER, playerX, playerY);
}

function playerMovement() {
    if (keyIsDown(87) && playerY > 24) playerY -= playerSpeed; // Up
    if (keyIsDown(83) && playerY < CANVAS_HEIGHT - 24) playerY += playerSpeed; // Down
    if (keyIsDown(65) && playerX > 24) playerX -= playerSpeed; // Left
    if (keyIsDown(68) && playerX < CANVAS_WIDTH - 24) playerX += playerSpeed; // Right
}

function mouseClicked() {
    if (state == "click") {
        state = "menu";
        noCursor();
    }
    else {
        var bullet = new PlayerBullet();
        bullets.push(bullet);
    }
}

class PlayerBullet {
    constructor() {
        this.x = playerX;
        this.y = playerY;

        var deltaX = mouseX - this.x;
        var deltaY = mouseY - this.y;

        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / BULLET_SPEED;
        
        this.dx = Math.round(deltaX / divider * 10)/10;
        this.dy = Math.round(deltaY / divider * 10)/10;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        drawImageSmooth(PLAYER_BULLET, this.x, this.y);
    }
   
}

function debug() {
    textSize(32);
    // text(state, 10, 40);

    drawImage(ENEMY, 800, 100);
}