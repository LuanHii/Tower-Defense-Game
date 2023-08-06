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
const projectiles = [];

let enemiesInterval = 600;
let numberOfResources = 300;
let frame = 0;
let gameOver = false;
let score = 0;




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
class Projectile {
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }

    draw(){
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleProjectiles(){
    for(let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++){
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
    }
}

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

    update(){
        if (this.shooting)
        {
            this.timer++;
            if (this.timer % 100 === 0){
                projectiles.push(new Projectile(this.x + 70,this.y + 50));
            }
        } else {
            this.timer = 0;
        }
        
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
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1){ // checando se tem inimigo na mesma linha
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++){
            if (defenders[i] && collision(defenders[i], enemies[j])){ // se colidir com inimigo tirar vida e reduzir velocidade
                enemies[j].movement = 0;
                defenders[i].health -= 0.2;
            }
            if (defenders[i] && defenders[i].health <=0){
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

        if (enemies[i].health <= 0){
            let gainedResources = enemies[i].maxHealth/10;
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
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
    ctx.fillText("Pontuação: " + score, 30,80); // Pontuação do jogador
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
    handleProjectiles();
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