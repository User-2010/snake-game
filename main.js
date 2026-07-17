const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const restartButton = document.getElementById("restart");

const grid = 30;
const tileCount = canvas.width / grid;

let snake = [
    { x: 10, y: 10 }
];

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let food = {
    x: 15,
    y: 15
};

let score = 0;
let best = Number(localStorage.getItem("snake_best")) || 0;

bestElement.textContent = best;

let speed = 140;
let lastMove = 0;

let gameOver = false;
let paused = false;

function randomFood() {

    while (true) {

        const x = Math.floor(Math.random() * tileCount);
        const y = Math.floor(Math.random() * tileCount);

        let ok = true;

        for (const part of snake) {
            if (part.x === x && part.y === y) {
                ok = false;
                break;
            }
        }

        if (ok) {
            food.x = x;
            food.y = y;
            return;
        }
    }

}

randomFood();

document.addEventListener("keydown", e => {

    const key = e.key.toLowerCase();

    if (key === " ") {
        paused = !paused;
        return;
    }

    if ((key === "arrowleft" || key === "a") && direction.x !== 1) {
        nextDirection = { x: -1, y: 0 };
    }

    if ((key === "arrowright" || key === "d") && direction.x !== -1) {
        nextDirection = { x: 1, y: 0 };
    }

    if ((key === "arrowup" || key === "w") && direction.y !== 1) {
        nextDirection = { x: 0, y: -1 };
    }

    if ((key === "arrowdown" || key === "s") && direction.y !== -1) {
        nextDirection = { x: 0, y: 1 };
    }

});

restartButton.onclick = () => {

    snake = [
        { x: 10, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    speed = 140;

    scoreElement.textContent = score;

    gameOver = false;
    paused = false;

    randomFood();

};

function update() {

    if (gameOver || paused) return;

    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Проход через стены
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;

    // Столкновение с собой
    for (const part of snake) {
        if (part.x === head.x && part.y === head.y) {

            gameOver = true;

            if (score > best) {
                best = score;
                localStorage.setItem("snake_best", best);
                bestElement.textContent = best;
            }

            return;
        }
    }

    snake.unshift(head);

    // Съели яблоко
    if (head.x === food.x && head.y === food.y) {

        score++;
        scoreElement.textContent = score;

        randomFood();

        // Каждые 5 очков ускоряем игру
        if (score % 5 === 0 && speed > 60) {
            speed -= 8;
        }

    } else {

        snake.pop();

    }

}

function drawGrid() {

    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvas.width; i += grid) {

        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();

    }

}

function draw() {

    // Фон
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // ---------- Яблоко ----------
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff4444";

    ctx.fillStyle = "#ff3b30";
    ctx.beginPath();
    ctx.arc(
        food.x * grid + grid / 2,
        food.y * grid + grid / 2,
        grid / 2.8,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Блик
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
        food.x * grid + grid / 2 - 5,
        food.y * grid + grid / 2 - 5,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // ---------- Змейка ----------
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ff88";

    snake.forEach((part, index) => {

        ctx.fillStyle = index === 0 ? "#00ff88" : "#00c96b";

        ctx.beginPath();
        ctx.roundRect(
            part.x * grid + 2,
            part.y * grid + 2,
            grid - 4,
            grid - 4,
            8
        );
        ctx.fill();

    });

    ctx.shadowBlur = 0;

    // ---------- Глаза ----------
    const head = snake[0];

    let ox = 0;
    let oy = 0;

    if (direction.x === 1) ox = 4;
    if (direction.x === -1) ox = -4;
    if (direction.y === 1) oy = 4;
    if (direction.y === -1) oy = -4;

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(
        head.x * grid + 10 + ox,
        head.y * grid + 10 + oy,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        head.x * grid + 20 + ox,
        head.y * grid + 10 + oy,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // ---------- Пауза ----------
    if (paused) {

        ctx.fillStyle = "rgba(0,0,0,.5)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("ПАУЗА", canvas.width/2, canvas.height/2);

    }

    // ---------- Game Over ----------
    if (gameOver) {

        ctx.fillStyle = "rgba(0,0,0,.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "#ff4444";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2-20);

        ctx.fillStyle = "white";
        ctx.font = "26px Arial";
        ctx.fillText(
            "Нажми «Играть снова»",
            canvas.width/2,
            canvas.height/2+35
        );

    }

}

function loop(time){

    if(time-lastMove>speed){

        update();

        lastMove=time;

    }

    draw();

    requestAnimationFrame(loop);

}

requestAnimationFrame(loop);

function mobileMove(dir){

    if(dir === "up" && direction.y !== 1){
        nextDirection = {x:0,y:-1};
    }

    if(dir === "down" && direction.y !== -1){
        nextDirection = {x:0,y:1};
    }

    if(dir === "left" && direction.x !== 1){
        nextDirection = {x:-1,y:0};
    }

    if(dir === "right" && direction.x !== -1){
        nextDirection = {x:1,y:0};
    }

}