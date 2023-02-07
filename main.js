const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

function setup() { // Inital setup
    resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    noSmooth();
    noCursor();
    frameRate(60);
    imageMode(CORNER);
}

function preload() { // Load sprites
    const PATH = "Sprites/";
    TEMP = loadImage(PATH + "Player/player.png");
    BORDER = loadImage(PATH + "Background/border.png");
    CROSSHAIR = loadImage(PATH + "Player/crosshair.png");
}

function draw() { // Loop
    clear();
    if (windowWidth < CANVAS_WIDTH || windowHeight < CANVAS_HEIGHT) return; // Don't allow resolutions that are too small
    debug();
    drawCrosshair();
    drawImage(BORDER, 0, 0);
}

function drawImage(sprite, x, y) {
    image(sprite, x+x%2, y+y%2, sprite.width*2, sprite.height*2)
}

function drawCrosshair() {
    if (focused) {
        imageMode(CENTER);
        drawImage(CROSSHAIR, mouseX, mouseY);
        imageMode(CORNER);
    }
}

var tempx = 512
var tempy = 288

function debug() {
    background(240, 240, 240)
    drawImage(TEMP, tempx, tempy);

    if (keyIsDown(87)) tempy -= 6; // Up
    if (keyIsDown(83)) tempy += 6; // Down
    if (keyIsDown(65)) tempx -= 6; // Left
    if (keyIsDown(68)) tempx += 6; // Right

    textSize(32);
    text(mouseX, 10, 40)
    text(mouseY, 10, 70)
}