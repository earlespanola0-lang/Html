
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;

let snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 }
];

let apple = {
    x: 100,
    y: 100
};

let direction = "RIGHT";
let score = 0;
let gameOver = false;

function draw() {
    if (gameOver) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 400);

    // Draw apple
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, box, box);

    // Draw snake
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "lime" : "green";
        ctx.fillRect(part.x, part.y, box, box);
    });

    // Move snake
    let head = { ...snake[0] };

    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    // Check apple
    if (head.x === apple.x && head.y === apple.y) {
        score += 10;
        document.getElementById("score").textContent = score;

        apple.x = Math.floor(Math.random() * 20) * box;
        apple.y = Math.floor(Math.random() * 20) * box;
    } else {
        snake.pop();
    }

    // Check collision
    if (
        head.x < 0 || head.x >= 400 ||
        head.y < 0 || head.y >= 400 ||
        snake.some(part => part.x === head.x && part.y === head.y)
    ) {
        gameOver = true;
        alert("Game Over! Score: " + score);
        return;
    }

    snake.unshift(head);
}

document.addEventListener("keydown", event => {
    if (event.key === "ArrowUp" && direction !== "DOWN")
        direction = "UP";

    if (event.key === "ArrowDown" && direction !== "UP")
        direction = "DOWN";

    if (event.key === "ArrowLeft" && direction !== "RIGHT")
        direction = "LEFT";

    if (event.key === "ArrowRight" && direction !== "LEFT")
        direction = "RIGHT";
});

setInterval(draw, 120);
