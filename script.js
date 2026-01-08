const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('gameMenu');

// --- 介面元素 ---
const scoreEl = document.getElementById('scoreText');
const btnStart = document.getElementById('btnStart');
const instructions = document.getElementById('instructions');
const selLang = document.getElementById('selLang');
const selDiff = document.getElementById('selDiff');
const selPlat = document.getElementById('selPlat');

// --- 語言包 (翻譯字典) ---
const translations = {
    zh: {
        title: "貪食蛇",
        score: "分數",
        lblLang: "語言設定",
        lblDiff: "遊戲難度",
        lblPlat: "操作平台",
        btnStart: "開始遊戲",
        btnRestart: "再玩一次",
        gameOver: "遊戲結束！",
        hintPC: "使用方向鍵移動",
        hintMobile: "在螢幕上滑動手指",
        optEasy: "簡單 (龜速)",
        optNormal: "普通 (標準)",
        optHard: "困難 (極速)",
        optPC: "電腦 (鍵盤)",
        optMobile: "手機 (觸控)"
    },
    en: {
        title: "Snake Game",
        score: "Score",
        lblLang: "Language",
        lblDiff: "Difficulty",
        lblPlat: "Platform",
        btnStart: "Start Game",
        btnRestart: "Play Again",
        gameOver: "Game Over!",
        hintPC: "Use Arrow Keys to Move",
        hintMobile: "Swipe Screen to Move",
        optEasy: "Easy (Slow)",
        optNormal: "Normal (Standard)",
        optHard: "Hard (Fast)",
        optPC: "Desktop (Keyboard)",
        optMobile: "Mobile (Touch)"
    }
};

// --- 遊戲變數 ---
const gridSize = 20;
let tileCount = canvas.width / gridSize;
let snake = [];
let dx = 0;
let dy = 0;
let food = { x: 0, y: 0 };
let score = 0;
let gameInterval;
let isGameRunning = false;

// --- 1. 選單與語言控制 ---

function updateLanguage() {
    const lang = selLang.value; // 'zh' or 'en'
    const t = translations[lang];

    document.getElementById('menuTitle').innerText = t.title;
    document.getElementById('lblLang').innerText = t.lblLang;
    document.getElementById('lblDiff').innerText = t.lblDiff;
    document.getElementById('lblPlat').innerText = t.lblPlat;
    
    // 按鈕文字判斷
    btnStart.innerText = score > 0 ? t.btnRestart : t.btnStart;
    
    // 下拉選單文字更新
    selDiff.options[0].text = t.optEasy;
    selDiff.options[1].text = t.optNormal;
    selDiff.options[2].text = t.optHard;
    selPlat.options[0].text = t.optPC;
    selPlat.options[1].text = t.optMobile;

    // 分數文字
    scoreEl.innerText = `${t.score}: ${score}`;

    updateInstructions();
}

function updateInstructions() {
    const lang = selLang.value;
    const plat = selPlat.value;
    const t = translations[lang];
    
    if (plat === 'pc') {
        instructions.innerText = t.hintPC;
    } else {
        instructions.innerText = t.hintMobile;
    }
}

// 初始化語言
updateLanguage();

// --- 2. 遊戲流程控制 ---

function startGame() {
    // 取得選單設定的難度 (速度)
    const speed = parseInt(selDiff.value);
    
    // 隱藏選單
    menu.classList.add('hidden');
    
    // 重置遊戲數據
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    isGameRunning = true;
    
    // 重置分數顯示
    const lang = selLang.value;
    scoreEl.innerText = `${translations[lang].score}: 0`;
    
    generateFood();
    
    // 清除舊的計時器並啟動新的
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(drawGame, speed);
}

function stopGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // 顯示選單
    menu.classList.remove('hidden');
    
    // 更新標題為 Game Over
    const lang = selLang.value;
    const t = translations[lang];
    document.getElementById('menuTitle').innerText = t.gameOver;
    btnStart.innerText = t.btnRestart;
}

function drawGame() {
    moveSnake();
    
    if (checkGameOver()) {
        stopGame();
        return;
    }

    // 清空背景
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 畫蛇
    snake.forEach((part, index) => {
        // 蛇頭顏色不同
        ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // 畫食物
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// --- 3. 遊戲邏輯 ---

function moveSnake() {
    // 如果蛇靜止，就不運算
    if (dx === 0 && dy === 0) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    
    // 吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        const lang = selLang.value;
        scoreEl.innerText = `${translations[lang].score}: ${score}`;
        generateFood();
    } else {
        snake.pop(); // 沒吃到就移除尾巴
    }
}

function checkGameOver() {
    const head = snake[0];
    
    // 撞牆檢查
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // 撞身體檢查
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // 確保食物不會生成在蛇身上
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            generateFood(); // 重新生成
            break;
        }
    }
}

// --- 4. 操作監聽 ---

// 電腦鍵盤
document.addEventListener('keydown', (event) => {
    if (!isGameRunning) return;
    
    // 防止按鍵捲動頁面
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }

    if (event.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
    if (event.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
    if (event.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
    if (event.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
});

// 手機觸控
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(event) {
    if (!isGameRunning) return;
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    event.preventDefault(); // 防止反白或其他手勢
}, { passive: false });

canvas.addEventListener('touchend', function(event) {
    if (!isGameRunning) return;
    let touchEndX = event.changedTouches[0].screenX;
    let touchEndY = event.changedTouches[0].screenY;
    handleSwipe(touchEndX, touchEndY);
    event.preventDefault();
}, { passive: false });

function handleSwipe(endX, endY) {
    let diffX = endX - touchStartX;
    let diffY = endY - touchStartY;

    // 防止誤觸 (滑動距離太短不算)
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
