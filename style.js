
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const SIZE = 600;
const BOX = 20;
const CELLS = SIZE / BOX;

// GAME VARIABLES
let snake = [];
let apple = {};

let direction = "RIGHT";
let nextDirection = "RIGHT";

let score = 0;
let best = Number(localStorage.getItem("snakeBest")) || 0;

let gameState = "menu";
let gameLoop = null;
let tick = 0;

// ELEMENTS
const menu = document.getElementById("menu");
const pauseMenu = document.getElementById("pauseMenu");
const gameOver = document.getElementById("gameOver");
const instructions = document.getElementById("instructions");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const menuBest = document.getElementById("menuBest");

bestText.textContent = best;
menuBest.textContent = best;

// MENU FUNCTIONS
function hideMenus() {
    menu.classList.add("hidden");
    pauseMenu.classList.add("hidden");
    gameOver.classList.add("hidden");
    instructions.classList.add("hidden");
}

function showMenu() {
    clearInterval(gameLoop);

    gameState = "menu";

    hideMenus();
    menu.classList.remove("hidden");

    menuBest.textContent = best;
    draw();
}

// START GAME
function startGame() {
    clearInterval(gameLoop);

    snake = [
        { x: 300, y: 300 },
        { x: 280, y: 300 },
        { x: 260, y: 300 },
        { x: 240, y: 300 }
    ];

    direction = "RIGHT";
    nextDirection = "RIGHT";

    score = 0;
    tick = 0;

    scoreText.textContent = score;

    gameState = "playing";

    hideMenus();

    spawnApple();
    draw();

    gameLoop = setInterval(update, 110);
}

// SPAWN APPLE
function spawnApple() {
    do {
        apple = {
            x: Math.floor(Math.random() * CELLS),
            y: Math.floor(Math.random() * CELLS)
        };
    } while (
        snake.some(part =>
            part.x === apple.x * BOX &&
            part.y === apple.y * BOX
        )
    );
}

// SNAKE DIRECTION
function changeDirection(newDirection) {

    if (gameState !== "playing") return;

    if (newDirection === "UP" && direction !== "DOWN") {
        nextDirection = "UP";
    }

    else if (newDirection === "DOWN" && direction !== "UP") {
        nextDirection = "DOWN";
    }

    else if (newDirection === "LEFT" && direction !== "RIGHT") {
        nextDirection = "LEFT";
    }

    else if (newDirection === "RIGHT" && direction !== "LEFT") {
        nextDirection = "RIGHT";
    }
}

// GAME UPDATE
function update() {

    if (gameState !== "playing") return;

    tick++;

    direction = nextDirection;

    let head = {
        x: snake[0].x,
        y: snake[0].y
    };

    if (direction === "UP") head.y -= BOX;
    if (direction === "DOWN") head.y += BOX;
    if (direction === "LEFT") head.x -= BOX;
    if (direction === "RIGHT") head.x += BOX;

    const eating =
        head.x === apple.x * BOX &&
        head.y === apple.y * BOX;

    // WALL COLLISION
    if (
        head.x < 0 ||
        head.x >= SIZE ||
        head.y < 0 ||
        head.y >= SIZE
    ) {
        endGame();
        return;
    }

    // BODY COLLISION
    const body = eating ? snake : snake.slice(0, -1);

    if (
        body.some(part =>
            part.x === head.x &&
            part.y === head.y
        )
    ) {
        endGame();
        return;
    }

    snake.unshift(head);

    // EAT APPLE
    if (eating) {
        score += 10;

        scoreText.textContent = score;

        if (score > best) {
            best = score;

            localStorage.setItem("snakeBest", best);

            bestText.textContent = best;
            menuBest.textContent = best;
        }

        spawnApple();
    } else {
        snake.pop();
    }

    draw();
}

// REALISTIC BACKGROUND
function drawBackground() {

    ctx.fillStyle = "#07190d";
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Dark green gradient
    const gradient = ctx.createRadialGradient(
        300, 300, 20,
        300, 300, 550
    );

    gradient.addColorStop(0, "#173c1b");
    gradient.addColorStop(1, "#020b05");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Grid
    ctx.strokeStyle = "rgba(120,255,80,0.10)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= SIZE; i += BOX) {

        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(SIZE, i);
        ctx.stroke();
    }
}

// REALISTIC APPLE
function drawApple() {

    const x = apple.x * BOX + BOX / 2;
    const y = apple.y * BOX + BOX / 2;

    ctx.save();

    // Glow
    ctx.shadowColor = "#ff1b1b";
    ctx.shadowBlur = 22;

    // Apple body
    const appleGradient = ctx.createRadialGradient(
        x - 5, y - 7, 2,
        x, y, 14
    );

    appleGradient.addColorStop(0, "#ffaaaa");
    appleGradient.addColorStop(0.3, "#ff3030");
    appleGradient.addColorStop(0.75, "#bd0000");
    appleGradient.addColorStop(1, "#550000");

    ctx.fillStyle = appleGradient;

    ctx.beginPath();
    ctx.ellipse(x, y + 1, 9, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Apple highlight
    ctx.fillStyle = "rgba(255,255,255,0.75)";

    ctx.beginPath();
    ctx.ellipse(x - 4, y - 4, 2, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = "#70401c";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x + 2, y - 14);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = "#65ff36";

    ctx.beginPath();
    ctx.ellipse(x + 5, y - 12, 5, 2.5, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// REALISTIC SNAKE BODY
function drawSnakeBody() {

    for (let i = snake.length - 1; i >= 1; i--) {

        const part = snake[i];

        const x = part.x + BOX / 2;
        const y = part.y + BOX / 2;

        const gradient = ctx.createRadialGradient(
            x - 5, y - 6, 2,
            x, y, 15
        );

        gradient.addColorStop(0, "#c3ff75");
        gradient.addColorStop(0.35, "#42c72c");
        gradient.addColorStop(0.8, "#08751d");
        gradient.addColorStop(1, "#023b12");

        ctx.save();

        ctx.shadowColor = "#00ff44";
        ctx.shadowBlur = 5;

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Scale pattern
        ctx.strokeStyle = "rgba(200,255,150,0.5)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(x, y, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Small scale highlights
        ctx.fillStyle = "rgba(255,255,255,0.25)";

        ctx.beginPath();
        ctx.arc(x - 3, y - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// SNAKE HEAD
function drawSnakeHead() {

    const head = snake[0];

    const x = head.x + BOX / 2;
    const y = head.y + BOX / 2;

    let angle = 0;

    if (direction === "UP") angle = -Math.PI / 2;
    if (direction === "DOWN") angle = Math.PI / 2;
    if (direction === "LEFT") angle = Math.PI;
    if (direction === "RIGHT") angle = 0;

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(angle);

    // Head shadow
    ctx.shadowColor = "#00ff22";
    ctx.shadowBlur = 12;

    // Head gradient
    const headGradient = ctx.createLinearGradient(0, -12, 0, 12);

    headGradient.addColorStop(0, "#b5ff69");
    headGradient.addColorStop(0.4, "#39d42c");
    headGradient.addColorStop(1, "#075b17");

    ctx.fillStyle = headGradient;

    // Snake head shape
    ctx.beginPath();

    ctx.moveTo(12, 0);
    ctx.quadraticCurveTo(10, -13, -5, -11);
    ctx.quadraticCurveTo(-15, -8, -12, 0);
    ctx.quadraticCurveTo(-15, 8, -5, 11);
    ctx.quadraticCurveTo(10, 13, 12, 0);

    ctx.fill();

    ctx.shadowBlur = 0;

    // Eyes
    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.arc(2, -6, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(2, 6, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#050505";

    ctx.beginPath();
    ctx.arc(3, -6, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(3, 6, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Tongue
    if (tick % 5 < 2) {

        ctx.strokeStyle = "#ff4242";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(19, 0);
        ctx.lineTo(22, -3);
        ctx.moveTo(19, 0);
        ctx.lineTo(22, 3);
        ctx.stroke();
    }

    ctx.restore();
}

// DRAW EVERYTHING
function draw() {

    drawBackground();
    drawApple();
    drawSnakeBody();

    if (snake.length > 0) {
        drawSnakeHead();
    }
}

// GAME OVER
function endGame() {

    clearInterval(gameLoop);

    gameState = "over";

    document.getElementById("finalScore").textContent = score;

    gameOver.classList.remove("hidden");
}

// PAUSE
function pauseGame() {

    if (gameState !== "playing") return;

    clearInterval(gameLoop);

    gameState = "paused";

    pauseMenu.classList.remove("hidden");
}

// RESUME
function resumeGame() {

    if (gameState !== "paused") return;

    hideMenus();

    gameState = "playing";

    gameLoop = setInterval(update, 110);
}

// KEYBOARD CONTROLS
document.addEventListener("keydown", function(event) {

    const keys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT"
    };

    if (keys[event.key]) {
        event.preventDefault();
        changeDirection(keys[event.key]);
    }

    if (event.code === "Space") {
        event.preventDefault();

        if (gameState === "playing") {
            pauseGame();
        } else if (gameState === "paused") {
            resumeGame();
        }
    }
});

// MOBILE BUTTONS
document.querySelectorAll("[data-dir]").forEach(button => {

    button.addEventListener("pointerdown", function(event) {

        event.preventDefault();

        changeDirection(button.dataset.dir);
    });
});

// BUTTON EVENTS
document.getElementById("startBtn").onclick = startGame;

document.getElementById("howBtn").onclick = function() {
    hideMenus();
    instructions.classList.remove("hidden");
};

document.getElementById("backBtn").onclick = showMenu;

document.getElementById("pauseBtn").onclick = pauseGame;

document.getElementById("resumeBtn").onclick = resumeGame;

document.getElementById("restartBtn").onclick = startGame;

document.getElementById("pauseRestartBtn").onclick = startGame;

document.getElementById("retryBtn").onclick = startGame;

document.getElementById("menuBtn").onclick = showMenu;

document.getElementById("pauseHomeBtn").onclick = showMenu;

document.getElementById("overHomeBtn").onclick = showMenu;

// INITIALIZE
draw();
showMenu();
