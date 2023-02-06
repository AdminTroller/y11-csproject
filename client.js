const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

function setup() { // Inital setup
    resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    noSmooth();
    frameRate(60);
    imageMode(CORNER);
}

function preload() { // Load sprites
    const PATH = "Sprites/";
    TEMP = loadImage(PATH + "Player/player.png");
    BORDER = loadImage(PATH + "Background/border.png");
}

function draw() { // Loop
    clear();
    if (windowWidth < CANVAS_WIDTH || windowHeight < CANVAS_HEIGHT) return; // Don't allow resolutions that are too small
    debug();
    image(BORDER, 0, 0)
}

function debug() {
    background(240, 240, 240)
    image(TEMP, 1024/2, 576/2);
}