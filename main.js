const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
var state = "playing"; // Game state. click, menu, playing

var inFade = false;
var fadeTimer = 0;
var fadeOpacity = 0;
var fadeOut = false;

var playerX = 512;
var playerY = 400;
var playerSpeed = 4;
var playerHealth = 6;
const PLAYER_HURT_TIME_BASE = 60;
var playerHurtTime = PLAYER_HURT_TIME_BASE;
var playerDead = false;
var playerInRoom = true;
var changeRoomDir;

var allowChangeRoomFade = false;
var changeRoomFadeTimer = 0;

var playerGun = 0;
var playerBullets = [];
const PLAYER_BULLET_SPEED = 12;
var playerGunCooldowns = [20];
var playerFiringCooldown = playerGunCooldowns[0];
var gunAmmo = [10];
var playerAmmo = [gunAmmo[0]];
var gunReload = [40];
var playerReload = [40];

var level = 0;
var room = 0;

var enemies = [];
const ENEMY_SPEED = [1.5, 3];
const ENEMY_HEALTH = [4, 1];
const ENEMY_HURT_TIME_BASE = [30, 20];
const ENEMY_SPREAD_DISTANCE = [40, 0];
const ENEMY_SPREAD_PLAYER_DISTANCE = [80, 15];

var enemyBullets = [];
const ENEMY_BULLET_SPEED = [5, 10];
const ENEMY_FIRING_COOLDOWN_BASE = [60];
var enemyFiringCooldown = 0;

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

    HEART_BOX = loadImage(PATH + "UI/heart_box.png");
    FULL_HEART = loadImage(PATH + "UI/full_heart.png");
    HALF_HEART = loadImage(PATH + "UI/half_heart.png");
    EMPTY_HEART = loadImage(PATH + "UI/empty_heart.png");

    AMMO_BOX = loadImage(PATH + "UI/ammo_box.png");
    RELOAD_BOX = loadImage(PATH + "UI/reload_box.png");
    AMMO_SYMBOL = loadImage(PATH + "UI/ammo_symbol.png");
    AMMO_SYMBOL_EMPTY = loadImage(PATH + "UI/ammo_symbol_empty.png");
    ZERO = loadImage(PATH + "UI/0.png");
    ONE = loadImage(PATH + "UI/1.png");
    TWO = loadImage(PATH + "UI/2.png");
    THREE = loadImage(PATH + "UI/3.png");
    FOUR = loadImage(PATH + "UI/4.png");
    FIVE = loadImage(PATH + "UI/5.png");
    SIX = loadImage(PATH + "UI/6.png");
    SEVEN = loadImage(PATH + "UI/7.png");
    EIGHT = loadImage(PATH + "UI/8.png");
    NINE = loadImage(PATH + "UI/9.png");
    SLASH = loadImage(PATH + "UI/slash.png");
    NUMBERS = [ZERO,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,SLASH];

    ENEMY0 = loadImage(PATH + "Enemy/enemy0.png");
    ENEMY0_HURT = loadImage(PATH + "Enemy/enemy0_hurt.png");
    ENEMY1 = loadImage(PATH + "Enemy/enemy1.png");
    ENEMY1_HURT = loadImage(PATH + "Enemy/enemy1.png");
    ENEMY_SPRITES = [ENEMY0, ENEMY1];
    ENEMY_HURT_SPRITES = [ENEMY0_HURT, ENEMY1_HURT];
    C4 = loadImage(PATH + "Enemy/3/c4.png");

    ENEMY0_BULLET = loadImage(PATH + "Enemy/bullet0.png");
    ENEMY1_BULLET = loadImage(PATH + "Enemy/bullet1.png");
    ENEMY_BULLET_SPRITES = [ENEMY0_BULLET, ENEMY1_BULLET];

    BARRIER_HORIZONTAL = loadImage(PATH + "Tiles/barrier_horizontal.png");
    BARRIER_VERTICAL = loadImage(PATH + "Tiles/barrier_vertical.png");
    TILE0 = loadImage(PATH + "Tiles/tile0.png");
    TILE1 = loadImage(PATH + "Tiles/tile1.png");
    
    PATH = "Audio/";
    OVERWORLD = loadSound(PATH + 'Music/overworld.mp3');
    OVERWORLD.setVolume(0.5);
}

var musicTimer = 0;

function draw() { // Loop
    clear();
    if (windowWidth < CANVAS_WIDTH || windowHeight < CANVAS_HEIGHT) return; // Don't allow resolutions that are too small

    if (state != "click") {
        debug();
    
        tiles();
        enemy();
        player();
        ui();
        fade();

        musicTimer += 1;
        if (musicTimer == 60) {
            OVERWORLD.loop();
        }
        noCursor();
    }

    imageMode(CORNER);
    // drawImage(BORDER, 0, 0);
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
    uiAmmo();
    drawCrosshair();
}

function uiHearts() {
    drawImage(HEART_BOX, 82, 28);
    drawImage(EMPTY_HEART, 30, 28);
    drawImage(EMPTY_HEART, 82, 28);
    drawImage(EMPTY_HEART, 134, 28);
    if (playerHealth >= 1) drawImage(HALF_HEART, 30, 28);
    if (playerHealth >= 2) drawImage(FULL_HEART, 30, 28);
    if (playerHealth >= 3) drawImage(HALF_HEART, 82, 28);
    if (playerHealth >= 4) drawImage(FULL_HEART, 82, 28);
    if (playerHealth >= 5) drawImage(HALF_HEART, 134, 28);
    if (playerHealth >= 6) drawImage(FULL_HEART, 134, 28);
}

function uiAmmo() {
    drawImage(AMMO_BOX, 70, 548);
    drawImage(NUMBERS[Math.floor(playerAmmo/10)], 14, 548);
    drawImage(NUMBERS[playerAmmo % 10], 32, 548);
    drawImage(NUMBERS[10], 50, 548);
    drawImage(NUMBERS[Math.floor(gunAmmo[playerGun]/10)], 66, 548);
    drawImage(NUMBERS[gunAmmo[playerGun] % 10], 84, 548);
    if (playerAmmo[playerGun] > 0) drawImage(AMMO_SYMBOL, 118, 548);
    else {
        drawImage(AMMO_SYMBOL_EMPTY, 118, 548);
        drawImage(AMMO_SYMBOL_EMPTY, playerX, playerY - 48);
    }

    if (playerReload[playerGun] < gunReload[playerGun]) {
        drawImageSmooth(RELOAD_BOX, 70 - (playerReload[playerGun] * (140/gunReload[playerGun])), 548);
    }
}

function fade() {
    if (allowChangeRoomFade) changeRoomFade();
}

function player() {
    if (!playerDead) {
        if (!inFade) {
            playerMovement();
            playerShooting();
            reload();
            playerHurt();
            playerMoveEdge();
        }
        playerDraw();
    }
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

    if (playerX >= (64+12) && playerX <= CANVAS_WIDTH - (64+12) && playerY >= (64+18) && playerY <= CANVAS_HEIGHT - (64+18)) playerInRoom = true;
    else playerInRoom = false;

    for (var y = 0; y < LEVELS[level][room].length; y++) {
        for (var x = 0; x < LEVELS[level][room][y].length; x++) {
            if (LEVELS[level][room][y][x] > 0) {
                if (!level_clear[level][room] && playerInRoom) {
                    if (tempX < (64+12) || tempX > CANVAS_WIDTH - (64+12)) okX = false;
                    if (tempY < (64+18) || tempY > CANVAS_HEIGHT - (64+18)) okY = false;
                }
                if (Math.abs(tempX - (x*32+16)) < 28 && Math.abs(playerY - (y*32+16)) < 36) {
                    okX = false;
                    break;
                }
                if (Math.abs(playerX - (x*32+16)) < 28 && Math.abs(tempY - (y*32+16)) < 36) {
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
    if (mouseIsPressed && (playerInRoom || level_clear[level][room])) {
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

        var temp = true;
        for (var y = 0; y < LEVELS[level][room].length; y++) {
            for (var x = 0; x < LEVELS[level][room][y].length; x++) {
                if (LEVELS[level][room][y][x] > 0) {
                    if (Math.abs(bullet.x - (x*32+16)) < 24 && Math.abs(bullet.y - (y*32+16)) < 24) {
                        playerBullets.splice(i, 1); // Remove bullet
                        i--;
                        var temp = false;
                        break;
                    }
                }
            }
            if (!temp) break;
        }

        if (bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50 || bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50) {
            playerBullets.splice(i, 1); // Remove bullet
            i--;
        }
        if (temp && playerInRoom && !level_clear[level][room] && (bullet.y <= 72 || bullet.y >= CANVAS_HEIGHT - 72 || bullet.x <= 72 || bullet.x >= CANVAS_WIDTH - 72)) {
            playerBullets.splice(i, 1); // Remove bullet
            i--;
        }
    }
}

function reload() {
    if (playerReload[playerGun] < gunReload[playerGun]) playerReload[playerGun]++;
    if (playerReload[playerGun] == gunReload[playerGun] - 1) playerAmmo[playerGun] = gunAmmo[playerGun];

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
        if (Math.abs(bullet.x - playerX) <= 20 && Math.abs(bullet.y - playerY) <= 28) {
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
        if (enemy.level == level && enemy.room == room) {
            if (Math.abs(enemy.x - playerX) <= 28 && Math.abs(enemy.y - playerY) <= 44 && !enemy.dead) {
                if (enemy.type == 1) enemy.die();
                if (playerHurtTime >= PLAYER_HURT_TIME_BASE) {
                    playerHealth -= 1;
                    playerHurtTime = 0;
                    if (playerHealth <= 0) playerDie();
                    break;
                }
            }
        }
    }
}

function playerDie() {
    playerDead = true;
    console.log("you died");
}

function playerDraw() {
    if (playerHurtTime >= PLAYER_HURT_TIME_BASE) drawImageSmooth(PLAYER, playerX, playerY);
    else drawImageSmooth(PLAYER_HURT, playerX, playerY);
}

function playerMoveEdge() {
    if (playerY < 8) {
        changeRoomDir = 0;
        changeRoom(changeRoomDir);
    }
    if (playerY > CANVAS_HEIGHT - 8) {
        changeRoomDir = 1;
        changeRoom(changeRoomDir);
    }
    if (playerX < 8) {
        changeRoomDir = 2;
        changeRoom(changeRoomDir);
    }
    if (playerX > CANVAS_WIDTH - 8) {
        changeRoomDir = 3;
        changeRoom(changeRoomDir);
    }
}

function changeRoom(dir) {
    inFade = true;
    allowChangeRoomFade = true;
    changeRoomDir = dir;
    playerInRoom = false;
}

function changeRoomFade() {
    if (fadeOut) fadeOpacity -= 20;
    else fadeOpacity += 20;
    background(0, 0, 0, fadeOpacity);
    if (fadeOpacity >= 255) {
        fadeOut = true;
        enemyBullets = [];
        playerBullets = [];
        room = LEVEL_MAP[level][room][changeRoomDir];

        if (changeRoomDir == 0) playerY = CANVAS_HEIGHT - 12;
        if (changeRoomDir == 1) playerY = 12;
        if (changeRoomDir == 2) playerX = CANVAS_WIDTH - 12;
        if (changeRoomDir == 3) playerX = 12;
    }
    if (fadeOpacity < 0) {
        fadeOut = false;
        inFade = false;
        allowChangeRoomFade = false;
        fadeOpacity = 0;
    }
}

function enemy() {
    for (var i = 0; i < enemyBullets.length; i++) { // Enemy Bullets
        var bullet = enemyBullets[i];
        bullet.update();

        var temp = true;
        for (var y = 0; y < LEVELS[level][room].length; y++) {
            for (var x = 0; x < LEVELS[level][room][y].length; x++) {
                if (LEVELS[level][room][y][x] > 0) {
                    if (Math.abs(bullet.x - (x*32+16)) < 24 && Math.abs(bullet.y - (y*32+16)) < 24) {
                        enemyBullets.splice(i, 1); // Remove bullet
                        i--;
                        var temp = false;
                        break;
                    }
                }
            }
            if (!temp) break;
        }

        if (bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50 || bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50) {
            enemyBullets.splice(i, 1); // Remove bullet
            i--;
        }
        if (temp && playerInRoom && !level_clear[level][room] && (bullet.y <= 72 || bullet.y >= CANVAS_HEIGHT - 72 || bullet.x <= 72 || bullet.x >= CANVAS_WIDTH - 72)) {
            enemyBullets.splice(i, 1); // Remove bullet
            i--;
        }
    }

    for (var i = 0; i < enemies.length; i++) { // Enemies
        var enemy = enemies[i];
        enemy.update();
    }

    for (var l = 0; l < level_clear.length; l++) { // Check room clear
        for (var r = 0; r < level_clear[l].length; r++) {
            var roomCleared = true;
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                if (enemy.level == l && enemy.room == r && !enemy.dead) {
                    roomCleared = false;
                    break;
                }
            }
            if (roomCleared) level_clear[l][r] = true;
        }
    }
}

function tiles() {
    for(var y = 0; y < LEVELS[level][room].length; y++) { //Background tiles
        for (var x = 0; x < LEVELS[level][room][y].length; x++) {
            if (LEVELS[level][room][y][x] == 0) drawImage(TILE0, x*32+16, y*32+16);
        }
    }

    if (level_clear[level][room] == false && playerInRoom) {
        drawImage(BARRIER_HORIZONTAL, 512, 32);
        drawImage(BARRIER_HORIZONTAL, 512, 544);
        drawImage(BARRIER_VERTICAL, 32, 288);
        drawImage(BARRIER_VERTICAL, 992, 288);
    }

    for(var y = 0; y < LEVELS[level][room].length; y++) { //Foreground tiles
        for (var x = 0; x < LEVELS[level][room][y].length; x++) {
            if (LEVELS[level][room][y][x] == 1) drawImage(TILE1, x*32+16, y*32+16);
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
    constructor(x, y, type, level, room) {
        this.id = enemies.length;
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = level;
        this.room = room;
        this.health = ENEMY_HEALTH[this.type];
        this.dead = false;
        this.seePlayer = false;
        this.firingCooldown = 0;

        this.hurtTime = ENEMY_HURT_TIME_BASE[this.type];
    }

    update() {
        if (this.level == level && this.room == room) {
            if (!this.dead) {
                if (!playerDead && !inFade && playerInRoom) {
                    if (this.seePlayer) this.move();
                    this.shoot();
                    this.hurt();
                    this.vision();
                }
                this.draw();
            }
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

        for (var y = 0; y < LEVELS[level][room].length; y++) {
            for (var x = 0; x < LEVELS[level][room][y].length; x++) {
                if (LEVELS[level][room][y][x] > 0) {
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

        var tempX = this.x + dx*5;
        var tempY = this.y + dy*5;
        if (Math.abs(playerX - tempX) < ENEMY_SPREAD_PLAYER_DISTANCE[this.type] && Math.abs(playerY - tempY) < ENEMY_SPREAD_PLAYER_DISTANCE[this.type]) { // Check collision with player
            dx = 0;
            dy = 0;
        }

        for (var i = 0; i < enemies.length; i++) { // Check collision
            if (enemies[i].level == this.level && enemies[i].room == this.room) {
                var enemy = enemies[i];
                var tempX = this.x + dx*5;
                var tempY = this.y + dy*5;
                if (i != this.id && !enemy.dead) { // Check collision with other enemies
                    if (Math.abs(enemy.x - tempX) < ENEMY_SPREAD_DISTANCE[this.type] && Math.abs(enemy.y - tempY) < ENEMY_SPREAD_DISTANCE[this.type]) {
                        dx = 0;
                        dy = 0;
                        break;
                    }
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
            // this.firingCooldown = 0; //uncomment this if you want enemies to not show when getting hurt
        }

        for (var i = 0; i < playerBullets.length; i++) { // Check bullet collision
            var bullet = playerBullets[i];
            if (Math.abs(bullet.x - this.x) <= 20 && Math.abs(bullet.y - this.y) <= 24) {
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
        if (this.firingCooldown >= ENEMY_FIRING_COOLDOWN_BASE[this.type] && this.seePlayer) {
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
        var divider = distance / 10;
        var tempX = this.x;
        var tempY = this.y
        
        while (Math.abs(tempX - playerX) > 40 || Math.abs(tempY - playerY) > 40) {
            for (var y = 0; y < LEVELS[level][room].length; y++) {
                for (var x = 0; x < LEVELS[level][room][y].length; x++) {
                    if (LEVELS[level][room][y][x] > 0) {
                        if (Math.abs((tempX) - (x*32+16)) < 18 && Math.abs(tempY - (y*32+16)) < 18) {
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
        if (!inFade) {
            this.move();
        }
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

function enemySpawn() { // (x, y, type, level, room)
    enemies.push(new Enemy(400, 160, 0, 0, 1));
    enemies.push(new Enemy(640, 160, 0, 0, 1));

    enemies.push(new Enemy(100, 100, 0, 0, 2));
    enemies.push(new Enemy(200, 100, 0, 0, 2));
    enemies.push(new Enemy(300, 100, 1, 0, 2));
}

var level1_clear = [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
var level_clear = [level1_clear];

const LEVEL1_1 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const LEVEL1_2 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const LEVEL1_3 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const LEVEL1 = [LEVEL1_1, LEVEL1_2, LEVEL1_3];
const LEVELS = [LEVEL1];

const LEVEL1_MAP = [ // [up, down, left, right]
    [1, 0, 0, 0], // Room 0
    [0, 0, 2, 1], // Room 1 etc.
    [2, 0, 0, 1],
];
const LEVEL_MAP = [LEVEL1_MAP];

const LEVEL_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];