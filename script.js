const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;


// variaveis globais
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
let enemiesInterval = 600;
let numberOfResources = 300;
let frame = 0;
let gameOver = false;



// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function(){
    mouse.x = undefined;
    mouse.y = undefined;
});

// tabuleiro do jogo
const controlsBar = {
    width : canvas.width,
    height: cellSize,
}

class Cell { // classe da grid individual
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    };
    
    draw(){ //desenhando a grid
        if (mouse.x && mouse.y && collision(this,mouse)){
            ctx.strokeStyle = "black"; 
            ctx.strokeRect(this.x,this.y,this.width,this.height);
        }
       
    }
}

function createGrid(){ // criando as grids
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize ){
            gameGrid.push(new Cell(x, y));     
        }
    }
}
createGrid();

function handleGameGrid(){ // desenhando cada celula de grid individualmente
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}

// balas

// defensores
class Defender { // criando molde de defensor
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.shooting = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        }
        draw(){ //desenhando junto com vida
            ctx.fillStyle = "blue";
            ctx.fillRect(this.x,this.y, this.width, this.height);
            ctx.fillStyle = "gold";
            ctx.font = "15px 'Press Start 2P'"
            ctx.fillText(Math.floor(this.health), this.x + 25,this.y + 25);
        }
}
canvas.addEventListener('click', function(){ // adicionando ao clicar
    const gridPositionX = mouse.x - (mouse.x % cellSize)
    const gridPositionY = mouse.y - (mouse.y % cellSize)
    if (gridPositionY < cellSize) return; // não deixando adicionar na barra de controle
    for (let i = 0; i < defenders.length; i++){ // não deixando adicionar em cima de um já existente
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) 
        return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost){ // adicionando na array caso tenha recurso suficiente
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost //removendo recurso após conseguir colocar

    }
});

function handleDefenders(){
    for (let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        for (let j = 0; j < enemies.length; j++){
            if (collision(defenders[i], enemies[j])){ // se colidir com inimigo tirar vida e reduzir velocidade
                enemies[j].movement = 0;
                defenders[i].health -= 0.2;
            }
            if (defenders[i].health <=0){
                defenders.splice(i,1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

// inimigos
class Enemy{
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize;
        this.height = cellSize;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
    }
    update(){
        this.x -= this.movement;
    }
    draw(){
        ctx.fillStyle = "red";
        ctx.fillRect(this.x,this.y,this.width,this.height);
        ctx.fillStyle = "black";
        ctx.font = "15px 'Press Start 2P'"
        ctx.fillText(Math.floor(this.health), this.x + 25,this.y + 25);

    }
}

function handleEnemies(){
    for (let i = 0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){
            gameOver = true;
        }
    }
    if (frame % enemiesInterval === 0){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
        enemies.push(new Enemy(verticalPosition))
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 50;
    }
}

//  recursos

// utilidades
function handleGameStatus(){ // lidando com status do jogo
    ctx.fillStyle = "Press Start 2P";
    ctx.font = "30px 'Press Start 2P'";
    ctx.fillText("Recursos: " + numberOfResources, 30,30); // texto e quantidade de recurso do jogador
    if (gameOver){ // animando mensagem de game over na tela
        ctx.fillStyle = 'black';
        ctx.font = "60px 'Press Start 2P'";
        ctx.fillText("Fim de jogo", 135,330);
    }
}
function animate(){ 
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";  // preenchendo barra de controle com azul
    ctx.fillRect(0,0,controlsBar.width,controlsBar.height); 
    handleGameGrid();
    handleDefenders();
    handleEnemies();
    handleGameStatus();
    frame++;
    if (!gameOver) requestAnimationFrame(animate); // se não está com gameover anime.
}

animate();

function collision(first, second){ // detectar colisão na diagonal
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)

    ) {
        return true;
    }
}