const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
var state = "playing"; // Game state. click, menu, playing

var volume = 0;
var volumeX = 0;
var volumePressed = false;

var inFade = false;
var fadeTimer = 0;
var fadeOpacity = 0;
var fadeOut = false;

var playerX = 512;
var playerY = 336;
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

var coins = 0;
var level = 0;
var room = 0;

var enemies = [];
const ENEMY_SPEED = [1.5, 3.5];
const ENEMY_HEALTH = [4, 1];
const ENEMY_HURT_TIME_BASE = [30, 20];
const ENEMY_SPREAD_DISTANCE = [40, 0];
const ENEMY_SPREAD_PLAYER_DISTANCE = [100, 0];
const ENEMY_COIN = [0, 0];

var enemyBullets = [];
const ENEMY_BULLET_SPEED = [4.5, 10];
const ENEMY_FIRING_COOLDOWN_BASE = [60];
var enemyFiringCooldown = 0;

var coinsDropped = [];
const COIN_VALUE = [1, 3, 10];

var saveRooms = [[0, 9]];

var paused = false;
var pauseTemp = false;

var menuEgg = 0;

function setup() { // Inital setup
    resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    noSmooth();
    frameRate(60);
    enemySpawn();
    if (localStorage.getItem("volumeX")) volumeX = parseInt(localStorage.getItem("volumeX"));
}

function preload() { // Load sprites
    PATH = "Sprites/";
    PLAYER = loadImage(PATH + "Player/player.png");
    PLAYER_HURT = loadImage(PATH + "Player/player_hurt.png");
    SAVE_INDICATOR = loadImage(PATH + "Player/save_indicator.png");

    BORDER = loadImage(PATH + "Background/border.png");
    CROSSHAIR = loadImage(PATH + "UI/crosshair.png");
    PLAYER_BULLET = loadImage(PATH + "Player/bullet.png");

    HEART_BOX = loadImage(PATH + "UI/heart_box.png");
    FULL_HEART = loadImage(PATH + "UI/full_heart.png");
    HALF_HEART = loadImage(PATH + "UI/half_heart.png");
    EMPTY_HEART = loadImage(PATH + "UI/empty_heart.png");

    COIN_BOX = loadImage(PATH + "UI/coin_box.png");
    COIN_LOGO = loadImage(PATH + "UI/coin_logo.png");

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
    VOLUME_KNOB = loadImage(PATH + "UI/volume_knob.png");
    VOLUME_SLIDER = loadImage(PATH + "UI/volume_slider.png");

    ENEMY0_IDLE = loadImage(PATH + "Enemy/1/enemy0_idle.png");
    ENEMY0_WALK1 = loadImage(PATH + "Enemy/1/enemy0_walk1.png");
    ENEMY0_WALK2 = loadImage(PATH + "Enemy/1/enemy0_walk2.png");
    ENEMY0_HURT = loadImage(PATH + "Enemy/1/enemy0_hurt.png");

    ENEMY1_IDLE = loadImage(PATH + "Enemy/1/enemy1.png");
    ENEMY1_WALK1 = loadImage(PATH + "Enemy/1/enemy1.png");
    ENEMY1_WALK2 = loadImage(PATH + "Enemy/1/enemy1.png");
    ENEMY1_HURT = loadImage(PATH + "Enemy/1/enemy1.png");
    ENEMY_SPRITES = [[ENEMY0_IDLE,ENEMY0_WALK1,ENEMY0_WALK2,ENEMY0_HURT], [ENEMY1_IDLE,ENEMY1_WALK1,ENEMY1_WALK2,ENEMY1_HURT]];
    ENEMY_HURT_SPRITES = [ENEMY0_HURT, ENEMY1_HURT];
    C4 = loadImage(PATH + "Enemy/3/c4.png");

    ENEMY0_BULLET = loadImage(PATH + "Enemy/bullet0.png");
    ENEMY1_BULLET = loadImage(PATH + "Enemy/bullet1.png");
    ENEMY_BULLET_SPRITES = [ENEMY0_BULLET, ENEMY1_BULLET];

    BARRIER_HORIZONTAL = loadImage(PATH + "Tiles/barrier_horizontal.png");
    BARRIER_VERTICAL = loadImage(PATH + "Tiles/barrier_vertical.png");

    BG1 = loadImage(PATH + "Tiles/1/bg.png");
    TILES1 = [];
    TILES1.push(loadImage(PATH + "Tiles/1/tile0.png"),loadImage(PATH + "Tiles/1/tile1.png"),loadImage(PATH + "Tiles/1/tile2.png"),loadImage(PATH + "Tiles/1/tile3.png"),loadImage(PATH + "Tiles/1/tile4.png"),loadImage(PATH + "Tiles/1/tile5.png"),loadImage(PATH + "Tiles/1/tile6.png"),loadImage(PATH + "Tiles/1/tile7.png"),loadImage(PATH + "Tiles/1/tile8.png"),loadImage(PATH + "Tiles/1/tile9.png"),loadImage(PATH + "Tiles/1/tile10.png"),loadImage(PATH + "Tiles/1/tile11.png"));
    TILES1.push(loadImage(PATH + "Tiles/1/tile12.png"),loadImage(PATH + "Tiles/1/tile13.png"),loadImage(PATH + "Tiles/1/tile14.png"),loadImage(PATH + "Tiles/1/tile15.png"),loadImage(PATH + "Tiles/1/tile16.png"),loadImage(PATH + "Tiles/1/tile17.png"),loadImage(PATH + "Tiles/1/tile18.png"),loadImage(PATH + "Tiles/1/tile19.png"),loadImage(PATH + "Tiles/1/tile20.png"),loadImage(PATH + "Tiles/1/tile21.png"),loadImage(PATH + "Tiles/1/tile22.png"),loadImage(PATH + "Tiles/1/tile23.png")); 
    TILES1.push(loadImage(PATH + "Tiles/1/tile24.png"),loadImage(PATH + "Tiles/1/tile25.png"),loadImage(PATH + "Tiles/1/tile26.png"),loadImage(PATH + "Tiles/1/tile27.png"),loadImage(PATH + "Tiles/1/tile28.png"),loadImage(PATH + "Tiles/1/tile29.png"),loadImage(PATH + "Tiles/1/tile30.png"),loadImage(PATH + "Tiles/1/tile31.png"),loadImage(PATH + "Tiles/1/tile32.png"),loadImage(PATH + "Tiles/1/tile33.png"),loadImage(PATH + "Tiles/1/tile34.png"),loadImage(PATH + "Tiles/1/tile35.png"));
    TILES1.push(loadImage(PATH + "Tiles/1/tile36.png"),loadImage(PATH + "Tiles/1/tile37.png"),loadImage(PATH + "Tiles/1/tile38.png"),loadImage(PATH + "Tiles/1/tile39.png"),loadImage(PATH + "Tiles/1/tile40.png"),loadImage(PATH + "Tiles/1/tile41.png"),loadImage(PATH + "Tiles/1/tile42.png"),loadImage(PATH + "Tiles/1/tile43.png"),loadImage(PATH + "Tiles/1/tile44.png"),loadImage(PATH + "Tiles/1/tile45.png"),loadImage(PATH + "Tiles/1/tile46.png"));

    COIN_BRONZE = [loadImage(PATH + "Items/Coins/coin_bronze1.png"),loadImage(PATH + "Items/Coins/coin_bronze2.png"),loadImage(PATH + "Items/Coins/coin_bronze3.png"),loadImage(PATH + "Items/Coins/coin_bronze4.png"),loadImage(PATH + "Items/Coins/coin_bronze5.png"),loadImage(PATH + "Items/Coins/coin_bronze6.png"),loadImage(PATH + "Items/Coins/coin_bronze7.png"),loadImage(PATH + "Items/Coins/coin_bronze8.png"),loadImage(PATH + "Items/Coins/coin_bronze9.png")];
    COIN_SILVER = [loadImage(PATH + "Items/Coins/coin_silver1.png"),loadImage(PATH + "Items/Coins/coin_silver2.png"),loadImage(PATH + "Items/Coins/coin_silver3.png"),loadImage(PATH + "Items/Coins/coin_silver4.png"),loadImage(PATH + "Items/Coins/coin_silver5.png"),loadImage(PATH + "Items/Coins/coin_silver6.png"),loadImage(PATH + "Items/Coins/coin_silver7.png"),loadImage(PATH + "Items/Coins/coin_silver8.png"),loadImage(PATH + "Items/Coins/coin_silver9.png")];
    COIN_GOLD = [loadImage(PATH + "Items/Coins/coin_gold1.png"),loadImage(PATH + "Items/Coins/coin_gold2.png"),loadImage(PATH + "Items/Coins/coin_gold3.png"),loadImage(PATH + "Items/Coins/coin_gold4.png"),loadImage(PATH + "Items/Coins/coin_gold5.png"),loadImage(PATH + "Items/Coins/coin_gold6.png"),loadImage(PATH + "Items/Coins/coin_gold7.png"),loadImage(PATH + "Items/Coins/coin_gold8.png"),loadImage(PATH + "Items/Coins/coin_gold9.png")];

    MENU_BUTTON = loadImage(PATH + "UI/menu_button.png");
    MENU_BUTTON_HOVER = loadImage(PATH + "UI/menu_button_hover.png");
    MENU_BACKGROUND = loadImage(PATH + "Background/menu_background.png");

    SAVE_POINT = loadImage(PATH + "Items/save_point.png");
    
    PATH = "Audio/";
    OVERWORLD = loadSound(PATH + 'Music/overworld.mp3');
    OVERWORLD.setVolume(volume/100);

    FONT_MONO = loadFont('Fonts/font_mono.ttf');
    FONT_SANS = loadFont('Fonts/font_sans.ttf');
    FONT_SANS_BOLD = loadFont('Fonts/font_sans_bold.ttf');
}

function draw() { // Loop
    clear();
    if (windowWidth < CANVAS_WIDTH || windowHeight < CANVAS_HEIGHT) return; // Don't allow resolutions that are too small
    
    if (state == "click") {
        drawImage(MENU_BACKGROUND, 512, 288);
        textAlign(CENTER, CENTER);
        textFont(FONT_SANS_BOLD);
        fill(0, 0, 0);
        textSize(32);
        if (mouseIsPressed) menuEgg++;
        if (menuEgg < 240) text('- Click anywhere to start -', 512, 280);
        else if (menuEgg < 240*2) text('...ok, you can let go now.', 512, 280);
        else if (menuEgg < 240*3) text('Hey, you gotta let go to start the game.', 512, 280);
        else if (menuEgg < 240*4) text('Come on, it\'s not hard.', 512, 280);
        else if (menuEgg < 240*5) text('You don\'t have to do anything. Literally.', 512, 280);
        else if (menuEgg < 240*6) text('There\'s no prize for doing this.', 512, 280);
        else if (menuEgg < 240*7) text('You\'d you rather do this than play the game?', 512, 280);
        else text('Don\'t you have anything better to do?', 512, 280);

        drawImage(BORDER, 512, 288);
    }

    if (state == "menu") menu();

    if (state == "playing") {
        noCursor();
        tiles();
        item();
        enemy();
        player();
        ui();
        fade();
        pause();
    }
    debug();
}

function menu() {
    cursor();
    drawImage(MENU_BACKGROUND, 512, 288);
    textAlign(CENTER, CENTER);

    var x = 512;
    var y = 180;
    if (mouseX >= x-128 && mouseX <= x+128 && mouseY >= y-32 && mouseY <= y+32 && !volumePressed) {
        drawImage(MENU_BUTTON_HOVER, x, y); // New Game
        if (mouseIsPressed) {
            level = 0;
            room = 0;
            state = "playing";
        }
    }
    else drawImage(MENU_BUTTON, x, y);
    textFont(FONT_SANS);
    fill(0, 180, 0);
    textSize(40);
    text('New Game', x, y-6);

    var y = 260;
    if (mouseX >= x-128 && mouseX <= x+128 && mouseY >= y-32 && mouseY <= y+32 && !volumePressed) {
        drawImage(MENU_BUTTON_HOVER, x, y); // Continue button
        if (mouseIsPressed) {
            level = parseInt(localStorage.getItem("level"));
            room = parseInt(localStorage.getItem("room"));
            state = "playing";
        }
    }
    else drawImage(MENU_BUTTON, x, y);
    fill(0, 140, 0);
    text('Continue', x, y-6);

    textSize(32);
    fill(200, 150, 0);
    text('Volume', 512, 336);

    textFont(FONT_SANS_BOLD);
    fill(0, 0, 0);
    textSize(48);
    text('Shooty Game', 512, 32);

    fill(69, 69, 69);
    textSize(24);
    text('Year 11 CS Project', 512, 80);

    textFont(FONT_SANS);
    fill(128, 128, 0);
    textSize(24);
    text('Credits', 512, 450);

    fill(64, 64, 64);
    textSize(16);
    text('Programming - AdminTroller', 512, 500);
    text('Music - AdminTroller', 512, 480);
    text('Sprites - mi_gusta', 512, 520);
    text('Playtesting - no one yet', 512, 540);

    if (mouseIsPressed && mouseX >= 512 - 170 && mouseX <= 512 + 170 && mouseY >= 386 - 20 && mouseY <= 386 + 20) volumePressed = true;
    if (!mouseIsPressed) volumePressed = false;
    if (volumePressed) {
        volumeX = (mouseX - 512);
        if (volumeX < -150) volumeX = -150;
        if (volumeX > 150) volumeX = 150;
        localStorage.setItem("volumeX", volumeX);
    }
    volume = Math.round((volumeX/3) + 50);
    OVERWORLD.setVolume(volume/100);
    drawImage(VOLUME_SLIDER, 512, 386);
    drawImageSmooth(VOLUME_KNOB, volumeX + 512, 386);
    textSize(32);
    textAlign(LEFT, CENTER);
    text(volume + "%", 700, 384);

    if (keyIsDown(46)) { // TEMPORARY DEBUG DELETE DATA
        level = 0;
        room = 0;
        saveGame();
    }
    textSize(12);
    fill(0, 0, 0);
    text("press Delete to delete data (temporary debug)", 710, 556);

    drawImage(BORDER, 512, 288);
}

function mouseClicked() {
    if (state == "click") {
        state = "menu";
        OVERWORLD.loop();
    }
}

function saveGame() {
    localStorage.setItem("level", level);
    localStorage.setItem("room", room);
}

function drawImage(sprite, x, y) {
    imageMode(CENTER);
    image(sprite, x+x%2, y+y%2, sprite.width*2, sprite.height*2);
}

function drawImageSmooth(sprite, x, y) {
    imageMode(CENTER);
    image(sprite, x, y, sprite.width*2, sprite.height*2);
}

function drawCrosshair() {
    drawImageSmooth(CROSSHAIR, mouseX, mouseY);
}

function ui() {
    uiHearts();
    uiAmmo();
    uiCoins();
    if (!paused) drawCrosshair();
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

function uiCoins() {
    drawImage(COIN_BOX, 954, 28);
    drawImage(COIN_LOGO, 992, 28);

    drawImage(NUMBERS[Math.floor(coins/100)], 908, 28);
    drawImage(NUMBERS[Math.floor(coins/10)%10], 926, 28);
    drawImage(NUMBERS[coins%10], 944, 28);
}

function fade() {
    if (allowChangeRoomFade) changeRoomFade();
}

function item() {
    for (var i = 0; i < coinsDropped.length; i++) {
        var coin = coinsDropped[i];
        coin.update();

        if (Math.abs(coin.x - playerX) < 28 && Math.abs(coin.y - playerY) < 36) {
            coin.collect();
            coinsDropped.splice(i,1);
            i--;
        }
    }

    for (var i = 0; i < saveRooms.length; i++) {
        if (saveRooms[i][0] == level && saveRooms[i][1] == room) { 
            drawImage(SAVE_POINT, 512, 288);
        }
    }

}

function player() {
    if (!playerDead) {
        if (!inFade) {
            if (!paused) {
                playerMovement();
                reload();
                playerHurt();
                playerMoveEdge();
                playerSave();
            }
            playerShooting();
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
            if (LEVELS[level][room][y][x].length != 0) {
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

    if (level_clear[level][room]) playerSpeed = 6;
    else playerSpeed = 4;
}

function playerShooting() {
    if (!paused) {
        if (playerFiringCooldown < playerGunCooldowns[playerGun]) playerFiringCooldown++;
        if (mouseIsPressed && (playerInRoom || level_clear[level][room])) {
            if (playerAmmo[playerGun] > 0 && playerFiringCooldown >= playerGunCooldowns[playerGun] && playerReload[playerGun] >= gunReload[playerGun]) {
                var bullet = new PlayerBullet();
                playerBullets.push(bullet);
                playerFiringCooldown = 0;
                playerAmmo[playerGun] -= 1;
            }
        }
    }

    for (var i = 0; i < playerBullets.length; i++) { // Player Bullets
        var bullet = playerBullets[i];
        bullet.update();

        var temp = true;
        for (var y = 0; y < LEVELS[level][room].length; y++) {
            for (var x = 0; x < LEVELS[level][room][y].length; x++) {
                if (LEVELS[level][room][y][x].length != 0) {
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

function playerSave() {
    for (var i = 0; i < saveRooms.length; i++) {
        if (saveRooms[i][0] == level && saveRooms[i][1] == room && playerX >= 512-60 && playerX <= 512+60 && playerY >= 288-44 && playerY < 288+44) { 
            drawImage(SAVE_INDICATOR, playerX, playerY+40);
            if (keyIsDown(32)) saveGame();
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
                if (LEVELS[level][room][y][x].length != 0) {
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

        if (keyIsDown(71)) { // Debug kill enemy
            if (enemy.level == level && enemy.room == room && !enemy.dead) enemy.die();
        }
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
            if (LEVELS[level][room][y][x].length == 0) drawImage(BG1, x*32+16, y*32+16);
        }
    }

    if (!level_clear[level][room] && playerInRoom) {
        drawImage(BARRIER_HORIZONTAL, 512, 32);
        drawImage(BARRIER_HORIZONTAL, 512, 544);
        drawImage(BARRIER_VERTICAL, 32, 288);
        drawImage(BARRIER_VERTICAL, 992, 288);
    }

    for(var y = 0; y < LEVELS[level][room].length; y++) { //Foreground tiles
        for (var x = 0; x < LEVELS[level][room][y].length; x++) {
            if (LEVELS[level][room][y][x].length != 0) drawImage(TILES1[LEVELS[level][room][y][x]], x*32+16, y*32+16);
        }
    }
}

function pause() {
    if (keyIsDown(27) && !pauseTemp && !inFade) { // Esc pressed
        paused = !paused;
        pauseTemp = true;
    }
    if (!keyIsDown(27)) pauseTemp = false;

    if (paused) {
        cursor();
        background(0, 0, 0, 128);
        textFont(FONT_SANS_BOLD);
        textSize(48);
        textAlign(CENTER, CENTER);
        fill(200, 200, 200);
        text("- Paused -", 512, 288);
    }
    else {
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
        if (!paused) this.move();
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
        this.firingSlowdown = 1;

        this.animation = 0;
        this.animationWalk = 1;
        this.animationTimer = 0;

        this.hurtTime = ENEMY_HURT_TIME_BASE[this.type];
    }

    update() {
        if (this.level == level && this.room == room) {
            if (!this.dead) {
                if (!playerDead && !inFade && playerInRoom && !paused) {
                    if (this.seePlayer) this.move();
                    else this.animation = 0;
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
                if (LEVELS[level][room][y][x].length != 0) {
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

        if (dx == 0 && dy == 0) this.animation = 0;
        else {
            this.animationTimer++;
            if (this.animationTimer >= 30) {
                this.animationWalk = 3 - this.animationWalk
                this.animationTimer = 0;
            }
            this.animation = this.animationWalk;
        }
        
    }

    hurt() {
        this.playerBullets = playerBullets;
        if (this.hurtTime < ENEMY_HURT_TIME_BASE[this.type]) { // During hurt
            this.hurtTime++; 
            this.firingSlowdown = 0.75;
            this.animation = 3;
        }
        else this.firingSlowdown = 1;

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
        if (this.firingCooldown * this.firingSlowdown < ENEMY_FIRING_COOLDOWN_BASE[this.type]) this.firingCooldown++;
        if (this.firingCooldown * this.firingSlowdown >= ENEMY_FIRING_COOLDOWN_BASE[this.type] && this.seePlayer) {
            var bullet = new EnemyBullet(this.x, this.y, this.type);
            enemyBullets.push(bullet);
            this.firingCooldown = Math.random() * 10 - 5;
        }
    }

    die() {
        this.dead = true;
        coinsDropped.push(new Coin(this.x, this.y, ENEMY_COIN[this.type], level, room));
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
                    if (LEVELS[level][room][y][x].length != 0) {
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
        // if (this.hurtTime < ENEMY_HURT_TIME_BASE[this.type]) drawImageSmooth(ENEMY_SPRITES[this.type][3], this.x, this.y);
        // else drawImageSmooth(ENEMY_SPRITES[this.type][0], this.x, this.y);
        drawImageSmooth(ENEMY_SPRITES[this.type][this.animation], this.x, this.y);
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
        if (!inFade && !paused) {
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

class Coin {
    constructor(x, y, type, level, room) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = level;
        this.room = room;

        this.animation = 0;
        this.animationDir = 1;
        this.animationDelay = 0;
    }

    update() {
        this.draw();
    }

    collect() {
        coins += COIN_VALUE[this.type];
    }

    draw() {

        if (this.level == level && this.room == room) {
            if (this.type == 0) drawImage(COIN_BRONZE[this.animation], this.x, this.y);
            if (this.type == 1) drawImage(COIN_SILVER[this.animation], this.x, this.y);
            if (this.type == 2) drawImage(COIN_GOLD[this.animation], this.x, this.y);

            if (this.animationDelay >= 3) {
                if ((this.animation >= 8 && this.animationDir > 0) || (this.animation <= 0 && this.animationDir < 0)) this.animationDir *= -1;
                this.animation += this.animationDir;
            }
            if (!paused) this.animationDelay++;
            if (this.animationDelay >= 4) this.animationDelay = 0;
        }
    }
}

function debug() {
    textSize(32);
}

function enemySpawn() { // (x, y, type, level, room)
    enemies.push(new Enemy(400, 160, 0, 0, 1));
    enemies.push(new Enemy(640, 160, 0, 0, 1));

    enemies.push(new Enemy(200, 150, 0, 0, 2));
    enemies.push(new Enemy(200, 426, 0, 0, 2));
    enemies.push(new Enemy(144, 288, 1, 0, 2));

    enemies.push(new Enemy(800, 244, 0, 0, 3));
    enemies.push(new Enemy(800, 332, 0, 0, 3));

    enemies.push(new Enemy(200, 310, 0, 0, 4));
    enemies.push(new Enemy(700, 180, 0, 0, 4));
    enemies.push(new Enemy(860, 420, 0, 0, 4));
    enemies.push(new Enemy(400, 120, 1, 0, 4));

    enemies.push(new Enemy(150, 200, 1, 0, 5));
    enemies.push(new Enemy(136, 300, 0, 0, 5));
    enemies.push(new Enemy(885, 250, 0, 0, 5));
    enemies.push(new Enemy(875, 360, 1, 0, 5));
}

var level1_clear = [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
var level_clear = [level1_clear];

const LEVEL1_0 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","",13,14,15,"","","","","","",13,14,15,"","","","","","","","",25,26],
    [26,27,"","","","","","","","",25,26,27,"","","","","","",25,26,27,"","","","","","","","",25,26],
    [26,27,"","","","","","","","",25,26,27,"","","","","","",25,26,27,"","","","","","","","",25,26],
    [26,27,"","","","","","","","",37,38,39,"","","","","","",37,38,39,"","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];
const LEVEL1_1 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",37,38],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","",13,14,14,14,14,14,14,14,14,14,14,15,"","","","","","","","","",""],
    ["","","","","","","","","","",37,38,38,38,38,38,38,38,38,38,38,39,"","","","","","","","","",""],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];
const LEVEL1_2 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","",13,15,"","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","",37,39,"","","","","","","","","","","","","",37,38],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","",13,15,"","","","","","","","","","","","","",13,14],
    [26,27,"","","","","","","","","","","","","",37,39,"","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];
const LEVEL1_3 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,32,39,"","","","",37,33,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","","","",25,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","","","",25,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","","","",25,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,39,"","","","","","",37,38,38,38,38,38,38,38,38,38,38,33,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_4 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","",01,02,02,03,"","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","",01,02,02,03,"","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_5 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,32,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,33,26,26,26],
    [26,26,26,27,"","","","","","","","","","","","","","","","","","","","","","","","",25,26,26,26],
    [26,32,38,39,"","","","","","","","","","","","","","","","","","","","","","","","",37,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,15,"","","","","","","","","","","","","","","","","","","","","","","","",13,14,45,26],
    [26,26,26,27,"","","","","","","","","","","","","","","","","","","","","","","","",25,26,26,26],
    [26,26,26,44,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,45,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1 = [LEVEL1_0,LEVEL1_1,LEVEL1_2,LEVEL1_3,LEVEL1_4,LEVEL1_5];
const LEVELS = [LEVEL1];

const LEVEL1_MAP = [ // [up, down, left, right]
    [1, 0, 0, 0], // Room 0
    [0, 0, 2, 3], // Room 1
    [4, 0, 0, 1], // Room 2 etc.
    [5, 0, 1, 0],
    [4, 2, 0, 0],
    [5, 3, 0, 0],
];
const LEVEL_MAP = [LEVEL1_MAP];

const LEVEL_TEMPLATE = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",37,39],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",13,15],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];