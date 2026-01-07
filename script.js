const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 遊戲參數設定 ---
const gridSize = 20; // 每一格的大小
let tileCount = canvas.width / gridSize; 

// 蛇的初始狀態
let snake = [{ x: 10, y: 10 }];
let dx = 0;
let dy = 0;
let food = { x: 15, y: 15 };
let score = 0;
let gameSpeed = 100; // 刷新速度 (毫秒)

// --- 遊戲主迴圈 ---
function drawGame() {
    moveSnake();
    
    if (checkGameOver()) {
        alert(`遊戲結束！你的分數是: ${score}\n按確定重新開始`);
        resetGame();
        return;
    }

    // 清空畫布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 畫蛇
    ctx.fillStyle = 'lime';
    snake.forEach((part, index) => {
        // 蛇頭顏色稍微不同，方便辨識
        ctx.fillStyle = index === 0 ? '#00FF00' : '#32CD32'; 
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // 畫食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    setTimeout(drawGame, gameSpeed);
}

// --- 邏輯功能 ---
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    
    // 吃食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').innerText = `分數: ${score}`;
        generateFood();
        // 難度增加：每吃一個稍微變快 (可選)
        if(gameSpeed > 50) gameSpeed -= 1; 
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    // 避免生成在蛇身上
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) generateFood();
    });
}

function checkGameOver() {
    const head = snake[0];
    // 撞牆
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
    // 撞自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 100;
    document.getElementById('score').innerText = `分數: 0`;
    drawGame();
}

// --- 控制與監聽 ---

// 1. 鍵盤控制 (電腦)
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
    if (event.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
    if (event.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
    if (event.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
});

// 2. 觸控控制 (手機)
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    // 防止瀏覽器預設行為
    event.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', function(event) {
    let touchEndX = event.changedTouches[0].screenX;
    let touchEndY = event.changedTouches[0].screenY;
    handleSwipe(touchEndX, touchEndY);
    event.preventDefault();
}, { passive: false });

function handleSwipe(endX, endY) {
    let diffX = endX - touchStartX;
    let diffY = endY - touchStartY;
    
    // 設定滑動靈敏度門檻 (避免誤觸)
    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) return;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑動
        if (diffX > 0 && dx === 0) { dx = 1; dy = 0; }
        else if (diffX < 0 && dx === 0) { dx = -1; dy = 0; }
    } else {
        // 垂直滑動
        if (diffY > 0 && dy === 0) { dx = 0; dy = 1; }
        else if (diffY < 0 && dy === 0) { dx = 0; dy = -1; }
    }
}

// 啟動遊戲
drawGame();
