const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;
var state = "click"; // Game state. click, menu, playing, credits

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
var inBoss = false;

var playerWalkDelay = 4;
var playerWalkTimer = 0;
var playerWalkAnimation = 0;
var playerDir = 0;
var playerMoving = false;

var allowChangeRoomFade = false;
var changeRoomFadeTimer = 0;

// pistol, machine, gatling, shotgun, sniper
var playerGuns = [0, -1];
var playerGun = 0;
var playerBullets = [];
const PLAYER_BULLET_SPEED = [12, 14, 9, 9, 22];
const PLAYER_SLOWDOWN = [1, 0.9, 0.75, 0.75, 0.85];
var playerGunCooldowns = [20, 10, 6, 40, 40];
var playerFiringCooldown = playerGunCooldowns[0];
var gunAmmo = [10, 25, 45, 8, 2];
var playerAmmo = [gunAmmo[0], gunAmmo[1], gunAmmo[2], gunAmmo[3], gunAmmo[4]];
var gunReload = [40, 60, 70, 60, 60];
var playerReload = [gunReload[0], gunReload[1], gunReload[2], gunReload[3], gunReload[4]];
var gunDamage = [1, 0.85, 0.5, 0.75, 5];
var gunNames = ["Pistol", "Machine Gun", "Gatling Gun", "Shotgun", "Sniper"];
var startupCooldown = 30;

var coins = 0;
var level = 0;
var room = 0;

// Pistol, Kamikaze, Machine, Shotgun
var enemies = [];
const ENEMY_SPEED = [1.5, 3.5, 1.5, 1];
const ENEMY_HEALTH = [4, 1, 6, 6];
const ENEMY_HURT_TIME_BASE = [30, 20, 30, 20];
const ENEMY_SPREAD_DISTANCE = [40, 0, 40, 40];
const ENEMY_SPREAD_PLAYER_DISTANCE = [100, 0, 100, 60];
const ENEMY_COIN = [0, 0, 1, 1];

var enemyBullets = [];
const ENEMY_BULLET_SPEED = [4.5, 10, 4.5, 4];
const ENEMY_FIRING_COOLDOWN_BASE = [60, 0, 20, 80];
var enemyFiringCooldown = 0;

const bossX = 512;
const bossY = 140;
var bossHealth = 100;
var bossAttack = 0;
var bossTimer = 160;
var bossPattern = 0;

var chestRooms = [[0, 10, 0, false], [0, 21, 0, false]]; // [level, room, type, opened]
var heartsDropped = [] // [level, room, x, y]

var shopRooms = [[0, 11, 1, false, -1, -1], [0, 17, 1.4, false, -1, -1]]; // [level, room, multiplier, visited, item1, item2, item3]
var shopPrices = [0, 9, 16, 12, 14];

var coinsDropped = [];
const COIN_VALUE = [1, 3, 10];

var gunsDropped = []; // [level, room, x, y, type]

var saveRooms = [[0, 9, "down"], [0, 19, "down"]]; // [level, room, entrace direction]
var currentSave = -1;

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

    PATH = "Sprites/Player/Walk/";
    PLAYER_UP = [loadImage(PATH + "walk_up1.png"),loadImage(PATH + "walk_up2.png"),loadImage(PATH + "walk_up3.png"),loadImage(PATH + "walk_up4.png"),loadImage(PATH + "walk_up5.png"),loadImage(PATH + "walk_up6.png"),loadImage(PATH + "walk_up7.png"),loadImage(PATH + "walk_up8.png")];
    PLAYER_DOWN = [loadImage(PATH + "walk_down1.png"),loadImage(PATH + "walk_down2.png"),loadImage(PATH + "walk_down3.png"),loadImage(PATH + "walk_down4.png"),loadImage(PATH + "walk_down5.png"),loadImage(PATH + "walk_down6.png"),loadImage(PATH + "walk_down7.png"),loadImage(PATH + "walk_down8.png")];
    PLAYER_LEFT = [loadImage(PATH + "walk_left1.png"),loadImage(PATH + "walk_left2.png"),loadImage(PATH + "walk_left3.png"),loadImage(PATH + "walk_left4.png"),loadImage(PATH + "walk_left5.png"),loadImage(PATH + "walk_left6.png"),loadImage(PATH + "walk_left7.png"),loadImage(PATH + "walk_left8.png")];
    PLAYER_RIGHT = [loadImage(PATH + "walk_right1.png"),loadImage(PATH + "walk_right2.png"),loadImage(PATH + "walk_right3.png"),loadImage(PATH + "walk_right4.png"),loadImage(PATH + "walk_right5.png"),loadImage(PATH + "walk_right6.png"),loadImage(PATH + "walk_right7.png"),loadImage(PATH + "walk_right8.png")];
    PLAYER_SPRITES = [PLAYER_UP, PLAYER_DOWN, PLAYER_LEFT, PLAYER_RIGHT];

    PATH = "Sprites/";
    PLAYER = loadImage(PATH + "Player/player.png");
    PLAYER_HURT = loadImage(PATH + "Player/player_hurt.png");
    SPACE_INDICATOR = loadImage(PATH + "Player/space_indicator.png");
    SHIFT_INDICATOR = loadImage(PATH + "Player/shift_indicator.png");

    BORDER = loadImage(PATH + "Background/border.png");
    CROSSHAIR = loadImage(PATH + "UI/crosshair.png");
    PLAYER_BULLETS = [loadImage(PATH + "Player/bullet0.png"),loadImage(PATH + "Player/bullet1.png"),loadImage(PATH + "Player/bullet2.png"),loadImage(PATH + "Player/bullet3.png"),loadImage(PATH + "Player/bullet4.png")];

    HEART_BOX = loadImage(PATH + "UI/heart_box.png");
    FULL_HEART = loadImage(PATH + "UI/full_heart.png");
    HALF_HEART = loadImage(PATH + "UI/half_heart.png");
    EMPTY_HEART = loadImage(PATH + "UI/empty_heart.png");

    COIN_BOX = loadImage(PATH + "UI/coin_box.png");
    COIN_LOGO = loadImage(PATH + "UI/coin_logo.png");

    AMMO_BOX = loadImage(PATH + "UI/ammo_box.png");
    RELOAD_BOX = loadImage(PATH + "UI/reload_box.png");
    SWAP_GUN = loadImage(PATH + "UI/swap_gun.png");
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

    GUN_BOX1 = loadImage(PATH + "UI/gun_box1.png");
    GUN_BOX2 = loadImage(PATH + "UI/gun_box2.png");

    ENEMY0_IDLE = loadImage(PATH + "Enemy/1/enemy0_idle.png");
    ENEMY0_WALK1 = loadImage(PATH + "Enemy/1/enemy0_walk1.png");
    ENEMY0_WALK2 = loadImage(PATH + "Enemy/1/enemy0_walk2.png");
    ENEMY0_HURT = loadImage(PATH + "Enemy/1/enemy0_hurt.png");

    ENEMY1_IDLE = loadImage(PATH + "Enemy/1/enemy1.png");
    ENEMY1_WALK1 = loadImage(PATH + "Enemy/1/enemy1.png");
    ENEMY1_WALK2 = loadImage(PATH + "Enemy/1/enemy1.png");
    ENEMY1_HURT = loadImage(PATH + "Enemy/1/enemy1.png");

    ENEMY2_IDLE = loadImage(PATH + "Enemy/1/enemy2_idle.png");
    ENEMY2_WALK1 = loadImage(PATH + "Enemy/1/enemy2_walk1.png");
    ENEMY2_WALK2 = loadImage(PATH + "Enemy/1/enemy2_walk2.png");
    ENEMY2_HURT = loadImage(PATH + "Enemy/1/enemy2_hurt.png");

    ENEMY3_IDLE = loadImage(PATH + "Enemy/1/enemy3_idle.png");
    ENEMY3_WALK1 = loadImage(PATH + "Enemy/1/enemy3_walk1.png");
    ENEMY3_WALK2 = loadImage(PATH + "Enemy/1/enemy3_walk2.png");
    ENEMY3_HURT = loadImage(PATH + "Enemy/1/enemy3_hurt.png");

    ENEMY_SPRITES = [[ENEMY0_IDLE,ENEMY0_WALK1,ENEMY0_WALK2,ENEMY0_HURT], [ENEMY1_IDLE,ENEMY1_WALK1,ENEMY1_WALK2,ENEMY1_HURT], [ENEMY2_IDLE,ENEMY2_WALK1,ENEMY2_WALK2,ENEMY2_HURT], [ENEMY3_IDLE,ENEMY3_WALK1,ENEMY3_WALK2,ENEMY3_HURT]];
    ENEMY_C4 = loadImage(PATH + "Enemy/2/c4.png");

    ENEMY0_BULLET = loadImage(PATH + "Enemy/bullet0.png");
    ENEMY1_BULLET = loadImage(PATH + "Enemy/bullet1.png");
    ENEMY2_BULLET = loadImage(PATH + "Enemy/bullet2.png");
    ENEMY3_BULLET = loadImage(PATH + "Enemy/bullet0.png");
    ENEMY_BULLET_SPRITES = [ENEMY0_BULLET, ENEMY1_BULLET, ENEMY2_BULLET, ENEMY3_BULLET];

    BOSS0 = [loadImage(PATH + "Enemy/1/boss1.png"),loadImage(PATH + "Enemy/1/boss2.png"),loadImage(PATH + "Enemy/1/boss3.png"),loadImage(PATH + "Enemy/1/boss4.png"),loadImage(PATH + "Enemy/1/boss5.png"),loadImage(PATH + "Enemy/1/boss6.png")]
    SPAWN_INDICATOR = loadImage(PATH + "Enemy/spawn_indicator.png");
    BOSSBAR = loadImage(PATH + "Enemy/bossbar.png");
    BOSSBAR_BORDER = loadImage(PATH + "Enemy/bossbar_border.png");

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

    CHEST1 = loadImage(PATH + "Items/Chests/chest1.png");
    CHESTS = [CHEST1];

    CHEST1_OPENED = loadImage(PATH + "Items/Chests/chest1_opened.png");
    CHESTS_OPENED = [CHEST1_OPENED];

    SHOP_SPRITE = loadImage(PATH + "Items/shop.png");

    GUN_SPRITES = [loadImage(PATH + "Items/Guns/pistol.png"),loadImage(PATH + "Items/Guns/machine.png"),loadImage(PATH + "Items/Guns/gatling.png"),loadImage(PATH + "Items/Guns/shotgun.png"),loadImage(PATH + "Items/Guns/sniper.png")];

    MENU_BUTTON = loadImage(PATH + "UI/menu_button.png");
    MENU_BUTTON_HOVER = loadImage(PATH + "UI/menu_button_hover.png");
    MENU_BACKGROUND = loadImage(PATH + "Background/menu_background.png");

    SAVE_POINT = loadImage(PATH + "Items/save_point.png");
    
    PATH = "Audio/";
    MUSIC_MENU = loadSound(PATH + 'Music/menu.mp3');
    MUSIC_MENU.setVolume(volume/100);
    MUSIC_OVERWORLD = loadSound(PATH + 'Music/overworld.mp3');
    MUSIC_OVERWORLD.setVolume(volume/100);
    MUSIC_OVERWORLD2 = loadSound(PATH + 'Music/overworld2.mp3');
    MUSIC_OVERWORLD2.setVolume(volume/100);
    MUSIC_BOSS1 = loadSound(PATH + 'Music/boss1.mp3');
    MUSIC_BOSS1.setVolume(volume/100);
    MUSIC_CREDITS = loadSound(PATH + 'Music/credits_final.mp3');
    MUSIC_CREDITS.setVolume(volume/60);

    SFX_DEATH = loadSound(PATH + 'SFX/death.mp3');
    SFX_HIT = loadSound(PATH + 'SFX/hit.mp3');
    SFX_HURT = loadSound(PATH + 'SFX/hurt.mp3');
    SFX_RELOAD = loadSound(PATH + 'SFX/reload.mp3');
    SFX_SHOOT = loadSound(PATH + 'SFX/shoot.mp3');
    SFX_CHEST = loadSound(PATH + 'SFX/chest.mp3');
    SFX_BUY = loadSound(PATH + 'SFX/buy.mp3');
    SFX_FAIL = loadSound(PATH + 'SFX/fail.mp3');
    SFX_COIN = loadSound(PATH + 'SFX/coin.mp3');
    SFX_SWAP = loadSound(PATH + 'SFX/swap.mp3');
    SFX_HEAL = loadSound(PATH + 'SFX/heal.mp3');

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
        if (!playerDead) noCursor();
        tiles();
        item();
        boss();
        enemy();
        player();
        ui();
        fade();
        pause();
    }

    if (state == "credits") credits();

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
            coins = 0;
            currentSave = -1;
            state = "playing";

            MUSIC_MENU.stop();
            MUSIC_OVERWORLD.setVolume(volume/100);
            MUSIC_OVERWORLD.loop();
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
        if (mouseIsPressed && localStorage.getItem("currentSave") >= 0) {
            level = parseInt(localStorage.getItem("level"));
            room = parseInt(localStorage.getItem("room"));
            coins = parseInt(localStorage.getItem("coins"));
            playerGuns[0] = parseInt(localStorage.getItem("playerGuns0"));
            playerGuns[1] = parseInt(localStorage.getItem("playerGuns1"));
            currentSave = parseInt(localStorage.getItem("currentSave"));
            state = "playing";

            MUSIC_MENU.stop();
            if (level == 0) {
                MUSIC_OVERWORLD.setVolume(volume/100);
                MUSIC_OVERWORLD.loop();
            }   
            else {
                MUSIC_OVERWORLD2.setVolume(volume/100);
                MUSIC_OVERWORLD2.loop();
            }
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
    text('Programming - Edmond', 512, 480);
    text('Music - Edmond', 512, 500);
    text('Sprites - Isaac, mi_gusta (Zach)', 512, 520);
    text('Playtesting - Aaden, Isaac, Jovan, Leon, Chris, Addison', 512, 540);

    if (mouseIsPressed && mouseX >= 512 - 170 && mouseX <= 512 + 170 && mouseY >= 386 - 20 && mouseY <= 386 + 20) volumePressed = true;
    if (!mouseIsPressed) volumePressed = false;
    if (volumePressed) {
        volumeX = (mouseX - 512);
        if (volumeX < -150) volumeX = -150;
        if (volumeX > 150) volumeX = 150;
        localStorage.setItem("volumeX", volumeX);
    }
    volume = Math.round((volumeX/3) + 50);
    MUSIC_MENU.setVolume(volume/100);
    drawImage(VOLUME_SLIDER, 512, 386);
    drawImageSmooth(VOLUME_KNOB, volumeX + 512, 386);
    textSize(32);
    textAlign(LEFT, CENTER);
    text(volume + "%", 700, 384);

    // if (keyIsDown(46)) { // TEMPORARY DEBUG DELETE DATA
    //     level = 0;
    //     room = 0;
    //     coins = 0;
    //     playerGuns = [0, -1];
    //     currentSave = -1;
    //     saveGame();
    // }
    // textSize(12);
    // fill(0, 0, 0);
    // text("press Delete to delete data (temporary debug)", 710, 556);

    drawImage(BORDER, 512, 288);
}

function credits() {
    cursor();
    MUSIC_OVERWORLD.stop();
    MUSIC_OVERWORLD2.stop();
    MUSIC_BOSS1.stop();

    drawImage(MENU_BACKGROUND, 512, 288);
    textAlign(CENTER, CENTER);
    textFont(FONT_SANS_BOLD);
    stroke(0, 90, 0);
    strokeWeight(4);
    fill(0, 180, 0);
    textSize(60);
    text('Thanks for playing!', 512, 260);

    textFont(FONT_SANS);
    strokeWeight(0);
    fill(60);
    textSize(24);
    text('Special thanks to 5iveZer0 for singing this song', 512, 540);

    drawImage(BORDER, 512, 288);
}

function mouseClicked() {
    if (state == "click") {
        state = "menu";
        MUSIC_MENU.setVolume(volume/100);
        MUSIC_MENU.loop();
    }
    // console.log(mouseX, mouseY);
}

function saveGame(i) {
    SFX_HEAL.setVolume(volume/100);
    SFX_HEAL.play();
    playerHealth = 6;
    localStorage.setItem("level", level);
    localStorage.setItem("room", room);
    localStorage.setItem("coins", coins);
    localStorage.setItem("playerGuns0", playerGuns[0]);
    localStorage.setItem("playerGuns1", playerGuns[1]);
    currentSave = i;
    localStorage.setItem("currentSave", currentSave);
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
    uiGuns();

    if (!paused && !playerDead) drawCrosshair();

    // Death Text
    if (playerDead) {
        cursor();
        background(0, 0, 0, 128);
        textAlign(CENTER, CENTER);
        textFont(FONT_SANS_BOLD);
        stroke(60, 0, 0);
        strokeWeight(4);
        fill(180, 0, 0);
        textSize(60);
        text('You Died', 512, 260);

        stroke(60, 0, 0);
        strokeWeight(4);
        fill(180, 50, 50);
        textSize(24);
        text('- Reload page to retry -', 512, 340);
    }
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
    drawImage(NUMBERS[Math.floor(playerAmmo[playerGuns[playerGun]]/10)], 14, 548);
    drawImage(NUMBERS[playerAmmo[playerGuns[playerGun]] % 10], 32, 548);
    drawImage(NUMBERS[10], 50, 548);
    drawImage(NUMBERS[Math.floor(gunAmmo[playerGuns[playerGun]]/10)], 66, 548);
    drawImage(NUMBERS[gunAmmo[playerGuns[playerGun]] % 10], 84, 548);
    if (playerAmmo[playerGuns[playerGun]] > 0) drawImage(AMMO_SYMBOL, 118, 548);
    else {
        drawImage(AMMO_SYMBOL_EMPTY, 118, 548);
        drawImage(AMMO_SYMBOL_EMPTY, playerX, playerY - 48);
    }

    if (playerReload[playerGuns[playerGun]] < gunReload[playerGuns[playerGun]]) {
        drawImageSmooth(RELOAD_BOX, 70 - (playerReload[playerGuns[playerGun]] * (140/gunReload[playerGuns[playerGun]])), 548);
    }
}

function uiCoins() {
    drawImage(COIN_BOX, 954, 28);
    drawImage(COIN_LOGO, 992, 28);

    drawImage(NUMBERS[Math.floor(coins/100)], 908, 28);
    drawImage(NUMBERS[Math.floor(coins/10)%10], 926, 28);
    drawImage(NUMBERS[coins%10], 944, 28);
}

function uiGuns() {
    if (playerGuns[1] == -1) {
        drawImage(GUN_BOX1, 972, 548);
        drawImage(GUN_SPRITES[playerGuns[0]], 972, 548);
    }
    else {
        if (playerGun == 0) {
            drawImage(GUN_BOX2, 972, 548);
            drawImage(GUN_BOX1, 968, 544);
            drawImage(GUN_SPRITES[playerGuns[0]], 968, 544);
        }
        else {
            drawImage(GUN_BOX1, 972, 548);
            drawImage(GUN_BOX2, 968, 544);
            drawImage(GUN_SPRITES[playerGuns[1]], 968, 544);
        }
        drawImage(SWAP_GUN, 884, 556);
        drawImage(SHIFT_INDICATOR, 884, 528);
    }
}

function fade() {
    if (allowChangeRoomFade) changeRoomFade();
}

function item() {
    for (var i = 0; i < coinsDropped.length; i++) {
        var coin = coinsDropped[i];
        coin.update();

        if (coin.level == level && coin.room == room && Math.abs(coin.x - playerX) < 28 && Math.abs(coin.y - playerY) < 36) {
            coin.collect();
            coinsDropped.splice(i,1);
            i--;
        }
    }

    for (var i = 0; i < saveRooms.length; i++) {
        if (saveRooms[i][0] == level && saveRooms[i][1] == room) { 
            drawImage(SAVE_POINT, 512, 288);
            if (currentSave == i) {
                textFont(FONT_SANS);
                textAlign(CENTER, CENTER);
                strokeWeight(0);
                fill(0, 255, 0);
                textSize(20);
                text('Progress saved', 512, 340);
            }
            else {
                textFont(FONT_SANS);
                textAlign(CENTER, CENTER);
                strokeWeight(0);
                fill(255, 160, 0);
                textSize(20);
                text('Heal & Save game', 512, 240);
            }
        }
    }

    chest();
    guns();
    shop();

}

function chest() {
    for (var i = 0; i < chestRooms.length; i++) {
        if (chestRooms[i][0] == level && chestRooms[i][1] == room) {

            if (!chestRooms[i][3]) drawImage(CHESTS[chestRooms[i][2]], 512, 288);
            else drawImage(CHESTS_OPENED[chestRooms[i][2]], 512, 288);

            if (Math.abs(512 - playerX) < 80 && Math.abs(288 - playerY) < 80 && !chestRooms[i][3]) {
                drawImage(SPACE_INDICATOR, playerX, playerY - 40);

                if (keyIsDown(32)) {
                    chestRooms[i][3] = true;
                    var gun = Math.floor(Math.random()*(GUN_SPRITES.length-1))+1;

                    if (playerHealth >= 6) gunsDropped.push([level, room, 512, 200, gun]);
                    else heartsDropped.push([level, room, 512, 200]);

                    SFX_CHEST.setVolume(volume/100);
                    SFX_CHEST.play();
                }
            }
        }
    }

    for (var i = 0; i < heartsDropped.length; i++) {
        if (heartsDropped[i][0] == level && heartsDropped[i][1] == room) {
            drawImage(FULL_HEART, heartsDropped[i][2], heartsDropped[i][3]);

            if (playerHealth < 6 && Math.abs(playerX - heartsDropped[i][2]) < 32 && Math.abs(playerY - heartsDropped[i][3]) < 32) {
                playerHealth += 2;
                heartsDropped.splice(i, 1);
                i--;

                SFX_HEAL.setVolume(volume/100);
                SFX_HEAL.play();
            }
        }
    }
}

var gunsDroppedTemp = false;
function guns() {
    for (var i = 0; i < gunsDropped.length; i++) {
        if (gunsDropped[i][0] == level && gunsDropped[i][1] == room) {

            drawImage(GUN_SPRITES[gunsDropped[i][4]], gunsDropped[i][2], gunsDropped[i][3]);

            if (Math.abs(gunsDropped[i][2] - playerX) < 32 && Math.abs(gunsDropped[i][3] - playerY) < 32) {
                drawImage(SPACE_INDICATOR, playerX, playerY - 40);

                textFont(FONT_SANS);
                textAlign(CENTER, CENTER);
                strokeWeight(0);
                fill(0);
                textSize(16);
                text(gunNames[gunsDropped[i][4]], playerX, playerY - 64);

                if (keyIsDown(32) && gunsDroppedTemp) { // pickup gun on ground
                    if (playerGuns[0] != gunsDropped[i][4] && playerGuns[1] != gunsDropped[i][4]) {
                        if (playerGuns[1] == -1) {
                            playerGuns[1] = gunsDropped[i][4];
                            gunSwitchReal();
                        }
                        else {
                            gunsDropped.push([level, room, playerX, playerY, playerGuns[playerGun]]);
                            playerGuns[playerGun] = gunsDropped[i][4];
                        }
                        SFX_RELOAD.setVolume(volume/100);
                        SFX_RELOAD.play();
                        gunsDropped.splice(i, 1);
                        i--;
                    }
                    else {
                        SFX_FAIL.setVolume(volume/100);
                        SFX_FAIL.play();
                    }
                    gunsDroppedTemp = false;

                }
                if (!keyIsDown(32)) {
                    gunsDroppedTemp = true;
                }
            }
        }
    }
}

var shopBuyTemp = false;
function shop() {
    for (var i = 0; i < shopRooms.length; i++) {
        if (shopRooms[i][0] == level && shopRooms[i][1] == room) {
            drawImage(SHOP_SPRITE, 512, 288);
            var itemX = [442, 582];

            // Draw shop items
            if (shopRooms[i][4] != -1) drawImage(GUN_SPRITES[shopRooms[i][4]], itemX[0], 320);
            if (shopRooms[i][5] != -1) drawImage(GUN_SPRITES[shopRooms[i][5]], itemX[1], 320);
            // if (shopRooms[i][6] != -1) drawImage(GUN_SPRITES[shopRooms[i][6]], itemX[2], 320);

            
            if (playerY < 376 + 8 && playerY > 376 - 16) { // Check player Y position
                for (var j = 0; j < 2; j++) { // for each shop item
                    if (shopRooms[i][j+4] != -1 && playerX > itemX[j] - 40 && playerX < itemX[j] + 40) {
                        drawImage(SPACE_INDICATOR, playerX, playerY + 40);

                        if (Math.floor(shopPrices[shopRooms[i][j+4]] * shopRooms[i][2]) < 10) drawImage(NUMBERS[Math.floor(shopPrices[shopRooms[i][j+4]] * shopRooms[i][2]) % 10], itemX[j], 260);
                        else {
                            drawImage(NUMBERS[Math.floor(Math.floor(shopPrices[shopRooms[i][j+4]] * shopRooms[i][2]) / 10)], itemX[j]-9, 260);
                            drawImage(NUMBERS[Math.floor(shopPrices[shopRooms[i][j+4]] * shopRooms[i][2]) % 10], itemX[j]+9, 260);
                        }

                        textFont(FONT_SANS);
                        textAlign(CENTER, CENTER);
                        strokeWeight(0);
                        fill(0);
                        textSize(16);
                        text(gunNames[shopRooms[i][j+4]], itemX[j], 220);

                        if (keyIsDown(32) && shopBuyTemp) { // Space pressed (buy item)
                            if (coins >= Math.floor(shopPrices[shopRooms[i][j+4]] * shopRooms[i][2]) && playerGuns[0] != shopRooms[i][j+4] && playerGuns[1] != shopRooms[i][j+4]) {
                                if (playerGuns[1] == -1) {
                                    playerGuns[1] = shopRooms[i][j+4];
                                    gunSwitchReal();
                                } else {
                                    gunsDropped.push([level, room, playerX, playerY, playerGuns[playerGun]]);
                                    playerGuns[playerGun] = shopRooms[i][j+4];
                                }
                                coins -= Math.floor(shopPrices[shopRooms[i][j+4]] * shopRooms[i][2]);
                                shopRooms[i][j+4] = -1;
                                SFX_BUY.setVolume(volume/100);
                                SFX_BUY.play();
                            }
                            else {
                                SFX_FAIL.setVolume(volume/100);
                                SFX_FAIL.play();
                            }
                            shopBuyTemp = false;
                        }
                        if (!keyIsDown(32)) shopBuyTemp = true;
                    }
                }
            }
        }
    }
}

function player() {
    volume = Math.round((volumeX/3) + 50); //temp
    if (!playerDead) {
        if (!inFade) {
            if (!paused) {
                playerMovement();
                reload();
                playerHurt();
                playerMoveEdge();
                playerSave();
                gunSwitch();
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
                    if (tempY < (64+18) || tempY > CANVAS_HEIGHT - (64+20)) okY = false;
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

    if (level_clear[level][room]) {
        playerSpeed = 7 * PLAYER_SLOWDOWN[playerGuns[playerGun]];
        playerWalkDelay = 4;
    }
    else {
        playerSpeed = 4 * PLAYER_SLOWDOWN[playerGuns[playerGun]];
        playerWalkDelay = 6;
    }

    // Walk Animation Help
    if (dx == 0 && dy == 0) playerMoving = false;
    else {
        playerMoving = true;
        if (dx > 0) playerDir = 3; // Right
        else if (dx < 0) playerDir = 2; // Left
        else if (dy > 0) playerDir = 1; // Down
        else if (dy < 0) playerDir = 0; // Up
    }

}

function playerShooting() {
    if (startupCooldown > 0) startupCooldown--;
    if (!paused) {
        if (playerFiringCooldown < playerGunCooldowns[playerGuns[playerGun]]) playerFiringCooldown++;
        if (mouseIsPressed && (playerInRoom || level_clear[level][room]) && startupCooldown == 0) {
            if (playerAmmo[playerGuns[playerGun]] > 0 && playerFiringCooldown >= playerGunCooldowns[playerGuns[playerGun]] && playerReload[playerGuns[playerGun]] >= gunReload[playerGuns[playerGun]]) {
                var bullet = new PlayerBullet();
                playerBullets.push(bullet);
                playerFiringCooldown = 0;
                playerAmmo[playerGuns[playerGun]] -= 1;

                if (playerGuns[playerGun] == 3) { // Shotgun
                    for (var i = 0; i < 6; i++) {
                        var bullet = new PlayerBullet();
                        playerBullets.push(bullet);
                    }
                }

                SFX_SHOOT.setVolume(volume/100);
                SFX_SHOOT.play();
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
                    if (Math.abs(bullet.x - (x*32+16)) < 20 && Math.abs(bullet.y - (y*32+16)) < 20) {
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
    if (playerReload[playerGuns[playerGun]] < gunReload[playerGuns[playerGun]]) playerReload[playerGuns[playerGun]]++;
    if (playerReload[playerGuns[playerGun]] == gunReload[playerGuns[playerGun]] - 1) playerAmmo[playerGuns[playerGun]] = gunAmmo[playerGuns[playerGun]];

    if (keyIsDown(82)) { // R is pressed
        if (playerReload[playerGuns[playerGun]] >= gunReload[playerGuns[playerGun]] && playerAmmo[playerGuns[playerGun]] < gunAmmo[playerGuns[playerGun]]) {
            playerReload[playerGuns[playerGun]] = 0;
            SFX_RELOAD.setVolume(volume/100);
            SFX_RELOAD.play();
        }
    }
}

var gunSwitchTemp = true;
function gunSwitch() {
    if (keyIsDown(16) && playerGuns[1] != -1 && gunSwitchTemp) gunSwitchReal();
    if (!keyIsDown(16)) gunSwitchTemp = true;
}

function gunSwitchReal() {
    playerReload[playerGuns[playerGun]] = gunReload[playerGuns[playerGun]];
    playerGun = 1 - playerGun;
    gunSwitchTemp = false;
    SFX_SWAP.setVolume(volume/100);
    SFX_SWAP.play();
}

function playerHurt() {
    if (playerHurtTime < PLAYER_HURT_TIME_BASE) playerHurtTime++; // During hurt
    for (var i = 0; i < enemyBullets.length; i++) { // Check bullet collision
        var bullet = enemyBullets[i];
        if (Math.abs(bullet.x - playerX) <= 20 && Math.abs(bullet.y - playerY) <= 28) {
            if (playerHurtTime >= PLAYER_HURT_TIME_BASE) {
                playerHealth -= 2;
                playerHurtTime = 0;
                if (playerHealth <= 0) playerDie();
                else {
                    SFX_HURT.setVolume(volume/100);
                    SFX_HURT.play();
                }
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
                    playerHealth -= 2;
                    playerHurtTime = 0;
                    if (playerHealth <= 0) playerDie();
                    else {
                        SFX_HURT.setVolume(volume/100);
                        SFX_HURT.play();
                    }
                    break;
                }
            }
        }
    }

    if (level == 0 && room == 20) { // Collide with boss
        if (Math.abs(playerX - bossX) < 56 && Math.abs(playerY - bossY) < 70) {
            if (playerHurtTime >= PLAYER_HURT_TIME_BASE) {
                playerHealth -= 2;
                playerHurtTime = 0;
                if (playerHealth <= 0) playerDie();
                else {
                    SFX_HURT.setVolume(volume/100);
                    SFX_HURT.play();
                }
            }
        }
    }
}

function playerSave() {
    for (var i = 0; i < saveRooms.length; i++) {
        if (saveRooms[i][0] == level && saveRooms[i][1] == room) {
            if (currentSave == i) { // Save Barrier
                if (saveRooms[i][2] == "up") {
                    drawImage(BARRIER_HORIZONTAL, 512, 32);
                    if (playerY < 86) playerY = 86;
                }
                if (saveRooms[i][2] == "down") { 
                    drawImage(BARRIER_HORIZONTAL, 512, 544);
                    if (playerY > 576-86) playerY = 576 - 86;
                }
                if (saveRooms[i][2] == "left") {
                    drawImage(BARRIER_VERTICAL, 32, 288);
                    if (playerX < 80) playerX = 80;
                }
                if (saveRooms[i][2] == "right") {
                    drawImage(BARRIER_VERTICAL, 992, 288);
                    if (playerX > 1024 - 80) playerX = 1024 - 80;
                }

            }

            if (currentSave != i && playerX >= 512-60 && playerX <= 512+60 && playerY >= 288-60 && playerY < 288+60) {
                drawImage(SPACE_INDICATOR, playerX, playerY+40);

                if (keyIsDown(32)) saveGame(i);
            }
        }
    }
}

function playerDie() {
    playerDead = true;
    MUSIC_OVERWORLD.stop();
    MUSIC_OVERWORLD2.stop();
    MUSIC_BOSS1.stop();
    SFX_DEATH.setVolume(volume/100);
    SFX_DEATH.play();
}

function playerDraw() {

    if (playerHurtTime >= PLAYER_HURT_TIME_BASE) {
        if (playerMoving) {
            drawImageSmooth(PLAYER_SPRITES[playerDir][playerWalkAnimation], playerX, playerY);
            if (!paused) playerWalkTimer++;
        }
        else {
            drawImage(PLAYER_SPRITES[1][3], playerX, playerY);
            playerWalkAnimation = 3;
        }
    
        if (playerWalkTimer >= playerWalkDelay) {
            playerWalkTimer = 0;
            playerWalkAnimation++;
            if (playerWalkAnimation >= 8) playerWalkAnimation = 0;
        }
    }
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

        for (var i = 0; i < shopRooms.length; i++) { // Assign items to shop
            if (!shopRooms[i][3] && shopRooms[i][0] == level && shopRooms[i][1] == room) {
                var left = Math.floor(Math.random()*(GUN_SPRITES.length-1))+1;
                shopRooms[i][4] = left;

                var right = Math.floor(Math.random()*(GUN_SPRITES.length-1))+1;
                while (right == left) right = Math.floor(Math.random()*(GUN_SPRITES.length-1))+1;
                shopRooms[i][5] = right;

                shopRooms[i][3] = true;
            }
        }

        if (level == 0 && room == 20 && !MUSIC_BOSS1.isPlaying()) {
            inBoss = true;
            MUSIC_OVERWORLD.stop();
            MUSIC_BOSS1.setVolume(volume/100);
            MUSIC_BOSS1.loop();
        }
    
    }
    if (fadeOpacity < 0) {
        fadeOut = false;
        inFade = false;
        allowChangeRoomFade = false;
        fadeOpacity = 0;
    }
}

function boss() {
    if (level == 0 && room == 20 && bossHealth > 0) {

        drawImage(BOSS0[0], bossX, bossY);

        imageMode(CORNER);
        image(BOSSBAR, 224, 16, bossHealth * 6, BOSSBAR.height*2);
        image(BOSSBAR_BORDER, 220, 16, BOSSBAR_BORDER.width*2, BOSSBAR.height*2);
        imageMode(CENTER);

        if (!paused && !playerDead && playerInRoom) {
            for (var i = 0; i < playerBullets.length; i++) { // Boss takes damage
                var bullet = playerBullets[i];
                if (Math.abs(bullet.x - bossX) < 56 && Math.abs(bullet.y - bossY) < 70) {
                    bossHealth -= gunDamage[playerGuns[playerGun]];
                    playerBullets.splice(i,1);
                    i--;
                }
            }
    
            if (bossAttack == 1) { // Shoot player attack
                if (bossTimer % 5 == 0 && (bossTimer > 20 && bossTimer < 70 || (bossTimer > 110 && bossTimer < 180))) {
                    var bullet = new EnemyBullet(bossX, bossY, 0, true);
                    enemyBullets.push(bullet);
                }
            }

            if (bossAttack == 2) { // Summon enemies

                if (bossTimer > 0 && bossTimer < 120 && Math.ceil(bossTimer/5) % 2 == 0) { // Enemy spawn indicator
                    if (bossPattern == 1) {
                        drawImage(SPAWN_INDICATOR, 124, 400);
                        drawImage(SPAWN_INDICATOR, 124, 200);
                        drawImage(SPAWN_INDICATOR, 900, 400);
                    }
                    if (bossPattern == 2) {
                        drawImage(SPAWN_INDICATOR, 512, 240);
                        drawImage(SPAWN_INDICATOR, 900, 120);
                        drawImage(SPAWN_INDICATOR, 124, 120);
                    }
                    if (bossPattern == 3) {
                        drawImage(SPAWN_INDICATOR, 900, 120);
                        drawImage(SPAWN_INDICATOR, 124, 120);
                    }
                    if (bossPattern == 4) {
                        drawImage(SPAWN_INDICATOR, 900, 120);
                        drawImage(SPAWN_INDICATOR, 124, 120);
                        drawImage(SPAWN_INDICATOR, 900, 456);
                        drawImage(SPAWN_INDICATOR, 124, 456);
                    }
                }

                if (bossTimer == 120) { // Enemy spawns
                    // (x, y, type, level, room)
                    if (bossPattern == 1) { 
                        enemies.push(new Enemy(124, 400, 0, 0, 20)); 
                        enemies.push(new Enemy(124, 200, 0, 0, 20)); 
                        enemies.push(new Enemy(900, 400, 0, 0, 20));
                    }
                    if (bossPattern == 2) { 
                        enemies.push(new Enemy(512, 240, 3, 0, 20)); 
                        enemies.push(new Enemy(900, 120, 1, 0, 20)); 
                        enemies.push(new Enemy(124, 120, 0, 0, 20)); 
                    }
                    if (bossPattern == 3) { 
                        enemies.push(new Enemy(900, 120, 1, 0, 20)); 
                        enemies.push(new Enemy(124, 120, 2, 0, 20)); 
                    }
                    if (bossPattern == 4) { 
                        enemies.push(new Enemy(900, 120, 1, 0, 20)); 
                        enemies.push(new Enemy(124, 120, 0, 0, 20)); 
                        enemies.push(new Enemy(900, 456, 0, 0, 20)); 
                        enemies.push(new Enemy(124, 456, 1, 0, 20)); 
                    }
                }
            }
    
            bossTimer++;
            if (bossTimer >= 300) {
                var temp = bossAttack;
                bossAttack = Math.floor(Math.random()*2) + 1;
                while (bossAttack == temp) bossAttack = Math.floor(Math.random()*2) + 1;
                bossTimer = 0;
                bossPattern = Math.floor(Math.random()*4) + 1;
            }
        }
    }
    if (bossHealth <= 0) {
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].level == 0 && enemies[i].room == 20) {
                enemies.splice(i, 1);
                i--;
            }
        }
        enemyBullets = [];
        MUSIC_CREDITS.setVolume(volume/60);
        MUSIC_CREDITS.play();
        state = "credits";
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
                    if (Math.abs(bullet.x - (x*32+16)) < 20 && Math.abs(bullet.y - (y*32+16)) < 20) {
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

        // if (keyIsDown(71)) { // Debug kill enemy
        //     if (enemy.level == level && enemy.room == room && !enemy.dead) enemy.die();
        // }
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

    // Level cards
    if (level == 0 && room == 0) {
        textSize(32);
        textAlign(CENTER);
        textFont(FONT_SANS);
        fill(255);
        strokeWeight(5);
        stroke(0);
        text("Level 1: Frail Forest", 512, 464);
    }
    if (level == 1 && room == 0) {
        textSize(32);
        textAlign(CENTER);
        textFont(FONT_SANS);
        fill(255);
        strokeWeight(5);
        stroke(0);
        text("Level 2: Bomb Garden", 512, 464);
    }
    
}

function pause() {
    if (keyIsDown(27) && !pauseTemp && !inFade && !playerDead) { // Esc pressed
        paused = !paused;
        pauseTemp = true;
        if (paused) {
            MUSIC_OVERWORLD.pause();
            MUSIC_OVERWORLD2.pause();
            MUSIC_BOSS1.pause();
        }
        else {
            if (inBoss) MUSIC_BOSS1.play();
            else {
                if (level == 0) MUSIC_OVERWORLD.play();
                if (level == 1) MUSIC_OVERWORLD2.play();
            }
        }
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
        if (!playerDead) noCursor();
    }
}

class PlayerBullet {
    constructor() {
        this.x = playerX;
        this.y = playerY;
        this.type = playerGuns[playerGun];

        var deltaX = mouseX - this.x;
        var deltaY = mouseY - this.y;
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / PLAYER_BULLET_SPEED[this.type];
        
        this.dx = Math.round(deltaX / divider * 10)/10;
        this.dy = Math.round(deltaY / divider * 10)/10;

        if (this.type == 3) { // Shotgun
            this.dx += Math.random()*3 - 1.5;
            this.dy += Math.random()*3 - 1.5;
        }
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
        drawImageSmooth(PLAYER_BULLETS[this.type], this.x, this.y);
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
        this.pursuit = false;
        this.pursuitTimer = 0;
        this.pursuitTemp = false;
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
                    if (this.seePlayer || this.pursuit) this.move();
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

        if (this.pursuit) this.pursuitTimer++;
        if (this.pursuitTimer > 120) this.pursuit = false;

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
            this.firingSlowdown = 0.8;
            this.animation = 3;
        }
        else this.firingSlowdown = 1;

        for (var i = 0; i < playerBullets.length; i++) { // Check bullet collision
            var bullet = playerBullets[i];
            if (Math.abs(bullet.x - this.x) <= 20 && Math.abs(bullet.y - this.y) <= 24) {
                this.health -= gunDamage[bullet.type];
                this.hurtTime = 0;
                playerBullets.splice(i, 1);
                SFX_HIT.setVolume(volume/100);
                SFX_HIT.play();
                break;
            }
        }

        if (this.health <= 0) this.die();
    }

    shoot() {
        if (this.type != 1) {
            if (this.firingCooldown * this.firingSlowdown < ENEMY_FIRING_COOLDOWN_BASE[this.type]) this.firingCooldown++;
            if (this.firingCooldown * this.firingSlowdown >= ENEMY_FIRING_COOLDOWN_BASE[this.type] && this.seePlayer) {
                var bullet = new EnemyBullet(this.x, this.y, this.type);
                enemyBullets.push(bullet);

                if (this.type == 3) { // Shotgun Enemy
                    for (var i = 0; i < 6; i++) {
                        var bullet = new EnemyBullet(this.x, this.y, this.type);
                        enemyBullets.push(bullet);
                    }
                }

                this.firingCooldown = Math.random() * 10 - 5;
            }
        }
    }

    die() {
        this.dead = true;
        if (!(level == 0 && room == 20)) coinsDropped.push(new Coin(this.x, this.y, ENEMY_COIN[this.type], level, room));
    }

    vision() {
        this.seePlayer = true;
        var deltaX = playerX - this.x;
        var deltaY = playerY - this.y;
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / 3;
        var tempX = this.x;
        var tempY = this.y
        
        while (Math.abs(tempX - playerX) > 40 || Math.abs(tempY - playerY) > 40) {
            for (var y = 0; y < LEVELS[level][room].length; y++) {
                for (var x = 0; x < LEVELS[level][room][y].length; x++) {
                    if (LEVELS[level][room][y][x].length != 0) {
                        if (Math.abs((tempX) - (x*32+16)) < 18 && Math.abs(tempY - (y*32+16)) < 18) {
                            this.seePlayer = false;

                            if (this.pursuitTemp) {
                                this.pursuit = true;
                                this.pursuitTimer = 0;
                            }
                            this.pursuitTemp = false;
                            break;
                        }
                    }
                }
            }
            tempX += deltaX / divider;
            tempY += deltaY / divider;
        }

        if (this.seePlayer) {
            this.pursuitTemp = true;
            this.pursuit = false;
            this.pursuitTimer = 0;
        }
    }

    draw() {
        drawImageSmooth(ENEMY_SPRITES[this.type][this.animation], this.x, this.y);
    }
}

class EnemyBullet {
    constructor(x, y, type, boss=false) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.boss = boss;

        var deltaX = playerX - this.x;
        var deltaY = playerY - this.y;
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        var divider = distance / ENEMY_BULLET_SPEED[this.type];
        if (this.boss) divider = distance / 7;
        
        this.dx = Math.round(deltaX / divider * 10)/10;
        this.dy = Math.round(deltaY / divider * 10)/10;

        if (this.type == 3) { // Shotgun
            this.dx += Math.random()*3 - 1.5;
            this.dy += Math.random()*3 - 1.5;
        }
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
        SFX_COIN.setVolume(volume/100);
        SFX_COIN.play();
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
    // textSize(32);
    // if (keyIsDown(72)) coins = 900; // Debug 900 coins
    // if (keyIsDown(67)) playerSpeed = 16; // Debug fast
}

function enemySpawn() { // (x, y, type, level, room)
    // 1-1
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

    enemies.push(new Enemy(412, 338, 0, 0, 6));
    enemies.push(new Enemy(600, 338, 0, 0, 6));
    enemies.push(new Enemy(412, 168, 0, 0, 6));
    enemies.push(new Enemy(600, 168, 0, 0, 6));
    enemies.push(new Enemy(900, 100, 1, 0, 6));
    enemies.push(new Enemy(124, 100, 1, 0, 6));

    enemies.push(new Enemy(800, 100, 1, 0, 7));
    enemies.push(new Enemy(900, 100, 1, 0, 7));
    enemies.push(new Enemy(800, 400, 1, 0, 7));
    enemies.push(new Enemy(900, 400, 1, 0, 7));
    enemies.push(new Enemy(100, 100, 0, 0, 7));

    enemies.push(new Enemy(124, 100, 0, 0, 8));
    enemies.push(new Enemy(900, 100, 0, 0, 8));
    enemies.push(new Enemy(512, 200, 2, 0, 8));

    // 1-2
    enemies.push(new Enemy(462, 120, 2, 0, 12));
    enemies.push(new Enemy(562, 120, 2, 0, 12));

    enemies.push(new Enemy(100, 340, 2, 0, 13));
    enemies.push(new Enemy(740, 288, 1, 0, 13));
    enemies.push(new Enemy(120, 100, 0, 0, 13));
    enemies.push(new Enemy(760, 100, 0, 0, 13));

    enemies.push(new Enemy(500, 288, 3, 0, 14));

    enemies.push(new Enemy(540, 288, 3, 0, 15));
    enemies.push(new Enemy(900, 176, 0, 0, 15));
    enemies.push(new Enemy(900, 400, 2, 0, 15));

    enemies.push(new Enemy(124, 340, 2, 0, 16));
    enemies.push(new Enemy(900, 460, 2, 0, 16));
    enemies.push(new Enemy(512, 120, 1, 0, 16));

    enemies.push(new Enemy(740, 240, 3, 0, 18));
    enemies.push(new Enemy(140, 120, 3, 0, 18));
    enemies.push(new Enemy(512, 120, 0, 0, 18));

    // Boss 0
    enemies.push(new Enemy(-690, -690, 1, 0, 20));

}

var level1_clear = [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
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

const LEVEL1_6 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","",13,15,"","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","",25,27,"","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","",25,27,"","","","","","","","","","","","","",37,38],
    ["","","","","","","","","","","",13,14,14,14,45,44,14,14,14,15,"","","","","","","","","","",""],
    ["","","","","","","","","","","",37,38,38,38,33,32,38,38,38,39,"","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","",25,27,"","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","",25,27,"","","","","","","","","","","","","","",""],
    [14,15,"","","","","","","","","","","","","",37,39,"","","","","","","","","","","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_7 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,33,26,26,32,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","",25,26,26,27,"","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","",37,38,38,39,"","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",37,38],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,15,"","","","","","","","",13,14,14,14,14,14,14,14,14,14,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,44,15,"","","","","","",13,45,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,44,15,"","","","",13,45,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_8 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",37,38],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_9 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
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
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_10 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",37,38],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_11 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","",00,00,"","","","","","","","",00,00,"","","","","","","","",25,26],
    ["","","","","","","","","","",00,00,"","","","","","","","",00,00,"","","","","","","","",25,26],
    ["","","","","","","","","","",00,00,00,00,00,00,00,00,00,00,00,00,"","","","","","","","",25,26],
    ["","","","","","","","","","",00,00,00,00,00,00,00,00,00,00,00,00,"","","","","","","","",25,26],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_12 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","",01,02,02,05,"","","","","","","","","","",04,02,02,03,"","","","","",25,26],
    [26,27,"","","","","","","","",24,"","","","","","","","","","",24,"","","","","","","","",25,26],
    [26,27,"","","","","","","","",24,"","","","","","","","","","",24,"","","","","","","","",25,26],
    [26,27,"","","","","","","","",36,"","","","","","","","","","",36,"","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_13 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,42,02,02,02,03,"","","","","","","","","","","","","","","",01,02,02,02,05,"","","","",37,38],
    ["","","","","","","","","","","","","","","","","","","","","","","","","",24,"","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","",24,"","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","",24,"","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","",24,"","","","","",""],
    [14,15,"","","","","","","","","","","","","","","","","","","",01,02,02,02,17,"","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_14 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","",12,"","","","","","","","","","","","","","","","",12,"","","","","",37,38],
    ["","","","","","","",24,"","","","","","","","","","","","","","","","",24,"","","","","","",""],
    ["","","","","","","",24,"","","","","","","","","","","","","","","","",24,"","","","","","",""],
    ["","","","","","","",24,"","","","","","","","","","","","","","","","",24,"","","","","","",""],
    ["","","","","","","",24,"","","","","","","","","","","","","","","","",24,"","","","","","",""],
    [14,15,"","","","","",36,"","","","","","","","","","","","","","","","",36,"","","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_15 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,33,26,26,26,26,26,26,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","",25,26,26,26,26,26,26,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","",37,38,38,38,38,38,33,26],
    [26,27,"","","","","","",12,"","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","",36,"","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","",12,"","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","",36,"","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","",13,14,14,14,14,14,45,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","",25,26,26,26,26,26,26,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26,26,26,26,26,26,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_16 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","",12,"","","","",12,"","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","",24,"","","","",24,"","","","","","","","","","","",37,38],
    [26,27,"","","","","","","","","","","",36,"","","","",36,"","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",13,14],
    [26,21,02,02,03,"","","","","","","","","","","","","","","","","","","","","","",01,02,02,23,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_17 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    ["","","","","","","","","","",00,00,"","","","","","","","",00,00,"","","","","","","","",25,26],
    ["","","","","","","","","","",00,00,"","","","","","","","",00,00,"","","","","","","","",25,26],
    ["","","","","","","","","","",00,00,00,00,00,00,00,00,00,00,00,00,"","","","","","","","",25,26],
    ["","","","","","","","","","",00,00,00,00,00,00,00,00,00,00,00,00,"","","","","","","","",25,26],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_18 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","",01,02,05,"","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","",24,"","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","",36,"","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_19 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
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
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_20 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
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
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1_21 = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",37,38],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26],
];

const LEVEL1 = [LEVEL1_0,LEVEL1_1,LEVEL1_2,LEVEL1_3,LEVEL1_4,LEVEL1_5,LEVEL1_6,LEVEL1_7,LEVEL1_8,LEVEL1_9,LEVEL1_10,LEVEL1_11,LEVEL1_12,LEVEL1_13,LEVEL1_14,LEVEL1_15,LEVEL1_16,LEVEL1_17,LEVEL1_18,LEVEL1_19,LEVEL1_20,LEVEL1_21];
const LEVELS = [LEVEL1];

const LEVEL1_MAP = [ // [up, down, left, right]
    [1, 0, 0, 0], // Room 0
    [0, 0, 2, 3], // Room 1
    [4, 0, 0, 1], // Room 2 etc.
    [5, 0, 1, 0],
    [6, 2, 0, 0],
    [7, 3, 0, 0],
    [0, 4, 10, 8],
    [0, 5, 8, 11],
    [9, 0, 6, 7],
    [12, 8, 0, 0],
    [0, 0, 0, 6],
    [0, 0, 7, 0],
    [13, 9, 0, 0], // 12
    [0, 12, 21, 14],
    [0, 0, 13, 15],
    [16, 0, 14, 0],
    [18, 15, 0, 17],
    [0, 0, 16, 0],
    [19, 16, 0, 0],
    [20, 18, 0, 0],
    [0, 19, 0, 0], // 20
    [0, 0, 0, 13],
];
const LEVEL_MAP = [LEVEL1_MAP];

const LEVEL_TEMPLATE = [
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
    [26,32,38,38,38,38,38,38,38,38,38,38,38,39,"","","","",37,38,38,38,38,38,38,38,38,38,38,38,33,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [38,39,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",37,38],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    [14,15,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",13,14],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,27,"","","","","","","","","","","","","","","","","","","","","","","","","","","","",25,26],
    [26,44,14,14,14,14,14,14,14,14,14,14,14,15,"","","","",13,14,14,14,14,14,14,14,14,14,14,14,45,26],
    [26,26,26,26,26,26,26,26,26,26,26,26,26,27,"","","","",25,26,26,26,26,26,26,26,26,26,26,26,26,26],
];