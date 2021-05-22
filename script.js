const GAME_WIDTH = 532;
const GAME_HEIGHT = 850;

let forceOfGravity = 0.8;
let gameSpeed = 0.2;
let background = new Image();
let victory = new Image();
let GAME = true;
let gameVictory = false;
let gameTarget = 250;
let gameStartScore = 150;
let gameScoreCounter = 0;
let gameScoreCounterColor = "yellow";
let gamePressureCounterColor;
let gamePressure;
let gameOverMessage;
let gameAudio = new Audio('audio/gameAudio.mp3');

let platformHeight = 5;
let platformWidth = 50;
let platformX = 250;
let platformY = GAME_HEIGHT - (3 * platformHeight);
let platforms = [];
let platformQuantity = 50;
let platformXDirection = platformWidth;
let platformColor = "#800000";
let platformCircleColor = "blue";

let diverX = 250;
let diverY = (platformY - 150);
let diver = new Image();
let diver_left = new Image();
let diver_right = new Image();
let diver_green = new Image();
let diver_blue = new Image();
let diverHeight = 45;
let diverWidth = 60;
let diverXDirection = 0;
let diverYDirection = 0;
let diverSpeed = 10;
let diverJumpSpeed = 40;

let sharkX = 250;
let sharkY;
let sharkHeight = 72;
let sharkWidth = 85;
let sharkSpeed = 1;
let sharks = [];
let sharkQuantity = 200;
let sharkXDirection = sharkWidth;
let shark = new Image();

context = null;
let FPS = 1000 / 60;

function init() {
  var canvas = document.getElementById("canvas");
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  context = canvas.getContext("2d");    
  document.addEventListener("keydown", onDocumentKeyDown);       
  background.src = "img/background_water.png";    
  diver_left.src = "img/diver_black_left.png";
  diver_right.src = "img/diver_black_right.png";
  diver.src = "img/diver_black.png";
  diver_green.src = "img/diver_green.png"
  diver_blue.src = "img/diver_blue.png"    
  shark.src = "img/shark.png";  
  victory.src = "img/logo_rescue_diver.png";
     
  // В массив записываются координаты платформ
  for (i = 0; i < platformQuantity; i++) {    
    platformY = Math.floor((Math.random() * 1000) / 2);
    platforms.push([platformX - platformXDirection * 1.5, platformY - (i + 1) * 80]);
    if (platforms[i][0] < 0) {
      platforms[i][0] = 15;
      platformXDirection = -(platformWidth + 20);
    }      
    if (platforms[i][0] > GAME_WIDTH - platformWidth) {
      platforms[i][0] = GAME_WIDTH - platformWidth - 15;
      platformXDirection = platformWidth;
    }
    platformX = (platformX - platformXDirection * 1.5);    
  }
    
  // В массив записываются координаты монстров
  for (i = 0; i < sharkQuantity; i++) {    
    sharkY = Math.floor((Math.random() * 1000) / 2);   
    sharks.push([sharkX  - sharkWidth * 1.5, sharkY - (i + 1) * 100]);        
    if (sharks[i][0] < 0) {
      sharks[i][0] = 10;
      sharkXDirection = -(sharkWidth);
    }    
    if (sharks[i][0] > GAME_WIDTH - sharkWidth) {
      sharks[i][0] = GAME_WIDTH - sharkWidth - 10;
      sharkXDirection = sharkWidth;
    }
    sharkX = (sharkX - sharkXDirection * 1.5);    
  }
  
  drawStart();
    
}

function play() {
  if (GAME) {
     draw();
     playGameSound();
     update();
  } else {
    drawGameover();
  }
  if (gameVictory == true) {
    drawVictoryGame();    
  }
}

function onDocumentKeyDown(event) {
  if (event.keyCode == 13) {
    setInterval(play, FPS);
  }

  if (event.keyCode == 40) {
    diverY = diverY + diverSpeed;
  } 

  if (event.keyCode == 32) {
    diverY = diverY - diverJumpSpeed;
    if (diverY <= diverHeight) {
      diverY = diverHeight;
    }
  } 
    
  if (event.keyCode == 37) {
    diverX = diverX - diverSpeed;
    diver = diver_left;
    if (diverX <= 0) {
      diverX = 0;
    }
  }
    
  if (event.keyCode == 39) {
    diverX =  diverX + diverSpeed;
    diver = diver_right;
    if (diverX >= GAME_WIDTH - diverWidth) {
      diverX = GAME_WIDTH - diverWidth;
    }
  }

  if (event.keyCode == 86) {
    gameVictory = true;
  } 
}

function draw() {
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawBackground();  
  drawPlatform();
  drawdiver();
  drawshark();
  drawGameScoreCounter();
  drawPressureCounter();  
}

function update() {
  let diverSpeed = forceOfGravity;
  
  //Движение платформ
  for (let i = 0; i < platforms.length; i++) {
    platforms[i][1] = platforms[i][1] + gameSpeed;   
  }
  //Движение акул   
  for (let i = 0; i < sharks.length; i++) {
    sharks[i][1] = sharks[i][1] + sharkSpeed;   
  }
  
  // Если дайвер на кислородной платформе, он наполняет балоны, иначе тратит кислород  
  for (let i = 0; i < platforms.length; i++) { 
    if ((diverY + diverHeight > platforms[i][1]) 
    && (diverY + diverHeight < platforms[i][1] + platformHeight) 
    && (diverX + (diverWidth / 2) <= (platforms[i][0] + platformWidth)) 
    && (diverX + (diverWidth / 2) >= platforms[i][0])) {
      diverSpeed = gameSpeed;
      gameStartScore = gameStartScore + 0.1;     
      break;
    } else {
      gameStartScore = gameStartScore - 0.001;
      diverSpeed = forceOfGravity;    
    } 
    gameScoreCounter = Math.trunc(gameStartScore);          
  }
         
  diverY = diverY + diverSpeed;
    
  //Столкновение с аккулой
  for (let i = 0; i < sharks.length; i++) {  
    if ((diverY > sharks[i][1] + 10 && diverY <= sharks[i][1] + sharkHeight - 10
     && diverX > sharks[i][0] + 10 && diverX <= sharks[i][0] + sharkWidth - 10) ||
     (diverY > sharks[i][1] + 10 && diverY <= sharks[i][1] + sharkHeight - 10
      && diverX + diverWidth > sharks[i][0] + 10 && diverX + diverWidth <= sharks[i][0] + sharkWidth - 10) ||
     (diverY + diverHeight > sharks[i][1] + 40 && diverY + diverHeight <= sharks[i][1] + sharkHeight - 10
      && diverX + diverWidth > sharks[i][0] + 10 && diverX + diverWidth <= sharks[i][0] + sharkWidth - 10) ||
      diverY + diverHeight > sharks[i][1] + 10 && diverY + diverHeight <= sharks[i][1] + sharkHeight - 10 
      && diverX > sharks[i][0] + 10 && diverX <= sharks[i][0] + sharkWidth - 10) {
      gameOverMessage = "Акула хорошо позавтракала";
      GAME = false;                   
    }         
  }
      
  //Game over если закончился кислород
  if (gameScoreCounter < 0) {
    gameOverMessage = "У тебя закончился кислород";
    GAME = false;
  }  
  //Game over если дайвер уплыл ниже размера игрового поля
  if (diverY - 0.5 * diverHeight >= GAME_HEIGHT) {
    gameOverMessage = "Тебя расплющило давление"
    GAME = false;
  }
  //Game Victory если счет в игры достиг цели
  if (gameScoreCounter >= gameTarget) {
    gameVictory = true;    
  } 
  //Изменение цвет счетчика кислорода
  switch(gameScoreCounter) {
    case 0:
      gameScoreCounterColor = "red";
    case 49:
      gameScoreCounterColor = "red";
      break  
    case 50:
      gameScoreCounterColor = "orange";
    case 99:
      gameScoreCounterColor = "orange";
      break;
    case 100:
      gameScoreCounterColor = "yellow";
    case 149:
      gameScoreCounterColor = "yellow";
      break;    
    case 150:
      gameScoreCounterColor = "lime";
    case 199:
      gameScoreCounterColor = "lime";
      break;
    case 200:
      gameScoreCounterColor = "aqua";
      break;
    case gameTarget:
      gameScoreCounterColor = "aqua";
      break;    
  }
  //Расчет давления
  gamePressure = Math.trunc(diverY / 10) / 10;
  //Изменение цвет счетчика давления
  switch(gamePressure) {
    case 0:
      gamePressureCounterColor = "aqua";
    case 1.49:
      gamePressureCounterColor = "aqua";
      break  
    case 1.50:
      gamePressureCounterColor = "lime";
    case 2.99:
      gamePressureCounterColor = "lime";
      break;
    case 3.00:
      gamePressureCounterColor = "yellow";
    case 4.49:
      gamePressureCounterColor = "yellow";
      break;    
    case 4.50:
      gamePressureCounterColor = "orange";
    case 5.99:
      gamePressureCounterColor = "orange";
      break;
    case 6.00:
      gamePressureCounterColor = "red";
      break;
    case GAME_HEIGHT:
      gamePressureCounterColor = "red";
      break;    
  }
}

function drawshark() {
  for (let i = 0; i < sharks.length; i++) {
    context.drawImage(shark, sharks[i][0], sharks[i][1], sharkWidth, sharkHeight);
  }
}
  
function drawStart() {
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);  
  context.textAlign = "center";
  context.fillStyle = "#00D420";
  context.font = "bold 15pt Verdana";
  context.fillText("Добро пожаловать в Rescue Diver", GAME_WIDTH / 2, GAME_HEIGHT / 3);
  context.fillStyle = "#00D420";
  context.fillText(`Наполни балоны кислородом до ${gameTarget} units`, GAME_WIDTH / 2, GAME_HEIGHT / 3 + 60);
  context.fillStyle = "#0053AB";
  context.font = "bold 10pt Verdana";
  context.fillText("Плыть вверх - Space", GAME_WIDTH / 2, GAME_HEIGHT / 3 + 120);
  context.fillText("Плыть вниз - ArrowDown", GAME_WIDTH / 2, GAME_HEIGHT / 3 + 160);
  context.fillText("Плыть влево, вправо - ArrowLeft, ArrowRight", GAME_WIDTH / 2, GAME_HEIGHT / 3 + 200);
  context.fillText("Для начала игры нажмите Enter", GAME_WIDTH / 2, GAME_HEIGHT / 3 + 240);
}

function drawVictoryGame() {  
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  context.fillStyle = "rgba(135, 206, 250, 0.4)";
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  context.drawImage(victory, 25, 300, 494, 331);
  context.textAlign = "center";
  context.fillStyle = "green";
  context.font = "bold 45pt Verdana";
  context.fillText("!!! ПОБЕДА !!! ", GAME_WIDTH / 2 + 10, GAME_HEIGHT / 6 + 50);  
}

function drawGameover() {  
  context.fillStyle = "rgba(255, 228, 225, 0.004)";
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);  
  context.drawImage(shark, GAME_WIDTH / 4, GAME_HEIGHT / 1.75, sharkWidth * 4, sharkHeight * 4); diver_green
  context.drawImage(diver_green, GAME_WIDTH / 6, GAME_HEIGHT / 12, 164, 292);
  context.textAlign = "center";
  context.fillStyle = "#FF0000";
  context.font = "bold 50pt Verdana";
  context.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2);
  context.font = "bold 20pt Verdana";
  context.fillText(gameOverMessage, GAME_WIDTH / 2, GAME_HEIGHT / 1.75);
}

function drawGameScoreCounter() {
  context.fillStyle = "#A9A9A9";
  context.fillRect(0, 0, GAME_WIDTH, 60);
  context.textAlign = "left";     
  context.fillStyle = gameScoreCounterColor;
  context.font = "bold 18pt Verdana";
  context.fillText("КИСЛОРОД:" + " " + gameScoreCounter, 20, 40);
}

function drawPressureCounter() {  
  context.textAlign = "left";     
  context.fillStyle = gamePressureCounterColor;  
  context.font = "bold 18pt Verdana";
  context.fillText("ДАВЛЕНИЕ:" + " " + gamePressure, 300, 40);
}

function drawBackground() {
  context.drawImage(background, 0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawdiver() {
  context.drawImage(diver, diverX, diverY, diverHeight, diverWidth);
}

function drawPlatform() {
  for (let i = 0; i < platforms.length; i++) {
    context.strokeStyle = 'rgb(0,' + Math.floor(255 - (Math.random() * 100)) + ',' + Math.floor(255 - (Math.random() * 100)/2) + ')';
    context.beginPath(); 
    //Рисуем воздушный шар
    context.arc(platforms[i][0] + platformWidth / 2, platforms[i][1] + platformHeight / 2, platformWidth, 0, 2 * Math.PI); 
    context.fillStyle = "rgba(175, 238, 238, 0.4)";
    context.stroke();
    context.fill();
    context.fillStyle = platformColor;
    //Рисуем платформу  
    context.fillRect(platforms[i][0], platforms[i][1], platformWidth, platformHeight);
  } 
}

function playGameSound()
{
  gameAudio.play();  
}