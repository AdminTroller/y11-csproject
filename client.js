// Game resolution is 640 x 360 pixels
const MIN_WIDTH = 500; // Minimum window width
const MIN_HEIGHT = 240; // Minimum window height

var canvasWidth; // Updated canvas width to match aspect ratio of 16:9
var canvasHeight; // Updated canvas height to match aspect ratio of 16:9
var scale; // How much the game window is zoomed in/out
var state; // What state the game is in

function setupCanvas() { // Change canvas to the biggest resolution possible with a 16:9 aspect ratio
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    if (canvasWidth/16*9 < canvasHeight) { // Height is too big
        canvasWidth = Math.floor(canvasWidth/16) * 16;
        canvasHeight = canvasWidth/16*9;
    }
    else if (canvasHeight/9*16 < canvasWidth) { // Height is too small
        canvasHeight = Math.floor(canvasHeight/9) * 9;
        canvasWidth = canvasHeight/9*16;
    }
    scale = (canvasWidth / 640).toFixed(5);
    resizeCanvas(canvasWidth, canvasHeight);
    noSmooth(); // Blurry pixel image fix (would've been nice to know earlier)
}

function setup() { // Inital setup
    setupCanvas();
    frameRate(60);
    imageMode(CENTER);
}

function windowResized() { // If the window is resized
    setupCanvas();
}

function preload() { // Load sprites
    const PATH = "Sprites/";
    // CARD_ATTACK = loadImage(PATH + "Cards/attack.png");
}

function draw() { // Loop
    clear();
    if (windowWidth < MIN_WIDTH || windowHeight < MIN_HEIGHT) return; // Don't allow resolutions that are too small
    debug();
}

function drawImage(sprite, x, y) { // Draws an image but easier
    image(sprite, x*scale, y*scale, sprite.width*scale, sprite.height*scale);
}

function debug() {
    background(240, 240, 240)
    textSize(32);
    text(canvasWidth, 0, 30);
    text(canvasHeight, 0, 60);
    text(scale, 0, 90);
}