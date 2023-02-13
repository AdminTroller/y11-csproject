const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
var state = "menu"; // Game state. click, menu, playing

var playerX = 512;
var playerY = 288;
var playerSpeed = 4;
var playerHealth = 6;
const PLAYER_HURT_TIME_BASE = 60;
var playerHurtTime = PLAYER_HURT_TIME_BASE;

var playerGun = 0;
var playerBullets = [];
const PLAYER_BULLET_SPEED = 12;
var playerGunCooldowns = [20];
var playerFiringCooldown = playerGunCooldowns[0];
var gunAmmo = [10];
var playerAmmo = [gunAmmo[0]];
var gunReload = [40];
var playerReload = [40];

var enemies = [];
const ENEMY_SPEED = [1.5, 3.5];
const ENEMY_HEALTH = [4, 1];
const ENEMY_HURT_TIME_BASE = [30, 20];
const ENEMY_SPREAD_DISTANCE = [60, 0];
const ENEMY_SPREAD_PLAYER_DISTANCE = [80, 15];

var enemyBullets = [];
const ENEMY_BULLET_SPEED = [5, 10];
const ENEMY_FIRING_COOLDOWN_BASE = [60];
var enemyFiringCooldown = 0;

const LEVEL1_1 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function setup() { // Inital setup
    resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    noSmooth();
    frameRate(60);
    enemySpawn();
}

function preload() { // Load sprites
    PATH = "Sprites/";
    PLAYER = loadImage(PATH + "Player/player.png");
    PLAYER_HURT = loadImage(PATH + "Player/player_hurt.png");

    BORDER = loadImage(PATH + "Background/border.png");
    CROSSHAIR = loadImage(PATH + "UI/crosshair.png");
    PLAYER_BULLET = loadImage(PATH + "Player/bullet.png");

    FULL_HEART = loadImage(PATH + "UI/full_heart.png");
    HALF_HEART = loadImage(PATH + "UI/half_heart.png");
    EMPTY_HEART = loadImage(PATH + "UI/empty_heart.png");

    ENEMY0 = loadImage(PATH + "Enemy/enemy0.png");
    ENEMY0_HURT = loadImage(PATH + "Enemy/enemy0_hurt.png");
    ENEMY1 = loadImage(PATH + "Enemy/enemy1.png");
    ENEMY1_HURT = loadImage(PATH + "Enemy/enemy1.png");
    ENEMY_SPRITES = [ENEMY0, ENEMY1];
    ENEMY_HURT_SPRITES = [ENEMY0_HURT, ENEMY1_HURT];

    ENEMY0_BULLET = loadImage(PATH + "Enemy/bullet0.png");
    ENEMY1_BULLET = loadImage(PATH + "Enemy/bullet1.png");
    ENEMY_BULLET_SPRITES = [ENEMY0_BULLET, ENEMY1_BULLET];

    TILE1 = loadImage(PATH + "Tiles/tile1.png");
    
    PATH = "Audio/";
    OVERWORLD = loadSound(PATH + 'Music/overworld.mp3');
    OVERWORLD.setVolume(0.5);
}

function enemySpawn() {
    enemies.push(new Enemy(100, 100, 0));
    enemies.push(new Enemy(100, 200, 0));
    enemies.push(new Enemy(900, 450, 1));
}

var musicTimer = 0;

function draw() { // Loop
    clear();
    if (windowWidth < CANVAS_WIDTH || windowHeight < CANVAS_HEIGHT) return; // Don't allow resolutions that are too small
    background(240, 240, 240);

    if (state != "click") {
        debug();
    
        tiles();
        enemy();
        player();
        ui();

        musicTimer += 1;
        if (musicTimer == 60) {
            OVERWORLD.loop();
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
    drawImageSmooth(CROSSHAIR, mouseX, mouseY);
}

function ui() {
    uiHearts();
}

function uiHearts() {
    drawImage(EMPTY_HEART, 30, 30);
    drawImage(EMPTY_HEART, 82, 30);
    drawImage(EMPTY_HEART, 134, 30);
    if (playerHealth >= 1) drawImage(HALF_HEART, 30, 30);
    if (playerHealth >= 2) drawImage(FULL_HEART, 30, 30);
    if (playerHealth >= 3) drawImage(HALF_HEART, 82, 30);
    if (playerHealth >= 4) drawImage(FULL_HEART, 82, 30);
    if (playerHealth >= 5) drawImage(HALF_HEART, 134, 30);
    if (playerHealth >= 6) drawImage(FULL_HEART, 134, 30);
}

function player() {
    playerMovement();
    playerShooting();
    reload();
    playerHurt();
    playerDraw();
}

function playerMovement() {
    var okX = okY = true;
    var dx = dy = 0;
    if (keyIsDown(87)) dy -= playerSpeed; // Up
    if (keyIsDown(83)) dy += playerSpeed; // Down
    if (keyIsDown(65)) dx -= playerSpeed; // Left
    if (keyIsDown(68)) dx += playerSpeed; // Right
    var tempX = playerX + dx;
    var tempY = playerY + dy;

    for (var y = 0; y < LEVEL1_1.length; y++) {
        for (var x = 0; x < LEVEL1_1[y].length; x++) {
            if (LEVEL1_1[y][x] > 0) {
                if (Math.abs(tempX - (x*32+16)) < 36 && Math.abs(playerY - (y*32+16)) < 36) {
                    okX = false;
                    break;
                }
                if (Math.abs(playerX - (x*32+16)) < 36 && Math.abs(tempY - (y*32+16)) < 36) {
                    okY = false;
                }
            }
        }
    }

    if (okX) playerX += dx;
    if (okY) playerY += dy;
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

        for (var y = 0; y < LEVEL1_1.length; y++) {
            for (var x = 0; x < LEVEL1_1[y].length; x++) {
                if (LEVEL1_1[y][x] > 0) {
                    if (Math.abs(bullet.x - (x*32+16)) < 24 && Math.abs(bullet.y - (y*32+16)) < 24) {
                        playerBullets.splice(i, 1); // Remove bullet
                        break;
                    }
                }
            }
        }

        if (bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50 || bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50) {
            playerBullets.splice(i, 1); // Remove bullet
        } 
    }
}

function reload() {
    if (playerReload[playerGun] < gunReload[playerGun]) playerReload[playerGun]++;
    if (playerReload[playerGun] == gunReload[playerGun] - 1) playerAmmo[playerGun] = gunAmmo[playerGun];
    text(playerAmmo[playerGun] + " ammo", 10, 560);
    if (playerReload[playerGun] < gunReload[playerGun]) text("Reloading...", 10, 530); // temp

    if (keyIsDown(82)) { // R is pressed
        if (playerReload[playerGun] >= gunReload[playerGun] && playerAmmo[playerGun] < gunAmmo[playerGun]) {
            playerReload[playerGun] = 0;
        }
    }
}

function playerHurt() {
    if (playerHurtTime < PLAYER_HURT_TIME_BASE) playerHurtTime++; // During hurt
    for (var i = 0; i < enemyBullets.length; i++) { // Check bullet collision
        var bullet = enemyBullets[i];
        if (Math.abs(bullet.x - playerX) <= 30 && Math.abs(bullet.y - playerY) <= 30) {
            if (playerHurtTime >= PLAYER_HURT_TIME_BASE) {
                playerHealth -= 1;
                playerHurtTime = 0;
                if (playerHealth <= 0) playerDie();
            }
            enemyBullets.splice(i, 1);
            break;
        }
    }

    for (var i = 0; i < enemies.length; i++) { // Check enemy collision
        var enemy = enemies[i];
        if (Math.abs(enemy.x - playerX) <= 30 && Math.abs(enemy.y - playerY) <= 48 && !enemy.dead) {
            if (enemy.type == 1) enemy.die();
            if (playerHurtTime >= PLAYER_HURT_TIME_BASE) {
                playerHealth -= 1;
                playerHurtTime = 0;
                break;
            }
        }
    }
}

function playerDie() {
    console.log("you died");
}

function playerDraw() {
    if (playerHurtTime >= PLAYER_HURT_TIME_BASE) drawImageSmooth(PLAYER, playerX, playerY);
    else drawImageSmooth(PLAYER_HURT, playerX, playerY);
}

function enemy() {
    for (var i = 0; i < enemyBullets.length; i++) { // Enemy Bullets
        var bullet = enemyBullets[i];
        bullet.update();

        for (var y = 0; y < LEVEL1_1.length; y++) {
            for (var x = 0; x < LEVEL1_1[y].length; x++) {
                if (LEVEL1_1[y][x] > 0) {
                    if (Math.abs(bullet.x - (x*32+16)) < 24 && Math.abs(bullet.y - (y*32+16)) < 24) {
                        enemyBullets.splice(i, 1); // Remove bullet
                        break;
                    }
                }
            }
        }

        if (bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50 || bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50) {
            enemyBullets.splice(i, 1); // Remove bullet
            i--;
        }
    }

    for (var i = 0; i < enemies.length; i++) { // Enemies
        var enemy = enemies[i];
        enemy.update();
    }
}

function tiles() {
    for(var y = 0; y < LEVEL1_1.length; y++) {
        for (var x = 0; x < LEVEL1_1[y].length; x++) {
            if (LEVEL1_1[y][x] == 1) drawImage(TILE1, x*32+16, y*32+16);
        }
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
        this.health = ENEMY_HEALTH[this.type];
        this.dead = false;
        this.seePlayer = false;
        this.firingCooldown = 0;

        this.hurtTime = ENEMY_HURT_TIME_BASE[this.type];
    }

    update() {
        if (!this.dead) {
            if (this.seePlayer) {
                this.move();
                this.shoot();
            }
            
            this.hurt();
            this.draw();
            this.vision();
        }
    }

    move() {
        var deltaX = playerX - this.x;
        var deltaY = playerY - this.y;

        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / ENEMY_SPEED[this.type];
        
        var dx = Math.round(deltaX / divider * 10)/10;
        var dy = Math.round(deltaY / divider * 10)/10;

        var okX = true;
        var okY = true;
        var tempX = this.x + dx;
        var tempY = this.y + dy;

        for (var y = 0; y < LEVEL1_1.length; y++) {
            for (var x = 0; x < LEVEL1_1[y].length; x++) {
                if (LEVEL1_1[y][x] > 0) {
                    if (Math.abs(tempX - (x*32+16)) < 26 && Math.abs(this.y - (y*32+16)) < 36) {
                        okX = false;
                        break;
                    }
                    if (Math.abs(this.x - (x*32+16)) < 26 && Math.abs(tempY - (y*32+16)) < 36) {
                        okY = false;
                    }
                }
            }
        }

        if (!okX) dx = 0;
        if (!okY) dy = 0;


        for (var i = 0; i < enemies.length; i++) { // Check collision
            var enemy = enemies[i];
            var tempX = this.x + dx*5;
            var tempY = this.y + dy*5;
            if (Math.abs(playerX - tempX) < ENEMY_SPREAD_PLAYER_DISTANCE[this.type] && Math.abs(playerY - tempY) < ENEMY_SPREAD_PLAYER_DISTANCE[this.type]) { // Check collision with player
                dx = 0;
                dy = 0;
                break;
            }
            if (i != this.id && !enemy.dead) { // Check collision with other enemies
                if (Math.abs(enemy.x - tempX) < ENEMY_SPREAD_DISTANCE[this.type] && Math.abs(enemy.y - tempY) < ENEMY_SPREAD_DISTANCE[this.type]) {
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
        if (this.hurtTime < ENEMY_HURT_TIME_BASE[this.type]) { // During hurt
            this.hurtTime++; 
            this.firingCooldown = 0;
        }

        for (var i = 0; i < playerBullets.length; i++) { // Check bullet collision
            var bullet = playerBullets[i];
            if (Math.abs(bullet.x - this.x) <= 30 && Math.abs(bullet.y - this.y) <= 30) {
                this.health -= 1;
                this.hurtTime = 0;
                playerBullets.splice(i, 1);
                break;
            }
        }

        if (this.health <= 0) this.die();
    }

    shoot() {
        if (this.firingCooldown < ENEMY_FIRING_COOLDOWN_BASE[this.type]) this.firingCooldown++;
        if (this.firingCooldown >= ENEMY_FIRING_COOLDOWN_BASE[this.type]) {
            var bullet = new EnemyBullet(this.x, this.y, this.type);
            enemyBullets.push(bullet);
            this.firingCooldown = Math.random() * 10 - 5;
        }
    }

    die() {
        this.dead = true;
    }

    vision() {
        this.seePlayer = true;
        var deltaX = playerX - this.x;
        var deltaY = playerY - this.y;
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / 5;
        var tempX = this.x;
        var tempY = this.y
        
        while (Math.abs(tempX - playerX) > 40 || Math.abs(tempY - playerY) > 40) {
            for (var y = 0; y < LEVEL1_1.length; y++) {
                for (var x = 0; x < LEVEL1_1[y].length; x++) {
                    if (LEVEL1_1[y][x] > 0) {
                        if (Math.abs(tempX - (x*32+16)) < 36 && Math.abs(tempY - (y*32+16)) < 36) {
                            this.seePlayer = false;
                            break;
                        }
                    }
                }
            }
            tempX += deltaX / divider;
            tempY += deltaY / divider;
        }
    }

    draw() {
        if (this.hurtTime < ENEMY_HURT_TIME_BASE[this.type]) drawImageSmooth(ENEMY_HURT_SPRITES[this.type], this.x, this.y);
        else drawImageSmooth(ENEMY_SPRITES[this.type], this.x, this.y);
    }
}

class EnemyBullet {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;

        var deltaX = playerX - this.x;
        var deltaY = playerY - this.y;
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / ENEMY_BULLET_SPEED[this.type];
        
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
        drawImageSmooth(ENEMY_BULLET_SPRITES[this.type], this.x, this.y);
    }
}

function debug() {
    textSize(32);
    // text(playerHealth, 10, 40);
}