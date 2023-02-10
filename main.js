const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
var state = "menu"; // Game state. click, menu, playing
var overworld;

var playerX = 512;
var playerY = 288;
var playerSpeed = 6;

var playerGun = 0;
var playerBullets = [];
const PLAYER_BULLET_SPEED = 12;
var playerGunCooldowns = [20];
var playerFiringCooldown = 20;
var gunAmmo = [10];
var playerAmmo = [10];
var gunReload = [40];
var playerReload = [40];

var enemies = [];
const ENEMY_SPEED = [1.5];
const ENEMY_HURT_TIME_BASE = [30];
const ENEMY_SPREAD_DISTANCE = 60;
const ENEMY_SPREAD_PLAYER_DISTANCE = 80;

function setup() { // Inital setup
    resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    noSmooth();
    frameRate(60);
    enemies.push(new Enemy(100, 100, 0));
    enemies.push(new Enemy(100, 200, 0));
    enemies.push(new Enemy(800, 200, 0));
}

function preload() { // Load sprites
    PATH = "Sprites/";
    PLAYER = loadImage(PATH + "Player/player.png");
    BORDER = loadImage(PATH + "Background/border.png");
    CROSSHAIR = loadImage(PATH + "UI/crosshair.png");
    PLAYER_BULLET = loadImage(PATH + "Player/bullet.png");

    ENEMY = loadImage(PATH + "Enemy/enemy.png");
    ENEMY_HURT = loadImage(PATH + "Enemy/enemy_hurt.png");
    
    PATH = "Audio/";
    overworld = loadSound(PATH + 'Music/overworld.mp3');
    overworld.setVolume(0.5);
}

var musicTimer = 0;

function draw() { // Loop
    clear();
    if (windowWidth < CANVAS_WIDTH || windowHeight < CANVAS_HEIGHT) return; // Don't allow resolutions that are too small
    background(240, 240, 240)

    if (state != "click") {
        debug();
    
        enemy();
        player();

        musicTimer += 1;
        if (musicTimer == 60) {
            overworld.loop();
        }
        drawCrosshair();
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
    imageMode(CENTER);
    drawImage(CROSSHAIR, mouseX, mouseY);
}

function player() {
    playerMovement();
    playerShooting();
    reload();

    imageMode(CENTER);
    drawImage(PLAYER, playerX, playerY);
}

function playerMovement() {
    if (keyIsDown(87) && playerY > 24) playerY -= playerSpeed; // Up
    if (keyIsDown(83) && playerY < CANVAS_HEIGHT - 24) playerY += playerSpeed; // Down
    if (keyIsDown(65) && playerX > 24) playerX -= playerSpeed; // Left
    if (keyIsDown(68) && playerX < CANVAS_WIDTH - 24) playerX += playerSpeed; // Right
}

function playerShooting() {
    if (playerFiringCooldown < playerGunCooldowns[playerGun]) playerFiringCooldown++;
    if (mouseIsPressed) {
        if (playerAmmo[playerGun] > 0 && playerFiringCooldown >= playerGunCooldowns[playerGun] && playerReload[playerGun] >= gunReload[playerGun]) {
            var bullet = new PlayerBullet();
            playerBullets.push(bullet);
            playerFiringCooldown = 0;
            playerAmmo[playerGun] -= 1;
        }
    }

    for (var i = 0; i < playerBullets.length; i++) { // Player Bullets
        var bullet = playerBullets[i];
        bullet.update();
        if (bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50 || bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50) {
            playerBullets.splice(i, 1); // Remove bullet
            i--;
        } 
    }
}

function reload() {
    if (playerReload[playerGun] < gunReload[playerGun]) playerReload[playerGun]++;
    if (playerReload[playerGun] == gunReload[playerGun] - 1) playerAmmo[playerGun] = gunAmmo[playerGun];
    if (playerReload[playerGun] < gunReload[playerGun]) text("Reloading...", 10, 70); // temp

    if (keyIsDown(82)) { // R is pressed
        if (playerReload[playerGun] >= gunReload[playerGun] && playerAmmo[playerGun] < gunAmmo[playerGun]) {
            playerReload[playerGun] = 0;
        }
    }
}

function enemy() {
    for (var i = 0; i < enemies.length; i++) { // Enemies
        var enemy = enemies[i];
        enemy.update();
    }
}

function mouseClicked() {
    if (state == "click") {
        state = "menu";
        noCursor();
    }
}

class PlayerBullet {
    constructor() {
        this.x = playerX;
        this.y = playerY;

        var deltaX = mouseX - this.x;
        var deltaY = mouseY - this.y;
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / PLAYER_BULLET_SPEED;
        
        this.dx = Math.round(deltaX / divider * 10)/10;
        this.dy = Math.round(deltaY / divider * 10)/10;
    }

    update() {
        this.move();
        this.draw();
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        drawImageSmooth(PLAYER_BULLET, this.x, this.y);
    }
   
}

class Enemy {
    constructor(x, y, type) {
        this.id = enemies.length;
        this.x = x;
        this.y = y;
        this.type = type;
        this.dead = false;

        if (this.type == 0) {
            this.health = 4;
        }

        this.hurtTime = ENEMY_HURT_TIME_BASE[this.type];
    }

    update() {
        if (!this.dead) {
            this.move();
            this.hurt();
            this.draw();
        }
    }

    move() {
        var deltaX = playerX - this.x;
        var deltaY = playerY - this.y;

        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / ENEMY_SPEED[this.type];
        
        var dx = Math.round(deltaX / divider * 10)/10;
        var dy = Math.round(deltaY / divider * 10)/10;

        for (var i = 0; i < enemies.length; i++) { // Check collision with other enemies
            var enemy = enemies[i];
            if (i != this.id && !enemy.dead) {
                var tempX = this.x + dx*10;
                var tempY = this.y + dy*10;
                if ((Math.abs(enemy.x - tempX) < ENEMY_SPREAD_DISTANCE && Math.abs(enemy.y - tempY) < ENEMY_SPREAD_DISTANCE) || (Math.abs(playerX - tempX) < ENEMY_SPREAD_PLAYER_DISTANCE && Math.abs(playerY - tempY) < ENEMY_SPREAD_PLAYER_DISTANCE)) {
                    dx = 0;
                    dy = 0;
                    break;
                }
            }
        }
        if (this.hurtTime >= ENEMY_HURT_TIME_BASE[this.type]) {
            this.x += dx;
            this.y += dy;
        }
        else {
            this.x += dx/4;
            this.y += dy/4;
        }
        
    }

    hurt() {
        this.playerBullets = playerBullets;
        if (this.hurtTime < ENEMY_HURT_TIME_BASE[this.type]) this.hurtTime++; // During hurt
    

        if (playerBullets.length > 0) {
            for (var i = 0; i < playerBullets.length; i++) { // Check bullet collision
                var bullet = playerBullets[i];
                if (Math.abs(bullet.x - this.x) <= 30 && Math.abs(bullet.y - this.y) <= 30) {
                    this.health -= 1;
                    this.hurtTime = 0;
                    playerBullets.splice(i, 1);
                    i--;
                }
            }
        }

        if (this.health <= 0) this.die();
    }

    die() {
        this.dead = true;
    }

    draw() {
        if (this.hurtTime < ENEMY_HURT_TIME_BASE[this.type]) drawImageSmooth(ENEMY_HURT, this.x, this.y);
        else drawImageSmooth(ENEMY, this.x, this.y);
    }
}

function debug() {
    textSize(32);
    text(playerAmmo[playerGun] + " ammo", 10, 40);
}